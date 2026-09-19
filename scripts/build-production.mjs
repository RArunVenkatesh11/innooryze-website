// Explicit release target. Other public integration settings remain configurable.
process.env.SITE_URL = 'https://innooryze.com';
process.env.SITE_INDEXABLE = 'true';
await import('./build.mjs');
