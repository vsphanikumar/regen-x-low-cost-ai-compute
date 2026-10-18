# REGEN-X

**Turn wasted renewable energy into low-cost AI compute.**

REGEN-X explores whether flexible AI workloads can be matched to compute capacity near periods of renewable-energy surplus. The prototype brings energy signals, workload constraints, routing choices, and example impact records into one interactive review flow.

> **Prototype, not an operating energy platform.** The checked-in app uses illustrative grid, workload, price, cost, and carbon data. It does not control a power grid or compute cluster, connect to utility or compute-provider feeds, independently verify sustainability, or guarantee savings.

## In 60 seconds

1. **Problem:** Renewable curtailment and energy-intensive AI compute can occur at different times and places.
2. **REGEN-X idea:** Make flexible workload placement consider regional energy conditions, job urgency, and residency preferences.
3. **How it works:** A React dashboard sends a scenario to a Node.js + Express API, which returns a routing decision and an in-memory example passport record.
4. **Gemini:** The API can call Google GenAI when `GEMINI_API_KEY` is configured. Without a key, or if the call fails, the app uses a deterministic local fallback and reports the selected mode.
5. **Value and impact:** The UI illustrates an economic and sustainability hypothesis; it does not show measured savings or audited emissions results.
6. **Differentiation to validate:** Treat renewable availability and workload flexibility as joint placement inputs.

## Try REGEN-X

| Resource | Link | Status |
| --- | --- | --- |
| Live hosted prototype | [Open REGEN-X](https://regen-x-xcdniufgbq-el.a.run.app/) | Live URL confirmed by the team; the deployed version has not been matched to this checkout. |
| Pitch deck | [Open Builder Cup deck](https://docs.google.com/presentation/d/19TZ0xXUcykzuHNxgdfya1qXANxzIlisC) | Opens in view-only mode; reconcile claims with the implementation before judging. |
| Demo video | [Open walkthrough video](https://drive.google.com/file/d/1AdiDb6uE5SuBMA6bSJ41GQNNd6LJHyCF) | Drive preview is visible; public playback without sign-in has not been confirmed. |
| Local walkthrough | [Read the demo script](demo/demo-script.md) | Describes the local simulation and limitations. |

The hosted app responded when checked on **October 18, 2026**, but its visible behavior and claims differ from this repository. Deploy and verify the reviewed commit before representing the hosted URL as this source revision.

## What is implemented

| Area | Repository evidence |
| --- | --- |
| Frontend | React 19, TypeScript, and Vite under [`frontend/`](frontend/README.md). |
| API | Node.js + Express in [`server.ts`](server.ts), using in-memory simulation state. |
| Gemini | Optional server-side Google GenAI SDK call with deterministic fallback. |
| Cloud Run | A live URL is supplied above and a Dockerfile is included. No verified deployment manifest or proof of source-revision parity is present. |
| Firebase / Firestore | Not integrated in the checked-in code. |
| Other cloud integrations | Utility telemetry, compute dispatch, BigQuery, Pub/Sub, Cloud Storage, Memorystore, and weather APIs are not implemented here. Diagrams describing them are concepts, not deployed integrations. |

The Python/FastAPI code under [`backend/`](backend/README.md) is a separate prototype and is not required to run the primary app.

## Run locally

Requirements: Node.js `^20.19.0` or `>=22.12.0` and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The local routing simulation does not require an API key.

To try Gemini, copy [`.env.example`](.env.example) to `.env`, set `GEMINI_API_KEY`, and restart the app. Do not commit `.env` or share API keys. The API can still use the fallback; check the decision-engine label.

### Validate

```bash
npm run lint
npm run build
```

CI runs these TypeScript and production frontend checks on pushes to `main` and pull requests. `npm run generate:runlog` is an optional local diagnostic; it does not certify deployment or compliance.

## Repository map

```text
.
├── frontend/       React + TypeScript application
├── backend/        Separate Python/FastAPI prototype
├── docs/           Product, implementation, audit, and cleanup notes
├── architecture/   Scalable SVG diagrams
├── screenshots/    App screenshots; review before external use
├── demo/           Walkthrough video and demo script
├── pitch-deck/     Pitch deck asset and access notes
├── scripts/        Local maintenance scripts
├── server.ts       Express API and local app server
└── README.md       Project overview and setup
```

Generated `dist/` output and installed `node_modules/` are excluded from Git.

### Start here

- [Frontend folder guide](frontend/README.md)
- [Documentation index](docs/README.md)
- [System architecture](architecture/system-architecture.svg)
- [Routing decision flow](architecture/agent-workflow.svg)
- [Data flow](architecture/data-flow.svg)
- [Deployment concept](architecture/deployment-architecture.svg)
- [Repository audit](docs/repository-audit-report.md)
- [Cleanup report](docs/cleanup-report.md)
- [Security policy](SECURITY.md)
- [Contribution guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Data and sustainability boundaries

- Prices, curtailment, availability, workload state, savings, and carbon metrics are illustrative or simulated values.
- Gemini may produce a routing recommendation; no containers are dispatched and no real job is moved.
- Passport examples are stored in process memory. A fingerprint is not a digital signature, immutable ledger, proof of energy origin, or compliance evidence.
- Residency values are scenario inputs, not a production data-boundary control or legal compliance assessment.
- This checkout contains no measured customer results, contracted commercial partnerships, or independently reviewed environmental methodology.

## Submission checklist

- [ ] Confirm the official Builder Cup rubric, eligibility, and deliverables in the event portal.
- [ ] Deploy and smoke-test the exact commit to be reviewed.
- [ ] Confirm judges can play the linked video without signing in.
- [ ] Reconcile the slide deck with the implementation and remove unsupported production, savings, certification, and partnership claims.
- [ ] Visually review screenshots and validate the retained pitch-deck PDF before presenting them as evidence.
- [ ] Claim Firebase or Firestore only if an integration is implemented and verifiable.
- [ ] Run `npm ci`, `npm run lint`, and `npm run build` on the final revision.

## License

See [`LICENSE`](LICENSE).
