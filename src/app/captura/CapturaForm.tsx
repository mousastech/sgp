"use client";

import { useState, useTransition, useEffect } from "react";
import { crearPermiso } from "@/lib/actions/permisos";

type Props = {
  empleados: { id: number; numeroEmpleado: string; nombreCompleto: string }[];
  areas: { id: number; nombre: string; ubicacion: string | null }[];
};

const NORMAS = [
  "NOM-031-STPS-2011 (Construccion)",
  "NOM-033-STPS-2015 (Espacios Confinados)",
  "NOM-009-STPS-2011 (Trabajos en Altura)",
  "NOM-029-STPS-2011 (Instalaciones Electricas)",
  "NOM-005-STPS-2017 (Sustancias Quimicas)",
  "Otra",
];

const TIPOS_ESPECIAL = [
  { key: "ALTURAS", label: "Trabajo en Altura (>1.80m)" },
  { key: "ESPACIOS_CONFINADOS", label: "Trabajo en Espacio Confinado" },
  { key: "EXCAVACION", label: "Excavacion" },
  { key: "CALIENTE", label: "Trabajo en Caliente" },
  { key: "EQUIPO_ENERGIZADO", label: "Trabajo con Equipo Energizado" },
  { key: "IZAJE_CARGAS", label: "Izaje y Mov. de Cargas Suspendidas" },
  { key: "ICS", label: "Permiso para Intervencion de ICS" },
  { key: "MAQUINARIA_PESADA", label: "Manejo de Maquinaria Pesada" },
];

export function CapturaForm({ empleados, areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; folio?: string; estado?: string; errors?: string[]; warning?: string } | null>(null);
  const [tiposEspecial, setTiposEspecial] = useState<Record<string, boolean>>({});
  const [warn24h, setWarn24h] = useState(false);
  const [requiereLoto, setRequiereLoto] = useState(false);
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>("Obteniendo ubicacion...");
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGeoStatus(`Ubicacion obtenida (precision: ${pos.coords.accuracy.toFixed(0)}m)`);
        },
        (err) => {
          setGeoStatus(err.code === 1 ? "Permiso de ubicacion denegado" : "No se pudo obtener ubicacion");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGeoStatus("Geolocalizacion no disponible en este navegador");
    }
  }, []);

  function toggleTipoEspecial(key: string) {
    setTiposEspecial((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selectedTipos = Object.entries(tiposEspecial).filter(([, v]) => v).map(([k]) => k);

  async function handleSubmit(formData: FormData) {
    formData.set("tiposTrabajoEspecial", JSON.stringify(selectedTipos));
    formData.set("requiereLoto", String(requiereLoto));

    startTransition(async () => {
      const res = await crearPermiso(formData);
      setResult(res);
      if (res.success) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Permiso de Trabajo General</h2>
            <p className="text-sm text-white/80 mt-1">RENOVABLES-O-PR-01-IN01-FO01</p>
          </div>
        </div>
      </div>

      {result?.success && (
        <div className="space-y-2 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 font-semibold">
            Permiso <span className="font-mono">{result.folio}</span> guardado como{" "}
            <span className="uppercase">{result.estado}</span>
          </div>
          {result.warning && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-800 text-sm">
              {result.warning}
            </div>
          )}
        </div>
      )}
      {result?.errors && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 space-y-1">
          {result.errors.map((e, i) => (
            <p key={i} className="text-red-700 text-sm">{e}</p>
          ))}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">

        {/* ═══════════ APARTADO I. SOLICITUD ═══════════ */}
        <div className="bg-engie-blue/5 border-l-4 border-engie-blue rounded-r-xl px-4 py-2">
          <h3 className="text-base font-bold text-engie-blue">I. Solicitud</h3>
          <p className="text-xs text-gray-500">Seccion 6.1 — Datos del permiso, personas y descripcion</p>
        </div>

        {/* Encabezado: Orden de trabajo + Fecha solicitada */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Encabezado del Permiso</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Orden de Trabajo # <span className="text-gray-400 font-normal">(2)</span></span>
              <input type="text" name="ordenTrabajo" placeholder="N/A si no aplica" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Solicitado para fecha * <span className="text-gray-400 font-normal">(3)</span></span>
              <input type="date" name="fechaTrabajo" defaultValue={today} required
                onChange={(e) => {
                  const selected = new Date(e.target.value + "T00:00:00");
                  const diff = selected.getTime() - Date.now();
                  setWarn24h(diff < 24 * 60 * 60 * 1000);
                }}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Hora solicitada <span className="text-gray-400 font-normal">(4)</span></span>
              <input type="time" name="horaInicio" defaultValue="08:00" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
          </div>
          {warn24h && (
            <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-lg mt-0.5">!</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Solicitud con menos de 24 horas de anticipacion</p>
                <p className="text-xs text-amber-600 mt-0.5">Sec. 6.3: Debe prevalecer la solicitud del trabajo de forma anticipada (mas de 24h antes de la fecha de ejecucion del trabajo) siempre que sea posible.</p>
              </div>
            </div>
          )}
        </section>

        {/* Datos de solicitud */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Datos de la Solicitud</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Duracion (dias) <span className="text-gray-400 font-normal">(7)</span></span>
              <input type="number" name="duracionDias" min={0} max={30} placeholder="1" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Duracion (horas) <span className="text-gray-400 font-normal">(8)</span></span>
              <input type="number" name="duracionHoras" min={0} max={24} step={0.5} placeholder="8" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Hora fin</span>
              <input type="time" name="horaFin" defaultValue="17:00" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Disp. emergencia (hrs) <span className="text-gray-400 font-normal">(9)</span></span>
              <input type="number" name="disponibilidadEmergencia" min={0} step={0.5} placeholder="2" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
          </div>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Area y/o equipo donde se ejecuta el trabajo * <span className="text-gray-400 font-normal">(10)</span></span>
            <select name="areaId" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.ubicacion || ""})</option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Descripcion detallada del trabajo * <span className="text-gray-400 font-normal">(11)</span></span>
            <textarea name="actividadEspecifica" required rows={2} placeholder="Descripcion clara del alcance: area, equipos, tag/codigo..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Paso a paso (procedimiento) *</span>
            <textarea name="descripcionPasos" required rows={4} placeholder="1. Desconectar alimentacion electrica&#10;2. Verificar ausencia de tension&#10;3. ..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Norma aplicable</span>
            <select name="normaAplicable" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
              <option value="">Seleccionar...</option>
              {NORMAS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </section>

        {/* Roles y personas */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Personas Involucradas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Solicitante ENGIE * <span className="text-gray-400 font-normal">(12)</span></span>
              <select name="empleadoId" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>{e.numeroEmpleado} — {e.nombreCompleto}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Responsable del Trabajo <span className="text-gray-400 font-normal">(13)</span></span>
              <input type="text" name="responsableTrabajo" placeholder="Nombre completo de quien ejecuta en sitio" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Depto. ENGIE o Contratista <span className="text-gray-400 font-normal">(14)</span></span>
              <input type="text" name="departamentoContratista" placeholder="Nombre del departamento o contratista" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nombre del Solicitante ENGIE <span className="text-gray-400 font-normal">(12)</span></span>
              <input type="text" name="solicitanteEngie" placeholder="Nombre y firma del solicitante" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
          </div>
        </section>

        {/* ═══════════ APARTADO II. ANALISIS DE SEGURIDAD ═══════════ */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl px-4 py-2">
          <h3 className="text-base font-bold text-red-700">II. Analisis de Seguridad</h3>
          <p className="text-xs text-red-400">Seccion 6.2 — Resultado del analisis de riesgos SEGURIDAD-PR-02-FO01</p>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Valor mas alto de la matriz de riesgos * <span className="text-gray-400 font-normal">(15)</span></span>
              <input type="number" name="valorRiesgoMax" min={1} max={25} placeholder="Ej: 12" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <p className="text-xs text-gray-400 mt-1">Del formato SEGURIDAD-PR-02-FO01, el valor cuantitativo mas alto de todos los pasos</p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Condiciones climatologicas <span className="text-gray-400 font-normal">(16)</span></span>
              <input type="text" name="condicionesClimaticas" placeholder="Ej: Lluvias, vientos fuertes, tormentas de arena..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <p className="text-xs text-gray-400 mt-1">Condiciones que podrian afectar la seguridad del trabajo</p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Riesgos identificados</span>
              <textarea name="riesgosIdentificados" rows={2} placeholder="Ej: Riesgo electrico, caida de altura, atrapamiento..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Medidas de control</span>
              <textarea name="medidasControl" rows={2} placeholder="Ej: Bloqueo/etiquetado (LOTO), linea de vida, ventilacion forzada..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </label>
          </div>
        </section>

        {/* ═══════════ APARTADO III. CONDICIONES ESPECIALES ═══════════ */}
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl px-4 py-2">
          <h3 className="text-base font-bold text-purple-700">III. Listas de Verificacion para Trabajo de Riesgo Especial</h3>
          <p className="text-xs text-purple-400">Seccion 6.3 — Marque Si o N/A para cada tipo de trabajo especial</p>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-4">
            Si el trabajo requiere algun tipo de riesgo especial, marque "Si". Puede seleccionar uno o mas tipos.
            Cada tipo seleccionado requerira su Lista de Verificacion correspondiente y la autorizacion del Jefe de Planta.
          </p>
          <div className="space-y-2 mb-4">
            {TIPOS_ESPECIAL.map((tipo) => (
              <label key={tipo.key} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                tiposEspecial[tipo.key]
                  ? "bg-purple-50 border-purple-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}>
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-sm text-gray-700 flex-1">{tipo.label}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tiposEspecial[tipo.key] || false}
                        onChange={() => toggleTipoEspecial(tipo.key)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={`text-xs font-semibold ${tiposEspecial[tipo.key] ? "text-purple-700" : "text-gray-400"}`}>Si</span>
                    </label>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* LOTO */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
            requiereLoto ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}>
            <label className="flex items-center gap-3 flex-1 cursor-pointer">
              <input
                type="checkbox"
                checked={requiereLoto}
                onChange={() => setRequiereLoto(!requiereLoto)}
                className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-700">LOTO (Bloqueo de Energia Peligrosa)</span>
              </div>
              {requiereLoto && (
                <input
                  type="text"
                  name="noLoto"
                  placeholder="No. LOTO (17)"
                  className="w-40 rounded-lg border-gray-300 shadow-sm text-sm p-2 border"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </label>
          </div>

          {selectedTipos.length > 0 && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-700 font-semibold">
                Trabajos Especiales seleccionados: {selectedTipos.length}
              </p>
              <p className="text-xs text-purple-500">
                Se requerira la Lista de Verificacion correspondiente y la autorizacion del Jefe de Planta para cada uno.
              </p>
            </div>
          )}
        </section>

        {/* ═══════════ GEOLOCALIZACION ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Geolocalizacion y Observaciones</h4>
          <div className={`text-xs mb-3 px-3 py-2 rounded-lg ${geo ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
            {geo ? `Ubicacion obtenida: ${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)} — ${geoStatus}` : geoStatus}
          </div>
          <input type="hidden" name="lat" value={geo?.lat ?? 0} />
          <input type="hidden" name="lon" value={geo?.lon ?? 0} />
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Observaciones adicionales</span>
            <textarea name="observacionesOperador" rows={2} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
          </label>
        </section>

        {/* ═══════════ SUBMIT ═══════════ */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="enviar" value="true" className="w-4 h-4 rounded border-gray-300 text-engie-blue" />
            <span className="text-sm font-medium text-gray-700">Enviar directamente para autorizacion</span>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="bg-gradient-to-r from-engie-blue to-[#0055CC] text-white font-semibold py-2.5 px-8 rounded-xl shadow-md hover:shadow-lg hover:from-engie-blue-dark hover:to-engie-blue transition-all disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Permiso"}
          </button>
        </div>
      </form>
    </div>
  );
}
