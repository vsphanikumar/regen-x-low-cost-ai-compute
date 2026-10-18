# Repository audit

**Scope:** checked-in source, documentation, local assets, and team-supplied submission links. External resources were checked for basic access only, not verified against this checkout.

## Strengths

- The primary app has a React + TypeScript frontend and an Express API.
- The source includes an optional Google GenAI integration and a deterministic fallback.
- SVG architecture diagrams explain the prototype and proposed system shape.
- The README now explains setup, product intent, implementation, and limitations.

## Weaknesses and recommendations

- Grid, workload, price, savings, and carbon values are illustrative; state that consistently and avoid claims of dispatch, measured impact, certification, or production ledger.
- Firebase and Firestore are not integrated in the checked-in app. Do not claim their use unless implemented and verifiable.
- The team confirms the hosted prototype URL is live, but its deployed revision has not been matched to this checkout. Deploy and smoke-test the exact submission commit.
- Reconcile the pitch deck with the code, especially claims about integrations, impact, partnerships, and compliance.
- Public playback of the supplied Drive video was not confirmed. Verify judge access without sign-in.
- The Python/FastAPI prototype in `backend/` is separate from the primary app startup flow; keep that distinction explicit.

## Assets and evidence

- The original architecture PNG previews were 1x1 placeholders and have been removed; valid SVG diagrams remain.
- Screenshot files are present, but should be visually checked against the current app before being presented as evidence.
- A previously inspected local PDF was a tiny title-page stub. Validate the retained pitch-deck PDF before sharing it as a complete deck.
- The official Builder Cup rubric and required deliverables were not established by this repository.

## Link and integration findings

- Root README links point to repository files; recheck them after future moves.
- The live URL, deck, and video are team-supplied. Access does not establish source parity, content accuracy, or media permissions.
- No verified deployment-to-commit mapping, public video playback confirmation, genuine screenshot validation, or complete local PDF validation is included.
