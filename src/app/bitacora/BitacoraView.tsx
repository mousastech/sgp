"use client";

import { useState } from "react";
import { Search, Download, Printer, Filter, X } from "lucide-react";

type Permiso = {
  id: number;
  folio: string;
  estado: string;
  fechaTrabajo: Date;
  horaInicio: string | null;
  actividadEspecifica: string;
  responsableTrabajo: string | null;
  tiposTrabajoEspecial: string | null;
  requiereLoto: boolean;
  createdAt: Date;
  fechaCierre: Date | null;
  empleado: { nombreCompleto: string; numeroEmpleado: string };
  area: { nombre: string; ubicacion: string | null };
  aprobaciones: { supervisor: { nombreCompleto: string } }[];
};

type Area = { id: number; nombre: string };

const ESTADO_BADGE: Record<string, string> = {
  ENVIADO: "bg-blue-100 text-blue-700",
  EN_REVISION: "bg-indigo-100 text-indigo-700",
  AUTORIZADO: "bg-emerald-100 text-emerald-700",
  EN_EJECUCION: "bg-orange-100 text-orange-700",
  CIERRE_RESPONSABLE: "bg-teal-100 text-teal-700",
  CERRADO: "bg-gray-200 text-gray-700",
  RECHAZADO: "bg-red-100 text-red-700",
  DEVUELTO: "bg-yellow-100 text-yellow-700",
  SUSPENDIDO: "bg-rose-100 text-rose-700",
};

export function BitacoraView({ permisos, areas }: { permisos: Permiso[]; areas: Area[] }) {
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = permisos.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.folio.toLowerCase().includes(q) &&
          !p.empleado.nombreCompleto.toLowerCase().includes(q) &&
          !p.actividadEspecifica.toLowerCase().includes(q) &&
          !(p.responsableTrabajo || "").toLowerCase().includes(q)) return false;
    }
    if (filtroEstado && p.estado !== filtroEstado) return false;
    if (filtroArea && p.area.nombre !== filtroArea) return false;
    if (filtroDesde) {
      const desde = new Date(filtroDesde);
      if (new Date(p.fechaTrabajo) < desde) return false;
    }
    if (filtroHasta) {
      const hasta = new Date(filtroHasta);
      hasta.setDate(hasta.getDate() + 1);
      if (new Date(p.fechaTrabajo) >= hasta) return false;
    }
    return true;
  });

  const hasFilters = filtroEstado || filtroArea || filtroDesde || filtroHasta;

  function clearFilters() {
    setFiltroEstado(""); setFiltroArea(""); setFiltroDesde(""); setFiltroHasta(""); setSearch("");
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Bitacora de Permisos de Trabajo</h2>
            <p className="text-sm text-white/80 mt-1">Registro formal con folios consecutivos — sec. 6.8 RENOVABLES-O-PR-01</p>
          </div>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Buscar por folio, solicitante, responsable, actividad..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-engie-blue" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${showFilters || hasFilters ? "bg-engie-blue text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            <Filter size={14} /> Filtros {hasFilters && `(${[filtroEstado, filtroArea, filtroDesde, filtroHasta].filter(Boolean).length})`}
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition no-print">
            <Printer size={14} /> Imprimir
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 flex-wrap items-end pt-2 border-t border-gray-100">
            <label className="block">
              <span className="text-xs text-gray-500">Estado</span>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="mt-1 block rounded-lg border-gray-300 shadow-sm text-sm p-2 border">
                <option value="">Todos</option>
                {Object.keys(ESTADO_BADGE).map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Area / Central</span>
              <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}
                className="mt-1 block rounded-lg border-gray-300 shadow-sm text-sm p-2 border">
                <option value="">Todas</option>
                {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Desde</span>
              <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)}
                className="mt-1 block rounded-lg border-gray-300 shadow-sm text-sm p-2 border" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Hasta</span>
              <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)}
                className="mt-1 block rounded-lg border-gray-300 shadow-sm text-sm p-2 border" />
            </label>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:underline pb-2">
                <X size={12} /> Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{filtered.length} de {permisos.length} registros</span>
        {hasFilters && <span className="text-engie-blue font-semibold">(filtrado)</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Folio</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Fecha Trabajo</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Area</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Solicitante</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Responsable</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Autorizador</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Especial</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Estado</th>
              <th className="text-left p-3 font-semibold text-gray-600 whitespace-nowrap">Cierre</th>
              <th className="text-center p-3 font-semibold text-gray-600 whitespace-nowrap no-print">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => {
              let tipos: string[] = [];
              try { tipos = JSON.parse(p.tiposTrabajoEspecial || "[]"); } catch {}
              const autorizador = p.aprobaciones?.[0]?.supervisor?.nombreCompleto || "—";
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-engie-blue font-bold whitespace-nowrap">{p.folio}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{new Date(p.fechaTrabajo).toLocaleDateString("es-MX")}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{p.area.nombre}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">{p.empleado.nombreCompleto}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{p.responsableTrabajo || "—"}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{autorizador}</td>
                  <td className="p-3 whitespace-nowrap">
                    {tipos.length > 0 ? (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">{tipos.length} tipo(s)</span>
                    ) : "—"}
                    {p.requiereLoto && <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded ml-1">LOTO</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ESTADO_BADGE[p.estado] || "bg-gray-100 text-gray-600"}`}>
                      {p.estado.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                    {p.fechaCierre ? new Date(p.fechaCierre).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap no-print">
                    {["AUTORIZADO", "EN_EJECUCION", "CIERRE_RESPONSABLE", "CERRADO"].includes(p.estado) && (
                      <a href={`/permiso/${p.id}/print`} target="_blank" className="text-gray-400 hover:text-engie-blue transition">
                        <Printer size={14} className="inline" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400">No hay registros que coincidan con los filtros.</div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center">
        Bitacora de Permisos de Trabajo — RENOVABLES-O-PR-01 sec. 6.8 — Retencion: 6 anos (EHS-12)
      </p>
    </div>
  );
}
