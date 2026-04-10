"use server";

import { getPrisma } from "@/lib/prisma";

export async function getTendenciasData() {
  const prisma = await getPrisma();

  const rondas = await prisma.ronda.findMany({
    where: { estado: "COMPLETADA" },
    include: { plantilla: true, area: true, empleado: true },
    orderBy: { fecha: "asc" },
    take: 100,
  });

  // Parse lecturas and build time series per punto
  const seriesPorPunto: Record<string, { nombre: string; unidad: string; min: number; max: number; datos: { fecha: string; valor: number; area: string; anomalia: boolean }[] }> = {};
  const anomaliasPorFecha: Record<string, number> = {};
  const rondasPorArea: Record<string, number> = {};
  const anomaliasPorArea: Record<string, number> = {};

  for (const ronda of rondas) {
    const fechaStr = new Date(ronda.fecha).toISOString().split("T")[0];
    anomaliasPorFecha[fechaStr] = (anomaliasPorFecha[fechaStr] || 0) + ronda.anomalias;
    rondasPorArea[ronda.area.nombre] = (rondasPorArea[ronda.area.nombre] || 0) + 1;
    anomaliasPorArea[ronda.area.nombre] = (anomaliasPorArea[ronda.area.nombre] || 0) + ronda.anomalias;

    const lecturas = Array.isArray(ronda.lecturas) ? ronda.lecturas : [];
    const puntos = Array.isArray(ronda.plantilla.puntos) ? ronda.plantilla.puntos : [];

    for (const lectura of lecturas as any[]) {
      if (!lectura.valor || lectura.valor === "") continue;
      const punto = puntos.find((p: any) => p.id === lectura.id) as any;
      if (!punto || punto.tipo !== "number") continue;

      const numVal = parseFloat(lectura.valor);
      if (isNaN(numVal)) continue;

      if (!seriesPorPunto[lectura.id]) {
        seriesPorPunto[lectura.id] = {
          nombre: punto.nombre || lectura.nombre || lectura.id,
          unidad: punto.unidad || "",
          min: punto.min ?? 0,
          max: punto.max ?? 100,
          datos: [],
        };
      }

      seriesPorPunto[lectura.id].datos.push({
        fecha: fechaStr,
        valor: numVal,
        area: ronda.area.nombre,
        anomalia: lectura.anomalia === true,
      });
    }
  }

  return {
    series: seriesPorPunto,
    anomaliasPorFecha: Object.entries(anomaliasPorFecha).map(([fecha, total]) => ({ fecha, total })),
    rondasPorArea: Object.entries(rondasPorArea).map(([area, total]) => ({ area, total })),
    anomaliasPorArea: Object.entries(anomaliasPorArea).map(([area, total]) => ({ area, total })),
    totalRondas: rondas.length,
    totalAnomalias: rondas.reduce((s, r) => s + r.anomalias, 0),
  };
}
