"use client";

import { useState, useTransition } from "react";
import { usePersona } from "@/lib/PersonaContext";
import { crearCategoria, editarCategoria, desactivarCategoria, crearEquipo, editarEquipo, desactivarEquipo, crearArea, editarArea, desactivarArea, crearEmpleado, editarEmpleado, desactivarEmpleado } from "@/lib/actions/admin";
import { Pencil, Trash2, Shield, AlertTriangle } from "lucide-react";

type Props = {
  categorias: { id: number; nombre: string; descripcion: string | null }[];
  equipos: { id: number; nombre: string; obligatorio: boolean; categoria: { nombre: string } }[];
  areas: { id: number; nombre: string; ubicacion: string | null }[];
  empleados: { id: number; numeroEmpleado: string; nombreCompleto: string; puesto: string | null; puestoHomologado: string | null; esSupervisor: boolean; email: string | null; area: { nombre: string } | null }[];
};

type Tab = "categorias" | "equipos" | "areas" | "empleados";

const ADMIN_ROLES = ["JEFE_PLANTA", "JEFE_MANTENIMIENTO", "SUPERVISOR_HSE"];

export function AdminPanel({ categorias, equipos, areas, empleados }: Props) {
  const { persona } = usePersona();
  const [tab, setTab] = useState<Tab>("areas");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const canAdmin = !persona || ADMIN_ROLES.includes(persona.puestoHomologado || "");

  function handleAction(action: (fd: FormData) => Promise<{ success?: boolean; error?: string }>) {
    return (formData: FormData) => {
      startTransition(async () => {
        const res = await action(formData);
        setMsg(res.error || "Guardado correctamente.");
        setEditId(null);
      });
    };
  }

  function handleDeactivate(type: string, id: number) {
    if (!confirm("Desactivar este registro? No se eliminara, solo se ocultara.")) return;
    startTransition(async () => {
      if (type === "categoria") await desactivarCategoria(id);
      else if (type === "equipo") await desactivarEquipo(id);
      else if (type === "area") await desactivarArea(id);
      else if (type === "empleado") await desactivarEmpleado(id);
      setMsg("Registro desactivado.");
    });
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "areas", label: "Areas / Centrales" },
    { key: "empleados", label: "Empleados" },
    { key: "categorias", label: "Categorias EPP" },
    { key: "equipos", label: "Equipos EPP" },
  ];

  if (!canAdmin) {
    return (
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
          <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Administracion de Catalogos</h2>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-800">Acceso Restringido</h3>
          <p className="text-sm text-red-600 mt-2">Solo Jefe de Planta, Jefe de Mantenimiento y Supervisor HSE pueden administrar los catalogos.</p>
          <p className="text-xs text-red-400 mt-2">Persona actual: {persona?.nombreCompleto} — {persona?.puestoHomologado || "Sin puesto"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-engie-blue/80 to-engie-blue-light/50 flex items-end p-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">Administracion de Catalogos</h2>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-sm font-medium flex justify-between">
          {msg}
          <button onClick={() => setMsg(null)} className="text-blue-500 hover:underline text-xs">cerrar</button>
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setEditId(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${tab === t.key ? "bg-engie-blue text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ AREAS ═══ */}
      {tab === "areas" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left p-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-3 font-semibold text-gray-600">Ubicacion</th>
                <th className="text-right p-3 font-semibold text-gray-600 w-24">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {areas.map((a) => editId === a.id ? (
                  <tr key={a.id} className="bg-blue-50">
                    <td colSpan={3} className="p-3">
                      <form action={handleAction(editarArea)} className="flex gap-2 items-center">
                        <input type="hidden" name="id" value={a.id} />
                        <input name="nombre" defaultValue={a.nombre} required className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" />
                        <input name="ubicacion" defaultValue={a.ubicacion || ""} className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" placeholder="Ubicacion" />
                        <button type="submit" disabled={isPending} className="px-3 py-2 bg-engie-blue text-white text-xs font-semibold rounded-lg">Guardar</button>
                        <button type="button" onClick={() => setEditId(null)} className="px-3 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg">Cancelar</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{a.nombre}</td>
                    <td className="p-3 text-gray-600">{a.ubicacion || "—"}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditId(a.id)} className="p-1 hover:bg-gray-100 rounded transition" title="Editar"><Pencil size={14} className="text-gray-400" /></button>
                      <button onClick={() => handleDeactivate("area", a.id)} className="p-1 hover:bg-red-50 rounded transition ml-1" title="Desactivar"><Trash2 size={14} className="text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* ═══ EMPLEADOS ═══ */}
      {tab === "empleados" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left p-3 font-semibold text-gray-600">No.</th>
                <th className="text-left p-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-3 font-semibold text-gray-600">Puesto</th>
                <th className="text-left p-3 font-semibold text-gray-600">Rol</th>
                <th className="text-left p-3 font-semibold text-gray-600">Area</th>
                <th className="text-right p-3 font-semibold text-gray-600 w-24">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {empleados.map((e) => editId === e.id ? (
                  <tr key={e.id} className="bg-blue-50">
                    <td colSpan={6} className="p-3">
                      <form action={handleAction(editarEmpleado)} className="grid grid-cols-3 gap-2">
                        <input type="hidden" name="id" value={e.id} />
                        <input name="nombreCompleto" defaultValue={e.nombreCompleto} required placeholder="Nombre *" className="rounded-lg border-gray-300 text-sm p-2 border" />
                        <input name="puesto" defaultValue={e.puesto || ""} placeholder="Puesto" className="rounded-lg border-gray-300 text-sm p-2 border" />
                        <input name="email" defaultValue={e.email || ""} placeholder="Email" className="rounded-lg border-gray-300 text-sm p-2 border" />
                        <select name="areaId" defaultValue={""} className="rounded-lg border-gray-300 text-sm p-2 border">
                          <option value="">(Sin area)</option>
                          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                        <select name="puestoHomologado" defaultValue={e.puestoHomologado || ""} className="rounded-lg border-gray-300 text-sm p-2 border">
                          <option value="">Puesto homologado</option>
                          <option value="JEFE_PLANTA">Jefe de Planta</option>
                          <option value="JEFE_MANTENIMIENTO">Jefe de Mantenimiento</option>
                          <option value="SUPERVISOR_HSE">Supervisor HSE</option>
                          <option value="ING_CONFIABILIDAD">Ing. de Confiabilidad</option>
                          <option value="TEC_MANTENIMIENTO">Tec. de Mantenimiento</option>
                          <option value="AUX_MANTENIMIENTO">Aux. de Mantenimiento</option>
                          <option value="CONTRATISTA">Contratista</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm p-2"><input type="checkbox" name="esSupervisor" value="true" defaultChecked={e.esSupervisor} className="rounded" /> Supervisor</label>
                        <div className="col-span-3 flex gap-2">
                          <button type="submit" disabled={isPending} className="px-4 py-2 bg-engie-blue text-white text-xs font-semibold rounded-lg">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg">Cancelar</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{e.numeroEmpleado}</td>
                    <td className="p-3 font-medium">{e.nombreCompleto}</td>
                    <td className="p-3 text-gray-600 text-xs">{e.puesto || "—"}</td>
                    <td className="p-3">
                      {e.puestoHomologado && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">{e.puestoHomologado.replace(/_/g, " ")}</span>}
                      {e.esSupervisor && <span className="text-[10px] font-bold text-emerald-600 ml-1">SUP</span>}
                    </td>
                    <td className="p-3 text-gray-600 text-xs">{e.area?.nombre || "—"}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditId(e.id)} className="p-1 hover:bg-gray-100 rounded transition"><Pencil size={14} className="text-gray-400" /></button>
                      <button onClick={() => handleDeactivate("empleado", e.id)} className="p-1 hover:bg-red-50 rounded transition ml-1"><Trash2 size={14} className="text-red-400" /></button>
                    </td>
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
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
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
              <label className="flex items-center gap-2 text-sm p-2.5"><input type="checkbox" name="esSupervisor" value="true" className="rounded" /> Es supervisor</label>
            </div>
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}

      {/* ═══ CATEGORIAS ═══ */}
      {tab === "categorias" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left p-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left p-3 font-semibold text-gray-600">Descripcion</th>
                <th className="text-right p-3 font-semibold text-gray-600 w-24">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {categorias.map((c) => editId === c.id ? (
                  <tr key={c.id} className="bg-blue-50">
                    <td colSpan={3} className="p-3">
                      <form action={handleAction(editarCategoria)} className="flex gap-2 items-center">
                        <input type="hidden" name="id" value={c.id} />
                        <input name="nombre" defaultValue={c.nombre} required className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" />
                        <input name="descripcion" defaultValue={c.descripcion || ""} className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" placeholder="Descripcion" />
                        <button type="submit" disabled={isPending} className="px-3 py-2 bg-engie-blue text-white text-xs font-semibold rounded-lg">Guardar</button>
                        <button type="button" onClick={() => setEditId(null)} className="px-3 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg">Cancelar</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.nombre}</td>
                    <td className="p-3 text-gray-600">{c.descripcion || "—"}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditId(c.id)} className="p-1 hover:bg-gray-100 rounded transition"><Pencil size={14} className="text-gray-400" /></button>
                      <button onClick={() => handleDeactivate("categoria", c.id)} className="p-1 hover:bg-red-50 rounded transition ml-1"><Trash2 size={14} className="text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={handleAction(crearCategoria)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Categoria</h3>
            <input name="nombre" placeholder="Nombre *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <input name="descripcion" placeholder="Descripcion" className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}

      {/* ═══ EQUIPOS ═══ */}
      {tab === "equipos" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left p-3 font-semibold text-gray-600">Categoria</th>
                <th className="text-left p-3 font-semibold text-gray-600">Equipo</th>
                <th className="text-left p-3 font-semibold text-gray-600">Obligatorio</th>
                <th className="text-right p-3 font-semibold text-gray-600 w-24">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {equipos.map((e) => editId === e.id ? (
                  <tr key={e.id} className="bg-blue-50">
                    <td colSpan={4} className="p-3">
                      <form action={handleAction(editarEquipo)} className="flex gap-2 items-center">
                        <input type="hidden" name="id" value={e.id} />
                        <input name="nombre" defaultValue={e.nombre} required className="flex-1 rounded-lg border-gray-300 text-sm p-2 border" />
                        <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="obligatorio" value="true" defaultChecked={e.obligatorio} className="rounded" /> Obligatorio</label>
                        <button type="submit" disabled={isPending} className="px-3 py-2 bg-engie-blue text-white text-xs font-semibold rounded-lg">Guardar</button>
                        <button type="button" onClick={() => setEditId(null)} className="px-3 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg">Cancelar</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-600">{e.categoria.nombre}</td>
                    <td className="p-3 font-medium">{e.nombre}</td>
                    <td className="p-3">{e.obligatorio ? <span className="text-orange-600 font-semibold text-xs">Si</span> : <span className="text-xs text-gray-400">No</span>}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditId(e.id)} className="p-1 hover:bg-gray-100 rounded transition"><Pencil size={14} className="text-gray-400" /></button>
                      <button onClick={() => handleDeactivate("equipo", e.id)} className="p-1 hover:bg-red-50 rounded transition ml-1"><Trash2 size={14} className="text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={handleAction(crearEquipo)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-engie-blue">Agregar Equipo</h3>
            <select name="categoriaId" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border">
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input name="nombre" placeholder="Nombre del equipo *" required className="block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="obligatorio" value="true" className="rounded" /> Obligatorio</label>
            <button type="submit" disabled={isPending} className="bg-engie-blue text-white font-semibold py-2 px-6 rounded-xl text-sm">Agregar</button>
          </form>
        </div>
      )}
    </div>
  );
}
