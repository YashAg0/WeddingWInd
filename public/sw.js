/**
 * WeddingWithIndia — Production Service Worker
 * Version: 2.0.0
 *
 * Architecture:
 * - Cache-First / SWR: Static app shell assets (JS, CSS, Fonts, Icons)
 * - Network-First / SWR: Public wedding images (capped LRU)
 * - Strict Network-First + Offline Fallback: Public HTML navigation (eliminates stale chunk mismatches)
 * - STRICT NETWORK ONLY: All Auth, API, Stripe, Dashboard, and Booking mutations
 */

const CACHE_VERSION = "v2";
const CACHE_STATIC = `wwi-static-${CACHE_VERSION}`;
const CACHE_IMAGES = `wwi-images-${CACHE_VERSION}`;
const CACHE_OFFLINE = `wwi-offline-${CACHE_VERSION}`;

const CURRENT_CACHES = [CACHE_STATIC, CACHE_IMAGES, CACHE_OFFLINE];

const PRECACHE_ASSETS = [
  "/offline",
  "/favicon.ico",
  "/apple-icon.png",
  "/icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-192x192.png",
  "/icons/maskable-icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

// Max cached images to prevent quota overflow
const MAX_CACHED_IMAGES = 60;

/**
 * Trim cache to max items
 */
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch (err) {
    console.warn("[SW] Cache trimming error:", err);
  }
}

/**
 * Determine if request is a transactional or private route that must NEVER be cached
 */
function isTransactionalOrPrivate(url) {
  const pathname = url.pathname;
  const hostname = url.hostname;

  // Third-party auth, payment, upload, and analytics APIs
  if (
    hostname.includes("clerk") ||
    hostname.includes("stripe.com") ||
    hostname.includes("uploadthing.com") ||
    hostname.includes("utfs.io") ||
    hostname.includes("google-analytics.com") ||
    hostname.includes("googletagmanager.com")
  ) {
    return true;
  }

  // Same-origin private / mutation / auth / dashboard paths
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/for-agents/dashboard") ||
    pathname.startsWith("/coordinators/dashboard")
  );
}

// ─── INSTALL EVENT ────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const offlineCache = await caches.open(CACHE_OFFLINE);
        await offlineCache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn("[SW] Precache failed during install:", err);
      }
    })()
  );
});

// ─── ACTIVATE EVENT ───────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys.map((key) => {
            if (!CURRENT_CACHES.includes(key)) {
              console.log("[SW] Removing outdated cache:", key);
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        );
        await self.clients.claim();
      } catch (err) {
        console.warn("[SW] Activation cache cleanup error:", err);
      }
    })()
  );
});

// ─── MESSAGE EVENT ────────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── FETCH EVENT ──────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // 1. STRICT BYPASS: Private data, auth, dashboards, and API mutations
  if (isTransactionalOrPrivate(url)) {
    return;
  }

  // 2. NAVIGATION REQUESTS (HTML documents) - Strict Network First
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Network-first for fresh live navigation and up-to-date scripts
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (fetchErr) {
          // Offline fallback
          try {
            const offlineCache = await caches.open(CACHE_OFFLINE);
            const fallback = await offlineCache.match("/offline");
            if (fallback) {
              return fallback;
            }
          } catch (cacheErr) {
            console.warn("[SW] Offline fallback lookup failed:", cacheErr);
          }

          throw fetchErr;
        }
      })()
    );
    return;
  }

  // 3. STATIC APP SHELL ASSETS (Next.js scripts, styles, Google fonts, icons)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/apple-icon.png" ||
    url.pathname === "/icon.png"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_STATIC);
        const cachedResponse = await cache.match(request);

        // Fetch in background to revalidate (SWR)
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })()
    );
    return;
  }

  // 4. PUBLIC IMAGES (Unsplash, Pravatar, local /images)
  if (
    url.pathname.startsWith("/images/") ||
    url.hostname === "images.unsplash.com" ||
    url.hostname === "i.pravatar.cc"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_IMAGES);
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone()).catch(() => {});
              trimCache(CACHE_IMAGES, MAX_CACHED_IMAGES);
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })()
    );
    return;
  }
});
