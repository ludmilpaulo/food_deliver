// service-worker.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache the assets generated by the build process
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache API responses
registerRoute(
  ({ url }) => url.origin === self.location.origin,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Add more routes and caching strategies as needed
