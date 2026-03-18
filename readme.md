# Hopper Tech Test

## Getting Started

Please refer to [coding-exercise.md](./coding-exercise.md) for the full problem description and instructions.

## Submitting your solution

Create your solution in a fork of this repository. Once you're ready to submit, please add dmanning-resilient as a collaborator on your private repository and send us a message.

## Candidate Notes

### Overview

I approached the exercise with four priorities:

1. keep the ingest flow easy to follow end to end,
2. acknowledge valid batches quickly,
3. isolate validation/enrichment/storage concerns cleanly,
4. keep the solution production-shaped without over-engineering it.

The implemented flow is intentionally compact and layered:

- `BatchHandler` is a thin entry point. It validates the payload, returns an acknowledgment immediately for valid batches, and dispatches processing asynchronously.
- `BatchInput` owns the CSV boundary. It parses CSV, supports optional headers, validates required fields, ISO 8601 timestamps, E.164 phone numbers, call ordering, and call type.
- `BatchService` owns enrichment and persistence orchestration. It converts ISO timestamps to `yy-MM-dd`, performs operator lookups, calculates duration and estimated cost, and writes results to store and index stubs.
- Lookup, persistence, indexing, and logging are all accessed through small contracts, which keeps the core flow testable and easy to swap later.

The application-facing server modules are grouped under `src/server/processing/`, so the main business pipeline is clearly separated from cross-cutting helpers (`utils`) and infrastructure doubles (`mocks`).

Internally, I also moved shared concerns into dedicated modules:

- reusable types in `src/types/`
- reusable constants in `src/consts/`
- reusable utility functions in `src/server/utils/`

This keeps the business flow small while making the codebase easier to extend and review.

### Installation

`npm install`

### Running tests

`npm test`

### Additional validation

- `npm run typecheck`
- `npm run lint`

### Notes on behaviour

- Empty or malformed payloads are rejected with validation errors.
- CSV input can be processed with or without a header row; if a header is present, it is validated explicitly.
- The handler acknowledges valid batches immediately and triggers downstream processing asynchronously.
- A dedicated test verifies that acknowledgment stays below the `<500ms` SLA.
- Operator lookup failures are tolerated during enrichment so a single external failure does not fail the whole batch.
- The provided operator lookup contract is respected, including E.164 input, `yy-MM-dd` lookup date formatting, mock latency, and occasional failure handling.
- Enriched records are written to both persistence and indexing stubs so the flow mirrors the intended production shape.

### Assumptions and trade-offs

- I treated the CSV header as optional because that keeps the input handling tolerant while still allowing strict validation when a header is supplied.
- `estimatedCost` is calculated from the average of the available per-minute prices returned for the `from` and `to` numbers. If one lookup fails, the remaining available price is still used.
- I used in-memory adapters instead of real persistence and search integrations, but kept explicit contracts so those dependencies can be replaced cleanly.
- I kept the architecture deliberately smaller than a typical production design. For this exercise, a compact `handler -> input -> service` flow gives enough structure without unnecessary layers, while still showing dependency inversion and module boundaries.
- I focused tests on the behavior that is most important to trust in this solution: input acceptance/rejection, asynchronous dispatch, SLA acknowledgment, enrichment logic, lookup-date conversion, and persistence/index handoff.
- I preferred explicit, composable modules over large files, so some validation and test fixtures were extracted into dedicated `types`, `consts`, and `utils` files.
