"use server";

import { getPrisma } from "@/lib/prisma";

export async function getAnaliticaData() {
  const prisma = await getPrisma();

  const [
    permisosPorEstado,
    permisosPorArea,
    rechazadosPorArea,
    tiposEspeciales,
    lotoStats,
    riesgoPromedioPorArea,
    permisosPorMes,
    autorizadoresMasActivos,
    tiempoCierrePromedio,
  ] = await Promise.all([
    // Permisos por estado
    prisma.$queryRawUnsafe(`
      SELECT estado, COUNT(*)::int as total
      FROM permisos_trabajo WHERE estado != 'BORRADOR'
      GROUP BY estado ORDER BY total DESC
    `),
    // Permisos por area
    prisma.$queryRawUnsafe(`
      SELECT a.nombre as area, COUNT(*)::int as total
      FROM permisos_trabajo p JOIN areas a ON p.area_id = a.id
      WHERE p.estado != 'BORRADOR'
      GROUP BY a.nombre ORDER BY total DESC LIMIT 10
    `),
    // Rechazados/Suspendidos por area
    prisma.$queryRawUnsafe(`
      SELECT a.nombre as area, p.estado, COUNT(*)::int as total
      FROM permisos_trabajo p JOIN areas a ON p.area_id = a.id
      WHERE p.estado IN ('RECHAZADO', 'SUSPENDIDO', 'DEVUELTO')
      GROUP BY a.nombre, p.estado ORDER BY total DESC LIMIT 10
    `),
    // Tipos de trabajo especial mas frecuentes
    prisma.$queryRawUnsafe(`
      SELECT tipos_trabajo_especial, COUNT(*)::int as total
      FROM permisos_trabajo
      WHERE tipos_trabajo_especial IS NOT NULL AND tipos_trabajo_especial != '[]'
      GROUP BY tipos_trabajo_especial ORDER BY total DESC LIMIT 10
    `),
    // LOTO stats
    prisma.$queryRawUnsafe(`
      SELECT
        SUM(CASE WHEN requiere_loto = true THEN 1 ELSE 0 END)::int as con_loto,
        SUM(CASE WHEN requiere_loto = false THEN 1 ELSE 0 END)::int as sin_loto
      FROM permisos_trabajo WHERE estado != 'BORRADOR'
    `),
    // Riesgo promedio por area
    prisma.$queryRawUnsafe(`
      SELECT a.nombre as area, ROUND(AVG(p.valor_riesgo_max), 1) as riesgo_promedio, COUNT(*)::int as total
      FROM permisos_trabajo p JOIN areas a ON p.area_id = a.id
      WHERE p.valor_riesgo_max IS NOT NULL AND p.estado != 'BORRADOR'
      GROUP BY a.nombre ORDER BY riesgo_promedio DESC LIMIT 10
    `),
    // Permisos por mes (ultimos 6 meses)
    prisma.$queryRawUnsafe(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as mes, COUNT(*)::int as total
      FROM permisos_trabajo WHERE estado != 'BORRADOR'
      GROUP BY mes ORDER BY mes DESC LIMIT 6
    `),
    // Autorizadores mas activos
    prisma.$queryRawUnsafe(`
      SELECT e.nombre_completo as autorizador, COUNT(*)::int as total
      FROM aprobaciones ap JOIN empleados e ON ap.supervisor_id = e.id
      WHERE ap.decision = 'AUTORIZADO'
      GROUP BY e.nombre_completo ORDER BY total DESC LIMIT 5
    `),
    // Tiempo promedio de cierre (dias)
    prisma.$queryRawUnsafe(`
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (fecha_cierre - created_at)) / 86400), 1) as dias_promedio
      FROM permisos_trabajo WHERE fecha_cierre IS NOT NULL
    `),
  ]);

  return {
    permisosPorEstado: JSON.parse(JSON.stringify(permisosPorEstado, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    permisosPorArea: JSON.parse(JSON.stringify(permisosPorArea, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    rechazadosPorArea: JSON.parse(JSON.stringify(rechazadosPorArea, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    tiposEspeciales: JSON.parse(JSON.stringify(tiposEspeciales, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    lotoStats: JSON.parse(JSON.stringify(lotoStats, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    riesgoPromedioPorArea: JSON.parse(JSON.stringify(riesgoPromedioPorArea, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    permisosPorMes: JSON.parse(JSON.stringify(permisosPorMes, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    autorizadoresMasActivos: JSON.parse(JSON.stringify(autorizadoresMasActivos, (_, v) => typeof v === "bigint" ? Number(v) : v)),
    tiempoCierrePromedio: JSON.parse(JSON.stringify(tiempoCierrePromedio, (_, v) => typeof v === "bigint" ? Number(v) : v)),
  };
}
