"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarRonda } from "@/lib/actions/rondas";
import { Save, CheckCircle, AlertTriangle, ArrowLeft, Activity, Zap } from "lucide-react";

type Punto = { id: string; nombre: string; tipo: string; unidad?: string; min?: number; max?: number; opciones?: string[] };
type Ronda = {
  id: number; fecha: string; horaInicio: string | null; estado: string; lecturas: any;
  empleado: { nombreCompleto: string }; area: { nombre: string };
  plantilla: { nombre: string; puntos: Punto[] };
};

export function RondaForm({ ronda }: { ronda: Ronda }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (Array.isArray(ronda.lecturas)) {
      (ronda.lecturas as any[]).forEach((l) => { initial[l.id] = l; });
    }
    return initial;
  });
  const [saved, setSaved] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const readOnly = ronda.estado === "COMPLETADA";

  const puntos: Punto[] = Array.isArray(ronda.plantilla.puntos) ? ronda.plantilla.puntos : [];

  function setValue(id: string, field: string, val: any) {
    setValues((prev) => {
      const current = prev[id] || { id };
      const punto = puntos.find((p) => p.id === id);
      let anomalia = false;
      if (field === "valor" && punto?.min !== undefined && punto?.max !== undefined) {
        const num = parseFloat(val);
        if (!isNaN(num) && (num < punto.min || num > punto.max)) anomalia = true;
      }
      if (field === "valor" && punto?.tipo === "check_si_no" && val === "si") {
        // "si" to ruido/fuga = anomalia
        if (punto.id === "ruido" || punto.id === "fuga") anomalia = true;
      }
      return { ...prev, [id]: { ...current, [field]: val, anomalia: field === "valor" ? anomalia : current.anomalia } };
    });
  }

  function handleSave(finalizar: boolean) {
    const lecturas = puntos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      valor: values[p.id]?.valor ?? "",
      observacion: values[p.id]?.observacion ?? "",
      anomalia: values[p.id]?.anomalia ?? false,
    }));
    const fd = new FormData();
    fd.set("rondaId", String(ronda.id));
    fd.set("lecturas", JSON.stringify(lecturas));
    fd.set("observaciones", "");
    fd.set("finalizar", finalizar ? "true" : "false");
    startTransition(async () => {
      const res = await guardarRonda(fd);
      if (res.success) {
        setSaved(true);
        if (finalizar) {
          // Auto-run AI analysis
          setAiLoading(true);
          try {
            const aiRes = await fetch("/api/ai/ronda", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lecturas,
                plantilla: ronda.plantilla.nombre,
                area: ronda.area.nombre,
                tecnico: ronda.empleado.nombreCompleto,
              }),
            });
            const aiData = await aiRes.json();
            if (!aiData.error) setAiAnalysis(aiData);
          } catch {}
          setAiLoading(false);
        }
      }
    });
  }

  const anomaliaCount = Object.values(values).filter((v: any) => v.anomalia).length;

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-32">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/80 to-engie-blue-light/50 flex items-center p-6">
          <div>
            <h2 className="text-xl font-bold text-white">{ronda.plantilla.nombre}</h2>
            <p className="text-sm text-white/80">{ronda.area.nombre} — {ronda.empleado.nombreCompleto} — {new Date(ronda.fecha).toLocaleDateString("es-MX")}</p>
          </div>
        </div>
      </div>

      <button onClick={() => router.push("/rondas")} className="flex items-center gap-2 text-sm text-engie-blue hover:underline">
        <ArrowLeft size={14} /> Volver a Rondas
      </button>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> Ronda {readOnly || ronda.estado === "COMPLETADA" ? "completada" : "guardada"} exitosamente.
          {anomaliaCount > 0 && <span className="text-red-600 ml-2">{anomaliaCount} anomalia(s) detectada(s)</span>}
        </div>
      )}

      {readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-sm">Ronda completada — solo lectura.</div>
      )}

      {/* AI Analysis */}
      {aiLoading && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <Zap size={20} className="text-indigo-500" />
          <span className="text-sm text-indigo-700 font-medium">Analizando lecturas con IA...</span>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-indigo-600" />
              <span className="text-sm font-bold text-indigo-800">Analisis de IA — Ronda Completada</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              aiAnalysis.estadoGeneral === "CRITICO" ? "bg-red-100 text-red-700" :
              aiAnalysis.estadoGeneral === "ATENCION" ? "bg-amber-100 text-amber-700" :
              "bg-green-100 text-green-700"
            }`}>{aiAnalysis.estadoGeneral}</span>
          </div>

          <p className="text-sm text-indigo-900">{aiAnalysis.resumen}</p>

          {aiAnalysis.anomaliasDetectadas?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-bold text-red-700 mb-1">Anomalias Detectadas</p>
              {aiAnalysis.anomaliasDetectadas.map((a: string, i: number) => (
                <p key={i} className="text-xs text-red-600 flex items-start gap-1"><span className="shrink-0">!</span> {a}</p>
              ))}
            </div>
          )}

          {aiAnalysis.tendencias?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-700 mb-1">Tendencias a Monitorear</p>
              {aiAnalysis.tendencias.map((t: string, i: number) => (
                <p key={i} className="text-xs text-amber-600 flex items-start gap-1"><span className="shrink-0">~</span> {t}</p>
              ))}
            </div>
          )}

          {aiAnalysis.accionesRecomendadas?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-700 mb-1">Acciones Recomendadas</p>
              {aiAnalysis.accionesRecomendadas.map((a: string, i: number) => (
                <p key={i} className="text-xs text-blue-600 flex items-start gap-1"><span className="shrink-0">→</span> {a}</p>
              ))}
            </div>
          )}

          {aiAnalysis.proximoFoco && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs font-bold text-purple-700">Foco para Proxima Ronda</p>
              <p className="text-xs text-purple-600">{aiAnalysis.proximoFoco}</p>
            </div>
          )}

          <p className="text-[10px] text-indigo-400">Powered by Claude Sonnet 4.6 via Databricks FMAPI</p>
        </div>
      )}

      {anomaliaCount > 0 && !readOnly && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="text-sm font-semibold text-red-700">{anomaliaCount} lectura(s) fuera de rango detectada(s)</span>
        </div>
      )}

      {/* Inspection points */}
      <div className="space-y-3">
        {puntos.map((punto, i) => {
          const val = values[punto.id] || {};
          const isAnomalia = val.anomalia;
          return (
            <div key={punto.id} className={`bg-white rounded-xl border p-4 ${isAnomalia ? "border-red-300 bg-red-50/50" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-700">{punto.nombre}</span>
                  {punto.unidad && <span className="text-xs text-gray-400">({punto.unidad})</span>}
                  {isAnomalia && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">ANOMALIA</span>}
                </div>
                {punto.min !== undefined && <span className="text-[10px] text-gray-400">Rango: {punto.min} — {punto.max} {punto.unidad}</span>}
              </div>

              <div className="flex gap-3">
                {punto.tipo === "number" && (
                  <input type="number" step="any" value={val.valor ?? ""} disabled={readOnly}
                    onChange={(e) => setValue(punto.id, "valor", e.target.value)}
                    placeholder={`Ej: ${((punto.min || 0) + (punto.max || 0)) / 2}`}
                    className={`flex-1 rounded-lg border text-sm p-2 ${isAnomalia ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                )}

                {punto.tipo === "check_si_no" && (
                  <div className="flex gap-4">
                    {["si", "no"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name={punto.id} value={opt} checked={val.valor === opt} disabled={readOnly}
                          onChange={() => setValue(punto.id, "valor", opt)}
                          className="w-4 h-4 text-engie-blue" />
                        <span className="text-sm text-gray-700 uppercase">{opt === "si" ? "Si" : "No"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {punto.tipo === "select" && (
                  <select value={val.valor ?? ""} disabled={readOnly}
                    onChange={(e) => setValue(punto.id, "valor", e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 text-sm p-2 border">
                    <option value="">Seleccionar...</option>
                    {punto.opciones?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}

                {punto.tipo === "text" && (
                  <textarea value={val.valor ?? ""} disabled={readOnly}
                    onChange={(e) => setValue(punto.id, "valor", e.target.value)}
                    placeholder="Observaciones..."
                    className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" rows={2} />
                )}

                {punto.tipo !== "text" && (
                  <input type="text" value={val.observacion ?? ""} disabled={readOnly}
                    onChange={(e) => setValue(punto.id, "observacion", e.target.value)}
                    placeholder="Nota..." className="w-40 rounded-lg border-gray-300 text-sm p-2 border" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-3 bg-white rounded-xl border border-gray-200 p-5">
          <button onClick={() => handleSave(false)} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
            <Save size={16} /> {isPending ? "..." : "Guardar Borrador"}
          </button>
          <button onClick={() => handleSave(true)} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-engie-blue text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50">
            <CheckCircle size={16} /> {isPending ? "..." : "Finalizar Ronda"}
          </button>
        </div>
      )}
    </div>
  );
}
