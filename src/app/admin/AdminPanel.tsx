"use client";

import { useState, useTransition } from "react";
import { crearCategoria, crearEquipo, crearArea, crearEmpleado } from "@/lib/actions/admin";

type Props = {
  categorias: { id: number; nombre: string; descripcion: string | null }[];
  equipos: { id: number; nombre: string; obligatorio: boolean; categoria: { nombre: string } }[];
  areas: { id: number; nombre: string; ubicacion: string | null }[];
  empleados: { id: number; numeroEmpleado: string; nombreCompleto: string; puesto: string | null; esSupervisor: boolean; email: string | null; area: { nombre: string } | null }[];
};

type Tab = "categorias" | "equipos" | "areas" | "empleados";

export function AdminPanel({ categorias, equipos, areas, empleados }: Props) {
  const [tab, setTab] = useState<Tab>("categorias");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function handleAction(action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>) {
    return (formData: FormData) => {
      startTransition(async () => {
        const res = await action(formData);
        setMsg(res.error || "Guardado correctamente.");
      });
    };
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "categorias", label: "Categorias EPP" },
    { key: "equipos", label: "Equipos EPP" },
    { key: "areas", label: "Areas" },
    { key: "empleados", label: "Empleados" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">Administracion de Catalogos</h2>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-sm font-medium">
          {msg}
          <button onClick={() => setMsg(null)} className="ml-3 text-blue-500 hover:underline text-xs">cerrar</button>
        </div>
      )}

      {/* Tab selector */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
              tab === t.key
                ? "bg-engie-blue text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- Categorias --- */}
      {tab === "categorias" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Categorias Existentes</h3>
            <div className="space-y-1 text-sm">
              {categorias.map((c) => (
                <p key={c.id}><span className="font-semibold">{c.nombre}</span> — {c.descripcion || "Sin descripcion"}</p>
              ))}
            </div>
          </div>
          <form action={handleAction(crearCategoria)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Categoria</h3>
            <input name="nombre" placeholder="Nombre *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <input name="descripcion" placeholder="Descripcion" className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}

      {/* --- Equipos --- */}
      {tab === "equipos" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">Categoria</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Equipo</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Obligatorio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipos.map((e) => (
                  <tr key={e.id}>
                    <td className="p-3 text-gray-600">{e.categoria.nombre}</td>
                    <td className="p-3 font-medium">{e.nombre}</td>
                    <td className="p-3">{e.obligatorio ? <span className="text-orange-600 font-semibold">Si</span> : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={handleAction(crearEquipo)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Equipo</h3>
            <select name="categoriaId" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <input name="nombre" placeholder="Nombre del equipo *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="obligatorio" value="true" className="rounded" />
              Obligatorio
            </label>
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}

      {/* --- Areas --- */}
      {tab === "areas" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Areas Existentes</h3>
            <div className="space-y-1 text-sm">
              {areas.map((a) => (
                <p key={a.id}><span className="font-semibold">{a.nombre}</span> — {a.ubicacion || "Sin ubicacion"}</p>
              ))}
            </div>
          </div>
          <form action={handleAction(crearArea)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Area</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="nombre" placeholder="Nombre *" required className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="ubicacion" placeholder="Ubicacion" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="lat" type="number" step="0.00000001" placeholder="Latitud" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="lon" type="number" step="0.00000001" placeholder="Longitud" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            </div>
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}

      {/* --- Empleados --- */}
      {tab === "empleados" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-600">No.</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Puesto</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Area</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empleados.map((e) => (
                  <tr key={e.id}>
                    <td className="p-3 font-mono">{e.numeroEmpleado}</td>
                    <td className="p-3 font-medium">{e.nombreCompleto}</td>
                    <td className="p-3 text-gray-600">{e.puesto || "—"}</td>
                    <td className="p-3 text-gray-600">{e.area?.nombre || "—"}</td>
                    <td className="p-3">{e.esSupervisor ? <span className="text-engie-blue font-semibold">Si</span> : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={handleAction(crearEmpleado)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Empleado</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="numeroEmpleado" placeholder="Numero empleado *" required className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="nombreCompleto" placeholder="Nombre completo *" required className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="puesto" placeholder="Puesto" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <input name="email" type="email" placeholder="Email corporativo" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
              <select name="areaId" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
                <option value="">(Sin area)</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              <select name="puestoHomologado" className="rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
                <option value="">Puesto homologado (Anexo 1)</option>
                <option value="JEFE_PLANTA">Jefe de Planta</option>
                <option value="JEFE_MANTENIMIENTO">Jefe de Mantenimiento</option>
                <option value="SUPERVISOR_HSE">Supervisor HSE</option>
                <option value="ING_CONFIABILIDAD">Ing. de Confiabilidad</option>
                <option value="TEC_MANTENIMIENTO">Tec. de Mantenimiento</option>
                <option value="AUX_MANTENIMIENTO">Aux. de Mantenimiento</option>
                <option value="CONTRATISTA">Contratista</option>
              </select>
              <label className="flex items-center gap-2 text-sm p-2.5">
                <input type="checkbox" name="esSupervisor" value="true" className="rounded" />
                Es supervisor
              </label>
            </div>
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}
    </div>
  );
}
