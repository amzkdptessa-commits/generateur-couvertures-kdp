/**
 * Netlify Function: unsplash-search
 * - Works with either UNSPLASH_ACCESS_KEY (preferred) OR UNSPLASH_ACCESS (legacy)
 * - Provides safe debug info with ?debug=1 (never returns secret)
 */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    // Accept either name to avoid Netlify UI/name mismatch issues
    const accessKey =
      process.env.UNSPLASH_ACCESS_KEY ||
      process.env.UNSPLASH_ACCESS ||
      process.env.UNSPLASH_ACCESSKEY ||
      "";

    const url = new URL("https://api.unsplash.com/search/photos");
    const q = (event.queryStringParameters?.q || "").trim();
    const page = Number(event.queryStringParameters?.page || 1) || 1;
    const perPage = Math.min(
      30,
      Math.max(1, Number(event.queryStringParameters?.per_page || 12) || 12)
    );
    const orientation = (event.queryStringParameters?.orientation || "").trim(); // landscape|portrait|squarish
    const color = (event.queryStringParameters?.color || "").trim(); // black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, and blue
    const contentFilter = (event.queryStringParameters?.content_filter || "").trim(); // low|high
    const debug = (event.queryStringParameters?.debug || "").trim() === "1";

    if (debug) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(
          {
            ok: true,
            debug: true,
            env: {
              UNSPLASH_ACCESS_KEY: Boolean(process.env.UNSPLASH_ACCESS_KEY),
              UNSPLASH_ACCESS: Boolean(process.env.UNSPLASH_ACCESS),
              UNSPLASH_ACCESSKEY: Boolean(process.env.UNSPLASH_ACCESSKEY),
            },
            note:
              "If all are false, set one of these env vars (scope: Functions) and redeploy (Clear cache & deploy).",
          },
          null,
          2
        ),
      };
    }

    if (!accessKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(
          {
            error: "Missing Unsplash access key in environment",
            expected: [
              "UNSPLASH_ACCESS_KEY (recommended)",
              "UNSPLASH_ACCESS (also accepted)",
            ],
            fix:
              "Netlify -> (Site) Settings -> Environment variables -> add key, scope=Functions, then Deploys -> Clear cache and deploy.",
          },
          null,
          2
        ),
      };
    }

    if (!q) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(
          { error: "Missing query parameter: q", example: "?q=lapin&per_page=12" },
          null,
          2
        ),
      };
    }

    url.searchParams.set("query", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));
    if (orientation) url.searchParams.set("orientation", orientation);
    if (color) url.searchParams.set("color", color);
    if (contentFilter) url.searchParams.set("content_filter", contentFilter);

    const resp = await fetch(url.toString(), {
      headers: {
        "Accept-Version": "v1",
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers,
        body: JSON.stringify(
          {
            error: "Unsplash API error",
            status: resp.status,
            details: data,
            hint:
              resp.status === 401 || resp.status === 403
                ? "Check your Access Key value (Unsplash 'Access Key', not 'Secret key')."
                : resp.status === 429
                ? "Rate limit reached (demo mode is ~50 requests/hour). Wait and retry."
                : "See details for troubleshooting.",
          },
          null,
          2
        ),
      };
    }

    // Keep only what the UI needs (avoid huge payloads)
    const items = (data?.results || []).map((p) => ({
      id: p.id,
      width: p.width,
      height: p.height,
      color: p.color,
      alt_description: p.alt_description,
      urls: p.urls,
      links: p.links,
      user: {
        name: p.user?.name,
        username: p.user?.username,
        links: p.user?.links,
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(
        {
          query: q,
          page,
          per_page: perPage,
          total: data.total,
          total_pages: data.total_pages,
          results: items,
          ratelimit: {
            limit: resp.headers.get("x-ratelimit-limit"),
            remaining: resp.headers.get("x-ratelimit-remaining"),
          },
        },
        null,
        2
      ),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(
        { error: "Function error", message: String(e?.message || e) },
        null,
        2
      ),
    };
  }
};
