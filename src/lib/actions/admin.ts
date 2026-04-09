"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Categorías ---
export async function getCategorias() {
  return (await getPrisma()).categoriaEpp.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}

export async function crearCategoria(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).categoriaEpp.create({ data: { nombre, descripcion } });
  revalidatePath("/admin");
  return { success: true };
}

export async function editarCategoria(formData: FormData) {
  const id = Number(formData.get("id"));
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).categoriaEpp.update({ where: { id }, data: { nombre, descripcion } });
  revalidatePath("/admin");
  return { success: true };
}

export async function desactivarCategoria(id: number) {
  await (await getPrisma()).categoriaEpp.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin");
  return { success: true };
}

// --- Equipos ---
export async function getEquipos() {
  return (await getPrisma()).equipoEpp.findMany({
    where: { activo: true },
    include: { categoria: true },
    orderBy: [{ categoria: { nombre: "asc" } }, { nombre: "asc" }],
  });
}

export async function crearEquipo(formData: FormData) {
  const categoriaId = Number(formData.get("categoriaId"));
  const nombre = (formData.get("nombre") as string)?.trim();
  const obligatorio = formData.get("obligatorio") === "true";
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).equipoEpp.create({ data: { categoriaId, nombre, obligatorio } });
  revalidatePath("/admin");
  return { success: true };
}

export async function editarEquipo(formData: FormData) {
  const id = Number(formData.get("id"));
  const nombre = (formData.get("nombre") as string)?.trim();
  const obligatorio = formData.get("obligatorio") === "true";
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).equipoEpp.update({ where: { id }, data: { nombre, obligatorio } });
  revalidatePath("/admin");
  return { success: true };
}

export async function desactivarEquipo(id: number) {
  await (await getPrisma()).equipoEpp.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin");
  return { success: true };
}

// --- Áreas ---
export async function getAreas() {
  return (await getPrisma()).area.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}

export async function crearArea(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const ubicacion = (formData.get("ubicacion") as string)?.trim() || null;
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lon = parseFloat(formData.get("lon") as string) || null;
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).area.create({ data: { nombre, ubicacion, coordenadasLat: lat, coordenadasLon: lon } });
  revalidatePath("/admin");
  return { success: true };
}

export async function editarArea(formData: FormData) {
  const id = Number(formData.get("id"));
  const nombre = (formData.get("nombre") as string)?.trim();
  const ubicacion = (formData.get("ubicacion") as string)?.trim() || null;
  if (!nombre) return { error: "El nombre es obligatorio." };
  await (await getPrisma()).area.update({ where: { id }, data: { nombre, ubicacion } });
  revalidatePath("/admin");
  return { success: true };
}

export async function desactivarArea(id: number) {
  await (await getPrisma()).area.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin");
  return { success: true };
}

export async function editarEmpleado(formData: FormData) {
  const id = Number(formData.get("id"));
  const nombreCompleto = (formData.get("nombreCompleto") as string)?.trim();
  const { puesto, puestoHomologado } = derivePuesto(formData);
  const email = (formData.get("email") as string)?.trim() || null;
  const areaId = Number(formData.get("areaId")) || null;
  const esSupervisor = formData.get("esSupervisor") === "true";
  if (!nombreCompleto) return { error: "El nombre es obligatorio." };
  const roles = puestoHomologado ? ROLE_MATRIX[puestoHomologado] : null;
  await (await getPrisma()).empleado.update({
    where: { id },
    data: {
      nombreCompleto, puesto, email, areaId, esSupervisor, puestoHomologado,
      puedeSerSolicitante: roles?.solicitante ?? true,
      puedeSerResponsable: roles?.responsable ?? true,
      puedeSerAutorizador: roles?.autorizador ?? esSupervisor,
      esJefePlanta: roles?.jefePlanta ?? false,
      esContratista: roles?.contratista ?? false,
    },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function desactivarEmpleado(id: number) {
  await (await getPrisma()).empleado.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin");
  return { success: true };
}

// --- Empleados ---
export async function getEmpleados() {
  return (await getPrisma()).empleado.findMany({
    where: { activo: true },
    include: { area: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

// Role matrix per Anexo 1 - Tabla de Homologacion de Puestos
const ROLE_MATRIX: Record<string, { solicitante: boolean; responsable: boolean; autorizador: boolean; jefePlanta: boolean; contratista: boolean }> = {
  JEFE_PLANTA:        { solicitante: true,  responsable: true,  autorizador: true,  jefePlanta: true,  contratista: false },
  JEFE_MANTENIMIENTO: { solicitante: true,  responsable: true,  autorizador: true,  jefePlanta: false, contratista: false },
  SUPERVISOR_HSE:     { solicitante: true,  responsable: true,  autorizador: false, jefePlanta: false, contratista: false },
  ING_CONFIABILIDAD:  { solicitante: true,  responsable: true,  autorizador: true,  jefePlanta: false, contratista: false },
  TEC_MANTENIMIENTO:  { solicitante: true,  responsable: true,  autorizador: false, jefePlanta: false, contratista: false },
  AUX_MANTENIMIENTO:  { solicitante: true,  responsable: true,  autorizador: false, jefePlanta: false, contratista: false },
  CONTRATISTA:        { solicitante: false, responsable: true,  autorizador: false, jefePlanta: false, contratista: true  },
};

const PUESTO_LABELS: Record<string, string> = {
  JEFE_PLANTA: "Jefe de Planta", JEFE_MANTENIMIENTO: "Jefe de Mantenimiento",
  SUPERVISOR_HSE: "Supervisor de HSE", ING_CONFIABILIDAD: "Ingeniero de Confiabilidad",
  TEC_MANTENIMIENTO: "Tecnico de Mantenimiento", AUX_MANTENIMIENTO: "Auxiliar de Mantenimiento",
  CONTRATISTA: "Contratista",
};

function derivePuesto(formData: FormData): { puesto: string | null; puestoHomologado: string | null } {
  let puestoHomologado = (formData.get("puestoHomologado") as string)?.trim() || null;
  const puestoOtro = (formData.get("puestoOtro") as string)?.trim() || null;

  if (puestoHomologado === "OTRO") {
    return { puesto: puestoOtro || "Otro", puestoHomologado: null };
  }
  if (puestoHomologado && PUESTO_LABELS[puestoHomologado]) {
    return { puesto: PUESTO_LABELS[puestoHomologado], puestoHomologado };
  }
  return { puesto: null, puestoHomologado: null };
}

export async function crearEmpleado(formData: FormData) {
  const numeroEmpleado = (formData.get("numeroEmpleado") as string)?.trim();
  const nombreCompleto = (formData.get("nombreCompleto") as string)?.trim();
  const { puesto, puestoHomologado } = derivePuesto(formData);
  const email = (formData.get("email") as string)?.trim() || null;
  const areaId = Number(formData.get("areaId")) || null;
  const esSupervisor = formData.get("esSupervisor") === "true";
  if (!numeroEmpleado || !nombreCompleto) return { error: "Número y nombre son obligatorios." };

  // Auto-derive role permissions from puestoHomologado
  const roles = puestoHomologado ? ROLE_MATRIX[puestoHomologado] : null;

  await (await getPrisma()).empleado.create({
    data: {
      numeroEmpleado, nombreCompleto, puesto, email, areaId, esSupervisor,
      puestoHomologado,
      puedeSerSolicitante: roles?.solicitante ?? true,
      puedeSerResponsable: roles?.responsable ?? true,
      puedeSerAutorizador: roles?.autorizador ?? (esSupervisor),
      esJefePlanta: roles?.jefePlanta ?? false,
      esContratista: roles?.contratista ?? false,
    },
  });
  revalidatePath("/admin");
  return { success: true };
}

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const prisma = await getPrisma();
  const [total, enviados, enRevision, autorizados, enEjecucion, cierreResp, cerrados, rechazados, devueltos, suspendidos, borradores] = await Promise.all([
    prisma.permisoTrabajo.count(),
    prisma.permisoTrabajo.count({ where: { estado: "ENVIADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_REVISION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "AUTORIZADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_EJECUCION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "CIERRE_RESPONSABLE" } }),
    prisma.permisoTrabajo.count({ where: { estado: "CERRADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "RECHAZADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "DEVUELTO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "SUSPENDIDO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "BORRADOR" } }),
  ]);
  return { total, enviados, enRevision, autorizados, enEjecucion, cierreResp, cerrados, rechazados, devueltos, suspendidos, borradores };
}

export async function getPermisosRecientes() {
  return (await getPrisma()).permisoTrabajo.findMany({
    include: { empleado: true, area: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getAuditoria() {
  return (await getPrisma()).auditoria.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
