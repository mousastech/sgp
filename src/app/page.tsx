export const dynamic = "force-dynamic";

import { getHomeData } from "@/lib/actions/home";
import { HomeRoleBanner } from "./HomeRoleBanner";
import { MisPendientes } from "./MisPendientes";
import Link from "next/link";
import {
  ClipboardList,
  ClipboardCheck,
  CheckCircle,
  Play,
  Archive,
  AlertTriangle,
  ArrowRight,
  Clock,
  BarChart3,
  Shield,
  BookOpen,
} from "lucide-react";

const ESTADO_BADGE: Record<string, string> = {
  ENVIADO: "bg-blue-100 text-blue-700",
  EN_REVISION: "bg-indigo-100 text-indigo-700",
  AUTORIZADO: "bg-emerald-100 text-emerald-700",
  EN_EJECUCION: "bg-orange-100 text-orange-700",
  CIERRE_RESPONSABLE: "bg-teal-100 text-teal-700",
  CERRADO: "bg-gray-200 text-gray-700",
  RECHAZADO: "bg-red-100 text-red-700",
  SUSPENDIDO: "bg-rose-100 text-rose-700",
};

export default async function HomePage() {
  const data = await getHomeData();

  const pendingActions = [
    { count: data.pendientesRevision, label: "Permisos pendientes de revision", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", href: "/aprobacion" },
    { count: data.enRevision, label: "En revision por Autorizador", icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", href: "/aprobacion" },
    { count: data.autorizadosErum, label: "ERUM pendiente para iniciar", icon: AlertTriangle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", href: "/aprobacion" },
    { count: data.enEjecucion, label: "Trabajos en ejecucion ahora", icon: Play, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", href: "/aprobacion" },
    { count: data.cierrePendiente, label: "Cierre pendiente de Autorizador", icon: Archive, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", href: "/aprobacion" },
  ].filter((a) => a.count > 0);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos dias" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6">
      {/* Hero welcome */}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Sistema de Permisos de Trabajo</h1>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-2 max-w-xl">
              Gestion digital de permisos de trabajo alineada al procedimiento RENOVABLES-O-PR-01 Ed.2 para las centrales electricas con tecnologias renovables de ENGIE Mexico.
            </p>
          </div>
        </div>
      </div>

      {/* Role banner */}
      <HomeRoleBanner />

      {/* Personalized pending actions for selected persona */}
      <MisPendientes />

      {/* Pending actions */}
      {pendingActions.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Acciones Pendientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${action.border} ${action.bg} hover:shadow-md transition-all group`}>
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <span className={`text-2xl font-extrabold ${action.color}`}>{action.count}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {pendingActions.length === 0 && data.totalPermisos > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={24} />
          <div>
            <p className="text-sm font-semibold text-green-800">Todo al dia</p>
            <p className="text-xs text-green-600">No hay acciones pendientes en este momento.</p>
          </div>
        </div>
      )}

      {/* Today's agenda */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
          Agenda del Dia — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ESTADO_BADGE[p.estado] || "bg-gray-100 text-gray-600"}`}>
                        {p.estado.replace(/_/g, " ")}
                      </span>
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
            <p className="text-sm">No hay permisos programados para hoy.</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Acciones Rapidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: "/captura", label: "Nuevo Permiso", desc: "Crear solicitud", icon: ClipboardList, color: "text-engie-blue", bg: "bg-engie-blue/5", border: "border-engie-blue/20" },
            { href: "/verificacion", label: "Verificacion", desc: "Listas especiales", icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
            { href: "/aprobacion", label: "Gestion", desc: "Flujo completo", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { href: "/dashboard", label: "Dashboard", desc: "KPIs y metricas", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
            { href: "/bitacora", label: "Bitacora", desc: "Registro formal", icon: BookOpen, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
          ].map((item) => {
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

      {/* Flow summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Flujo del Permiso de Trabajo</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {[
            { state: "SOLICITUD", desc: "Captura en campo", color: "bg-blue-500" },
            { state: "REVISION", desc: "Autorizador evalua", color: "bg-indigo-500" },
            { state: "AUTORIZACION", desc: "Firma electronica", color: "bg-emerald-500" },
            { state: "ERUM", desc: "Riesgo ultimo minuto", color: "bg-yellow-500" },
            { state: "EJECUCION", desc: "Trabajo en curso", color: "bg-orange-500" },
            { state: "CIERRE", desc: "Doble firma", color: "bg-teal-500" },
            { state: "CERRADO", desc: "Archivado (6 anos)", color: "bg-gray-500" },
          ].map((step, i) => (
            <div key={step.state} className="flex items-center min-w-0">
              <div className="flex flex-col items-center text-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full ${step.color} text-white text-xs font-bold flex items-center justify-center`}>
                  {i + 1}
                </div>
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
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Actividad Reciente</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.actividadReciente.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.accion === "CREATE" ? "bg-blue-400" :
                  a.accion === "AUTORIZADO" ? "bg-emerald-400" :
                  a.accion === "CERRADO" ? "bg-gray-400" :
                  a.accion === "RECHAZADO" ? "bg-red-400" :
                  "bg-orange-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{a.accion}</span>
                    <span className="text-gray-400"> en </span>
                    <span className="text-gray-600">{a.tabla}</span>
                    {a.usuario && <span className="text-gray-400"> por </span>}
                    {a.usuario && <span className="text-gray-600">{a.usuario}</span>}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 shrink-0">{new Date(a.createdAt).toLocaleString("es-MX")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          RENOVABLES-O-PR-01 Ed.2 — Gestion de Permisos de Trabajo | Powered by Databricks Lakebase
        </p>
      </div>
    </div>
  );
}
