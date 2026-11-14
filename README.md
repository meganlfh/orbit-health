# Orbit Health

An offline-capable health dashboard for astronauts to record daily measurements, review trends, and keep a portable health log.

Long missions can make regular health monitoring and communication more difficult. Orbit Health brings measurements, personal observations, and daily routines into one interface that works without a continuous connection.

## Features

- **Daily check-ins:** record resting heart rate, systolic pressure, body temperature, glucose, sleep duration, oxygen saturation, radiation exposure, symptoms, and notes.
- **Health overview:** see the latest measurements, time of entry, and clearly explained sample-range flags. Entries older than 24 hours are marked as stale.
- **Actions to take:** review how to check a flagged measurement and its units, record useful context, and follow established mission medical procedures. Symptom reports take priority, and stale records request a fresh check-in.
- **Trend charts:** switch between indicators and inspect the latest 14 readings, with exact values available in a table.
- **Body-system explorer:** read background information on cardiovascular health, sleep, immune health, nutrition, and bone and muscle health.
- **Daily routine:** track completion of a personal checklist that resets each local calendar day.
- **Local records:** save check-ins in the browser and export them as JSON or CSV. Restore records from a validated JSON export.
- **Offline access:** reload the dashboard after its application files have been cached.

## Getting started

Requires **Node.js 20 or later**. No dependency installation or API keys are needed.

From the project folder:

```bash
npm run dev
```

Open **http://127.0.0.1:5173**.

For a walkthrough, select **Mission records → Load 14-day demo**. The fictional dataset includes changing measurements so the charts and range flags can be explored. Loading it replaces existing check-ins after confirmation.

To run on another port:

```bash
npm run dev -- --port 8080
```

## How it works

1. Enter a measurement time and the seven health indicators.
2. Add relevant context and indicate whether there are concerning symptoms.
3. Save the check-in to update the overview and charts.
4. Review non-diagnostic follow-up guidance for any fictional sample-range flags, then open the relevant trend or record a follow-up check-in.
5. Review changes over time and the associated body-system information.
6. Export the records when a backup or transfer is needed.

Values are entered manually. The app does not connect to wearables, sensors, or a medical service. The symptoms flag displays a reminder to follow the established mission medical protocol; it does not send an alert.

## Technology

The interface uses HTML, CSS, and JavaScript modules. Charts are rendered with SVG, records use `localStorage`, and a service worker caches the application files. A small Node.js server supports local development. There is no build step or third-party runtime dependency.

| File | Responsibility |
| --- | --- |
| `index.html` | Dashboard structure and check-in form |
| `styles.css` | Responsive layout and interface styling |
| `src/app.js` | Rendering, charts, checklist, and record management |
| `src/actions.js` | Prioritized, non-diagnostic action guidance for symptoms, stale records, and fictional sample-range flags |
| `src/model.js` | Validation, sample data, range checks, and CSV export |
| `sw.js` | Offline application cache |
| `scripts/serve.mjs` | Local development server |
| `tests/model.test.js` | Data validation and rule tests |
| `docs/ARCHITECTURE.md` | Data flow, storage format, and implementation details |
| `docs/TESTING.md` | Test coverage and manual verification checklist |

## Tests

```bash
npm run check
npm test
```

The tests cover input validation, symptom priority, stale-record follow-up, per-indicator action guidance, range boundaries, import validation, duplicate timestamps, CSV escaping, and sample-data round trips. GitHub Actions runs the checks on pushes and pull requests.

## Data and privacy

Records remain in this browser. There are no health-data uploads, analytics, accounts, or cloud backups. Browser storage and exported files are **not encrypted**. Use fictional data when exploring the app, particularly on shared devices.

Clearing site data can remove the records. Exporting JSON provides a backup of check-ins and notes; checklist progress is stored separately. Import validates the full file before replacing existing check-ins.

- Maximum stored check-ins: **500**.
- Maximum JSON import size: **1 MB**.
- History table: latest **30** entries; exports contain all entries.
- Measurement times: stored in UTC and displayed in local time.
- Radiation exposure is recorded in millisieverts (mSv).

## Scope and limitations

Orbit Health is an educational software prototype, not a medical device. Its sample ranges demonstrate the interface and are **not clinically validated thresholds**. A reading within a sample range does not establish health or rule out illness.

Blood pressure currently includes systolic readings only. Glucose readings do not distinguish fasting and post-meal measurements. The app does not diagnose conditions, recommend treatment, or assess fitness for duty.

Offline reload requires a successful initial load, an active service worker, and HTTPS or localhost. External references require an internet connection. The connection indicator reflects browser network status rather than a verified communication link.

Chart points are evenly spaced by record, not elapsed time. Records have no individual edit or delete controls, and simultaneous changes from multiple tabs are not reconciled. Use one tab when entering data.

## Further development

- Add diastolic pressure and structured measurement context, including meal timing and device source.
- Support editing and deleting individual check-ins.
- Handle concurrent changes across tabs or devices.
- Review measurement guidance and range rules with medical professionals.
- Introduce secure storage and access controls before using real health records.
- Extend usability, accessibility, mobile, and offline testing.

## References

- [NASA: Five Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/)
- [NASA: The Human Body in Space](https://www.nasa.gov/humans-in-space/the-human-body-in-space/)
- [NASA: Human Research Program](https://www.nasa.gov/hrp/)

These resources inform the health background; they do not validate the sample ranges. This project is independent and is not affiliated with or endorsed by NASA.

## License

[MIT](LICENSE)
