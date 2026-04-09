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

// --- Empleados ---
export async function getEmpleados() {
  return (await getPrisma()).empleado.findMany({
    where: { activo: true },
    include: { area: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function crearEmpleado(formData: FormData) {
  const numeroEmpleado = (formData.get("numeroEmpleado") as string)?.trim();
  const nombreCompleto = (formData.get("nombreCompleto") as string)?.trim();
  const puesto = (formData.get("puesto") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const areaId = Number(formData.get("areaId")) || null;
  const esSupervisor = formData.get("esSupervisor") === "true";
  if (!numeroEmpleado || !nombreCompleto) return { error: "Número y nombre son obligatorios." };
  await (await getPrisma()).empleado.create({
    data: { numeroEmpleado, nombreCompleto, puesto, email, areaId, esSupervisor },
  });
  revalidatePath("/admin");
  return { success: true };
}

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const prisma = await getPrisma();
  const [total, enviados, enRevision, autorizados, enEjecucion, cerrados, rechazados, devueltos, suspendidos, borradores] = await Promise.all([
    prisma.permisoTrabajo.count(),
    prisma.permisoTrabajo.count({ where: { estado: "ENVIADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_REVISION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "AUTORIZADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_EJECUCION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "CERRADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "RECHAZADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "DEVUELTO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "SUSPENDIDO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "BORRADOR" } }),
  ]);
  return { total, enviados, enRevision, autorizados, enEjecucion, cerrados, rechazados, devueltos, suspendidos, borradores };
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
