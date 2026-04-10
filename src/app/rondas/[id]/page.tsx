export const dynamic = "force-dynamic";

import { getRondaById } from "@/lib/actions/rondas";
import { notFound } from "next/navigation";
import { RondaForm } from "./RondaForm";

export default async function RondaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ronda = await getRondaById(Number(id));
  if (!ronda) return notFound();
  return <RondaForm ronda={JSON.parse(JSON.stringify(ronda))} />;
}
