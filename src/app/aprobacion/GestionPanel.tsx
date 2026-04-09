"use client";

import { useState, useTransition, useEffect } from "react";
import {
  iniciarRevision,
  autorizarPermiso,
  devolverPermiso,
  rechazarPermiso,
  registrarErum,
  extenderPermiso,
  suspenderPermiso,
  reanudarPermiso,
  cerrarPermiso,
  cierreResponsable,
  cierreAutorizador,
  getPermisosActivosEnArea,
} from "@/lib/actions/flujo";
import {
  Send,
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Clock,
  Archive,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lock,
  Shield,
} from "lucide-react";

type Supervisor = { id: number; numeroEmpleado: string; nombreCompleto: string };
type Permiso = {
  id: number;
  folio: string;
  estado: string;
  areaId: number;
  fechaTrabajo: Date;
  horaInicio: string | null;
  horaFin: string | null;
  actividadEspecifica: string;
  descripcionPasos: string;
  normaAplicable: string | null;
  riesgosIdentificados: string | null;
  medidasControl: string | null;
  observacionesOperador: string | null;
  requiereLoto: boolean;
  tiposTrabajoEspecial: string | null;
  motivoDevolucion: string | null;
  motivoRechazo: string | null;
  motivoSuspension: string | null;
  erumCompletado: boolean;
  extensionDias: number;
  cierreResponsable: string | null;
  cierreFechaResponsable: Date | null;
  coordenadasLatCaptura: { toString(): string } | null;
  coordenadasLonCaptura: { toString(): string } | null;
  empleado: { nombreCompleto: string; numeroEmpleado: string };
  area: { nombre: string; ubicacion: string | null };
  checklist: {
    cumple: boolean;
    observacion: string | null;
    equipo: { nombre: string; obligatorio: boolean; categoria: { nombre: string } };
  }[];
  aprobaciones: {
    decision: string;
    comentarios: string | null;
    fechaFirma: Date;
    supervisor: { nombreCompleto: string };
  }[];
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ENVIADO:       { label: "Pendientes",    color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-200" },
  EN_REVISION:   { label: "En Revision",   color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-200" },
  AUTORIZADO:    { label: "Autorizados",   color: "text-emerald-700",bg: "bg-emerald-100",border: "border-emerald-200" },
  EN_EJECUCION:  { label: "En Ejecucion",  color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" },
  CIERRE_RESPONSABLE: { label: "Cierre Pendiente", color: "text-teal-700", bg: "bg-teal-100", border: "border-teal-200" },
  CERRADO:       { label: "Cerrados",      color: "text-gray-700",   bg: "bg-gray-100",   border: "border-gray-200" },
  DEVUELTO:      { label: "Devueltos",     color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200" },
  RECHAZADO:     { label: "Rechazados",    color: "text-red-700",    bg: "bg-red-100",    border: "border-red-200" },
  SUSPENDIDO:    { label: "Suspendidos",   color: "text-rose-700",   bg: "bg-rose-100",   border: "border-rose-200" },
};

const PIPELINE_STATES = ["ENVIADO", "EN_REVISION", "AUTORIZADO", "EN_EJECUCION", "CIERRE_RESPONSABLE", "CERRADO"];
const OTHER_STATES = ["DEVUELTO", "RECHAZADO", "SUSPENDIDO"];

const TIPO_ESPECIAL_LABELS: Record<string, string> = {
  ALTURAS: "Alturas",
  ESPACIOS_CONFINADOS: "Espacios Confinados",
  EXCAVACION: "Excavacion",
  CALIENTE: "Trabajo en Caliente",
  EQUIPO_ENERGIZADO: "Equipo Energizado",
  IZAJE_CARGAS: "Izaje y Cargas",
  MAQUINARIA_PESADA: "Maquinaria Pesada",
  ICS: "Intervencion ICS",
};

export function GestionPanel({ supervisores, permisos }: { supervisores: Supervisor[]; permisos: Permiso[] }) {
  const [supId, setSupId] = useState(supervisores[0]?.id);
  const [activeTab, setActiveTab] = useState("ENVIADO");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const counts = Object.fromEntries(
    [...PIPELINE_STATES, ...OTHER_STATES].map((s) => [s, permisos.filter((p) => p.estado === s).length])
  );

  const filtered = permisos.filter((p) => p.estado === activeTab);

  function runAction(action: (fd: FormData) => Promise<any>, fd: FormData) {
    fd.set("supervisorId", String(supId));
    if (geo) { fd.set("lat", String(geo.lat)); fd.set("lon", String(geo.lon)); }
    startTransition(async () => {
      const res = await action(fd);
      if (res.success) {
        setFeedback(`Permiso ${res.folio}: accion completada.`);
        setExpandedId(null);
      } else {
        setFeedback(res.error || "Error.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Gestion de Permisos de Trabajo</h2>
            <p className="text-sm text-white/80 mt-1">Flujo segun RENOVABLES-O-PR-01 Ed.2</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-sm font-medium flex justify-between">
          {feedback}
          <button onClick={() => setFeedback(null)} className="text-blue-500 hover:underline text-xs">cerrar</button>
        </div>
      )}

      {/* Supervisor selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Actuar como Autorizador</span>
          <select value={supId} onChange={(e) => setSupId(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
            {supervisores.map((s) => (
              <option key={s.id} value={s.id}>{s.numeroEmpleado} — {s.nombreCompleto}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Pipeline visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Flujo del Permiso</p>
        <div className="flex items-center gap-1">
          {PIPELINE_STATES.map((state, i) => {
            const cfg = ESTADO_CONFIG[state];
            const count = counts[state] || 0;
            const isActive = activeTab === state;
            return (
              <div key={state} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveTab(state)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-center transition-all ${
                    isActive
                      ? `${cfg.bg} ${cfg.color} border-2 ${cfg.border} shadow-sm`
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <p className={`text-lg font-extrabold ${isActive ? cfg.color : "text-gray-700"}`}>{count}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide leading-tight">{cfg.label}</p>
                </button>
                {i < PIPELINE_STATES.length - 1 && (
                  <div className="text-gray-300 text-xs px-0.5 shrink-0">&#9654;</div>
                )}
              </div>
            );
          })}
        </div>
        {/* Other states row */}
        {OTHER_STATES.some((s) => (counts[s] || 0) > 0) && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            {OTHER_STATES.map((state) => {
              const cfg = ESTADO_CONFIG[state];
              const count = counts[state] || 0;
              if (count === 0) return null;
              return (
                <button key={state} onClick={() => setActiveTab(state)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === state
                      ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}>
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Permit cards */}
      {filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No hay permisos en estado "{ESTADO_CONFIG[activeTab]?.label}".
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{filtered.length} permiso(s)</p>
          {filtered.map((pt) => (
            <div key={pt.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === pt.id ? null : pt.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-engie-blue">{pt.folio}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ESTADO_CONFIG[pt.estado]?.bg} ${ESTADO_CONFIG[pt.estado]?.color}`}>
                    {ESTADO_CONFIG[pt.estado]?.label}
                  </span>
                  {pt.tiposTrabajoEspecial && (() => {
                    try { const tipos = JSON.parse(pt.tiposTrabajoEspecial); return tipos.map((t: string) => (
                      <span key={t} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        {TIPO_ESPECIAL_LABELS[t] || t}
                      </span>
                    )); } catch { return null; }
                  })()}
                  {pt.requiereLoto && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                      <Lock size={10} /> LOTO
                    </span>
                  )}
                  {pt.extensionDias > 0 && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                      +{pt.extensionDias}d ext.
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">|</span>
                  <span className="text-sm text-gray-700">{pt.empleado.nombreCompleto}</span>
                  <span className="text-gray-400 text-xs">|</span>
                  <span className="text-sm text-gray-500">{pt.area.nombre}</span>
                </div>
                {expandedId === pt.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {/* Expanded detail */}
              {expandedId === pt.id && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="font-semibold text-gray-600">Operador:</span> {pt.empleado.nombreCompleto} ({pt.empleado.numeroEmpleado})</div>
                    <div><span className="font-semibold text-gray-600">Fecha:</span> {new Date(pt.fechaTrabajo).toLocaleDateString("es-MX")}</div>
                    <div><span className="font-semibold text-gray-600">Horario:</span> {pt.horaInicio} — {pt.horaFin}</div>
                    <div><span className="font-semibold text-gray-600">Area:</span> {pt.area.nombre}</div>
                    <div><span className="font-semibold text-gray-600">Norma:</span> {pt.normaAplicable}</div>
                    {pt.coordenadasLatCaptura && (
                      <div><span className="font-semibold text-gray-600">GPS:</span> {pt.coordenadasLatCaptura?.toString()}, {pt.coordenadasLonCaptura?.toString()}</div>
                    )}
                  </div>

                  {/* Activity details */}
                  <div className="text-sm space-y-2">
                    <p><span className="font-semibold text-gray-600">Actividad:</span> {pt.actividadEspecifica}</p>
                    <p className="whitespace-pre-wrap"><span className="font-semibold text-gray-600">Pasos:</span> {pt.descripcionPasos}</p>
                    {pt.riesgosIdentificados && <p><span className="font-semibold text-gray-600">Riesgos:</span> {pt.riesgosIdentificados}</p>}
                    {pt.medidasControl && <p><span className="font-semibold text-gray-600">Medidas de control:</span> {pt.medidasControl}</p>}
                  </div>

                  {/* Special conditions badges */}
                  {(pt.tiposTrabajoEspecial || pt.requiereLoto) && (
                    <div className="flex gap-2 flex-wrap">
                      {pt.tiposTrabajoEspecial && (() => {
                        try { const tipos = JSON.parse(pt.tiposTrabajoEspecial); return tipos.length > 0 && (
                          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                            <Shield size={14} className="text-purple-600" />
                            <div>
                              <p className="text-xs font-bold text-purple-700">Trabajos Especiales: {tipos.map((t: string) => TIPO_ESPECIAL_LABELS[t] || t).join(", ")}</p>
                              <p className="text-[10px] text-purple-500">Requiere Lista de Verificacion + Jefe de Planta</p>
                            </div>
                          </div>
                        ); } catch { return null; }
                      })()}
                      {pt.requiereLoto && (
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                          <Lock size={14} className="text-yellow-600" />
                          <div>
                            <p className="text-xs font-bold text-yellow-700">LOTO Requerido</p>
                            <p className="text-[10px] text-yellow-500">Bloqueo y Etiquetado de energias</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* EPP Checklist */}
                  {pt.checklist.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Checklist EPP</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                        {pt.checklist.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={c.cumple ? "text-green-600" : "text-red-500"}>{c.cumple ? "✓" : "✗"}</span>
                            <span className={`${c.equipo.obligatorio && !c.cumple ? "text-red-700 font-semibold" : "text-gray-700"}`}>
                              {c.equipo.categoria.nombre} &gt; {c.equipo.nombre}
                            </span>
                            {c.observacion && <span className="text-gray-400 italic text-xs">— {c.observacion}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivo devolucion/rechazo/suspension */}
                  {pt.motivoDevolucion && pt.estado === "DEVUELTO" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-yellow-800">Motivo de devolucion:</p>
                      <p className="text-yellow-700">{pt.motivoDevolucion}</p>
                    </div>
                  )}
                  {pt.motivoRechazo && pt.estado === "RECHAZADO" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-red-800">Motivo de rechazo:</p>
                      <p className="text-red-700">{pt.motivoRechazo}</p>
                    </div>
                  )}
                  {pt.motivoSuspension && pt.estado === "SUSPENDIDO" && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-rose-800">Motivo de suspension:</p>
                      <p className="text-rose-700">{pt.motivoSuspension}</p>
                    </div>
                  )}

                  {/* Previous approvals */}
                  {pt.aprobaciones.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Historial de Decisiones</h4>
                      <div className="space-y-1 text-sm">
                        {pt.aprobaciones.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 text-gray-600">
                            <span className={a.decision === "AUTORIZADO" ? "text-green-600" : "text-red-500"}>
                              {a.decision === "AUTORIZADO" ? "✓" : "✗"}
                            </span>
                            <span className="font-medium">{a.decision}</span>
                            <span>por {a.supervisor.nombreCompleto}</span>
                            <span className="text-gray-400 text-xs">{new Date(a.fechaFirma).toLocaleString("es-MX")}</span>
                            {a.comentarios && <span className="italic text-gray-400">— {a.comentarios}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* === INTERFERENCE CHECK (sec. 6.4) === */}
                  {(pt.estado === "ENVIADO" || pt.estado === "EN_REVISION") && (
                    <InterferenceCheck permisoId={pt.id} areaId={pt.areaId} areaNombre={pt.area.nombre} />
                  )}

                  {/* === ACTION FORMS by state === */}

                  {/* ENVIADO: Iniciar Revision */}
                  {pt.estado === "ENVIADO" && (
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-bold text-engie-blue mb-3 flex items-center gap-2"><Search size={14} /> Revision de Alcance (6.4)</h4>
                      <p className="text-xs text-gray-500 mb-3">Evalua la actividad, area y alcance del trabajo. Verifica si existen interferencias con otros trabajos.</p>
                      <button
                        disabled={isPending}
                        onClick={() => {
                          const fd = new FormData();
                          fd.set("permisoId", String(pt.id));
                          runAction(iniciarRevision, fd);
                        }}
                        className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <Search size={14} /> {isPending ? "..." : "Tomar para Revision"}
                      </button>
                    </div>
                  )}

                  {/* EN_REVISION: Autorizar / Devolver / Rechazar */}
                  {pt.estado === "EN_REVISION" && (
                    <ActionFormRevision pt={pt} isPending={isPending} runAction={runAction} />
                  )}

                  {/* AUTORIZADO: Registrar ERUM */}
                  {pt.estado === "AUTORIZADO" && (
                    <ActionFormErum pt={pt} isPending={isPending} runAction={runAction} />
                  )}

                  {/* EN_EJECUCION: Extender / Suspender / Cerrar */}
                  {pt.estado === "EN_EJECUCION" && (
                    <ActionFormEjecucion pt={pt} isPending={isPending} runAction={runAction} />
                  )}

                  {/* CIERRE_RESPONSABLE: Autorizador confirma cierre */}
                  {pt.estado === "CIERRE_RESPONSABLE" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm">
                        <p className="font-semibold text-teal-800">Paso 1 completado — Responsable firmo el cierre</p>
                        <p className="text-teal-600 text-xs mt-1">Firmado por: {pt.cierreResponsable} el {pt.cierreFechaResponsable ? new Date(pt.cierreFechaResponsable).toLocaleString("es-MX") : ""}</p>
                      </div>
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(cierreAutorizador, fd); }}
                        className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-700 font-semibold">Paso 2 de 2 — Firma del Autorizador (sec. 6.12)</p>
                        <p className="text-xs text-gray-500">Confirme que las condiciones de orden, limpieza y estado final del area/equipo son adecuadas.</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="condicionesOk" value="true" className="w-4 h-4 rounded border-gray-300 text-engie-blue" />
                          <span className="text-sm text-gray-700">Las condiciones finales del area son adecuadas</span>
                        </label>
                        {pt.requiereLoto && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="lotoRetirado" value="true" className="w-4 h-4 rounded border-gray-300 text-orange-600" />
                            <span className="text-sm text-orange-700 font-semibold">Confirmo retiro del LOTO (sec. 6.13)</span>
                          </label>
                        )}
                        <button type="submit" disabled={isPending}
                          className="w-full bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                          <Archive size={14} /> {isPending ? "..." : "Confirmar Cierre (Autorizador)"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUSPENDIDO: Reanudar / Cerrar */}
                  {pt.estado === "SUSPENDIDO" && (
                    <ActionFormSuspendido pt={pt} isPending={isPending} runAction={runAction} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Sub-components for action forms ---

function ActionFormRevision({ pt, isPending, runAction }: { pt: Permiso; isPending: boolean; runAction: any }) {
  const [mode, setMode] = useState<"autorizar" | "devolver" | "rechazar" | null>(null);
  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <h4 className="text-sm font-bold text-engie-blue">Decision del Autorizador (6.7)</h4>
      <p className="text-xs text-gray-500">Valide: nombres/firmas presentes, descripcion adecuada del area/trabajo, analisis de riesgo cumplido, listas de verificacion completas.</p>
      <div className="flex gap-2">
        <button onClick={() => setMode("autorizar")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "autorizar" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}>
          <CheckCircle size={14} className="inline mr-1" /> Autorizar
        </button>
        <button onClick={() => setMode("devolver")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "devolver" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"}`}>
          <RotateCcw size={14} className="inline mr-1" /> Devolver
        </button>
        <button onClick={() => setMode("rechazar")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "rechazar" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"}`}>
          <XCircle size={14} className="inline mr-1" /> Rechazar
        </button>
      </div>

      {mode === "autorizar" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(autorizarPermiso, fd); }}
          className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <textarea name="comentarios" placeholder="Comentarios (opcional)..." rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <div className="bg-white border-2 border-dashed border-emerald-300 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-emerald-700">Firma Electronica del Autorizador</p>
          </div>
          <input type="password" name="password" placeholder="Contrasena para firmar *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
            {isPending ? "..." : "Confirmar Autorizacion"}
          </button>
        </form>
      )}

      {mode === "devolver" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(devolverPermiso, fd); }}
          className="space-y-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-yellow-700">El permiso sera devuelto al Responsable para correccion (6.4)</p>
          <textarea name="motivo" placeholder="Motivo de devolucion (obligatorio) *" required rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-yellow-500 text-white font-semibold py-2.5 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50">
            {isPending ? "..." : "Devolver para Correccion"}
          </button>
        </form>
      )}

      {mode === "rechazar" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(rechazarPermiso, fd); }}
          className="space-y-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <textarea name="motivo" placeholder="Motivo de rechazo (obligatorio) *" required rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <input type="password" name="password" placeholder="Contrasena para firmar *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50">
            {isPending ? "..." : "Confirmar Rechazo"}
          </button>
        </form>
      )}
    </div>
  );
}

function ActionFormErum({ pt, isPending, runAction }: { pt: Permiso; isPending: boolean; runAction: any }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="text-sm font-bold text-engie-blue mb-2 flex items-center gap-2"><AlertTriangle size={14} /> ERUM — Evaluacion de Riesgo de Ultimo Minuto (6.9)</h4>
      <p className="text-xs text-gray-500 mb-3">
        El Responsable, junto con el personal involucrado, debe ejecutar la ERUM antes de iniciar las actividades.
        Confirme que los riesgos fueron difundidos y las medidas de control verificadas.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(registrarErum, fd); }}
        className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-engie-blue mt-0.5" />
            <span className="text-sm text-gray-700">Analisis de riesgos difundido a todo el personal involucrado</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-engie-blue mt-0.5" />
            <span className="text-sm text-gray-700">Medidas de control verificadas en sitio</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-engie-blue mt-0.5" />
            <span className="text-sm text-gray-700">Documentos (AR, PT, listas de verificacion, ERUM) visibles en sitio</span>
          </label>
          {pt.requiereLoto && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-orange-600 mt-0.5" />
              <span className="text-sm text-orange-700 font-semibold">LOTO aplicado y verificado</span>
            </label>
          )}
        </div>
        <textarea name="observaciones" placeholder="Observaciones de la ERUM (riesgos adicionales, condiciones del sitio)..." rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
        <button type="submit" disabled={isPending}
          className="w-full bg-gradient-to-r from-engie-blue to-[#0055CC] text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Play size={14} /> {isPending ? "..." : "ERUM Completada — Iniciar Ejecucion"}
        </button>
      </form>
    </div>
  );
}

function ActionFormEjecucion({ pt, isPending, runAction }: { pt: Permiso; isPending: boolean; runAction: any }) {
  const [mode, setMode] = useState<"extender" | "suspender" | "cerrar" | null>(null);
  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <h4 className="text-sm font-bold text-engie-blue">Acciones en Ejecucion</h4>
      <div className="flex gap-2">
        {pt.extensionDias < 6 && (
          <button onClick={() => setMode("extender")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "extender" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"}`}>
            <Clock size={14} className="inline mr-1" /> Extender (+1 dia)
          </button>
        )}
        <button onClick={() => setMode("suspender")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "suspender" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"}`}>
          <Pause size={14} className="inline mr-1" /> Suspender (6.15.4)
        </button>
        <button onClick={() => setMode("cerrar")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "cerrar" ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"}`}>
          <Archive size={14} className="inline mr-1" /> Cerrar Permiso (6.12)
        </button>
      </div>

      {mode === "extender" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(extenderPermiso, fd); }}
          className="space-y-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-700">Extension {pt.extensionDias + 1} de 6. Verifica que el alcance y riesgos no hayan cambiado (6.10).</p>
          <textarea name="comentarios" placeholder="Justificacion de la extension..." rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-orange-500 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
            {isPending ? "..." : `Autorizar Extension (dia ${pt.extensionDias + 1}/6)`}
          </button>
        </form>
      )}

      {mode === "suspender" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(suspenderPermiso, fd); }}
          className="space-y-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-xs text-rose-700">Suspension por condiciones operativas o de seguridad (6.15.4 / 6.15.5 "stop the work")</p>
          <textarea name="motivo" placeholder="Motivo de suspension (obligatorio) *" required rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
            {isPending ? "..." : "Confirmar Suspension"}
          </button>
        </form>
      )}

      {mode === "cerrar" && (
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("permisoId", String(pt.id)); runAction(cierreResponsable, fd); }}
          className="space-y-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-xs text-teal-700 font-semibold">Paso 1 de 2 — Firma del Responsable del Trabajo (sec. 6.11)</p>
          <p className="text-xs text-teal-600">El Responsable declara la finalizacion del trabajo. Luego el Autorizador confirmara las condiciones finales.</p>
          <input type="text" name="nombreResponsable" placeholder="Nombre del Responsable del Trabajo *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <textarea name="observaciones" placeholder="Observaciones de cierre (condiciones finales, estado del area)..." rows={2} className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          <button type="submit" disabled={isPending}
            className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Archive size={14} /> {isPending ? "..." : "Firmar Cierre (Responsable)"}
          </button>
        </form>
      )}
    </div>
  );
}

function ActionFormSuspendido({ pt, isPending, runAction }: { pt: Permiso; isPending: boolean; runAction: any }) {
  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <h4 className="text-sm font-bold text-engie-blue">Permiso Suspendido</h4>
      <div className="flex gap-3">
        <button disabled={isPending}
          onClick={() => { const fd = new FormData(); fd.set("permisoId", String(pt.id)); runAction(reanudarPermiso, fd); }}
          className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Play size={14} /> {isPending ? "..." : "Reanudar Trabajo"}
        </button>
        <button disabled={isPending}
          onClick={() => {
            const fd = new FormData();
            fd.set("permisoId", String(pt.id));
            fd.set("condicionesOk", "false");
            fd.set("observaciones", `Cerrado desde suspension. Motivo original: ${pt.motivoSuspension || "N/A"}`);
            if (pt.requiereLoto) fd.set("lotoRetirado", "true");
            runAction(cerrarPermiso, fd);
          }}
          className="flex-1 bg-gray-700 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Archive size={14} /> {isPending ? "..." : "Cerrar Sin Reanudar"}
        </button>
      </div>
    </div>
  );
}

// --- Interference Check Component (sec. 6.4) ---

function InterferenceCheck({ permisoId, areaId, areaNombre }: { permisoId: number; areaId: number; areaNombre: string }) {
  const [interferencias, setInterferencias] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPermisosActivosEnArea(areaId, permisoId)
      .then((data) => setInterferencias(data))
      .catch(() => setInterferencias([]))
      .finally(() => setLoading(false));
  }, [areaId, permisoId]);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 animate-pulse">
        Verificando interferencia con otros trabajos en {areaNombre}...
      </div>
    );
  }

  if (!interferencias || interferencias.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
        <CheckCircle size={14} />
        Sin interferencia — no hay otros permisos activos en {areaNombre}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-amber-600" />
        <span className="text-sm font-bold text-amber-800">
          Interferencia detectada — {interferencias.length} permiso(s) activo(s) en {areaNombre}
        </span>
      </div>
      <p className="text-xs text-amber-600 mb-3">
        Seccion 6.4: El Autorizador debe evaluar si existen interferencias con otras actividades y condiciones de los equipos.
      </p>
      <div className="space-y-1.5">
        {interferencias.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-white border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-amber-700">{p.folio}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                p.estado === "EN_EJECUCION" ? "bg-orange-100 text-orange-700" :
                p.estado === "AUTORIZADO" ? "bg-emerald-100 text-emerald-700" :
                "bg-blue-100 text-blue-700"
              }`}>{p.estado.replace(/_/g, " ")}</span>
              <span className="text-xs text-gray-600">{p.empleado.nombreCompleto}</span>
            </div>
            <span className="text-xs text-gray-500">{p.actividadEspecifica?.slice(0, 50)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
}
