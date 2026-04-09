export const dynamic = "force-dynamic";

import { getPermisosConListasPendientes } from "@/lib/actions/verificacion";
import { VerificacionIndex } from "./VerificacionIndex";

export default async function VerificacionPage() {
  const permisos = await getPermisosConListasPendientes();
  return <VerificacionIndex permisos={permisos} />;
}
