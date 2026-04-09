"use client";

import { usePersona } from "@/lib/PersonaContext";
import { Shield, Wrench, Eye, Crown } from "lucide-react";

const PUESTO_LABELS: Record<string, string> = {
  JEFE_PLANTA: "Jefe de Planta", JEFE_MANTENIMIENTO: "Jefe de Mantenimiento",
  SUPERVISOR_HSE: "Supervisor HSE", ING_CONFIABILIDAD: "Ing. de Confiabilidad",
  TEC_MANTENIMIENTO: "Tec. de Mantenimiento", AUX_MANTENIMIENTO: "Aux. de Mantenimiento",
  CONTRATISTA: "Contratista",
};

export function HomeRoleBanner() {
  const { persona, loading } = usePersona();
  if (loading || !persona) return null;

  const puesto = persona.puestoHomologado ? PUESTO_LABELS[persona.puestoHomologado] : persona.puesto || "Operador";

  if (persona.esJefePlanta) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><Crown size={24} className="text-purple-600" /></div>
        <div>
          <p className="text-sm font-bold text-purple-800">{persona.nombreCompleto} — {puesto}</p>
          <p className="text-xs text-purple-600">Vista completa: puede autorizar permisos generales, trabajos especiales, y revisar todas las centrales.</p>
        </div>
      </div>
    );
  }

  if (persona.puedeSerAutorizador) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><Shield size={24} className="text-emerald-600" /></div>
        <div>
          <p className="text-sm font-bold text-emerald-800">{persona.nombreCompleto} — {puesto}</p>
          <p className="text-xs text-emerald-600">Revise permisos pendientes de autorizacion, registre ERUM, y confirme cierres.</p>
        </div>
      </div>
    );
  }

  if (persona.puedeSerResponsable && !persona.esContratista) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Wrench size={24} className="text-blue-600" /></div>
        <div>
          <p className="text-sm font-bold text-blue-800">{persona.nombreCompleto} — {puesto}</p>
          <p className="text-xs text-blue-600">Cree permisos, llene listas de verificacion, suba evidencia fotografica, y firme cierres.</p>
        </div>
      </div>
    );
  }

  if (persona.esContratista) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"><Eye size={24} className="text-orange-600" /></div>
        <div>
          <p className="text-sm font-bold text-orange-800">{persona.nombreCompleto} — Contratista</p>
          <p className="text-xs text-orange-600">Vista como Responsable del Trabajo. Puede llenar listas de verificacion y firmar cierres.</p>
        </div>
      </div>
    );
  }

  return null;
}
