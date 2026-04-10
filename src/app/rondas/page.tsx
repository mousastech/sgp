export const dynamic = "force-dynamic";

import { getPlantillas, getRondas, getEstadisticasRondas } from "@/lib/actions/rondas";
import { getAreas } from "@/lib/actions/admin";
import { RondasIndex } from "./RondasIndex";

export default async function RondasPage() {
  const [plantillas, rondas, stats, areas] = await Promise.all([
    getPlantillas(),
    getRondas(),
    getEstadisticasRondas(),
    getAreas(),
  ]);
  return <RondasIndex plantillas={plantillas} rondas={rondas} stats={stats} areas={areas} />;
}
