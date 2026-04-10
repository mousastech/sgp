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
      titulo: `Permiso ${p.folio} devuelto para correccion`,
      detalle: p.motivoDevolucion || "Requiere correcciones del Autorizador",
      href: "/aprobacion",
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
          titulo: `Lista de Verificacion pendiente: ${tipo.replace(/_/g, " ")}`,
          detalle: `Permiso ${p.folio} — Crear lista de verificacion antes de autorizar`,
          href: "/verificacion",
          color: "purple",
        });
      } else if (lista.estado === "PENDIENTE") {
        pendientes.push({
          tipo: "LISTA_INCOMPLETA",
          titulo: `Lista de Verificacion incompleta: ${tipo.replace(/_/g, " ")}`,
          detalle: `Permiso ${p.folio} — Completar y guardar la lista`,
          href: "/verificacion",
          color: "indigo",
        });
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
      titulo: `Trabajo en ejecucion: ${p.folio}`,
      detalle: "Subir evidencia fotografica y firmar cierre cuando termine",
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
