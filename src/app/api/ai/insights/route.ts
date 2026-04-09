import { NextRequest, NextResponse } from "next/server";
import { callFMAPI } from "@/lib/fmapi";

export const dynamic = "force-dynamic";

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

    const insights = await callFMAPI([
      { role: "system", content: "Eres un analista de seguridad HSE para centrales electricas renovables de ENGIE Mexico. Analiza datos de permisos de trabajo y genera insights accionables en espanol. Se conciso y directo. Usa formato con bullets." },
      { role: "user", content: prompt },
    ], 1000, 0.3);
    return NextResponse.json({ insights });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
