import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { lecturas, plantilla, area, tecnico } = await req.json();

    const prompt = `Analiza los resultados de esta ronda de inspeccion operativa en una central electrica renovable de ENGIE Mexico:

PLANTILLA: ${plantilla}
AREA: ${area}
TECNICO: ${tecnico}

LECTURAS:
${(lecturas || []).map((l: any) => `- ${l.nombre}: ${l.valor || "no registrado"} ${l.anomalia ? "[ANOMALIA - FUERA DE RANGO]" : ""} ${l.observacion ? `(Nota: ${l.observacion})` : ""}`).join("\n")}

Genera un analisis usando EXACTAMENTE este formato de lineas:

RESUMEN: resumen ejecutivo de la ronda en 1-2 oraciones
ESTADO_GENERAL: NORMAL o ATENCION o CRITICO
ANOMALIAS_DETECTADAS: lista de anomalias y su impacto separadas por punto y coma (o NINGUNA)
TENDENCIAS: observaciones sobre tendencias o patrones a monitorear separadas por punto y coma
ACCIONES_RECOMENDADAS: acciones correctivas o preventivas recomendadas separadas por punto y coma
PROXIMO_FOCO: que puntos priorizar en la proxima ronda

No agregues nada mas. Solo las 6 lineas.`;

    const content = await callFMAPI([
      { role: "system", content: "Eres un ingeniero de confiabilidad experto en centrales electricas renovables (eolica y solar). Analizas lecturas de rondas operativas y generas recomendaciones accionables. Responde solo con el formato de lineas solicitado." },
      { role: "user", content: prompt },
    ], 1000, 0.2);

    function parseLine(prefix: string): string {
      const regex = new RegExp(`^${prefix}:\\s*(.+)$`, "mi");
      const match = content.match(regex);
      return match ? match[1].trim() : "";
    }

    function parseList(prefix: string): string[] {
      const line = parseLine(prefix);
      if (!line || line.toUpperCase() === "NINGUNA" || line === "-" || line === "N/A") return [];
      return line.split(";").map((s) => s.trim()).filter(Boolean);
    }

    return NextResponse.json({
      resumen: parseLine("RESUMEN") || "Analisis completado",
      estadoGeneral: parseLine("ESTADO_GENERAL") || "NORMAL",
      anomaliasDetectadas: parseList("ANOMALIAS_DETECTADAS"),
      tendencias: parseList("TENDENCIAS"),
      accionesRecomendadas: parseList("ACCIONES_RECOMENDADAS"),
      proximoFoco: parseLine("PROXIMO_FOCO") || "",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
