export const dynamic = "force-dynamic";

import { getTodosPermisos, getSupervisores } from "@/lib/actions/flujo";
import { GestionPanel } from "./GestionPanel";

export default async function GestionPage() {
  const [supervisores, permisos] = await Promise.all([
    getSupervisores(),
    getTodosPermisos(),
  ]);

  return <GestionPanel supervisores={supervisores} permisos={permisos} />;
}
