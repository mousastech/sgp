"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_ROLES = [
  { codigo: "JEFE_PLANTA", nombre: "Jefe de Planta", descripcion: "Maximo responsable de la central. Autoriza permisos generales y trabajos especiales.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: true, esJefePlanta: true, esContratista: false, puedeAdministrar: true },
  { codigo: "JEFE_MANTENIMIENTO", nombre: "Jefe de Mantenimiento", descripcion: "Responsable de mantenimiento. Puede autorizar permisos generales.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: true, esJefePlanta: false, esContratista: false, puedeAdministrar: true },
  { codigo: "SUPERVISOR_HSE", nombre: "Supervisor de HSE", descripcion: "Supervision de seguridad e higiene. No puede autorizar.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: false, esJefePlanta: false, esContratista: false, puedeAdministrar: true },
  { codigo: "ING_CONFIABILIDAD", nombre: "Ingeniero de Confiabilidad", descripcion: "Ingenieria de confiabilidad. Puede autorizar permisos generales.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: true, esJefePlanta: false, esContratista: false, puedeAdministrar: false },
  { codigo: "TEC_MANTENIMIENTO", nombre: "Tecnico de Mantenimiento", descripcion: "Ejecucion de mantenimiento en campo. No puede autorizar.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: false, esJefePlanta: false, esContratista: false, puedeAdministrar: false },
  { codigo: "AUX_MANTENIMIENTO", nombre: "Auxiliar de Mantenimiento", descripcion: "Apoyo en mantenimiento. No puede autorizar.", puedeSerSolicitante: true, puedeSerResponsable: true, puedeSerAutorizador: false, esJefePlanta: false, esContratista: false, puedeAdministrar: false },
  { codigo: "CONTRATISTA", nombre: "Contratista", descripcion: "Personal externo. Solo puede ser Responsable del Trabajo.", puedeSerSolicitante: false, puedeSerResponsable: true, puedeSerAutorizador: false, esJefePlanta: false, esContratista: true, puedeAdministrar: false },
];

export async function getRoles() {
  const prisma = await getPrisma();
  const count = await prisma.rol.count();
  if (count === 0) {
    // Seed default roles
    for (const r of DEFAULT_ROLES) {
      await prisma.rol.create({ data: r });
    }
  }
  return prisma.rol.findMany({ where: { activo: true }, orderBy: { id: "asc" } });
}

export async function crearRol(formData: FormData) {
  const codigo = (formData.get("codigo") as string)?.trim().toUpperCase().replace(/\s+/g, "_");
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  if (!codigo || !nombre) return { error: "Codigo y nombre son obligatorios." };

  const puedeSerSolicitante = formData.get("puedeSerSolicitante") === "true";
  const puedeSerResponsable = formData.get("puedeSerResponsable") === "true";
  const puedeSerAutorizador = formData.get("puedeSerAutorizador") === "true";
  const esJefePlanta = formData.get("esJefePlanta") === "true";
  const esContratista = formData.get("esContratista") === "true";
  const puedeAdministrar = formData.get("puedeAdministrar") === "true";

  try {
    await (await getPrisma()).rol.create({
      data: { codigo, nombre, descripcion, puedeSerSolicitante, puedeSerResponsable, puedeSerAutorizador, esJefePlanta, esContratista, puedeAdministrar },
    });
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Ya existe un rol con ese codigo." };
    throw e;
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function editarRol(formData: FormData) {
  const id = Number(formData.get("id"));
  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  if (!nombre) return { error: "El nombre es obligatorio." };

  await (await getPrisma()).rol.update({
    where: { id },
    data: {
      nombre, descripcion,
      puedeSerSolicitante: formData.get("puedeSerSolicitante") === "true",
      puedeSerResponsable: formData.get("puedeSerResponsable") === "true",
      puedeSerAutorizador: formData.get("puedeSerAutorizador") === "true",
      esJefePlanta: formData.get("esJefePlanta") === "true",
      esContratista: formData.get("esContratista") === "true",
      puedeAdministrar: formData.get("puedeAdministrar") === "true",
    },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function desactivarRol(id: number) {
  await (await getPrisma()).rol.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin");
  return { success: true };
}
