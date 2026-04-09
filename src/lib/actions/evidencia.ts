"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvidencias(permisoId: number) {
  return (await getPrisma()).evidencia.findMany({
    where: { permisoId },
    orderBy: { createdAt: "asc" },
    select: { id: true, tipo: true, nombre: true, creadoPor: true, createdAt: true },
  });
}

export async function getEvidenciaImagen(id: number) {
  return (await getPrisma()).evidencia.findUnique({
    where: { id },
    select: { datos: true, nombre: true },
  });
}

export async function subirEvidencia(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const tipo = formData.get("tipo") as string || "FOTO";
  const nombre = formData.get("nombre") as string || "evidencia";
  const datos = formData.get("datos") as string;
  const creadoPor = formData.get("creadoPor") as string || null;

  if (!permisoId || !datos) {
    return { success: false, error: "Datos incompletos." };
  }

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso) return { success: false, error: "Permiso no encontrado." };

  if (!["EN_EJECUCION", "CIERRE_RESPONSABLE", "CERRADO", "SUSPENDIDO"].includes(permiso.estado)) {
    return { success: false, error: "Solo se pueden subir evidencias en permisos en ejecucion o cierre." };
  }

  await (await getPrisma()).evidencia.create({
    data: { permisoId, tipo, nombre, datos, creadoPor },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "evidencias",
      registroId: permisoId,
      accion: "UPLOAD",
      usuario: creadoPor,
      datosNuevos: { tipo, nombre, folio: permiso.folio },
    },
  });

  revalidatePath("/aprobacion");
  return { success: true, folio: permiso.folio };
}

export async function eliminarEvidencia(id: number) {
  await (await getPrisma()).evidencia.delete({ where: { id } });
  revalidatePath("/aprobacion");
  return { success: true };
}
