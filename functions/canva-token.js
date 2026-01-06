// netlify/functions/canva-token.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { code, code_verifier, redirect_uri } = JSON.parse(event.body || "{}");
    if (!code || !code_verifier || !redirect_uri) {
      return { statusCode: 400, body: "Missing code, code_verifier or redirect_uri" };
    }

    const clientId = process.env.CANVA_CLIENT_ID;
    const clientSecret = process.env.CANVA_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return { statusCode: 500, body: "Missing CANVA_CLIENT_ID or CANVA_CLIENT_SECRET" };
    }

    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier,
      redirect_uri
    });

    const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body
    });

    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : res.status,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || "Server error" };
  }
}
