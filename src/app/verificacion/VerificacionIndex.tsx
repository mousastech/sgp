"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Plus, CheckCircle, Clock } from "lucide-react";
import { crearListaVerificacion } from "@/lib/actions/verificacion";
import { getFormDef } from "@/lib/verificacion-forms";

type Permiso = {
  id: number;
  folio: string;
  estado: string;
  tiposTrabajoEspecial: string | null;
  actividadEspecifica: string;
  empleado: { nombreCompleto: string };
  area: { nombre: string };
  listasVerificacion: { id: number; tipo: string; estado: string }[];
};

const TIPO_LABELS: Record<string, string> = {
  ALTURAS: "Trabajo en Alturas",
  ESPACIOS_CONFINADOS: "Espacios Confinados",
  EXCAVACION: "Excavacion",
  CALIENTE: "Trabajo en Caliente",
  EQUIPO_ENERGIZADO: "Equipo Energizado",
  IZAJE_CARGAS: "Izaje y Cargas",
  MAQUINARIA_PESADA: "Maquinaria Pesada",
  ICS: "Intervencion de ICS",
};

export function VerificacionIndex({ permisos }: { permisos: Permiso[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate(permisoId: number, tipo: string) {
    const def = getFormDef(tipo);
    if (!def) return;
    startTransition(async () => {
      const lista = await crearListaVerificacion(permisoId, tipo, def.codigo);
      router.push(`/verificacion/${lista.id}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/80 to-engie-blue-light/50 flex items-end p-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Listas de Verificacion</h2>
            <p className="text-sm text-white/80 mt-1">Formularios de trabajo especial por permiso</p>
          </div>
        </div>
      </div>

      {permisos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No hay permisos con trabajo especial requerido.
        </div>
      ) : (
        <div className="space-y-4">
          {permisos.map((pt) => {
            let tipos: string[] = [];
            try { tipos = JSON.parse(pt.tiposTrabajoEspecial || "[]"); } catch {}
            if (tipos.length === 0) return null;

            return (
              <div key={pt.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-sm font-bold text-engie-blue">{pt.folio}</span>
                  <span className="text-sm text-gray-600">{pt.empleado.nombreCompleto}</span>
                  <span className="text-sm text-gray-400">|</span>
                  <span className="text-sm text-gray-500">{pt.area.nombre}</span>
                  <span className={`ml-auto inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pt.estado === "CERRADO" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
                  }`}>{pt.estado.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1">{pt.actividadEspecifica}</p>

                <div className="space-y-2">
                  {tipos.map((tipo) => {
                    const existing = pt.listasVerificacion.find((l) => l.tipo === tipo);
                    const def = getFormDef(tipo);
                    return (
                      <div key={tipo} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <ClipboardCheck size={16} className={existing?.estado === "COMPLETADA" ? "text-green-600" : "text-purple-500"} />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{TIPO_LABELS[tipo] || tipo}</p>
                            <p className="text-[10px] text-gray-400">{def?.codigo}</p>
                          </div>
                        </div>
                        {existing ? (
                          existing.estado === "COMPLETADA" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Completada
                              </span>
                              <button
                                onClick={() => router.push(`/verificacion/${existing.id}`)}
                                className="text-xs text-engie-blue hover:underline"
                              >
                                Ver
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => router.push(`/verificacion/${existing.id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition"
                            >
                              <Clock size={12} /> Continuar
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleCreate(pt.id, tipo)}
                            disabled={isPending}
                            className="flex items-center gap-1 px-3 py-1.5 bg-engie-blue text-white text-xs font-semibold rounded-lg hover:bg-engie-blue-dark transition disabled:opacity-50"
                          >
                            <Plus size={12} /> Crear Lista
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
