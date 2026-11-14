# Architecture

Orbit Health is a static browser application. It uses JavaScript modules and browser storage, with no backend or external runtime dependencies.

## Data flow

The check-in form collects measurements and context. `validateRecord` checks field types, numeric bounds, timestamps, and note length. Accepted entries are sorted by timestamp and written to browser storage before the interface confirms a save.

`assess` compares the latest entry with the fictional ranges in `METRICS`. It returns individual flags and an independent stale-record status. A concerning-symptoms flag takes priority in the overview message. Range checks do not infer a diagnosis.

Oxygen saturation uses a 95–100% demo envelope. Daily radiation exposure uses a 0–1 mSv/day envelope covering representative daily exposure levels aboard the International Space Station. The latter is an operational range rather than a zero-risk health threshold.

The overview, charts, and history table read the same stored record collection. Chart selection changes the indicator without modifying records.

## Storage

| Key | Contents |
| --- | --- |
| `orbit-health-v1` | Versioned check-in collection |
| `orbit-routine-v1` | Checklist date and completed item indices |

The storage version is separate from the application release version. Neither key contains encrypted data. Clearing browser site data removes these records.

A version 2 JSON export assigns every record an ID and can link a follow-up to its source record and indicator:

```json
{
  "version": 2,
  "records": [
    {
      "id": "record-001",
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
    },
    {
      "id": "record-002",
      "date": "2026-11-01T08:15:00.000Z",
      "heartRate": 68,
      "systolic": 118,
      "temperature": 36.7,
      "glucose": 95,
      "sleep": 7.8,
      "oxygenSaturation": 97.2,
      "radiationExposure": 0.108,
      "symptoms": false,
      "notes": "Fictional follow-up.",
      "followUpTo": "record-001",
      "followUpIndicator": "oxygenSaturation",
      "followUpReason": "unhealthy-range"
    }
  ]
}
```

The app also adds an `exportedAt` timestamp when exporting. Import accepts version 1 and version 2 files with at most 500 entries, gives legacy records deterministic IDs, validates every entry and follow-up reference, rejects duplicate timestamps or IDs, and discards unknown record properties. It replaces the collection only after successful validation and user confirmation.

CSV exports include every measurement, the symptoms flag, notes, record IDs, and follow-up fields. Values are quoted, embedded quotes are escaped, and text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe.

## Offline behavior

The service worker caches the HTML, stylesheet, JavaScript modules, icon, and manifest. Measurements remain in `localStorage`; they are not added to the application cache.

The worker uses a versioned cache. When changing cached application files, increment the cache name in `sw.js`. A newly installed worker can wait for existing tabs to close before activating. Local development can use the browser's service-worker controls to unregister an old worker.

Service workers require HTTPS or localhost. The first load must succeed before offline reload is available. External reading links require a connection.

## Interface

The dashboard uses labelled form controls, keyboard focus styles, text alongside color-coded status, reduced-motion support, and an exact-values table for the SVG chart. The body-system controls expose their selection through `aria-pressed`.

Only the latest 14 entries appear in the chart, and the history table displays the latest 30. Exports include the complete collection. Chart points are spaced by record rather than elapsed time.

## Current boundaries

The app has no authentication, encryption, sensor connection, synchronization service, medical messaging, or clinical decision engine. It does not reconcile writes across tabs. Those capabilities require separate designs and validation before they can support real health records.
