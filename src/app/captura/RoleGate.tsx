"use client";

import { usePersona } from "@/lib/PersonaContext";
import { AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";

export function CapturaRoleGate({ children }: { children: React.ReactNode }) {
  const { persona, loading } = usePersona();

  if (loading) return null;

  if (persona && persona.esContratista) {
    return (
      <div className="space-y-4 mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-800">Acceso Restringido</h3>
          <p className="text-sm text-red-600 mt-2">
            Los contratistas no pueden crear permisos de trabajo (Anexo 1).
            <br />Solo pueden ser asignados como <strong>Responsable del Trabajo</strong>.
          </p>
          <p className="text-xs text-red-400 mt-3">
            Persona actual: {persona.nombreCompleto} — Contratista
          </p>
        </div>
        <div className="text-center">
          <Link href="/aprobacion" className="text-sm text-engie-blue hover:underline">
            Ir a Gestion de Permisos →
          </Link>
        </div>
      </div>
    );
  }

  if (persona && !persona.puedeSerSolicitante) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-8">
        <Shield size={32} className="text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-800">Rol no habilitado</h3>
        <p className="text-sm text-amber-600 mt-2">
          Su puesto homologado no permite crear solicitudes de permisos de trabajo.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
