const { createCache } = require("cache-manager");

// Default 15 minutes TTL for cache.
const cache = createCache({
    ttl: 1000 * 60 * 15
});

module.exports = cache;