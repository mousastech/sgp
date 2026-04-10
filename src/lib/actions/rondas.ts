"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlantillas() {
  return (await getPrisma()).rondaPlantilla.findMany({
    where: { activo: true },
    include: { area: true },
    orderBy: { nombre: "asc" },
  });
}

export async function crearPlantilla(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const areaId = Number(formData.get("areaId")) || null;
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const puntosJson = formData.get("puntos") as string;
  if (!nombre) return { error: "El nombre es obligatorio." };

  let puntos;
  try { puntos = JSON.parse(puntosJson || "[]"); } catch { puntos = []; }

  await (await getPrisma()).rondaPlantilla.create({ data: { nombre, areaId, descripcion, puntos } });
  revalidatePath("/rondas");
  return { success: true };
}

export async function getRondas(limit = 50) {
  return (await getPrisma()).ronda.findMany({
    include: { empleado: true, area: true, plantilla: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRondaById(id: number) {
  return (await getPrisma()).ronda.findUnique({
    where: { id },
    include: { empleado: true, area: true, plantilla: true },
  });
}

export async function crearRonda(formData: FormData) {
  const plantillaId = Number(formData.get("plantillaId"));
  const empleadoId = Number(formData.get("empleadoId"));
  const areaId = Number(formData.get("areaId"));
  if (!plantillaId || !empleadoId || !areaId) return { error: "Datos incompletos." };

  const ronda = await (await getPrisma()).ronda.create({
    data: {
      plantillaId, empleadoId, areaId,
      fecha: new Date(),
      horaInicio: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      estado: "EN_CURSO",
    },
  });
  revalidatePath("/rondas");
  return { success: true, rondaId: ronda.id };
}

export async function guardarRonda(formData: FormData) {
  const rondaId = Number(formData.get("rondaId"));
  const lecturasJson = formData.get("lecturas") as string;
  const observaciones = (formData.get("observaciones") as string) || null;
  const finalizar = formData.get("finalizar") === "true";

  let lecturas;
  try { lecturas = JSON.parse(lecturasJson || "[]"); } catch { lecturas = []; }

  // Count anomalies (readings out of range)
  const anomalias = lecturas.filter((l: any) => l.anomalia === true).length;

  await (await getPrisma()).ronda.update({
    where: { id: rondaId },
    data: {
      lecturas,
      observaciones,
      anomalias,
      estado: finalizar ? "COMPLETADA" : "EN_CURSO",
      horaFin: finalizar ? new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
  });

  await (await getPrisma()).auditoria.create({
    data: {
      tabla: "rondas",
      registroId: rondaId,
      accion: finalizar ? "RONDA_COMPLETADA" : "RONDA_ACTUALIZADA",
      usuario: "Operador",
      datosNuevos: { anomalias, totalPuntos: lecturas.length },
    },
  });

  revalidatePath("/rondas");
  return { success: true, anomalias };
}

export async function getEstadisticasRondas() {
  const prisma = await getPrisma();
  const [total, hoy, anomalias] = await Promise.all([
    prisma.ronda.count(),
    prisma.ronda.count({ where: { fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.ronda.aggregate({ _sum: { anomalias: true } }),
  ]);
  return { total, hoy, totalAnomalias: anomalias._sum.anomalias || 0 };
}
