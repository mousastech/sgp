"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";

// --- Valid state transitions per RENOVABLES-O-PR-01 ---
// BORRADOR → ENVIADO (via crearPermiso)
// ENVIADO → EN_REVISION
// EN_REVISION → AUTORIZADO | DEVUELTO | RECHAZADO
// DEVUELTO → ENVIADO (re-submit)
// AUTORIZADO → EN_EJECUCION (after ERUM)
// EN_EJECUCION → SUSPENDIDO | CERRADO (extension increments extensionDias)
// SUSPENDIDO → EN_EJECUCION | CERRADO

const TIPOS_TRABAJO_ESPECIAL = [
  "ALTURAS",
  "ESPACIOS_CONFINADOS",
  "EXCAVACION",
  "CALIENTE",
  "EQUIPO_ENERGIZADO",
  "IZAJE_CARGAS",
  "MAQUINARIA_PESADA",
  "ICS",
] as const;

function revalidateAll() {
  revalidatePath("/captura");
  revalidatePath("/aprobacion");
  revalidatePath("/dashboard");
}

async function audit(tabla: string, registroId: number, accion: string, usuario: string, datos: object) {
  await (await getPrisma()).auditoria.create({
    data: { tabla, registroId, accion, usuario, datosNuevos: datos },
  });
}

// --- Fetch helpers ---

export async function getPermisosActivosEnArea(areaId: number, excludePermisoId?: number) {
  const where: any = {
    areaId,
    estado: { in: ["ENVIADO", "EN_REVISION", "AUTORIZADO", "EN_EJECUCION"] },
  };
  if (excludePermisoId) where.id = { not: excludePermisoId };

  return (await getPrisma()).permisoTrabajo.findMany({
    where,
    include: { empleado: true, area: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTodosPermisos() {
  return (await getPrisma()).permisoTrabajo.findMany({
    where: { estado: { not: "BORRADOR" } },
    include: {
      empleado: true,
      area: true,
      checklist: {
        include: { equipo: { include: { categoria: true } } },
      },
      aprobaciones: {
        include: { supervisor: true },
        orderBy: { fechaFirma: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSupervisores() {
  return (await getPrisma()).empleado.findMany({
    where: { activo: true, esSupervisor: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

// --- 6.4 Iniciar Revision (ENVIADO → EN_REVISION) ---

export async function iniciarRevision(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "ENVIADO") {
    return { success: false, error: "El permiso no esta en estado ENVIADO." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "EN_REVISION", updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "INICIAR_REVISION",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, estado: "EN_REVISION" });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- 6.7 Autorizar Permiso (EN_REVISION → AUTORIZADO) ---

export async function autorizarPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const comentarios = formData.get("comentarios") as string;
  const password = formData.get("password") as string;
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lon = parseFloat(formData.get("lon") as string) || null;

  if (!password) return { success: false, error: "La contrasena es obligatoria para firmar." };

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "EN_REVISION") {
    return { success: false, error: "El permiso no esta en revision." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });
  const firmaData = `${supervisor?.nombreCompleto}|${permiso.folio}|AUTORIZADO|${new Date().toISOString()}|${password}`;
  const firmaHash = createHash("sha256").update(firmaData).digest("hex");

  await (await getPrisma()).aprobacion.create({
    data: {
      permisoId, supervisorId, decision: "AUTORIZADO",
      comentarios: comentarios || null,
      firmaElectronica: firmaHash,
      coordenadasLatFirma: lat, coordenadasLonFirma: lon,
    },
  });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "AUTORIZADO", fechaAutorizacion: new Date(), updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "AUTORIZADO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, firma: firmaHash.slice(0, 16) });

  revalidateAll();
  return { success: true, folio: permiso.folio, firma: firmaHash.slice(0, 16) };
}

// --- 6.4 Devolver Permiso (EN_REVISION → DEVUELTO) ---

export async function devolverPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const motivo = formData.get("motivo") as string;

  if (!motivo?.trim()) return { success: false, error: "El motivo de devolucion es obligatorio." };

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "EN_REVISION") {
    return { success: false, error: "El permiso no esta en revision." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "DEVUELTO", motivoDevolucion: motivo, updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "DEVUELTO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, motivo });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- Rechazar Permiso (EN_REVISION → RECHAZADO) ---

export async function rechazarPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const motivo = formData.get("motivo") as string;
  const password = formData.get("password") as string;

  if (!motivo?.trim()) return { success: false, error: "El motivo de rechazo es obligatorio." };
  if (!password) return { success: false, error: "La contrasena es obligatoria para firmar." };

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "EN_REVISION") {
    return { success: false, error: "El permiso no esta en revision." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });
  const firmaData = `${supervisor?.nombreCompleto}|${permiso.folio}|RECHAZADO|${new Date().toISOString()}|${password}`;
  const firmaHash = createHash("sha256").update(firmaData).digest("hex");

  await (await getPrisma()).aprobacion.create({
    data: {
      permisoId, supervisorId, decision: "RECHAZADO",
      comentarios: motivo,
      firmaElectronica: firmaHash,
    },
  });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "RECHAZADO", motivoRechazo: motivo, updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "RECHAZADO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, motivo, firma: firmaHash.slice(0, 16) });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- 6.9 Registrar ERUM e Iniciar Ejecucion (AUTORIZADO → EN_EJECUCION) ---

export async function registrarErum(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const observaciones = formData.get("observaciones") as string;

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "AUTORIZADO") {
    return { success: false, error: "El permiso no esta autorizado." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: {
      estado: "EN_EJECUCION",
      erumCompletado: true,
      erumObservaciones: observaciones || null,
      fechaInicioEjecucion: new Date(),
      updatedAt: new Date(),
    },
  });

  await audit("permisos_trabajo", permisoId, "ERUM_COMPLETADO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, observaciones });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- 6.10 Extender Permiso (EN_EJECUCION, max 6 dias) ---

export async function extenderPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const comentarios = formData.get("comentarios") as string;

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "EN_EJECUCION") {
    return { success: false, error: "El permiso no esta en ejecucion." };
  }
  if (permiso.extensionDias >= 6) {
    return { success: false, error: "Se alcanzo el maximo de 6 dias de extension. Debe cerrar y abrir un nuevo permiso." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { extensionDias: permiso.extensionDias + 1, updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "EXTENSION",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, extensionDia: permiso.extensionDias + 1, comentarios });

  revalidateAll();
  return { success: true, folio: permiso.folio, extensionDias: permiso.extensionDias + 1 };
}

// --- 6.15.4 Suspender Permiso (EN_EJECUCION → SUSPENDIDO) ---

export async function suspenderPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const motivo = formData.get("motivo") as string;

  if (!motivo?.trim()) return { success: false, error: "El motivo de suspension es obligatorio." };

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "EN_EJECUCION") {
    return { success: false, error: "El permiso no esta en ejecucion." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "SUSPENDIDO", motivoSuspension: motivo, updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "SUSPENDIDO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, motivo });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- Reanudar Permiso (SUSPENDIDO → EN_EJECUCION) ---

export async function reanudarPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || permiso.estado !== "SUSPENDIDO") {
    return { success: false, error: "El permiso no esta suspendido." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: { estado: "EN_EJECUCION", motivoSuspension: null, updatedAt: new Date() },
  });

  await audit("permisos_trabajo", permisoId, "REANUDADO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}

// --- 6.11 + 6.12 Cerrar Permiso (EN_EJECUCION|SUSPENDIDO → CERRADO) ---

export async function cerrarPermiso(formData: FormData) {
  const permisoId = Number(formData.get("permisoId"));
  const supervisorId = Number(formData.get("supervisorId"));
  const condicionesOk = formData.get("condicionesOk") === "true";
  const observaciones = formData.get("observaciones") as string;
  const lotoRetirado = formData.get("lotoRetirado") === "true";

  const permiso = await (await getPrisma()).permisoTrabajo.findUnique({ where: { id: permisoId } });
  if (!permiso || !["EN_EJECUCION", "SUSPENDIDO"].includes(permiso.estado)) {
    return { success: false, error: "El permiso no puede cerrarse en su estado actual." };
  }

  if (permiso.requiereLoto && !lotoRetirado) {
    return { success: false, error: "Debe confirmar el retiro del LOTO antes de cerrar." };
  }

  const supervisor = await (await getPrisma()).empleado.findUnique({ where: { id: supervisorId } });

  await (await getPrisma()).permisoTrabajo.update({
    where: { id: permisoId },
    data: {
      estado: "CERRADO",
      fechaCierre: new Date(),
      condicionesCierreOk: condicionesOk,
      observacionesCierre: observaciones || null,
      updatedAt: new Date(),
    },
  });

  await audit("permisos_trabajo", permisoId, "CERRADO",
    supervisor?.nombreCompleto || `Supervisor #${supervisorId}`,
    { folio: permiso.folio, condicionesOk, lotoRetirado });

  revalidateAll();
  return { success: true, folio: permiso.folio };
}
