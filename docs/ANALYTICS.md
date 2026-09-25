# Analytics and cookie consent

Migrated from the previous innooryze.com and placed behind an explicit consent gate. Nothing optional
loads until a visitor opts in on the production property.

## Identifiers

| Purpose | Identifier | State |
|---|---|---|
| Google tag (Analytics) | `GT-WF4XRBSQ` | Live, consent-gated |
| Google Tag Manager container | `GTM-NJPT6DRQ` | **Recorded, deliberately not loaded** |
| Google Search Console verification | `qkNhV7wi86Q1l1yc0BqXJAr7BFhrJmIETs-S7TZteeM` | Live on every page |

All three live in `src/config/analytics.mjs` and nowhere else. The build emits the browser-side subset to
`dist/analytics-config.js`, the same way it emits the film configuration, so no identifier is duplicated
across files.

### Why the tag is `GT-` and not `G-`

The previous site's source never exposed a `G-XXXXXXXXXX` measurement ID. It loaded
`googletagmanager.com/gtag/js?id=GT-WF4XRBSQ` directly and ran `gtag('config','GT-WF4XRBSQ')`. The `GT-`
tag is therefore the confirmed identifier for this property, and it is what we migrated. If a measurement
ID is later confirmed in the Google Analytics admin, only `googleTagId` changes.

### Why Tag Manager stays off

The old site loaded the direct Google tag *and* the container. Whether `GTM-NJPT6DRQ` also fires GA4 has
not been audited. Loading both before that audit would double-count pageviews and events. The ID is kept
with `gtmEnabled: false` so it survives the migration; turn it on only once the container's contents are
known, and remove the direct tag if the container turns out to fire GA4 itself.

## Where analytics may run

Two conditions must both hold:

1. The visitor has granted analytics consent.
2. `location.hostname` is `innooryze.com` or `www.innooryze.com`.

The hostname rule is an **allowlist**, so everything else is excluded by omission: local development,
`127.0.0.1`, the Vercel preview and any branch deploy. No environment is named anywhere in the code, so a
new preview URL is blocked automatically rather than needing to be added to a blocklist.

The consent UI itself runs everywhere, so the banner and preferences panel stay testable off-production.

### Debug override

To verify the tag away from the production hostname, load any page once with `?analytics-debug=1`. That
writes `innooryze.analytics-debug` to `localStorage` for that browser profile, after which a granted
analytics consent loads the tag on any hostname.

**This sends real traffic to the live property.** Use it only for a deliberate check, and clear it
afterwards:

```js
localStorage.removeItem('innooryze.analytics-debug');
```

The site never sets this flag on its own, and it does not bypass consent — consent is still required.

## Consent architecture

`public/consent.js` is the only place in the repository that references a Google domain. The tag is
requested by creating a `<script>` element there and nowhere else, so "no analytics before consent" is
enforced by that element simply not existing, rather than by a flag a third-party script could ignore.

- **Google Consent Mode v2** defaults are pushed to `dataLayer` as *denied* before anything else runs, so
  a tag loaded later starts from "no storage" instead of a permissive default.
- **Categories:** Essential (always active, not a choice), Analytics, Marketing. Marketing maps to
  `ad_storage` / `ad_user_data` / `ad_personalization`; no marketing technology is active on the site
  today, so the toggle records a forward choice rather than gating anything that currently runs.
- **Persistence:** `localStorage` under `innooryze.consent`, as
  `{version, analytics, marketing, updated}`. Raising `consentVersion` in the config invalidates every
  stored choice and re-asks — do that whenever the categories change. If storage is unavailable (private
  browsing, blocked site data) the choice is held in memory for the page only: the visitor is asked again
  next time and analytics stays off until they opt in again.
- **Withdrawal:** switching Analytics off pushes a denied consent update, sets
  `window['ga-disable-GT-WF4XRBSQ']`, and expires every `_ga*` / `_gid` / `_gat*` cookie across the
  current path and each parent domain.

### Content-Security-Policy

`scripts/build.mjs` builds the policy from `analyticsCsp` in the config, so the allowlist and the loader
cannot drift apart. The policy permits `https://www.googletagmanager.com` in `script-src`, the wildcard
Google Analytics collection hosts in `connect-src`, and the pixel hosts in `img-src`. The policy allows
those origins at all times; consent is what decides whether anything is ever requested from them. No
`'unsafe-inline'` was added to `script-src` — the bootstrap lives in a module file, not an inline tag.

`_headers` covers hosts that read it and `.htaccess` covers Apache. **Vercel reads neither**, so the
preview deployment runs without this policy; that is pre-existing and unrelated to consent.

## Entry points

- First visit: a bottom bar with *Reject non-essential*, *Manage preferences*, *Accept all*.
- Afterwards: **Cookie settings** in the footer legal row reopens the preferences panel.
- A Privacy Policy link appears inline in the bar automatically once `site.policies.privacy` is set. No
  policy route exists yet, so the link is not rendered — it is not a missing link, it is a link that has
  nothing approved to point at.

## Relationship to the existing integrations seam

`public/integrations.js` and `ANALYTICS_ID` are a separate, optional adapter for a deployment-supplied
provider. Nothing is installed, so it does nothing. The `enquiry_submitted` event it dispatches is **not**
currently sent to the Google tag. Connecting the two is a deliberate later decision and would have to be
consent-gated the same way.

## Verifying a release

| Scenario | Expected |
|---|---|
| Fresh visitor | Bar shown; zero requests to `googletagmanager.com`, `google-analytics.com`, `analytics.google.com` |
| Reject non-essential | Bar stays dismissed across reloads; no Google requests; no `_ga` cookies |
| Accept all, production hostname | `gtag/js?id=GT-WF4XRBSQ` requested exactly once per page load |
| Accept all, anywhere else | Choice recorded; zero Google requests |
| Custom (Analytics on, Marketing off) | Persists across reload; `ad_storage` stays `denied` |
| Withdraw Analytics | Collection stops; `_ga` cookies cleared; nothing requested after reload |

In DevTools, filter the Network panel by `google` before accepting — it must be empty.
