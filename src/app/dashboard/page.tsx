export const dynamic = "force-dynamic";

import { getDashboardStats, getPermisosRecientes, getAuditoria } from "@/lib/actions/admin";

export default async function DashboardPage() {
  const [stats, recientes, auditoria] = await Promise.all([
    getDashboardStats(),
    getPermisosRecientes(),
    getAuditoria(),
  ]);

  const totalDecididos = stats.cerrados + stats.rechazados;
  const tasaCierre = totalDecididos > 0 ? ((stats.cerrados / totalDecididos) * 100).toFixed(1) : null;
  const activos = stats.enviados + stats.enRevision + stats.autorizados + stats.enEjecucion + stats.suspendidos;

  const ESTADO_BADGE: Record<string, string> = {
    BORRADOR: "bg-gray-100 text-gray-600",
    ENVIADO: "bg-blue-100 text-blue-700",
    EN_REVISION: "bg-indigo-100 text-indigo-700",
    DEVUELTO: "bg-yellow-100 text-yellow-700",
    AUTORIZADO: "bg-emerald-100 text-emerald-700",
    EN_EJECUCION: "bg-orange-100 text-orange-700",
    SUSPENDIDO: "bg-rose-100 text-rose-700",
    CERRADO: "bg-gray-100 text-gray-700",
    RECHAZADO: "bg-red-100 text-red-700",
    APROBADO: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">Dashboard de Cumplimiento HSE</h2>
        </div>
      </div>

      {/* Pipeline KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Pendientes", value: stats.enviados, color: "text-blue-600" },
          { label: "En Revision", value: stats.enRevision, color: "text-indigo-600" },
          { label: "Autorizados", value: stats.autorizados, color: "text-emerald-600" },
          { label: "En Ejecucion", value: stats.enEjecucion, color: "text-orange-600" },
          { label: "Cerrados", value: stats.cerrados, color: "text-gray-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{kpi.label}</p>
            <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Permisos", value: stats.total, color: "text-engie-blue" },
          { label: "Activos Ahora", value: activos, color: "text-orange-600" },
          { label: "Rechazados", value: stats.rechazados, color: "text-red-600" },
          { label: "Suspendidos", value: stats.suspendidos, color: "text-rose-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{kpi.label}</p>
            <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {tasaCierre && (
        <div className="bg-gradient-to-r from-engie-blue to-engie-blue-light text-white rounded-xl p-5 flex items-center justify-between">
          <span className="font-semibold">Tasa de Cierre Exitoso</span>
          <span className="text-3xl font-extrabold">{tasaCierre}%</span>
        </div>
      )}

      {stats.total === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-800">
          No hay datos aun. Cree un permiso en la seccion Captura.
        </div>
      )}

      {/* Recent permits */}
      {recientes.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Ultimos Permisos</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">Folio</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Operador</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Area</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recientes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-engie-blue font-semibold">{p.folio}</td>
                    <td className="p-3 text-gray-600">{new Date(p.fechaTrabajo).toLocaleDateString("es-MX")}</td>
                    <td className="p-3 text-gray-700">{p.empleado.nombreCompleto}</td>
                    <td className="p-3 text-gray-600">{p.area.nombre}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado] || "bg-gray-100 text-gray-600"}`}>
                        {p.estado.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Audit */}
      {auditoria.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Registro de Auditoria</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">Tabla</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Accion</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditoria.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-700">{a.tabla}</td>
                    <td className="p-3 font-medium">{a.accion}</td>
                    <td className="p-3 text-gray-600">{a.usuario}</td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleString("es-MX")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
