export const dynamic = "force-dynamic";

import { getBitacora, getAreasActivas } from "@/lib/actions/bitacora";
import { BitacoraView } from "./BitacoraView";

export default async function BitacoraPage() {
  const [permisos, areas] = await Promise.all([getBitacora(), getAreasActivas()]);
  return <BitacoraView permisos={permisos} areas={areas} />;
}
