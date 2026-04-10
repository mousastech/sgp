"use client";

import { useState } from "react";
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, Zap } from "lucide-react";
import Link from "next/link";

type SerieData = {
  nombre: string;
  unidad: string;
  min: number;
  max: number;
  datos: { fecha: string; valor: number; area: string; anomalia: boolean }[];
};

type Props = {
  data: {
    series: Record<string, SerieData>;
    anomaliasPorFecha: { fecha: string; total: number }[];
    rondasPorArea: { area: string; total: number }[];
    anomaliasPorArea: { area: string; total: number }[];
    totalRondas: number;
    totalAnomalias: number;
  };
};

function MiniChart({ datos, min, max, unidad }: { datos: { fecha: string; valor: number; anomalia: boolean }[]; min: number; max: number; unidad: string }) {
  if (datos.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>;

  const chartMax = Math.max(max, ...datos.map((d) => d.valor)) * 1.1;
  const chartMin = Math.min(min, ...datos.map((d) => d.valor)) * 0.9;
  const range = chartMax - chartMin || 1;
  const barWidth = Math.max(8, Math.min(40, 600 / datos.length));

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-[2px] h-[120px] min-w-fit px-1 relative">
        {/* Range lines */}
        <div className="absolute left-0 right-0 border-t border-dashed border-green-300" style={{ bottom: `${((max - chartMin) / range) * 100}%` }}>
          <span className="text-[8px] text-green-500 absolute right-0 -top-3">{max}{unidad}</span>
        </div>
        <div className="absolute left-0 right-0 border-t border-dashed border-green-300" style={{ bottom: `${((min - chartMin) / range) * 100}%` }}>
          <span className="text-[8px] text-green-500 absolute right-0 -top-3">{min}{unidad}</span>
        </div>

        {datos.map((d, i) => {
          const height = Math.max(2, ((d.valor - chartMin) / range) * 100);
          return (
            <div key={i} className="flex flex-col items-center" style={{ width: barWidth }}>
              <div className="relative w-full" style={{ height: "120px" }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-all ${d.anomalia ? "bg-red-500" : "bg-cyan-500"}`}
                  style={{ height: `${height}%` }}
                  title={`${d.fecha}: ${d.valor} ${unidad}${d.anomalia ? " [ANOMALIA]" : ""}`}
                />
              </div>
              <span className="text-[7px] text-gray-400 mt-1 -rotate-45 origin-top-left whitespace-nowrap">
                {d.fecha.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-gray-600 w-40 truncate">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

export function TendenciasView({ data }: Props) {
  const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
  const serieKeys = Object.keys(data.series);
  const maxRondas = Math.max(...data.rondasPorArea.map((r) => r.total), 1);
  const maxAnomalias = Math.max(...data.anomaliasPorArea.map((a) => a.total), 1);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-800/80 to-indigo-600/50 flex items-center p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Historico de Tendencias — Rondas</h2>
            <p className="text-sm text-white/80 mt-1">Evolucion de lecturas, anomalias y patrones en el tiempo</p>
          </div>
        </div>
      </div>

      <Link href="/rondas" className="flex items-center gap-2 text-sm text-engie-blue hover:underline">
        <ArrowLeft size={14} /> Volver a Rondas
      </Link>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Activity size={20} className="text-cyan-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-cyan-600">{data.totalRondas}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Rondas Completadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <AlertTriangle size={20} className="text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-red-500">{data.totalAnomalias}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Anomalias</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <TrendingUp size={20} className="text-indigo-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-indigo-600">{serieKeys.length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Parametros Monitoreados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Zap size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-amber-500">
            {data.totalRondas > 0 ? (data.totalAnomalias / data.totalRondas).toFixed(1) : 0}
          </p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Anomalias/Ronda Prom.</p>
        </div>
      </div>

      {data.totalRondas === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          No hay rondas completadas para mostrar tendencias. Complete al menos una ronda.
        </div>
      ) : (
        <>
          {/* Parameter selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Tendencia por Parametro</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {serieKeys.map((key) => {
                const serie = data.series[key];
                const hasAnomalia = serie.datos.some((d) => d.anomalia);
                return (
                  <button key={key} onClick={() => setSelectedSerie(selectedSerie === key ? null : key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedSerie === key
                        ? "bg-cyan-600 text-white"
                        : hasAnomalia
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}>
                    {serie.nombre} {hasAnomalia && "!"}
                  </button>
                );
              })}
            </div>

            {selectedSerie && data.series[selectedSerie] && (() => {
              const serie = data.series[selectedSerie];
              const lastVal = serie.datos[serie.datos.length - 1];
              const anomCount = serie.datos.filter((d) => d.anomalia).length;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-700">{serie.nombre}</span>
                      <span className="text-xs text-gray-400 ml-2">Rango normal: {serie.min} — {serie.max} {serie.unidad}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastVal && <span className="text-sm font-bold text-cyan-600">Ultimo: {lastVal.valor} {serie.unidad}</span>}
                      {anomCount > 0 && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{anomCount} anomalia(s)</span>}
                    </div>
                  </div>
                  <MiniChart datos={serie.datos} min={serie.min} max={serie.max} unidad={serie.unidad} />
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan-500 rounded-sm inline-block"></span> Normal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm inline-block"></span> Anomalia (fuera de rango)</span>
                    <span className="flex items-center gap-1"><span className="border-t border-dashed border-green-400 w-4 inline-block"></span> Limites</span>
                  </div>
                </div>
              );
            })()}

            {!selectedSerie && <p className="text-xs text-gray-400 text-center py-4">Seleccione un parametro para ver su tendencia</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anomalias por fecha */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Anomalias por Fecha</h3>
              {data.anomaliasPorFecha.length > 0 ? (
                <div className="space-y-1">
                  {data.anomaliasPorFecha.slice(-10).map((a) => (
                    <Bar key={a.fecha} label={a.fecha} value={a.total}
                      max={Math.max(...data.anomaliasPorFecha.map((x) => x.total))}
                      color={a.total > 3 ? "bg-red-500" : a.total > 1 ? "bg-amber-500" : "bg-green-500"} />
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>}
            </div>

            {/* Rondas por area */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Rondas por Area</h3>
              {data.rondasPorArea.map((r) => (
                <Bar key={r.area} label={r.area} value={r.total} max={maxRondas} color="bg-cyan-500" />
              ))}
              {data.rondasPorArea.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>}
            </div>

            {/* Anomalias por area */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Anomalias por Area</h3>
              {data.anomaliasPorArea.map((a) => (
                <Bar key={a.area} label={a.area} value={a.total} max={maxAnomalias}
                  color={a.total > 5 ? "bg-red-500" : a.total > 2 ? "bg-amber-500" : "bg-green-500"} />
              ))}
              {data.anomaliasPorArea.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>}
            </div>

            {/* All parameters summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Resumen de Parametros</h3>
              <div className="space-y-2">
                {serieKeys.map((key) => {
                  const serie = data.series[key];
                  const vals = serie.datos.map((d) => d.valor);
                  const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
                  const last = vals[vals.length - 1]?.toFixed(1) || "—";
                  const anomCount = serie.datos.filter((d) => d.anomalia).length;
                  return (
                    <div key={key} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-700 font-medium">{serie.nombre}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400">Prom: {avg}</span>
                        <span className="text-cyan-600 font-bold">Ultimo: {last}</span>
                        {anomCount > 0 && <span className="text-red-500 font-bold">{anomCount}!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 text-center">
        Historico de Tendencias — Rondas Operativas | Datos desde Lakebase PostgreSQL
      </p>
    </div>
  );
}
