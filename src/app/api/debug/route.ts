import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = process.env.DATABRICKS_HOST || "(not set)";
  const token = process.env.DATABRICKS_TOKEN || "(not set)";
  const appName = process.env.DATABRICKS_APP_NAME || "(not set)";

  return NextResponse.json({
    DATABRICKS_HOST: host,
    DATABRICKS_TOKEN_LENGTH: token.length,
    DATABRICKS_TOKEN_PREFIX: token.substring(0, 20) + "...",
    DATABRICKS_APP_NAME: appName,
    env_keys: Object.keys(process.env).filter(k => k.includes("DATABRICKS")).sort(),
  });
}
