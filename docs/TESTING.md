# Testing and verification

## Automated coverage

Run `npm test` and `npm run check` with Node.js 20+.

Node unit tests cover empty state, symptom-first escalation and action priority, linked follow-ups, per-indicator action guidance, inclusive demo-envelope boundaries, invalid input and future timestamps, atomic import validation, schema/version/size/duplicate rejection, CSV formula neutralization and quoting, unknown property removal, and demo round-trip validation.

`npm run check` parses the application and service worker. GitHub Actions runs both commands on pushes and pull requests. The app has no third-party runtime dependencies.

## Browser checks

Checked the empty dashboard, loading sample records, saving a manual check-in, switching body-system explanations, and updating routine progress on desktop.

Mobile layouts, offline reload, storage failure, and the complete regression checklist below still need testing.

## Manual regression checklist

Use fictional data only.

- Save a valid check-in and refresh; verify it remains.
- Submit missing fields, a negative sleep value, and a future date; verify rejection.
- Check concerning symptoms with otherwise in-envelope values; verify the mission-protocol message.
- Load the demo; switch each trend; expand the value table.
- Use every body-system button with mouse and keyboard.
- Toggle routine items and refresh. Check local calendar-day reset.
- Export JSON, import it again, and confirm equal records. Try invalid JSON and duplicate timestamps; verify no replacement.
- Export CSV and inspect units, quotes, note line breaks, and formula neutralization.
- Confirm that clear/load/import replacement prompts can be cancelled.
- Test browser-storage failure and quota exhaustion; verify no false saved message.
- After the first successful load and service-worker activation, disconnect networking and reload the same origin. Verify the app shell works; external NASA links should need connectivity.
- Inspect at 390 px, 768 px, and desktop widths. Check keyboard focus, zoom, contrast, screen-reader announcements, and reduced motion.
- Verify two tabs editing the same dataset: the app has no cross-tab conflict resolution; use a single tab.

## Known verification limits

The unit tests are deterministic logic tests, not clinical validation, end-to-end automation, sensor integration tests, a security audit, or a formal accessibility review. No real users or astronaut datasets were used. Offline reload and mobile-browser behavior require the manual checks above on target devices.
