"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown, Shield, Star, Wrench, HardHat } from "lucide-react";

type Empleado = {
  id: number;
  numeroEmpleado: string;
  nombreCompleto: string;
  puesto: string | null;
  puestoHomologado: string | null;
  puedeSerAutorizador: boolean;
  esJefePlanta: boolean;
  esContratista: boolean;
};

const PUESTO_LABELS: Record<string, { label: string; short: string; color: string; bg: string }> = {
  JEFE_PLANTA:        { label: "Jefe de Planta",        short: "JP",  color: "text-purple-700", bg: "bg-purple-100" },
  JEFE_MANTENIMIENTO: { label: "Jefe de Mantenimiento",  short: "JM",  color: "text-blue-700",   bg: "bg-blue-100" },
  SUPERVISOR_HSE:     { label: "Supervisor HSE",         short: "HSE", color: "text-green-700",  bg: "bg-green-100" },
  ING_CONFIABILIDAD:  { label: "Ing. Confiabilidad",     short: "IC",  color: "text-indigo-700", bg: "bg-indigo-100" },
  TEC_MANTENIMIENTO:  { label: "Tec. Mantenimiento",     short: "TM",  color: "text-gray-700",   bg: "bg-gray-100" },
  AUX_MANTENIMIENTO:  { label: "Aux. Mantenimiento",     short: "AM",  color: "text-gray-600",   bg: "bg-gray-100" },
  CONTRATISTA:        { label: "Contratista",            short: "CT",  color: "text-orange-700", bg: "bg-orange-100" },
};

export function PersonaSwitcher({ collapsed }: { collapsed: boolean }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetch("/api/empleados")
      .then((r) => r.json())
      .then((data) => {
        setEmpleados(data);
        const saved = localStorage.getItem("engie_persona_id");
        if (saved && data.find((e: Empleado) => e.id === Number(saved))) {
          setSelectedId(Number(saved));
        } else if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function selectPersona(id: number) {
    setSelectedId(id);
    localStorage.setItem("engie_persona_id", String(id));
    setShowPicker(false);
  }

  const selected = empleados.find((e) => e.id === selectedId);
  const puestoInfo = selected?.puestoHomologado ? PUESTO_LABELS[selected.puestoHomologado] : null;

  if (collapsed) {
    return (
      <div className="p-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 mx-auto rounded-full bg-engie-blue/10 flex items-center justify-center hover:bg-engie-blue/20 transition relative"
          title={selected ? `${selected.nombreCompleto} — ${puestoInfo?.label || selected.puesto || ""}` : "Seleccionar persona"}
        >
          <User className="w-4 h-4 text-engie-blue" />
          {selected?.puedeSerAutorizador && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </button>
        {showPicker && (
          <div className="absolute bottom-16 left-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
            <PersonaList empleados={empleados} selectedId={selectedId} onSelect={selectPersona} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left"
      >
        <div className="w-9 h-9 rounded-full bg-engie-blue/10 flex items-center justify-center shrink-0 relative">
          <User className="w-4 h-4 text-engie-blue" />
          {selected?.puedeSerAutorizador && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Puede autorizar" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {selected?.nombreCompleto || "Seleccionar persona"}
          </p>
          <div className="flex items-center gap-1.5">
            {puestoInfo && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${puestoInfo.bg} ${puestoInfo.color}`}>
                {puestoInfo.short}
              </span>
            )}
            {selected?.puedeSerAutorizador && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Autorizador</span>
            )}
            {selected?.esJefePlanta && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Jefe Planta</span>
            )}
            {selected?.esContratista && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Contratista</span>
            )}
            {!puestoInfo && !selected?.esContratista && selected && (
              <span className="text-[10px] text-gray-400">Operador</span>
            )}
          </div>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showPicker ? "rotate-180" : ""}`} />
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <PersonaList empleados={empleados} selectedId={selectedId} onSelect={selectPersona} />
        </div>
      )}
    </div>
  );
}

function PersonaList({ empleados, selectedId, onSelect }: {
  empleados: Empleado[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  if (empleados.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        No hay empleados registrados. Configure en Administracion.
      </div>
    );
  }

  return (
    <div className="py-1">
      <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Simular como...</p>
      {empleados.map((e) => {
        const info = e.puestoHomologado ? PUESTO_LABELS[e.puestoHomologado] : null;
        const isSelected = e.id === selectedId;
        return (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition ${isSelected ? "bg-engie-blue/5" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-engie-blue text-white" : "bg-gray-100 text-gray-500"}`}>
              <User size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${isSelected ? "text-engie-blue" : "text-gray-700"}`}>
                {e.nombreCompleto}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-gray-400">{e.numeroEmpleado}</span>
                {info && <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${info.bg} ${info.color}`}>{info.label}</span>}
                {e.puedeSerAutorizador && <span className="text-[10px] font-bold text-emerald-600">● Autorizador</span>}
                {e.esJefePlanta && <span className="text-[10px] font-bold text-purple-600">★ Jefe Planta</span>}
              </div>
            </div>
            {isSelected && <div className="w-2 h-2 rounded-full bg-engie-blue shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
