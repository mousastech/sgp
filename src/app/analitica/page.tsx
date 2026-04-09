export const dynamic = "force-dynamic";

import { getAnaliticaData } from "@/lib/actions/analitica";
import { AnaliticaView } from "./AnaliticaView";

export default async function AnaliticaPage() {
  const data = await getAnaliticaData();
  return <AnaliticaView data={data} />;
}
