"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPermisosDelMes } from "@/lib/actions/calendario";

type Permiso = {
  id: number;
  folio: string;
  estado: string;
  fechaTrabajo: Date;
  horaInicio: string | null;
  actividadEspecifica: string;
  requiereLoto: boolean;
  empleado: { nombreCompleto: string };
  area: { nombre: string };
};

const ESTADO_DOT: Record<string, string> = {
  ENVIADO: "bg-blue-500", EN_REVISION: "bg-indigo-500", AUTORIZADO: "bg-emerald-500",
  EN_EJECUCION: "bg-orange-500", CIERRE_RESPONSABLE: "bg-teal-500", CERRADO: "bg-gray-400",
  RECHAZADO: "bg-red-500", DEVUELTO: "bg-yellow-500", SUSPENDIDO: "bg-rose-500",
};

const ESTADO_BG: Record<string, string> = {
  ENVIADO: "bg-blue-50 border-blue-200", EN_REVISION: "bg-indigo-50 border-indigo-200",
  AUTORIZADO: "bg-emerald-50 border-emerald-200", EN_EJECUCION: "bg-orange-50 border-orange-200",
  CIERRE_RESPONSABLE: "bg-teal-50 border-teal-200", CERRADO: "bg-gray-50 border-gray-200",
  RECHAZADO: "bg-red-50 border-red-200", SUSPENDIDO: "bg-rose-50 border-rose-200",
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export function CalendarioView({ initialPermisos, initialYear, initialMonth }: {
  initialPermisos: Permiso[];
  initialYear: number;
  initialMonth: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [permisos, setPermisos] = useState<Permiso[]>(initialPermisos);
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function navigate(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
    startTransition(async () => {
      const data = await getPermisosDelMes(newYear, newMonth);
      setPermisos(data);
    });
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Group permits by day
  const byDay: Record<number, Permiso[]> = {};
  permisos.forEach((p) => {
    const d = new Date(p.fechaTrabajo).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(p);
  });

  const selectedPermisos = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-32">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-center p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Calendario de Permisos</h2>
            <p className="text-sm text-white/80 mt-1">Vista mensual de permisos de trabajo programados</p>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {MESES[month]} {year}
          {isPending && <span className="text-xs text-gray-400 ml-2 font-normal">cargando...</span>}
        </h3>
        <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DIAS.map((d) => (
            <div key={d} className="text-center py-2 text-[11px] font-bold text-gray-500 uppercase">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPermisos = byDay[day] || [];
            const isToday = isCurrentMonth && day === today.getDate();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 text-left transition hover:bg-blue-50 ${
                  isSelected ? "bg-engie-blue/5 ring-2 ring-engie-blue ring-inset" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${
                    isToday ? "bg-engie-blue text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-gray-600"
                  }`}>
                    {day}
                  </span>
                  {dayPermisos.length > 0 && (
                    <span className="text-[10px] font-bold text-gray-400">{dayPermisos.length}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayPermisos.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ESTADO_DOT[p.estado] || "bg-gray-400"}`} />
                      <span className="text-[9px] text-gray-600 truncate">{p.folio}</span>
                    </div>
                  ))}
                  {dayPermisos.length > 3 && (
                    <span className="text-[9px] text-gray-400">+{dayPermisos.length - 3} mas</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            {selectedDay} de {MESES[month]} {year} — {selectedPermisos.length} permiso(s)
          </h3>
          {selectedPermisos.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No hay permisos para este dia.</p>
          ) : (
            <div className="space-y-2">
              {selectedPermisos.map((p) => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${ESTADO_BG[p.estado] || "bg-gray-50 border-gray-200"}`}>
                  <div className="text-center min-w-[45px]">
                    <p className="text-sm font-bold text-gray-700">{p.horaInicio || "--:--"}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-engie-blue">{p.folio}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        ESTADO_DOT[p.estado]?.replace("bg-", "text-") || "text-gray-500"
                      }`}>{p.estado.replace(/_/g, " ")}</span>
                      {p.requiereLoto && <span className="text-[9px] font-bold text-yellow-700 bg-yellow-100 px-1 rounded">LOTO</span>}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{p.actividadEspecifica}</p>
                    <p className="text-[10px] text-gray-400">{p.empleado.nombreCompleto} — {p.area.nombre}</p>
                  </div>
                  <a href={`/permiso/${p.id}/print`} target="_blank" className="text-xs text-engie-blue hover:underline shrink-0">PDF</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(ESTADO_DOT).map(([estado, color]) => (
          <div key={estado} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-gray-500">{estado.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
