"use server";

import { getPrisma } from "@/lib/prisma";

export async function getBitacora() {
  return (await getPrisma()).permisoTrabajo.findMany({
    where: { estado: { not: "BORRADOR" } },
    include: {
      empleado: { select: { nombreCompleto: true, numeroEmpleado: true } },
      area: { select: { nombre: true, ubicacion: true } },
      aprobaciones: {
        where: { decision: "AUTORIZADO" },
        include: { supervisor: { select: { nombreCompleto: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAreasActivas() {
  return (await getPrisma()).area.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}
