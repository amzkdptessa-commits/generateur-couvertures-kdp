// netlify/functions/unsplash-search.js
const UNSPLASH_API = "https://api.unsplash.com";

exports.handler = async (event) => {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return { statusCode: 500, body: "Missing UNSPLASH_ACCESS_KEY" };
    }

    const q = event.queryStringParameters?.q || "book cover";
    const page = event.queryStringParameters?.page || 1;
    const perPage = event.queryStringParameters?.per_page || 24;

    const url = new URL(`${UNSPLASH_API}/search/photos`);
    url.searchParams.set("query", q);
    url.searchParams.set("page", page);
    url.searchParams.set("per_page", perPage);
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};
