import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getLLMResponse(prompt: string): Promise<string> {
  const host = process.env.DATABRICKS_HOST || "";
  const token = process.env.DATABRICKS_TOKEN || "";
  const baseUrl = host.startsWith("http") ? host : `https://${host}`;

  const response = await fetch(`${baseUrl}/serving-endpoints/databricks-claude-sonnet-4-6/invocations`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "Eres un analista de seguridad HSE para centrales electricas renovables de ENGIE Mexico. Analiza datos de permisos de trabajo y genera insights accionables en espanol. Se conciso y directo. Usa formato con bullets." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`FMAPI error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const prompt = `Analiza los siguientes datos de permisos de trabajo de las centrales renovables de ENGIE Mexico y genera 5-7 insights accionables para el equipo de seguridad HSE:

DATOS:
- Permisos por estado: ${JSON.stringify(data.permisosPorEstado)}
- Permisos por area: ${JSON.stringify(data.permisosPorArea)}
- Rechazados/Suspendidos por area: ${JSON.stringify(data.rechazadosPorArea)}
- Tipos de trabajo especial: ${JSON.stringify(data.tiposEspeciales)}
- LOTO: ${JSON.stringify(data.lotoStats)}
- Riesgo promedio por area: ${JSON.stringify(data.riesgoPromedioPorArea)}
- Tendencia mensual: ${JSON.stringify(data.permisosPorMes)}
- Autorizadores mas activos: ${JSON.stringify(data.autorizadoresMasActivos)}
- Tiempo promedio de cierre: ${JSON.stringify(data.tiempoCierrePromedio)}

Genera insights que incluyan:
1. Patrones de riesgo detectados
2. Areas que necesitan atencion
3. Recomendaciones de mejora
4. Tendencias preocupantes o positivas
5. Oportunidades de optimizacion`;

    const insights = await getLLMResponse(prompt);
    return NextResponse.json({ insights });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
