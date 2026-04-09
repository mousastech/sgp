"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getListasDePermiso(permisoId: number) {
  return (await getPrisma()).listaVerificacion.findMany({
    where: { permisoId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getListaById(id: number) {
  return (await getPrisma()).listaVerificacion.findUnique({
    where: { id },
    include: { permiso: { include: { empleado: true, area: true } } },
  });
}

export async function crearListaVerificacion(permisoId: number, tipo: string, codigo: string) {
  const lista = await (await getPrisma()).listaVerificacion.create({
    data: { permisoId, tipo, codigo, respuestas: {}, estado: "PENDIENTE" },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "listas_verificacion",
      registroId: lista.id,
      accion: "CREATE",
      usuario: "Sistema",
      datosNuevos: { tipo, codigo, permisoId },
    },
  });

  revalidatePath("/verificacion");
  revalidatePath("/aprobacion");
  return lista;
}

export async function guardarRespuestas(formData: FormData) {
  const listaId = Number(formData.get("listaId"));
  const respuestasJson = formData.get("respuestas") as string;

  if (!listaId || !respuestasJson) {
    return { success: false, error: "Datos incompletos." };
  }

  const respuestas = JSON.parse(respuestasJson);

  await (await getPrisma()).listaVerificacion.update({
    where: { id: listaId },
    data: { respuestas, estado: "COMPLETADA", updatedAt: new Date() },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "listas_verificacion",
      registroId: listaId,
      accion: "COMPLETADA",
      usuario: "Responsable del Trabajo",
      datosNuevos: { listaId },
    },
  });

  revalidatePath("/verificacion");
  revalidatePath("/aprobacion");
  return { success: true };
}

export async function getPermisosConListasPendientes() {
  return (await getPrisma()).permisoTrabajo.findMany({
    where: {
      tiposTrabajoEspecial: { not: null },
      estado: { not: "BORRADOR" },
    },
    include: {
      empleado: true,
      area: true,
      listasVerificacion: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
