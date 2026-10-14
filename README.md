# REGEN-X: Spatial-Temporal Compute Arbitrage Network

REGEN-X is a local simulation and product demo for routing flexible AI workloads toward regions and time windows where renewable energy is available at low or negative cost. The project combines a React frontend with a Node.js + Express backend to model grid telemetry, curtailment events, workload allocation, and Green Compute Passport-style compliance records.

This repository is intended for demo use, technical exploration, and presentation-friendly validation. It is not a production control plane for live energy markets or a real utility operations system.

## Project overview

The current implementation demonstrates a simplified compute-arbitrage loop:

- simulated renewable corridors report energy prices, available capacity, and curtailment levels;
- AI-assisted orchestration evaluates a target workload and decides whether to scale, throttle, or route it;
- data residency constraints are represented as part of the routing decision flow;
- generated passport records summarize carbon avoidance and execution context in an audit-style ledger.

The repo is designed to make the concept concrete in a single local workflow without requiring a connected grid API or a full industrial deployment stack.

## Repository structure

```text
regen-x/
├── README.md
├── docs/
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   ├── ai-agents.md
│   ├── green-compute-passport.md
│   └── roadmap.md
├── architecture/
│   ├── system-architecture.png
│   ├── data-flow.png
│   ├── agent-workflow.png
│   └── deployment-architecture.png
├── screenshots/
│   ├── dashboard.png
│   ├── surplus-detection.png
│   ├── ai-routing.png
│   ├── passport.png
│   └── analytics.png
├── demo/
│   ├── demo-script.md
│   └── walkthrough.pdf
├── pitch-deck/
│   └── Regen-X-AI-Builder-Cup.pdf
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── components/
│   ├── services/
│   └── utils/
├── backend/
│   └── app/
│       └── main.py
├── server.ts
├── public/
├── .env.example
├── .gitignore
├── Dockerfile
├── LICENSE
├── CONTRIBUTING.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── index.html
├── RUNLOG.md
└── dist/
```

## Codebase layout

### Frontend
The frontend is a Vite React application written in TypeScript.

Key areas include:

- `src/App.tsx` — main dashboard composition and state orchestration
- `src/components/` — dashboard, job, compliance, architecture, and verification views
- `src/services/apiClient.ts` — typed API client for backend calls
- `src/types.ts` — shared domain types for nodes, jobs, and passports
- `src/utils/passportPdfExport.ts` — export flow for compliance/passport records

### Backend
The main backend is implemented in `server.ts` and uses Express.

It exposes a set of demo endpoints, including:

- `GET /healthz` and `GET /readyz`
- `GET /v1/grid/telemetry`
- `POST /v1/simulation/override`
- `GET /v1/jobs` and `POST /v1/jobs`
- `GET /v1/compliance/passport`
- `GET /v1/verification/checklist`
- `POST /v1/orchestrate`

The repository also contains a Python prototype at `backend/app/main.py` using FastAPI and the Google GenAI SDK. This provides a secondary implementation of the orchestration flow and a useful reference for experimentation.

## Product concept

The core idea is that not every compute workload needs to run in a fixed always-on data center footprint. Some AI jobs are delay-tolerant, and some regions temporarily have excess renewable supply. In that setting, the platform demonstrates how to route compute toward available clean energy while accounting for policy, operational risk, and carbon accounting.

The current demo models this through:

- renewable corridor telemetry simulation;
- curtailment and price sensitivity checks;
- ROI and workload allocation views;
- AI-driven routing decisions with a structured response body;
- compliance-style passport ledger entries.

## Technology stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4
- Data and UI libraries: D3, Motion, Lucide React
- Backend runtime: Node.js, Express
- AI orchestration: Google GenAI SDK (`@google/genai`)
- PDF generation: `jspdf`, `jspdf-autotable`
- Prototype backend: FastAPI, Pydantic, Google GenAI Python SDK

## Prerequisites

The local setup assumes the following are available:

- Node.js 18 or later
- npm
- A valid Gemini API key if you want the AI orchestrator path to use live Google GenAI calls

## Environment configuration

Create a local environment file from the example:

```bash
cp .env.example .env
```

Then add the required variables to `.env`:

```bash
GEMINI_API_KEY="your_key_here"
NODE_ENV="development"
PORT=3000
```

## Installation

```bash
npm install
```

## Local development

Run the app in development mode:

```bash
npm run dev
```

The demo is served through the Express app and is typically available at:

```text
http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## Available scripts

The project exposes the following package scripts:

- `npm run dev` — run the app in development mode
- `npm run build` — build the frontend bundle
- `npm start` — serve the app in the production runtime path
- `npm run lint` — TypeScript validation (`tsc --noEmit`)
- `npm run generate:runlog` — refresh the runlog artifact used by the demo workflow

## Documentation

The project documentation is organized under `docs/` and covers the concept, architecture, and roadmap:

- `docs/problem-statement.md` — problem framing and motivation
- `docs/solution-overview.md` — high-level platform concept
- `docs/architecture.md` — implementation architecture and system flow
- `docs/ai-agents.md` — simulated agent model and orchestration logic
- `docs/green-compute-passport.md` — Green Compute Passport concept and compliance framing
- `docs/roadmap.md` — near-term directions and future expansion areas

## Contributing

Contributions are welcome when they are narrow, well-scoped, and clearly documented. For any substantive change, please update the related code and the matching documentation when necessary.

## License

The repository includes a license file for open use and distribution. Please review `LICENSE` before reusing or redistributing the project.

## Notes on status

This repository is best understood as a product demo and simulation layer rather than a production energy-operations platform. The code intentionally emphasizes experience, narrative clarity, and local reproducibility over real-world infrastructure complexity.
