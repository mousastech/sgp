export const dynamic = "force-dynamic";

import { getTendenciasData } from "@/lib/actions/tendencias";
import { TendenciasView } from "./TendenciasView";

export default async function TendenciasPage() {
  const data = await getTendenciasData();
  return <TendenciasView data={data} />;
}
