import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres un revisor de cumplimiento de permisos de trabajo para centrales electricas renovables de ENGIE Mexico. Revisas permisos ANTES de enviarlos para autorizacion.

Procedimiento base: RENOVABLES-O-PR-01 Ed.2

Reglas clave:
1. Descripcion del trabajo debe ser clara y especifica
2. Paso a paso detallado y secuencial
3. Trabajo en alturas (>1.80m) DEBE marcar tipo especial ALTURAS
4. Trabajo con electricidad requiere EQUIPO_ENERGIZADO y/o LOTO
5. Si requiere LOTO debe tener numero de LOTO
6. Medidas de control proporcionales a los riesgos
7. Debe haber un Responsable del Trabajo asignado
8. Solicitud con >24h de anticipacion si es posible

Responde usando EXACTAMENTE este formato de lineas:

APROBADO: SI o NO
PUNTAJE: numero del 1 al 100
CRITICOS: lista de problemas criticos separados por punto y coma (o NINGUNO)
ADVERTENCIAS: lista de advertencias separadas por punto y coma (o NINGUNO)
SUGERENCIAS: lista de sugerencias separadas por punto y coma (o NINGUNO)
RESUMEN: resumen ejecutivo de 1-2 oraciones

No agregues nada mas. Solo las 6 lineas con el formato indicado.`;

function parseLine(content: string, prefix: string): string {
  const regex = new RegExp(`^${prefix}:\\s*(.+)$`, "mi");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function parseList(content: string, prefix: string): string[] {
  const line = parseLine(content, prefix);
  if (!line || line.toUpperCase() === "NINGUNO" || line === "-" || line === "N/A") return [];
  return line.split(";").map((s) => s.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const prompt = `Revisa este permiso de trabajo:

DATOS: Orden=${body.ordenTrabajo || "?"}, Fecha=${body.fechaTrabajo || "?"}, Duracion=${body.duracionDias || "?"}d ${body.duracionHoras || "?"}h
AREA: ${body.area || "?"}
ACTIVIDAD: ${body.actividad || "?"}
PASOS: ${body.pasos || "?"}
NORMA: ${body.norma || "?"}
SOLICITANTE: ${body.solicitante || "?"}
RESPONSABLE: ${body.responsable || "?"}
DEPARTAMENTO: ${body.departamento || "?"}
RIESGO MAX: ${body.valorRiesgo || "?"}
CLIMA: ${body.condicionesClimaticas || "?"}
RIESGOS: ${body.riesgos || "?"}
MEDIDAS: ${body.medidas || "?"}
TIPOS ESPECIALES: ${body.tiposEspeciales || "ninguno"}
LOTO: ${body.requiereLoto ? "SI" : "NO"}
NO. LOTO: ${body.noLoto || "no proporcionado"}`;

    const content = await callFMAPI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], 1500, 0.1);

    const aprobado = parseLine(content, "APROBADO").toUpperCase().includes("SI");
    const puntaje = parseInt(parseLine(content, "PUNTAJE")) || 75;
    const criticos = parseList(content, "CRITICOS");
    const advertencias = parseList(content, "ADVERTENCIAS");
    const sugerencias = parseList(content, "SUGERENCIAS");
    const resumen = parseLine(content, "RESUMEN") || "Revision completada";

    return NextResponse.json({ aprobado, puntaje, criticos, advertencias, sugerencias, resumen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
