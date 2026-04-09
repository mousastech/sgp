"use client";

import { useState } from "react";
import { TrendingUp, AlertTriangle, Shield, Clock, Zap } from "lucide-react";

const ESTADO_COLORS: Record<string, string> = {
  ENVIADO: "bg-blue-500", EN_REVISION: "bg-indigo-500", AUTORIZADO: "bg-emerald-500",
  EN_EJECUCION: "bg-orange-500", CIERRE_RESPONSABLE: "bg-teal-500", CERRADO: "bg-gray-400",
  RECHAZADO: "bg-red-500", DEVUELTO: "bg-yellow-500", SUSPENDIDO: "bg-rose-500",
};

const TIPO_LABELS: Record<string, string> = {
  ALTURAS: "Alturas", ESPACIOS_CONFINADOS: "Esp. Confinados", EXCAVACION: "Excavacion",
  CALIENTE: "Caliente", EQUIPO_ENERGIZADO: "Energizado", IZAJE_CARGAS: "Izaje",
  MAQUINARIA_PESADA: "Maq. Pesada", ICS: "ICS",
};

function Bar({ value, max, color, label, count }: { value: number; max: number; color: string; label: string; count?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-gray-600 w-32 truncate">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{count || value}</span>
    </div>
  );
}

export function AnaliticaView({ data }: { data: any }) {
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const maxPerArea = Math.max(...(data.permisosPorArea?.map((a: any) => a.total) || [1]));
  const maxRiesgo = 25;
  const totalPermisos = data.permisosPorEstado?.reduce((s: number, e: any) => s + e.total, 0) || 0;
  const loto = data.lotoStats?.[0] || { con_loto: 0, sin_loto: 0 };
  const tiempoCierre = data.tiempoCierrePromedio?.[0]?.dias_promedio || "N/A";

  // Parse tipos especiales (stored as JSON array strings)
  const tiposCount: Record<string, number> = {};
  (data.tiposEspeciales || []).forEach((row: any) => {
    try {
      const tipos = JSON.parse(row.tipos_trabajo_especial || "[]");
      tipos.forEach((t: string) => { tiposCount[t] = (tiposCount[t] || 0) + row.total; });
    } catch {}
  });
  const tiposArr = Object.entries(tiposCount).sort((a, b) => b[1] - a[1]);
  const maxTipo = Math.max(...tiposArr.map(([, v]) => v), 1);

  async function generateInsights() {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setInsights(result.insights || result.error);
    } catch (e: any) {
      setInsights("Error al generar insights: " + e.message);
    }
    setInsightsLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/80 to-purple-600/50 flex items-center p-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Analitica Predictiva de Riesgo</h2>
            <p className="text-sm text-white/80 mt-1">Patrones, tendencias e insights con IA — Powered by Claude Sonnet</p>
          </div>
          <button onClick={generateInsights} disabled={insightsLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition disabled:opacity-50">
            {insightsLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generando...</>
            ) : (
              <><Zap size={16} /> Generar Insights con IA</>
            )}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Shield size={20} className="text-engie-blue mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-engie-blue">{totalPermisos}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Permisos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Clock size={20} className="text-teal-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-teal-600">{tiempoCierre}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Dias Prom. Cierre</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <AlertTriangle size={20} className="text-yellow-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-yellow-600">{loto.con_loto}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Con LOTO</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <TrendingUp size={20} className="text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-red-600">{data.rechazadosPorArea?.length || 0}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Rechazos/Suspensiones</p>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-indigo-600" />
            <span className="text-sm font-bold text-indigo-800">Insights Generados por IA</span>
          </div>
          <div className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">{insights}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Permisos por estado */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Distribucion por Estado</h3>
          {(data.permisosPorEstado || []).map((e: any) => (
            <Bar key={e.estado} label={e.estado.replace(/_/g, " ")} value={e.total} max={totalPermisos}
              color={ESTADO_COLORS[e.estado] || "bg-gray-400"} />
          ))}
        </div>

        {/* Permisos por area */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Permisos por Area/Central</h3>
          {(data.permisosPorArea || []).map((a: any) => (
            <Bar key={a.area} label={a.area} value={a.total} max={maxPerArea} color="bg-engie-blue" />
          ))}
          {(!data.permisosPorArea || data.permisosPorArea.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>
          )}
        </div>

        {/* Tipos de trabajo especial */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Trabajos Especiales mas Frecuentes</h3>
          {tiposArr.map(([tipo, count]) => (
            <Bar key={tipo} label={TIPO_LABELS[tipo] || tipo} value={count} max={maxTipo} color="bg-purple-500" />
          ))}
          {tiposArr.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin datos de trabajos especiales</p>}
        </div>

        {/* Riesgo promedio por area */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Riesgo Promedio por Area</h3>
          {(data.riesgoPromedioPorArea || []).map((a: any) => (
            <Bar key={a.area} label={a.area} value={Number(a.riesgo_promedio)} max={maxRiesgo}
              color={Number(a.riesgo_promedio) > 15 ? "bg-red-500" : Number(a.riesgo_promedio) > 10 ? "bg-yellow-500" : "bg-emerald-500"}
              count={`${a.riesgo_promedio}/25`} />
          ))}
          {(!data.riesgoPromedioPorArea || data.riesgoPromedioPorArea.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos de riesgo</p>
          )}
        </div>

        {/* Rechazos/Suspensiones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Rechazos y Suspensiones por Area</h3>
          {(data.rechazadosPorArea || []).map((r: any, i: number) => (
            <Bar key={i} label={`${r.area} (${r.estado})`} value={r.total}
              max={Math.max(...(data.rechazadosPorArea || []).map((x: any) => x.total), 1)}
              color={r.estado === "RECHAZADO" ? "bg-red-500" : r.estado === "SUSPENDIDO" ? "bg-rose-500" : "bg-yellow-500"} />
          ))}
          {(!data.rechazadosPorArea || data.rechazadosPorArea.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">Sin rechazos ni suspensiones</p>
          )}
        </div>

        {/* Autorizadores mas activos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Autorizadores mas Activos</h3>
          {(data.autorizadoresMasActivos || []).map((a: any) => (
            <Bar key={a.autorizador} label={a.autorizador} value={a.total}
              max={Math.max(...(data.autorizadoresMasActivos || []).map((x: any) => x.total), 1)}
              color="bg-emerald-500" />
          ))}
          {(!data.autorizadoresMasActivos || data.autorizadoresMasActivos.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">Sin datos de autorizadores</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Analitica Predictiva de Riesgo — Datos en tiempo real desde Lakebase | IA: Claude Sonnet 4.6 via Databricks FMAPI
      </p>
    </div>
  );
}
