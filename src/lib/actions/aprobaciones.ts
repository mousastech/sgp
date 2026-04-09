"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";

export async function getSupervisores() {
  return (await getPrisma()).empleado.findMany({
    where: { activo: true, esSupervisor: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function getPermisosPendientes() {
  return (await getPrisma()).permisoTrabajo.findMany({
    where: { estado: "ENVIADO" },
    include: {
      empleado: true,
      area: true,
      checklist: {
        include: {
          equipo: { include: { categoria: true } },
        },
      },
    },
    orderBy: { fechaTrabajo: "desc" },
  });
}

export async function decidirPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const decision = formData.get("decision") as string; // APROBADO | RECHAZADO
  const comentarios = formData.get("comentarios") as string;
  const password = formData.get("password") as string;
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lon = parseFloat(formData.get("lon") as string) || null;

  if (!password) {
    return { success: false, error: "La contraseña es obligatoria para firmar." };
  }

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({
    where: { id: permisoId },
  });
  if (!permiso) {
    return { success: false, error: "Permiso no encontrado." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({
    where: { id: supervisorId },
  });

  const firmaData = `${supervisor?.nombreCompleto}|${permiso.folio}|${decision}|${new Date().toISOString()}|${password}`;
  const firmaHash = createHash("sha256").update(firmaData).digest("hex");

  await (await getPrisma()).aprobacion.create({
    data: {
      permisoId,
      supervisorId,
      decision,
      comentarios: comentarios || null,
      firmaElectronica: firmaHash,
      coordenadasLatFirma: lat,
      coordenadasLonFirma: lon,
    },
  });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: decision, updatedAt: new Date() },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "aprobaciones",
      registroId: permisoId,
      accion: decision,
      usuario: supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
      datosNuevos: { folio: permiso.folio, decision, firma: firmaHash.slice(0, 16) },
    },
  });

  revalidatePath("/aprobacion");
  revalidatePath("/dashboard");

  return { success: true, decision, folio: permiso.folio, firma: firmaHash.slice(0, 16) };
}
