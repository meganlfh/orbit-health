# Project overview

Orbit Health provides a single place to record astronaut health observations and review changes over time. It is designed to keep those records accessible when a continuous network connection is unavailable.

## Workflow

A crew member records six measurements, adds context, and reviews the latest entry alongside recent readings. The dashboard highlights values outside fictional sample ranges and marks records older than 24 hours. A separate symptoms flag directs the user to the established mission medical protocol.

The body-system explorer provides background information. A daily checklist records self-reported routine completion. Records remain in the browser and can be exported for backup or transfer.

## Design choices

- Manual entry keeps the application independent of specific sensor hardware.
- A small set of indicators makes the data flow easy to inspect and test.
- Text explains each flag so users do not have to rely on color alone.
- Charts include an exact-values table.
- Local storage and cached application files support use without a continuous connection.
- Portable exports allow records to be moved without an automatic upload service.

## Scope

The application demonstrates health recordkeeping and visualization. It does not establish a clinical assessment, provide treatment instructions, or replace mission medical procedures. The sample dataset and comparison ranges are fictional.

Implementation details are in [Architecture](ARCHITECTURE.md). Test coverage and remaining verification work are in [Testing](TESTING.md).
