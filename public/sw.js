const CACHE = 'transform-coach-v1'

// Pages to pre-cache on install
const PRECACHE = ['/', '/log', '/progress', '/plan', '/chat', '/login']

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Always network for: API routes, auth, POST requests
  if (
    url.pathname.startsWith('/api/') ||
    request.method !== 'GET'
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Network-first for navigation (pages always fresh)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
          return res
        })
        .catch(() => caches.match(request).then(cached => cached ?? caches.match('/')))
    )
    return
  }

  // Cache-first for static assets (_next/static)
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          caches.open(CACHE).then(c => c.put(request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
