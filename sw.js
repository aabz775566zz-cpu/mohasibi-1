// Service worker: required by Chrome to install this app to the home screen
// as a real standalone app (no address bar). It also caches the app shell so
// that, after the first successful load, the installed app keeps opening
// normally even if the local server used for setup is not running anymore.
const CACHE_NAME = 'mohasibi-alawal-v1';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){ /* ignore individual failures */ });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      const network = fetch(event.request).then(function(response){
        if(response && response.ok && event.request.url.indexOf(self.location.origin) === 0){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
