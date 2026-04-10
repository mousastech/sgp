import { getPrisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const empleadoId = Number(req.nextUrl.searchParams.get("empleadoId"));
  if (!empleadoId) return NextResponse.json({ pendientes: [] });

  const prisma = await getPrisma();

  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) return NextResponse.json({ pendientes: [] });

  const pendientes: { tipo: string; titulo: string; detalle: string; href: string; color: string }[] = [];

  // 1. Permisos donde soy Solicitante y fueron DEVUELTOS (necesito corregir)
  const devueltos = await prisma.permisoTrabajo.findMany({
    where: { empleadoId, estado: "DEVUELTO" },
    select: { folio: true, motivoDevolucion: true },
  });
  for (const p of devueltos) {
    pendientes.push({
      tipo: "DEVUELTO",
      titulo: `Corregir permiso devuelto: ${p.folio}`,
      detalle: `El Autorizador devolvio tu permiso. Motivo: "${p.motivoDevolucion || "Requiere correcciones"}". Corrige y reenvia.`,
      href: "/captura",
      color: "yellow",
    });
  }

  // 2. Permisos donde soy Responsable y necesitan Lista de Verificacion
  const misPermisos = await prisma.permisoTrabajo.findMany({
    where: {
      OR: [
        { empleadoId },
        { responsableTrabajo: { contains: empleado.nombreCompleto } },
      ],
      tiposTrabajoEspecial: { not: null },
      estado: { in: ["ENVIADO", "EN_REVISION", "AUTORIZADO", "EN_EJECUCION"] },
    },
    select: { id: true, folio: true, tiposTrabajoEspecial: true, listasVerificacion: { select: { tipo: true, estado: true } } },
  });

  for (const p of misPermisos) {
    let tipos: string[] = [];
    try { tipos = JSON.parse(p.tiposTrabajoEspecial || "[]"); } catch {}
    for (const tipo of tipos) {
      const lista = p.listasVerificacion.find((l: any) => l.tipo === tipo);
      if (!lista) {
        pendientes.push({
          tipo: "LISTA_PENDIENTE",
          titulo: `Crear Lista de Verificacion: ${tipo.replace(/_/g, " ")}`,
          detalle: `Permiso ${p.folio} — Tu permiso fue aprobado. Debes crear y completar la lista de verificacion para ${tipo.replace(/_/g, " ")} antes de que el Autorizador pueda registrar la ERUM e iniciar el trabajo.`,
          href: `/verificacion`,
          color: "purple",
          folio: p.folio,
          permisoId: p.id,
        } as any);
      } else if (lista.estado === "PENDIENTE") {
        pendientes.push({
          tipo: "LISTA_INCOMPLETA",
          titulo: `Completar Lista: ${tipo.replace(/_/g, " ")}`,
          detalle: `Permiso ${p.folio} — Ya creaste la lista pero esta incompleta. Abrela, llena todos los campos y guarda.`,
          href: `/verificacion`,
          color: "indigo",
          folio: p.folio,
        } as any);
      }
    }
  }

  // 3. Permisos donde soy Responsable y estan en CIERRE_RESPONSABLE (esperando mi firma? no, ya firme)
  // Actually: permisos EN_EJECUCION donde soy responsable (pendiente de cerrar)
  const enEjecucion = await prisma.permisoTrabajo.findMany({
    where: {
      OR: [
        { empleadoId },
        { responsableTrabajo: { contains: empleado.nombreCompleto } },
      ],
      estado: "EN_EJECUCION",
    },
    select: { folio: true },
  });
  for (const p of enEjecucion) {
    pendientes.push({
      tipo: "EN_EJECUCION",
      titulo: `Trabajo activo: ${p.folio}`,
      detalle: "Tu trabajo esta en ejecucion. Sube evidencia fotografica durante el trabajo. Cuando termines, firma el cierre en Gestion de Permisos.",
      href: "/aprobacion",
      color: "orange",
    });
  }

  // 4. Si soy Autorizador: permisos pendientes de revision
  if (empleado.puedeSerAutorizador || empleado.esJefePlanta) {
    const porRevisar = await prisma.permisoTrabajo.count({ where: { estado: "ENVIADO" } });
    if (porRevisar > 0) {
      pendientes.push({
        tipo: "POR_REVISAR",
        titulo: `${porRevisar} permiso(s) pendientes de revision`,
        detalle: "Tomar para revision y autorizar",
        href: "/aprobacion",
        color: "blue",
      });
    }

    const enRevision = await prisma.permisoTrabajo.count({ where: { estado: "EN_REVISION" } });
    if (enRevision > 0) {
      pendientes.push({
        tipo: "EN_REVISION",
        titulo: `${enRevision} permiso(s) en revision`,
        detalle: "Autorizar, devolver o rechazar",
        href: "/aprobacion",
        color: "indigo",
      });
    }

    const porErum = await prisma.permisoTrabajo.count({ where: { estado: "AUTORIZADO" } });
    if (porErum > 0) {
      pendientes.push({
        tipo: "ERUM_PENDIENTE",
        titulo: `${porErum} permiso(s) esperando ERUM`,
        detalle: "Registrar ERUM antes de iniciar trabajo",
        href: "/aprobacion",
        color: "emerald",
      });
    }

    const porCierreAut = await prisma.permisoTrabajo.count({ where: { estado: "CIERRE_RESPONSABLE" } });
    if (porCierreAut > 0) {
      pendientes.push({
        tipo: "CIERRE_AUTORIZADOR",
        titulo: `${porCierreAut} permiso(s) esperando cierre del Autorizador`,
        detalle: "El Responsable ya firmo — confirmar condiciones finales",
        href: "/aprobacion",
        color: "teal",
      });
    }
  }

  return NextResponse.json({ pendientes });
}
