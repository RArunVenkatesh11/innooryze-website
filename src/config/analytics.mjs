// Single source for the Google measurement configuration. No other file hard-codes these IDs; the build
// emits them to dist/analytics-config.js for the browser, exactly as it does for the film configuration.

export const analytics = {
 // The Google tag the previous innooryze.com carried. That source loaded
 // googletagmanager.com/gtag/js?id=GT-WF4XRBSQ directly and ran gtag('config','GT-WF4XRBSQ'); it never
 // exposed a G-XXXXXXXXXX measurement ID, so the GT- tag is the confirmed identifier we migrate.
 googleTagId: 'GT-WF4XRBSQ',

 // The Tag Manager container the old site also loaded. Deliberately NOT loaded here: we have not audited
 // whether this container fires GA4 as well, and running it alongside the direct tag would double-count
 // pageviews and events. The ID is recorded so it survives the migration and can be enabled after that
 // audit; flip gtmEnabled only once the container's contents are known.
 gtmContainerId: 'GTM-NJPT6DRQ',
 gtmEnabled: false,

 // Verified Google Search Console property token for innooryze.com.
 searchConsoleVerification: 'qkNhV7wi86Q1l1yc0BqXJAr7BFhrJmIETs-S7TZteeM',

 // Analytics may initialise on the production property and nowhere else. This is an allowlist, so every
 // other origin is excluded by omission: local development, 127.0.0.1, the Vercel preview and any branch
 // deploy can never reach the production measurement, without naming any of them.
 measuredHosts: ['innooryze.com','www.innooryze.com'],

 // Raising this invalidates every stored choice and re-asks. Do that when the categories change.
 consentVersion: 1,
 storageKey: 'innooryze.consent',

 // Deliberate, documented override for verifying the tag away from the production hostname. See
 // docs/ANALYTICS.md. It sends real traffic, so it is opt-in per device and never set by the site itself.
 debugKey: 'innooryze.analytics-debug'
};

// Origins the Content-Security-Policy must allow once a visitor has consented. Wildcards cover the
// regional collection endpoints GA4 chooses at runtime (region1.google-analytics.com and friends).
export const analyticsCsp = {
 script: ['https://www.googletagmanager.com'],
 connect: ['https://www.googletagmanager.com','https://*.google-analytics.com','https://*.analytics.google.com'],
 img: ['https://*.google-analytics.com','https://*.googletagmanager.com']
};
