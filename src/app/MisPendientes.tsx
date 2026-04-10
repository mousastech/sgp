"use client";

import { useState, useEffect } from "react";
import { usePersona } from "@/lib/PersonaContext";
import Link from "next/link";
import { Bell, ArrowRight, ClipboardCheck, AlertTriangle, Play, Search, CheckCircle, Archive } from "lucide-react";

type Pendiente = {
  tipo: string;
  titulo: string;
  detalle: string;
  href: string;
  color: string;
};

const ICONS: Record<string, any> = {
  LISTA_PENDIENTE: ClipboardCheck,
  LISTA_INCOMPLETA: ClipboardCheck,
  DEVUELTO: AlertTriangle,
  EN_EJECUCION: Play,
  POR_REVISAR: Search,
  EN_REVISION: CheckCircle,
  ERUM_PENDIENTE: AlertTriangle,
  CIERRE_AUTORIZADOR: Archive,
};

const COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  yellow:  { bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-800",  icon: "text-yellow-500" },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-800",  icon: "text-purple-500" },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-800",  icon: "text-indigo-500" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  icon: "text-orange-500" },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-800",    icon: "text-blue-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "text-emerald-500" },
  teal:    { bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-800",    icon: "text-teal-500" },
};

export function MisPendientes() {
  const { persona } = usePersona();
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!persona) return;
    setLoading(true);
    fetch(`/api/pendientes?empleadoId=${persona.id}`)
      .then((r) => r.json())
      .then((d) => setPendientes(d.pendientes || []))
      .catch(() => setPendientes([]))
      .finally(() => setLoading(false));
  }, [persona?.id]);

  if (!persona || loading) return null;
  if (pendientes.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Bell size={14} className="text-red-500" />
        Mis Pendientes — {persona.nombreCompleto}
      </h2>
      <div className="space-y-2">
        {pendientes.map((p, i) => {
          const Icon = ICONS[p.tipo] || Bell;
          const c = COLORS[p.color] || COLORS.blue;
          return (
            <Link key={i} href={p.href}
              className={`flex items-center gap-4 p-3 rounded-xl border ${c.border} ${c.bg} hover:shadow-md transition-all group`}>
              <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0`}>
                <Icon size={18} className={c.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${c.text}`}>{p.titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{p.detalle}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
