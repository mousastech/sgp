"use client";

import { useI18n } from "@/lib/i18n";
import { HomeRoleBanner } from "./HomeRoleBanner";
import { MisPendientes } from "./MisPendientes";
import Link from "next/link";
import {
  ClipboardList, ClipboardCheck, CheckCircle, Play, Archive, AlertTriangle,
  ArrowRight, Clock, BarChart3, Shield, BookOpen,
} from "lucide-react";

const ESTADO_BADGE: Record<string, string> = {
  ENVIADO: "bg-blue-100 text-blue-700", EN_REVISION: "bg-indigo-100 text-indigo-700",
  AUTORIZADO: "bg-emerald-100 text-emerald-700", EN_EJECUCION: "bg-orange-100 text-orange-700",
  CIERRE_RESPONSABLE: "bg-teal-100 text-teal-700", CERRADO: "bg-gray-200 text-gray-700",
  RECHAZADO: "bg-red-100 text-red-700", SUSPENDIDO: "bg-rose-100 text-rose-700",
};

export function HomeClient({ data }: { data: any }) {
  const { t } = useI18n();

  const hora = new Date().getHours();
  const saludo = hora < 12 ? t("home.buenos_dias") : hora < 18 ? t("home.buenas_tardes") : t("home.buenas_noches");

  const flowSteps = [
    { state: t("flow.solicitud"), desc: t("flow.solicitud_desc"), color: "bg-blue-500" },
    { state: t("flow.revision"), desc: t("flow.revision_desc"), color: "bg-indigo-500" },
    { state: t("flow.autorizacion"), desc: t("flow.autorizacion_desc"), color: "bg-emerald-500" },
    { state: t("flow.erum"), desc: t("flow.erum_desc"), color: "bg-yellow-500" },
    { state: t("flow.ejecucion"), desc: t("flow.ejecucion_desc"), color: "bg-orange-500" },
    { state: t("flow.cierre"), desc: t("flow.cierre_desc"), color: "bg-teal-500" },
    { state: t("flow.cerrado"), desc: t("flow.cerrado_desc"), color: "bg-gray-500" },
  ];

  const quickActions = [
    { href: "/captura", label: t("home.nuevo_permiso"), desc: t("home.crear_solicitud"), icon: ClipboardList, color: "text-engie-blue", bg: "bg-engie-blue/5", border: "border-engie-blue/20" },
    { href: "/verificacion", label: t("home.verificacion"), desc: t("home.listas_especiales"), icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    { href: "/aprobacion", label: t("home.gestion"), desc: t("home.flujo_completo"), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { href: "/dashboard", label: "Dashboard", desc: t("home.kpis_metricas"), icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { href: "/bitacora", label: t("nav.bitacora"), desc: t("home.registro_formal"), icon: BookOpen, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/90 via-engie-blue/70 to-engie-blue-light/40 flex items-center p-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">{saludo}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("home.title")}</h1>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-2 max-w-xl">{t("home.subtitle")}</p>
          </div>
        </div>
      </div>

      <HomeRoleBanner />
      <MisPendientes />

      {/* Today's agenda */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
          {t("home.agenda")} — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </h2>
        {data.permisosHoy.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {data.permisosHoy.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div className="text-center min-w-[50px]">
                    <p className="text-lg font-bold text-engie-blue">{p.horaInicio || "--:--"}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-engie-blue">{p.folio}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ESTADO_BADGE[p.estado] || "bg-gray-100 text-gray-600"}`}>{p.estado.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate mt-0.5">{p.actividadEspecifica}</p>
                    <p className="text-xs text-gray-400">{p.empleado.nombreCompleto} — {p.area.nombre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-400">
            <Clock size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{t("home.sin_permisos_hoy")}</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{t("home.acciones_rapidas")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${item.border} ${item.bg} hover:shadow-md transition-all text-center group`}>
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={20} className={item.color} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Flow */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">{t("home.flujo")}</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {flowSteps.map((step, i) => (
            <div key={step.state} className="flex items-center min-w-0">
              <div className="flex flex-col items-center text-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full ${step.color} text-white text-xs font-bold flex items-center justify-center`}>{i + 1}</div>
                <p className="text-[10px] font-bold text-gray-700 mt-1">{step.state}</p>
                <p className="text-[9px] text-gray-400">{step.desc}</p>
              </div>
              {i < 6 && <div className="w-6 h-0.5 bg-gray-200 shrink-0 mt-[-12px]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {data.actividadReciente.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{t("home.actividad_reciente")}</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.actividadReciente.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.accion === "CREATE" ? "bg-blue-400" : a.accion === "AUTORIZADO" ? "bg-emerald-400" :
                  a.accion === "CERRADO" ? "bg-gray-400" : a.accion === "RECHAZADO" ? "bg-red-400" : "bg-orange-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700"><span className="font-semibold">{a.accion}</span> {a.tabla} {a.usuario && `— ${a.usuario}`}</p>
                </div>
                <p className="text-[10px] text-gray-400 shrink-0">{new Date(a.createdAt).toLocaleString("es-MX")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-4">
        <p className="text-xs text-gray-400">RENOVABLES-O-PR-01 Ed.2 | {t("common.powered")}</p>
      </div>
    </div>
  );
}
