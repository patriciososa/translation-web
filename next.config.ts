import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === "development";

/**
 * The backend the browser talks to (REST and Socket.IO), as CSP sources. Same
 * origin as the site in production, a different port in development; the
 * WebSocket scheme is listed on its own because not every browser lets 'self'
 * cover it.
 */
function backendSources(): string {
  try {
    const { protocol, host } = new URL(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000");
    return `${protocol}//${host} ${protocol === "https:" ? "wss:" : "ws:"}//${host}`;
  } catch {
    return "";
  }
}

/** Sent with every response. */
const BASE_HEADERS = [
  // Ignored over plain http, so local `next start` is unaffected.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // For browsers that predate frame-ancestors.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

/**
 * The public site. Deliberately not a script or connect allowlist: the pages
 * are prerendered, so their inline scripts cannot carry a nonce and script-src
 * would need 'unsafe-inline' — little protection — while a host list for
 * Google Analytics that falls behind Google's silently drops the conversions
 * the ad campaigns are measured by. What is left costs nothing and still stops
 * framing, <base> hijacking, plugins and forms posting elsewhere.
 */
const SITE_CSP = ["frame-ancestors 'self'", "base-uri 'self'", "object-src 'none'", "form-action 'self'"].join("; ");

/**
 * The translation status portal holds a link secret in sessionStorage and runs
 * no third-party code, so it gets the allowlist the site cannot have: nothing
 * loads from, and nothing is sent to, anywhere but this site and its backend.
 * 'unsafe-inline' stays for the bootstrap scripts Next.js inlines into a
 * prerendered page; an injected script still has nowhere to send the token.
 */
const PORTAL_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${backendSources()}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const PORTAL_HEADERS = [
  { key: "Content-Security-Policy", value: PORTAL_CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  // A page that only makes sense with a personal link: keep it out of search results.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // Later entries override earlier ones for the same header.
      { source: "/:path*", headers: [...BASE_HEADERS, { key: "Content-Security-Policy", value: SITE_CSP }] },
      { source: "/portal", headers: PORTAL_HEADERS },
      { source: "/portal/:path*", headers: PORTAL_HEADERS },
    ];
  },
};

export default withNextIntl(nextConfig);
