export const dynamic = "force-dynamic";

import { getPermisosDelMes } from "@/lib/actions/calendario";
import { CalendarioView } from "./CalendarioView";

export default async function CalendarioPage() {
  const now = new Date();
  const permisos = await getPermisosDelMes(now.getFullYear(), now.getMonth());
  return <CalendarioView initialPermisos={permisos} initialYear={now.getFullYear()} initialMonth={now.getMonth()} />;
}
