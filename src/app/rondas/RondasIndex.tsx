"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/lib/PersonaContext";
import { crearRonda, crearPlantilla } from "@/lib/actions/rondas";
import { Activity, Plus, Clock, AlertTriangle, CheckCircle, Play, TrendingUp } from "lucide-react";
import Link from "next/link";

type Plantilla = { id: number; nombre: string; descripcion: string | null; puntos: any; area: { nombre: string } | null };
type Ronda = { id: number; fecha: Date; horaInicio: string | null; horaFin: string | null; estado: string; anomalias: number; empleado: { nombreCompleto: string }; area: { nombre: string }; plantilla: { nombre: string } };
type Stats = { total: number; hoy: number; totalAnomalias: number };
type Area = { id: number; nombre: string };

const PUNTOS_DEFAULT = [
  { id: "temp_amb", nombre: "Temperatura ambiente", tipo: "number", unidad: "C", min: -10, max: 55 },
  { id: "presion", nombre: "Presion del sistema", tipo: "number", unidad: "bar", min: 0, max: 20 },
  { id: "vibracion", nombre: "Nivel de vibracion", tipo: "number", unidad: "mm/s", min: 0, max: 10 },
  { id: "ruido", nombre: "Ruido anormal", tipo: "check_si_no" },
  { id: "fuga", nombre: "Fugas visibles", tipo: "check_si_no" },
  { id: "estado_visual", nombre: "Estado visual del equipo", tipo: "select", opciones: ["Bueno", "Regular", "Malo", "Critico"] },
  { id: "limpieza", nombre: "Limpieza del area", tipo: "select", opciones: ["Bueno", "Regular", "Malo"] },
  { id: "senalizacion", nombre: "Senalizacion correcta", tipo: "check_si_no" },
  { id: "epp_personal", nombre: "Personal con EPP basico", tipo: "check_si_no" },
  { id: "observacion", nombre: "Observaciones generales", tipo: "text" },
];

export function RondasIndex({ plantillas, rondas, stats, areas }: { plantillas: Plantilla[]; rondas: Ronda[]; stats: Stats; areas: Area[] }) {
  const router = useRouter();
  const { persona } = usePersona();
  const [isPending, startTransition] = useTransition();
  const [showNewPlantilla, setShowNewPlantilla] = useState(false);
  const [showNewRonda, setShowNewRonda] = useState(false);

  function handleCrearRonda(plantillaId: number, areaId: number) {
    if (!persona) { alert("Seleccione una persona primero"); return; }
    const fd = new FormData();
    fd.set("plantillaId", String(plantillaId));
    fd.set("empleadoId", String(persona.id));
    fd.set("areaId", String(areaId));
    startTransition(async () => {
      const res = await crearRonda(fd);
      if (res.success) router.push(`/rondas/${res.rondaId}`);
    });
  }

  function handleCrearPlantilla(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("puntos", JSON.stringify(PUNTOS_DEFAULT));
    startTransition(async () => {
      await crearPlantilla(fd);
      setShowNewPlantilla(false);
    });
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/80 to-engie-blue-light/50 flex items-center p-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Rondas Operativas</h2>
            <p className="text-sm text-white/80 mt-1">Inspecciones de rutina, lecturas y verificaciones de campo</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNewRonda(!showNewRonda)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition">
              <Play size={16} /> Iniciar Ronda
            </button>
            <Link href="/rondas/tendencias"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition">
              <TrendingUp size={16} /> Tendencias
            </Link>
            <button onClick={() => setShowNewPlantilla(!showNewPlantilla)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white/80 text-sm rounded-xl hover:bg-white/20 transition">
              <Plus size={16} /> Plantilla
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Activity size={20} className="text-cyan-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-cyan-600">{stats.total}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Rondas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Clock size={20} className="text-engie-blue mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-engie-blue">{stats.hoy}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Hoy</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <AlertTriangle size={20} className="text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-red-500">{stats.totalAnomalias}</p>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Anomalias</p>
        </div>
      </div>

      {/* Start new ronda */}
      {showNewRonda && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-cyan-800">Iniciar Nueva Ronda</h3>
          {plantillas.length === 0 ? (
            <p className="text-xs text-cyan-600">No hay plantillas. Cree una primero.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plantillas.map((pl) => (
                <button key={pl.id} onClick={() => handleCrearRonda(pl.id, (pl.area as any)?.id || areas[0]?.id)}
                  disabled={isPending}
                  className="flex items-center gap-3 p-3 bg-white border border-cyan-200 rounded-lg hover:shadow-md transition text-left disabled:opacity-50">
                  <Play size={18} className="text-cyan-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{pl.nombre}</p>
                    <p className="text-[10px] text-gray-400">{pl.area?.nombre || "General"} — {Array.isArray(pl.puntos) ? pl.puntos.length : "?"} puntos</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New plantilla */}
      {showNewPlantilla && (
        <form onSubmit={handleCrearPlantilla} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-engie-blue">Crear Plantilla de Ronda</h3>
          <div className="grid grid-cols-2 gap-3">
            <input name="nombre" placeholder="Nombre de la plantilla *" required className="rounded-lg border-gray-300 text-sm p-2.5 border" />
            <select name="areaId" className="rounded-lg border-gray-300 text-sm p-2.5 border">
              <option value="">Area (opcional)</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <input name="descripcion" placeholder="Descripcion" className="block w-full rounded-lg border-gray-300 text-sm p-2.5 border" />
          <p className="text-xs text-gray-400">Se creara con 10 puntos de inspeccion predeterminados (temperatura, presion, vibracion, visual, etc.)</p>
          <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Crear Plantilla</button>
        </form>
      )}

      {/* Rondas list */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Rondas Recientes</h3>
        {rondas.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            No hay rondas registradas. Cree una plantilla e inicie su primera ronda.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left p-2 font-semibold text-gray-600">Fecha</th>
                <th className="text-left p-2 font-semibold text-gray-600">Plantilla</th>
                <th className="text-left p-2 font-semibold text-gray-600">Tecnico</th>
                <th className="text-left p-2 font-semibold text-gray-600">Area</th>
                <th className="text-left p-2 font-semibold text-gray-600">Horario</th>
                <th className="text-center p-2 font-semibold text-gray-600">Anomalias</th>
                <th className="text-left p-2 font-semibold text-gray-600">Estado</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {rondas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/rondas/${r.id}`)}>
                    <td className="p-2 text-gray-600">{new Date(r.fecha).toLocaleDateString("es-MX")}</td>
                    <td className="p-2 font-medium text-gray-700">{r.plantilla.nombre}</td>
                    <td className="p-2 text-gray-600">{r.empleado.nombreCompleto}</td>
                    <td className="p-2 text-gray-600">{r.area.nombre}</td>
                    <td className="p-2 text-gray-500">{r.horaInicio || "?"} — {r.horaFin || "..."}</td>
                    <td className="p-2 text-center">
                      {r.anomalias > 0 ? (
                        <span className="text-red-600 font-bold">{r.anomalias}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.estado === "COMPLETADA" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
