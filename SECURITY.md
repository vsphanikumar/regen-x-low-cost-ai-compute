# Security policy

REGEN-X is a prototype and does not provide a production service or a security support commitment.

## Reporting a vulnerability

Do not publish credentials, personal information, or exploit details in a public issue. Contact the maintainers through a private channel associated with this repository and include the affected file or route, impact, and reproduction steps. If no private reporting channel is available, report only a high-level description publicly and request a private contact.

## Sensitive configuration

- Keep `.env` and API keys out of Git; use `.env.example` for non-secret configuration names.
- Treat the demo API and in-memory state as prototype code, not a hardened production service.
- Before deployment, independently review authentication, authorization, input validation, CORS, rate limiting, data handling, logging, and dependency updates.
