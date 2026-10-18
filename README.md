<<<<<<< HEAD
# REGEN-X

## Turn Wasted Renewable Energy Into Low-Cost AI Compute

REGEN-X is a demonstration platform that routes delay-tolerant AI workloads to periods and regions with surplus renewable energy. It shows how enterprises can reduce compute cost and carbon footprint by matching flexible jobs to low- or negative-cost energy windows while preserving data residency and auditability.

---

## Live resources

- Prototype: https://regen-x-xcdniufgbq-el.a.run.app/
- Pitch deck: https://docs.google.com/presentation/d/19TZ0xXUcykzuHNxgdfya1qXANxzIlisC
- Demo video: https://drive.google.com/file/d/1AdiDb6uE5SuBMA6bSJ41GQNNd6LJHyCF

---

<<<<<<< HEAD
## The problem

Many AI workloads are flexible in time and location. Grid operators periodically curtail renewable generation when supply exceeds demand, creating short windows of very low or negative prices. Enterprises currently lack a practical, auditable way to take advantage of these windows for non-urgent compute work.
=======
| Resource | Link | Status |
| --- | --- | --- |
| Live hosted prototype | [Open REGEN-X](https://regen-x-xcdniufgbq-el.a.run.app/) | Live URL confirmed by the team; the deployed version has not been matched to this checkout. |
| Pitch deck | [Open Builder Cup deck](https://docs.google.com/presentation/d/19TZ0xXUcykzuHNxgdfya1qXANxzIlisC) | Opens in view-only mode. Reconcile claims with the checked-in implementation before judging. |
| Demo video | [Open walkthrough video](https://drive.google.com/file/d/1AdiDb6uE5SuBMA6bSJ41GQNNd6LJHyCF) | Drive preview is visible; public playback without signing in has not been confirmed. |
| Local walkthrough | [Read the demo script](demo/demo-script.md) | Demonstrates the current local simulation and its limitations. |

The live hosted app responded when checked on **October 18, 2026**, but its visible claims and behavior differ from the current repository. Re-deploy and verify the reviewed commit before presenting the hosted URL as this source revision.
>>>>>>> 76f4231 (docs: finalize Builder Cup repository documentation)

---

## Why now

- Increasing renewable penetration creates more frequent, predictable surplus windows.
- Cloud and edge platforms provide the APIs and ephemeral capacity needed to schedule remote execution reliably.
- Advances in model orchestration enable safe, policy-driven routing and audit trails without changing core application logic.

---

## Predict → Match → Record (workflow)

1. Predict: ingest grid telemetry and forecast short-term surplus and prices.
2. Match: evaluate queued AI jobs against policy (delay tolerance, data residency, cost/CO2) and select execution windows and locations.
3. Record: emit an auditable passport that records decision context, estimated carbon avoided, and execution metadata.

---

## Example enterprise impact

- Reduce marginal compute spend on batch AI tasks by shifting them to surplus windows.
- Improve sustainability reporting with per-job carbon estimates and signed audit records.
- Maintain compliance through configurable data residency and verification checks.

---

## Google technology stack

REGEN-X uses Google Cloud building blocks for the prototype and integration examples:

- Gemini (GenAI) — for orchestration reasoning and decision support
- Firebase — lightweight auth and hosting for demos
- Firestore — time-series and passport record store
- Cloud Run — stateless backend and worker deployment

---

## Key features

- Surplus detection: simulated renewable corridor telemetry and price signals.
- Policy-driven routing: configurable constraints for delay tolerance and data residency.
- AI-assisted decisions: structured model outputs to score/rank routing options.
- Audit-ready passports: per-job records for cost and carbon accounting.
- Local-first demo: runnable locally without production grid integrations.

---

## Architecture diagram

(See architecture/system-architecture.png)

![Architecture](architecture/system-architecture.png)

---

## Screenshots

Dashboard

![Dashboard](screenshots/dashboard.png)

Surplus detection

![Surplus detection](screenshots/surplus-detection.png)

AI routing

![AI routing](screenshots/ai-routing.png)

Passport record

![Passport](screenshots/passport.png)

Analytics

![Analytics](screenshots/analytics.png)

---

## Project status

Prototype: interactive demo and local simulation. Not intended for production control of real-world energy systems. The code is suitable for evaluation, experimentation, and concept validation.

---

## Quick start

1. Copy environment example:

```bash
cp .env.example .env
```

2. Install and run locally:

```bash
npm install
npm run dev
```

3. Open the demo at http://localhost:3000 or the prototype URL above.

Notes: a Gemini API key in .env enables live GenAI orchestration; otherwise the demo uses local simulation.

---

## Repository structure (high level)

- architecture/ — diagrams
- backend/ — prototype Python API and server logic
- src/ — TypeScript React frontend
- screenshots/ — demo images
- docs/ — problem statement, architecture, and roadmap

---

## Sustainability impact

REGEN-X is focused on reducing marginal carbon from flexible workloads by shifting execution into periods of surplus renewable generation. The platform provides per-job estimates and an auditable trail suitable for sustainability reporting and internal verification.

<<<<<<< HEAD
---
=======
```text
.
├── frontend/       React + TypeScript application
├── backend/        Separate Python/FastAPI prototype
├── docs/           Product, implementation, audit, and cleanup notes
├── architecture/   Current-state SVG diagrams
├── screenshots/    Captures of the local app
├── demo/           Walkthrough script and demo resources
├── pitch-deck/     Pitch deck links and retained source asset
├── scripts/        Local maintenance scripts
├── server.ts       Express API and local app server
└── README.md       Setup, project summary, and submission links
```
>>>>>>> 76f4231 (docs: finalize Builder Cup repository documentation)

## Disclaimer

This repository is a research and demonstration project. It is not a production-grade control system for energy markets or utility operations. Do not use this code to control live generation or make operational grid decisions without appropriate validation and coordination with grid operators.
=======
# regen-x-low-cost-ai-compute
Transforming surplus renewable energy into sustainability-verified AI compute through Gemini-powered orchestration.
>>>>>>> 33feebc (Initial commit)
