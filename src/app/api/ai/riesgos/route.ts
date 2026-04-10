import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres un experto en seguridad industrial para centrales electricas renovables de ENGIE Mexico (eolica y solar). Analiza trabajos y genera analisis de riesgos.

Tipos de trabajo especial validos: ALTURAS, ESPACIOS_CONFINADOS, EXCAVACION, CALIENTE, EQUIPO_ENERGIZADO, IZAJE_CARGAS, MAQUINARIA_PESADA, ICS

Responde usando EXACTAMENTE este formato de lineas (una por linea, sin cambiar los prefijos):

RIESGOS: lista de riesgos separados por coma
MEDIDAS: lista de medidas de control separadas por coma
VALOR_RIESGO: numero del 1 al 25
TIPOS_ESPECIALES: lista de codigos separados por coma (ej: ALTURAS, EQUIPO_ENERGIZADO)
REQUIERE_LOTO: SI o NO
CONDICIONES_CLIMA: condiciones climaticas a considerar
NORMA: norma NOM mas relevante
OBSERVACIONES: recomendaciones adicionales

No agregues nada mas. Solo las 8 lineas con el formato indicado.`;

function parseLine(content: string, prefix: string): string {
  const regex = new RegExp(`^${prefix}:\\s*(.+)$`, "mi");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actividad, pasos, area, norma } = body;

    if (!actividad) {
      return NextResponse.json({ error: "La descripcion de la actividad es requerida" }, { status: 400 });
    }

    const prompt = `Analiza este trabajo y genera el analisis de riesgos:

ACTIVIDAD: ${actividad}
${pasos ? `PASOS: ${pasos}` : ""}
${area ? `AREA: ${area}` : ""}
${norma ? `NORMA: ${norma}` : ""}`;

    const content = await callFMAPI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);

    // Parse line-based response
    const riesgos = parseLine(content, "RIESGOS");
    const medidasControl = parseLine(content, "MEDIDAS");
    const valorStr = parseLine(content, "VALOR_RIESGO");
    const tiposStr = parseLine(content, "TIPOS_ESPECIALES");
    const lotoStr = parseLine(content, "REQUIERE_LOTO");
    const condicionesClimaticas = parseLine(content, "CONDICIONES_CLIMA");
    const normaAplicable = parseLine(content, "NORMA");
    const observaciones = parseLine(content, "OBSERVACIONES");

    const valorRiesgoSugerido = parseInt(valorStr) || 12;
    const tiposEspeciales = tiposStr
      ? tiposStr.split(",").map((t) => t.trim().toUpperCase().replace(/\s+/g, "_")).filter(Boolean)
      : [];
    const requiereLoto = lotoStr.toUpperCase().includes("SI");

    return NextResponse.json({
      riesgos: riesgos || "Consultar analisis de riesgos",
      medidasControl: medidasControl || "Consultar medidas de control",
      valorRiesgoSugerido,
      tiposEspeciales,
      requiereLoto,
      condicionesClimaticas,
      normaAplicable,
      observaciones,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
