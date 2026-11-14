# Architecture

Orbit Health is a static browser application. It uses JavaScript modules and browser storage, with no backend or external runtime dependencies.

## Data flow

The check-in form collects measurements and context. `validateRecord` checks field types, numeric bounds, timestamps, and note length. Accepted entries are sorted by timestamp and written to browser storage before the interface confirms a save.

`assess` compares the latest entry with the fictional ranges in `METRICS`. It returns individual flags and an independent stale-record status. A concerning-symptoms flag takes priority in the overview message. Range checks do not infer a diagnosis.

Oxygen saturation uses a 95–100% demo envelope. Cumulative radiation exposure uses a 0–600 mSv envelope based on NASA's career exposure limit. The latter is a risk-management ceiling rather than a zero-risk health threshold. These two measurements currently receive range flags without indicator-specific follow-up instructions.

The overview, charts, and history table read the same stored record collection. Chart selection changes the indicator without modifying records.

## Storage

| Key | Contents |
| --- | --- |
| `orbit-health-v1` | Versioned check-in collection |
| `orbit-routine-v1` | Checklist date and completed item indices |

The storage version is separate from the application release version. Neither key contains encrypted data. Clearing browser site data removes these records.

A version 1 JSON export has the following structure:

```json
{
  "version": 1,
  "records": [
    {
      "date": "2026-11-01T08:00:00.000Z",
      "heartRate": 68,
      "systolic": 118,
      "temperature": 36.7,
      "glucose": 95,
      "sleep": 7.8,
      "oxygenSaturation": 97.8,
      "radiationExposure": 0.108,
      "symptoms": false,
      "notes": "Fictional example."
    }
  ]
}
```

The app also adds an `exportedAt` timestamp when exporting. Import accepts at most 500 entries, validates every entry, rejects duplicate timestamps, and discards unknown record properties. It replaces the collection only after successful validation and user confirmation.

CSV exports include every measurement, the symptoms flag, and notes. Values are quoted, embedded quotes are escaped, and text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe.

## Offline behavior

The service worker caches the HTML, stylesheet, JavaScript modules, icon, and manifest. Measurements remain in `localStorage`; they are not added to the application cache.

The worker uses a versioned cache. When changing cached application files, increment the cache name in `sw.js`. A newly installed worker can wait for existing tabs to close before activating. Local development can use the browser's service-worker controls to unregister an old worker.

Service workers require HTTPS or localhost. The first load must succeed before offline reload is available. External reading links require a connection.

## Interface

The dashboard uses labelled form controls, keyboard focus styles, text alongside color-coded status, reduced-motion support, and an exact-values table for the SVG chart. The body-system controls expose their selection through `aria-pressed`.

Only the latest 14 entries appear in the chart, and the history table displays the latest 30. Exports include the complete collection. Chart points are spaced by record rather than elapsed time.

## Current boundaries

The app has no authentication, encryption, sensor connection, synchronization service, medical messaging, or clinical decision engine. It does not reconcile writes across tabs. Those capabilities require separate designs and validation before they can support real health records.
