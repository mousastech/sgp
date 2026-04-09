export const dynamic = "force-dynamic";

import { getPermisoCompleto } from "@/lib/actions/flujo";
import { notFound } from "next/navigation";
import { PrintButton } from "./PrintButton";

const TIPOS_LABEL: Record<string, string> = {
  ALTURAS: "Trabajo en Altura", ESPACIOS_CONFINADOS: "Trabajo en Espacio Confinado",
  EXCAVACION: "Excavacion", CALIENTE: "Trabajo en Caliente",
  EQUIPO_ENERGIZADO: "Trabajo con Equipo Energizado", IZAJE_CARGAS: "Izaje y Mov. de Cargas Suspendidas",
  ICS: "Permiso para Intervencion de ICS", MAQUINARIA_PESADA: "Manejo de Maquinaria Pesada",
};

function fDate(d: string | null) { return d ? new Date(d).toLocaleDateString("es-MX") : "\u00A0"; }
function fTime(d: string | null) { return d ? new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "\u00A0"; }
function fStr(s: string | null | undefined) { return s || "\u00A0"; }

export default async function PrintPermitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPermisoCompleto(Number(id));
  if (!p) return notFound();

  let tipos: string[] = [];
  try { tipos = JSON.parse(p.tiposTrabajoEspecial || "[]"); } catch {}

  const autorizacion = p.aprobaciones?.find((a: any) => a.decision === "AUTORIZADO");

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } .print-page { margin: 0 !important; padding: 0 !important; } }
        .print-page { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; max-width: 800px; margin: 0 auto; }
        .print-page h1 { font-size: 16px; text-align: center; margin: 0; }
        .print-page h2 { font-size: 13px; color: #003DA5; margin: 12px 0 6px; padding: 4px 0; border-bottom: 1px solid #003DA5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003DA5; padding-bottom: 8px; margin-bottom: 12px; }
        .code { font-size: 9px; color: #666; text-align: right; }
        .row { display: flex; gap: 16px; margin-bottom: 4px; }
        .field { flex: 1; }
        .field label { font-size: 9px; color: #666; display: block; }
        .field .val { font-size: 11px; font-weight: 600; border-bottom: 1px solid #ccc; min-height: 16px; padding: 2px 0; }
        .check-table { width: 100%; border-collapse: collapse; margin: 6px 0; }
        .check-table td, .check-table th { border: 1px solid #ccc; padding: 4px 8px; font-size: 10px; }
        .check-table th { background: #f0f4f8; text-align: left; }
        .check-table .center { text-align: center; width: 40px; }
        .sig-row { display: flex; gap: 20px; margin: 10px 0; }
        .sig-row > div { flex: 2; }
        .sig-row .sig-label { font-size: 9px; color: #666; display: block; margin-bottom: 2px; }
        .sig-row .sig-val { font-size: 11px; font-weight: 600; border-bottom: 1px solid #999; min-height: 18px; padding: 2px 0; }
        .sig-row .sig-date { flex: 1; }
        .note { font-size: 9px; color: #666; font-style: italic; margin: 4px 0; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 9px; color: #999; text-align: center; }
      `}</style>
      <div className="print-page">
        <PrintButton />

        {/* Header */}
        <div className="header">
          <div><strong style={{ color: "#003DA5", fontSize: "14px" }}>ENGIE</strong></div>
          <h1>PERMISO DE TRABAJO GENERAL</h1>
          <div className="code">RENOVABLES-O-PR-01-IN01-FO01</div>
        </div>

        {/* Encabezado fields */}
        <div className="row">
          <div className="field"><label>Permiso #</label><div className="val">{p.folio}</div></div>
          <div className="field"><label>Orden Trabajo #</label><div className="val">{fStr(p.ordenTrabajo)}</div></div>
          <div className="field"><label>Solicitado para, fecha</label><div className="val">{fDate(p.fechaTrabajo)}</div></div>
          <div className="field"><label>Hora</label><div className="val">{fStr(p.horaInicio)}</div></div>
        </div>

        {/* I. Solicitud */}
        <h2>I. Solicitud</h2>
        <div className="row">
          <div className="field"><label>Fecha</label><div className="val">{fDate(p.createdAt)}</div></div>
          <div className="field"><label>Hora</label><div className="val">{fTime(p.createdAt)}</div></div>
          <div className="field"><label>Duracion del trabajo</label><div className="val">{p.duracionDias || "___"} dias {p.duracionHoras || "___"} horas</div></div>
        </div>
        <div className="row">
          <div className="field"><label>Disponibilidad del equipo en caso de emergencia</label><div className="val">{p.disponibilidadEmergencia || "___"} horas</div></div>
        </div>
        <div className="row">
          <div className="field"><label>Area y/o equipo donde se ejecuta el trabajo</label><div className="val">{p.area?.nombre} ({p.area?.ubicacion || ""})</div></div>
        </div>
        <div className="row">
          <div className="field"><label>Descripcion detallada del trabajo</label><div className="val" style={{ whiteSpace: "pre-wrap", minHeight: "40px" }}>{p.actividadEspecifica}{p.descripcionPasos ? `\n${p.descripcionPasos}` : ""}</div></div>
        </div>

        <div className="sig-row">
          <div><span className="sig-label">Nombre y firma del Solicitante ENGIE:</span><div className="sig-val">{fStr(p.solicitanteEngie || p.empleado?.nombreCompleto)}</div></div>
        </div>
        <div className="sig-row">
          <div><span className="sig-label">Nombre y Firma de Persona Responsable del Trabajo:</span><div className="sig-val">{fStr(p.responsableTrabajo)}</div></div>
        </div>
        <div className="sig-row">
          <div><span className="sig-label">Departamento ENGIE o Nombre del Contratista Responsable:</span><div className="sig-val">{fStr(p.departamentoContratista)}</div></div>
        </div>

        {/* II. Analisis de Seguridad */}
        <h2>II. Analisis de Seguridad</h2>
        <p className="note">El solicitante debera presentar el Analisis de Riesgo acorde al procedimiento SEGURIDAD-PR-02.</p>
        <div className="row">
          <div className="field"><label>Valor mas alto del resultado de la matriz de evaluacion de riesgos</label><div className="val">{p.valorRiesgoMax || "___"}</div></div>
        </div>
        <div className="row">
          <div className="field"><label>Condiciones climatologicas que podrian afectar la seguridad</label><div className="val">{fStr(p.condicionesClimaticas)}</div></div>
        </div>
        {(p.riesgosIdentificados || p.medidasControl) && (
          <div className="row">
            <div className="field"><label>Riesgos identificados</label><div className="val">{fStr(p.riesgosIdentificados)}</div></div>
            <div className="field"><label>Medidas de control</label><div className="val">{fStr(p.medidasControl)}</div></div>
          </div>
        )}

        {/* III. Listas de verificacion */}
        <h2>III. Listas de verificacion para Trabajo de Riesgo Especial requerido</h2>
        <table className="check-table">
          <thead>
            <tr><th>Tipo de Trabajo</th><th className="center">Si</th><th className="center">N/A</th></tr>
          </thead>
          <tbody>
            {Object.entries(TIPOS_LABEL).map(([key, label]) => (
              <tr key={key}>
                <td>{label}</td>
                <td className="center">{tipos.includes(key) ? "X" : ""}</td>
                <td className="center">{!tipos.includes(key) ? "X" : ""}</td>
              </tr>
            ))}
            <tr>
              <td>LOTO (Bloqueo de energia peligrosa){p.noLoto ? ` — No. LOTO: ${p.noLoto}` : ""}</td>
              <td className="center">{p.requiereLoto ? "X" : ""}</td>
              <td className="center">{!p.requiereLoto ? "X" : ""}</td>
            </tr>
          </tbody>
        </table>

        {/* IV. Autorizacion */}
        <h2>IV. Autorizacion del Permiso de Trabajo</h2>
        <div className="sig-row">
          <div style={{ flex: 2 }}><span className="sig-label">Nombre y firma del Autorizador:</span><div className="sig-val">{autorizacion ? autorizacion.supervisor?.nombreCompleto : ""}</div></div>
          <div className="sig-date"><span className="sig-label">Fecha:</span><div className="sig-val">{autorizacion ? fDate(autorizacion.fechaFirma) : ""}</div></div>
          <div className="sig-date"><span className="sig-label">Hora:</span><div className="sig-val">{autorizacion ? fTime(autorizacion.fechaFirma) : ""}</div></div>
        </div>

        {/* V. Cierre */}
        <h2>V. Cierre del Permiso del Trabajo</h2>
        <div className="sig-row">
          <div style={{ flex: 2 }}><span className="sig-label">Nombre y firma del Responsable del Trabajo:</span><div className="sig-val">{fStr(p.cierreResponsable)}</div></div>
          <div className="sig-date"><span className="sig-label">Fecha:</span><div className="sig-val">{p.cierreFechaResponsable ? fDate(p.cierreFechaResponsable) : ""}</div></div>
          <div className="sig-date"><span className="sig-label">Hora:</span><div className="sig-val">{p.cierreFechaResponsable ? fTime(p.cierreFechaResponsable) : ""}</div></div>
        </div>
        <div className="sig-row">
          <div style={{ flex: 2 }}><span className="sig-label">Nombre y firma del Autorizador:</span><div className="sig-val">{fStr(p.cierreAutorizador)}</div></div>
          <div className="sig-date"><span className="sig-label">Fecha:</span><div className="sig-val">{p.cierreFechaAutorizador ? fDate(p.cierreFechaAutorizador) : ""}</div></div>
          <div className="sig-date"><span className="sig-label">Hora:</span><div className="sig-val">{p.cierreFechaAutorizador ? fTime(p.cierreFechaAutorizador) : ""}</div></div>
        </div>
        <p className="note" style={{ fontWeight: 600 }}>El Responsable del Trabajo y el Autorizador garantizan las adecuadas condiciones de orden y limpieza del area de trabajo y son conscientes de las condiciones finales del equipo, sistema o instalaciones.</p>

        {/* GPS */}
        {p.coordenadasLatCaptura && (
          <div className="note">GPS Captura: {p.coordenadasLatCaptura}, {p.coordenadasLonCaptura}</div>
        )}

        <div className="footer">
          Este documento debera permanecer en su formato original en resguardo ubicado en cuarto de control.
          <br />Generado digitalmente — Sistema de Permisos de Trabajo ENGIE | Powered by Databricks
        </div>
      </div>
    </>
  );
}
