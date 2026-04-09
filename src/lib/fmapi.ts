// Foundation Model API client with OAuth token management
// Uses DATABRICKS_CLIENT_ID + DATABRICKS_CLIENT_SECRET (SP credentials)

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const host = process.env.DATABRICKS_HOST || "";
  const clientId = process.env.DATABRICKS_CLIENT_ID || "";
  const clientSecret = process.env.DATABRICKS_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    // Fallback: maybe DATABRICKS_TOKEN is set (local dev)
    const token = process.env.DATABRICKS_TOKEN || "";
    if (token) return token;
    throw new Error("No DATABRICKS_CLIENT_ID/SECRET or DATABRICKS_TOKEN available");
  }

  const baseUrl = host.startsWith("http") ? host : `https://${host}`;
  const resp = await fetch(`${baseUrl}/oidc/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "all-apis",
    }),
  });

  if (!resp.ok) {
    throw new Error(`OAuth token error ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken!;
}

export async function callFMAPI(messages: any[], maxTokens = 1500, temperature = 0.2): Promise<string> {
  const host = process.env.DATABRICKS_HOST || "";
  const baseUrl = host.startsWith("http") ? host : `https://${host}`;
  const token = await getToken();

  const response = await fetch(`${baseUrl}/serving-endpoints/databricks-claude-sonnet-4-6/invocations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, max_tokens: maxTokens, temperature }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`FMAPI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
