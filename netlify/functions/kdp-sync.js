const EXT_ORIGIN = "chrome-extension://mbngmlkggdapbbncgoijjcbmbcgeomip";

const headers = {
  "Access-Control-Allow-Origin": EXT_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  // 1) Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // 2) Only POST is allowed
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" })
    };
  }

  // 3) POST handler
  try {
    const body = JSON.parse(event.body || "{}");

    // Ici, ton extension envoie: { cookies: ... }
    const cookies = body.cookies;

    // Pour l’instant on valide juste que le flux marche
    // Tu brancheras ensuite ton vrai traitement (Supabase etc.)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, receivedCookies: !!cookies })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
