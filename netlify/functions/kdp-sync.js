const EXT_ORIGIN = "chrome-extension://mbngmlkggdapbbncgoijjcbmbcgeomip";

const headers = {
  "Access-Control-Allow-Origin": EXT_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  // =========================
  // CORS preflight
  // =========================
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // =========================
  // Only POST allowed
  // =========================
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Method Not Allowed"
      })
    };
  }

  // =========================
  // Main logic
  // =========================
  try {
    const body = JSON.parse(event.body || "{}");
    const cookies = body.cookies;

    if (!cookies) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "No cookies received"
        })
      };
    }

    // ✅ À CE STADE, LE PIPELINE FONCTIONNE
    // Tu pourras ensuite ajouter ici :
    // - parsing cookies
    // - appel Amazon
    // - save Supabase / DB

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        message: "KDP sync endpoint reached successfully",
        cookiesReceived: true
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: err.message
      })
    };
  }
};
