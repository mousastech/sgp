export const dynamic = "force-dynamic";

import { getHomeData } from "@/lib/actions/home";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const data = await getHomeData();
  return <HomeClient data={data} />;
}
