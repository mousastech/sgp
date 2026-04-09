"use client";

import { usePersona } from "@/lib/PersonaContext";
import { Shield, AlertTriangle, Eye } from "lucide-react";

export function GestionRoleBanner() {
  const { persona, loading } = usePersona();

  if (loading || !persona) return null;

  if (persona.puedeSerAutorizador || persona.esJefePlanta) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
        <Shield size={18} className="text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Actuando como Autorizador: {persona.nombreCompleto}
            {persona.esJefePlanta && " [Jefe de Planta]"}
          </p>
          <p className="text-xs text-emerald-600">
            {persona.esJefePlanta
              ? "Puede autorizar permisos generales y trabajos especiales"
              : "Puede autorizar permisos generales"}
          </p>
        </div>
      </div>
    );
  }

  if (persona.puedeSerResponsable) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
        <Eye size={18} className="text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">
            Vista de Responsable: {persona.nombreCompleto}
          </p>
          <p className="text-xs text-blue-600">
            Puede ver permisos y firmar cierres, pero no puede autorizar.
            Para autorizar, cambie a un Autorizador en el selector de persona.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
      <AlertTriangle size={18} className="text-amber-600 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Vista de solo lectura: {persona.nombreCompleto}</p>
        <p className="text-xs text-amber-600">Su rol actual no permite realizar acciones en esta pantalla.</p>
      </div>
    </div>
  );
}
