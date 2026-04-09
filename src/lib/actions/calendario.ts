"use server";

import { getPrisma } from "@/lib/prisma";

export async function getPermisosDelMes(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  return (await getPrisma()).permisoTrabajo.findMany({
    where: {
      fechaTrabajo: { gte: start, lt: end },
      estado: { not: "BORRADOR" },
    },
    include: {
      empleado: { select: { nombreCompleto: true } },
      area: { select: { nombre: true } },
    },
    orderBy: [{ fechaTrabajo: "asc" }, { horaInicio: "asc" }],
  });
}
