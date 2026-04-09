"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarRespuestas } from "@/lib/actions/verificacion";
import type { VerificationFormDef, FormSection, FormField } from "@/lib/verificacion-forms";
import { CheckCircle, Save, ArrowLeft } from "lucide-react";

type ListaData = {
  id: number;
  tipo: string;
  estado: string;
  respuestas: Record<string, any>;
  permiso: { folio: string; actividadEspecifica: string; empleado: string; area: string };
};

export function FormRenderer({ lista, formDef }: { lista: ListaData; formDef: VerificationFormDef }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, any>>(lista.respuestas || {});
  const [saved, setSaved] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const readOnly = lista.estado === "COMPLETADA";

  function setValue(id: string, val: any) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  function handleConditional(field: FormField, val: string) {
    setValue(field.id, val);
    if (val === "si" && field.showSection) {
      setHiddenSections((prev) => { const n = new Set(prev); n.delete(field.showSection!); return n; });
    } else if (val === "no") {
      if (field.showSection) setHiddenSections((prev) => new Set(prev).add(field.showSection!));
    }
  }

  function handleSubmit() {
    const fd = new FormData();
    fd.set("listaId", String(lista.id));
    fd.set("respuestas", JSON.stringify(values));
    startTransition(async () => {
      const res = await guardarRespuestas(fd);
      if (res.success) setSaved(true);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img src="/hero-captura.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/80 to-engie-blue-light/50 flex items-end p-6">
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">{formDef.titulo}</h2>
            <p className="text-sm text-white/80 mt-1">{formDef.codigo} — Vigencia: {formDef.vigencia}</p>
          </div>
        </div>
      </div>

      <button onClick={() => router.push("/verificacion")} className="flex items-center gap-2 text-sm text-engie-blue hover:underline">
        <ArrowLeft size={14} /> Volver a Listas
      </button>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> Lista de verificacion guardada exitosamente.
        </div>
      )}

      {readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-800 text-sm font-medium">
          Esta lista ya fue completada. Los datos son de solo lectura.
        </div>
      )}

      {/* Permit context */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="font-semibold text-gray-600">Permiso:</span> <span className="font-mono text-engie-blue">{lista.permiso.folio}</span></div>
          <div><span className="font-semibold text-gray-600">Solicitante:</span> {lista.permiso.empleado}</div>
          <div><span className="font-semibold text-gray-600">Area:</span> {lista.permiso.area}</div>
          <div><span className="font-semibold text-gray-600">Estado:</span> <span className={lista.estado === "COMPLETADA" ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>{lista.estado}</span></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{lista.permiso.actividadEspecifica}</p>
      </div>

      {/* Dynamic sections */}
      {formDef.sections.map((section) => {
        if (hiddenSections.has(section.id)) return null;
        return (
          <SectionRenderer
            key={section.id}
            section={section}
            values={values}
            setValue={setValue}
            handleConditional={handleConditional}
            readOnly={readOnly}
          />
        );
      })}

      {/* Submit */}
      {!readOnly && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-engie-blue text-white font-semibold py-2.5 px-8 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            <Save size={16} /> {isPending ? "Guardando..." : "Guardar Lista de Verificacion"}
          </button>
        </div>
      )}
    </div>
  );
}

function SectionRenderer({ section, values, setValue, handleConditional, readOnly }: {
  section: FormSection;
  values: Record<string, any>;
  setValue: (id: string, val: any) => void;
  handleConditional: (field: FormField, val: string) => void;
  readOnly: boolean;
}) {
  return (
    <div>
      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl px-4 py-2 mb-3">
        <h3 className="text-base font-bold text-purple-700">{section.title}</h3>
        {section.subtitle && <p className="text-xs text-purple-400">{section.subtitle}</p>}
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        {section.note && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{section.note}</p>
        )}
        {section.fields.map((field) => (
          <FieldRenderer key={field.id} field={field} value={values[field.id]} setValue={setValue} handleConditional={handleConditional} readOnly={readOnly} values={values} />
        ))}
      </section>
    </div>
  );
}

function FieldRenderer({ field, value, setValue, handleConditional, readOnly, values }: {
  field: FormField;
  value: any;
  setValue: (id: string, val: any) => void;
  handleConditional: (field: FormField, val: string) => void;
  readOnly: boolean;
  values: Record<string, any>;
}) {
  const disabled = readOnly;

  switch (field.type) {
    case "check_si_no":
      return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-700 flex-1">{field.label}</span>
          <div className="flex gap-4">
            {["si", "no"].map((opt) => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => setValue(field.id, opt)} disabled={disabled}
                  className="w-4 h-4 text-engie-blue focus:ring-engie-blue-light" />
                <span className="text-xs font-semibold text-gray-600 uppercase">{opt === "si" ? "Si" : "No"}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "check_si_no_na":
      return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-700 flex-1">{field.label}</span>
          <div className="flex gap-4">
            {["si", "no", "na"].map((opt) => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => setValue(field.id, opt)} disabled={disabled}
                  className="w-4 h-4 text-engie-blue focus:ring-engie-blue-light" />
                <span className="text-xs font-semibold text-gray-600 uppercase">{opt === "si" ? "Si" : opt === "no" ? "No" : "N/A"}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "check_cumple_na":
      return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-700 flex-1">{field.label}</span>
          <div className="flex gap-4">
            {["cumple", "no_cumple", "na"].map((opt) => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => setValue(field.id, opt)} disabled={disabled}
                  className="w-4 h-4 text-engie-blue focus:ring-engie-blue-light" />
                <span className="text-xs font-semibold text-gray-600 uppercase">{opt === "cumple" ? "Cumple" : opt === "no_cumple" ? "No Cumple" : "N/A"}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <label className="block py-1">
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
          <input type="text" value={value || ""} onChange={(e) => setValue(field.id, e.target.value)} disabled={disabled}
            placeholder={field.placeholder || ""} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border disabled:bg-gray-50" />
          {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
        </label>
      );

    case "number":
      return (
        <label className="block py-1">
          <span className="text-sm font-medium text-gray-700">{field.label} {field.unit && <span className="text-gray-400">({field.unit})</span>}</span>
          <input type="number" value={value || ""} onChange={(e) => setValue(field.id, e.target.value)} disabled={disabled}
            step="any" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border disabled:bg-gray-50" />
        </label>
      );

    case "date":
      return (
        <label className="block py-1">
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
          <input type="date" value={value || ""} onChange={(e) => setValue(field.id, e.target.value)} disabled={disabled}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2.5 border disabled:bg-gray-50" />
        </label>
      );

    case "conditional":
      return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-800">{field.label}</span>
            <div className="flex gap-4">
              {["si", "no"].map((opt) => (
                <label key={opt} className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name={field.id} value={opt} checked={value === opt}
                    onChange={() => handleConditional(field, opt)} disabled={disabled}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-xs font-bold text-indigo-700 uppercase">{opt === "si" ? "Si" : "No"}</span>
                </label>
              ))}
            </div>
          </div>
          {value === "no" && field.skipToSection && (
            <p className="text-xs text-indigo-500 mt-2">Seccion omitida — continue al siguiente apartado.</p>
          )}
        </div>
      );

    case "atmospheric_test":
      return <AtmosphericTestField value={value || {}} setValue={(v: any) => setValue(field.id, v)} disabled={disabled} />;

    case "signature_block":
      return <SignatureBlockField value={value || {}} setValue={(v: any) => setValue(field.id, v)} disabled={disabled} />;

    case "risk_table":
      return <RiskTableField value={value || []} setValue={(v: any) => setValue(field.id, v)} disabled={disabled} />;

    default:
      return null;
  }
}

function AtmosphericTestField({ value, setValue, disabled }: { value: any; setValue: (v: any) => void; disabled: boolean }) {
  const v = value || {};
  const set = (k: string, val: string) => setValue({ ...v, [k]: val });

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-bold text-amber-800">Prueba Atmosferica</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <label className="block"><span className="text-xs font-medium text-gray-600">Realizada por</span>
          <input type="text" value={v.realizada_por || ""} onChange={(e) => set("realizada_por", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Empresa</span>
          <input type="text" value={v.empresa || ""} onChange={(e) => set("empresa", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Hora</span>
          <input type="time" value={v.hora || ""} onChange={(e) => set("hora", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Equipo de Prueba</span>
          <input type="text" value={v.equipo || ""} onChange={(e) => set("equipo", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">No. de Serie</span>
          <input type="text" value={v.no_serie || ""} onChange={(e) => set("no_serie", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Fecha de Calibracion</span>
          <input type="date" value={v.fecha_calibracion || ""} onChange={(e) => set("fecha_calibracion", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-600">Monitoreo continuo:</span>
        {["si", "no"].map((opt) => (
          <label key={opt} className="flex items-center gap-1"><input type="radio" name="monitoreo_continuo" value={opt} checked={v.monitoreo_continuo === opt} onChange={() => set("monitoreo_continuo", opt)} disabled={disabled} className="w-3 h-3" /><span className="text-xs">{opt === "si" ? "Si" : "No"}</span></label>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-amber-200 p-3">
        <p className="text-xs text-amber-700 mb-2">Limites: O2 19.5%-23.5% | Inflam. &lt;10% LEL | H2S &lt;10ppm | CO &lt;35ppm | Temp max 43C | Visib. &gt;1.6m</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[{ k: "h2s", l: "H2S" }, { k: "oxigeno", l: "Oxigeno" }, { k: "inflamabilidad", l: "Inflamabilidad" }, { k: "co", l: "CO" }, { k: "temperatura", l: "Temperatura" }, { k: "visibilidad", l: "Visibilidad" }].map(({ k, l }) => (
            <label key={k} className="block"><span className="text-xs font-medium text-gray-600">{l} — Resultado</span>
              <input type="text" value={v[k] || ""} onChange={(e) => set(k, e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs font-semibold text-gray-700">Prueba atmosferica en conformidad con los limites permisibles:</span>
          {["si", "no"].map((opt) => (
            <label key={opt} className="flex items-center gap-1"><input type="radio" name="conformidad" value={opt} checked={v.conformidad === opt} onChange={() => set("conformidad", opt)} disabled={disabled} className="w-3 h-3" /><span className="text-xs font-bold">{opt === "si" ? "Si" : "No"}</span></label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignatureBlockField({ value, setValue, disabled }: { value: any; setValue: (v: any) => void; disabled: boolean }) {
  const v = value || {};
  const set = (k: string, val: string) => setValue({ ...v, [k]: val });

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block"><span className="text-xs font-medium text-gray-600">Nombre</span>
          <input type="text" value={v.nombre || ""} onChange={(e) => set("nombre", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Empresa</span>
          <input type="text" value={v.empresa || ""} onChange={(e) => set("empresa", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Calificacion (DC-3)</span>
          <input type="text" value={v.calificacion || ""} onChange={(e) => set("calificacion", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
        <label className="block"><span className="text-xs font-medium text-gray-600">Fecha de expedicion</span>
          <input type="date" value={v.fecha || ""} onChange={(e) => set("fecha", e.target.value)} disabled={disabled} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-xs p-2 border" /></label>
      </div>
    </div>
  );
}

function RiskTableField({ value, setValue, disabled }: { value: any; setValue: (v: any) => void; disabled: boolean }) {
  const rows = Array.isArray(value) ? value : [];

  function addRow() {
    setValue([...rows, { riesgo: "", medida: "" }]);
  }
  function updateRow(i: number, k: string, v: string) {
    const newRows = [...rows];
    newRows[i] = { ...newRows[i], [k]: v };
    setValue(newRows);
  }
  function removeRow(i: number) {
    setValue(rows.filter((_: any, idx: number) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-semibold text-gray-600">
        <span>Riesgo Potencial</span><span>Medidas de Control a Adoptar</span><span></span>
      </div>
      {rows.map((row: any, i: number) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input type="text" value={row.riesgo || ""} onChange={(e) => updateRow(i, "riesgo", e.target.value)} disabled={disabled}
            placeholder="Descripcion del riesgo..." className="rounded-lg border-gray-300 shadow-sm text-xs p-2 border" />
          <input type="text" value={row.medida || ""} onChange={(e) => updateRow(i, "medida", e.target.value)} disabled={disabled}
            placeholder="Medida de control..." className="rounded-lg border-gray-300 shadow-sm text-xs p-2 border" />
          {!disabled && <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-xs px-2">X</button>}
        </div>
      ))}
      {!disabled && (
        <button onClick={addRow} className="text-xs text-engie-blue hover:underline font-semibold">+ Agregar fila</button>
      )}
    </div>
  );
}
