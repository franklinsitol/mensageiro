self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("fetch", function(event) {
  // Offline fallback opcional
});
