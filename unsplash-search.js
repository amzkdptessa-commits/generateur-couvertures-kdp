// netlify/functions/unsplash-search.js
// Unsplash proxy for Netlify Functions (keeps your API key secret)

const UNSPLASH_API = "https://api.unsplash.com";

exports.handler = async (event) => {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing UNSPLASH_ACCESS_KEY in Netlify Environment Variables (Functions scope)."
        })
      };
    }

    const q = (event.queryStringParameters?.q || "book cover").trim();
    const page = String(event.queryStringParameters?.page || "1");
    const perPage = String(event.queryStringParameters?.per_page || "24");

    const url = new URL(`${UNSPLASH_API}/search/photos`);
    url.searchParams.set("query", q);
    url.searchParams.set("page", page);
    url.searchParams.set("per_page", perPage);
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1"
      }
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Unsplash API error",
          status: res.status,
          details: text.slice(0, 2000)
        })
      };
    }

    const data = JSON.parse(text);

    // Return only what the UI needs (lighter payload)
    const items = (data.results || []).map((img) => ({
      id: img.id,
      thumb: img.urls?.small,
      full: img.urls?.full,
      author: img.user?.name,
      author_profile: img.user?.links?.html,
      unsplash_page: img.links?.html
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ query: q, items })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(e?.message || e) })
    };
  }
};
