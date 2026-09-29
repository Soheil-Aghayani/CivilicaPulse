const DEFAULT_UPSTREAM = "https://civilicapulse-api.onrender.com";
const ALLOWED_ORIGINS = new Set([
  "https://soheil-aghayani.github.io",
  "http://127.0.0.1:5000",
  "http://localhost:5000"
]);

function corsHeaders(request) {
  const headers = new Headers();
  const origin = request.headers.get("Origin");

  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Expose-Headers", "Content-Disposition");
  headers.set("Vary", "Origin");
  return headers;
}

function isEmptyResponse(response, request) {
  return request.method === "HEAD" || [204, 205, 304].includes(response.status);
}

async function responseWithCors(response, request, bufferBody = false) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request);
  cors.forEach((value, key) => headers.set(key, value));

  if (!bufferBody || isEmptyResponse(response, request)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  // A fixed-size JSON response avoids intermittent stream resets observed by
  // browser HTTP/2 clients during long author-search requests.
  const body = await response.arrayBuffer();
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isBodylessMethod(method) {
  return method === "GET" || method === "HEAD";
}

function shouldBufferProfileRequest(pathname) {
  return pathname === "/api/parse-profile";
}

function makeUpstreamRequest(url, method, headers, body) {
  return new Request(url, {
    method,
    headers,
    body: body == null ? undefined : body.slice(0),
    redirect: "manual"
  });
}

function shouldRetryUpstreamResponse(response) {
  return [502, 503, 504].includes(response.status);
}

async function fetchProfileWithRetry(upstreamUrl, method, headers, body) {
  const fetchUpstream = () => fetch(
    makeUpstreamRequest(upstreamUrl, method, headers, body)
  );
  var response;

  try {
    response = await fetchUpstream();
  } catch {
    return fetchUpstream();
  }

  if (shouldRetryUpstreamResponse(response)) {
    return fetchUpstream();
  }

  return response;
}

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    if (request.method === "OPTIONS") {
      return responseWithCors(new Response(null, { status: 204 }), request);
    }

    if (!incomingUrl.pathname.startsWith("/api/")) {
      return responseWithCors(
        new Response("CivilicaPulse API bridge", { status: 404 }),
        request
      );
    }

    const upstreamOrigin = env.UPSTREAM_ORIGIN || DEFAULT_UPSTREAM;
    const upstreamUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      upstreamOrigin
    );
    const headers = new Headers(request.headers);
    headers.delete("Host");
    headers.delete("Origin");
    const bufferProfileRequest = shouldBufferProfileRequest(incomingUrl.pathname);
    const requestBody = bufferProfileRequest && !isBodylessMethod(request.method)
      ? await request.arrayBuffer()
      : undefined;

    try {
      if (!bufferProfileRequest) {
        const upstreamRequest = new Request(upstreamUrl, {
          method: request.method,
          headers,
          body: isBodylessMethod(request.method) ? undefined : request.body,
          redirect: "manual"
        });
        const response = await fetch(upstreamRequest);
        return await responseWithCors(response, request);
      }

      // Profile parsing is idempotent and its JSON input is tiny. Buffering it
      // gives the subrequest a fixed body length and lets us retry one dropped
      // upstream connection without reusing an already-consumed stream.
      const response = await fetchProfileWithRetry(
        upstreamUrl,
        request.method,
        headers,
        requestBody
      );
      return await responseWithCors(response, request, true);
    } catch (error) {
      return await responseWithCors(
        Response.json(
          {
            ok: false,
            error: "ارتباط با سرویس استخراج برقرار نشد.",
            detail: error instanceof Error ? error.message : String(error)
          },
          { status: 502 }
        ),
        request
      );
    }
  }
};

// Cloudflare keeps this export while the previous experimental Durable Object
// namespace exists. The production request path never binds to or calls it.
export class ProfileRelay {
  async fetch() {
    return new Response("This relay is no longer in use.", { status: 410 });
  }
}
