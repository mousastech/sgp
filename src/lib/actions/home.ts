"use server";

import { getPrisma } from "@/lib/prisma";

export async function getHomeData() {
  const prisma = await getPrisma();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPermisos,
    pendientesRevision,
    enRevision,
    autorizadosErum,
    enEjecucion,
    cierrePendiente,
    permisosHoy,
    actividadReciente,
  ] = await Promise.all([
    prisma.permisoTrabajo.count({ where: { estado: { not: "BORRADOR" } } }),
    prisma.permisoTrabajo.count({ where: { estado: "ENVIADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_REVISION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "AUTORIZADO" } }),
    prisma.permisoTrabajo.count({ where: { estado: "EN_EJECUCION" } }),
    prisma.permisoTrabajo.count({ where: { estado: "CIERRE_RESPONSABLE" } }),
    prisma.permisoTrabajo.findMany({
      where: { fechaTrabajo: { gte: today, lt: tomorrow }, estado: { not: "BORRADOR" } },
      include: { empleado: true, area: true },
      orderBy: { horaInicio: "asc" },
    }),
    prisma.auditoria.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    totalPermisos,
    pendientesRevision,
    enRevision,
    autorizadosErum,
    enEjecucion,
    cierrePendiente,
    permisosHoy,
    actividadReciente,
  };
}
