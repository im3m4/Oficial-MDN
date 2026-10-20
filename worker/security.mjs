/** Apply the same response policy to pages, APIs, biography and image responses. */
export function secureResponse(response, url) {
  const secured = new Response(response.body, response);
  secured.headers.set("X-Content-Type-Options", "nosniff");
  secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  secured.headers.set("X-Frame-Options", "DENY");
  // Inline scripts/styles are required by the current React SSR renderer.
  secured.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests");
  if (url.protocol === "https:") secured.headers.set("Strict-Transport-Security", "max-age=31536000");
  if (url.pathname === "/login" || url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/")) {
    secured.headers.set("Cache-Control", "private, no-store");
    secured.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return secured;
}
