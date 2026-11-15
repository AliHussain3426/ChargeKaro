# Security Audit Report

**Type:** Defensive review (source inspection + dependency audit + executed functional tests). No destructive attacks, no external targets, no real user data.

## Dependency vulnerabilities
- **Server:** `npm audit --json` → **0 vulnerabilities** (info/low/mod/high/critical = 0).
- **Client:** `npm audit --json` → **0 vulnerabilities**.
- Evidence: `server_npm_audit.json`, `client_npm_audit.json`.

## Implemented controls observed
| Control | Evidence | Assessment |
|---|---|---|
| Security headers baseline | `helmet()` in `server/src/index.ts` | Present (default config) |
| CORS with credentials + configured origin | `cors({ origin: env.CLIENT_URL, credentials: true })` | Present; ensure strict origins in prod |
| Cookie parsing / HttpOnly auth cookies | `cookie-parser`, auth cookie issuance/reading | Present |
| Password hashing | `bcryptjs` (auth service) | Present |
| JWT auth + role checks | `authenticate`, `authorize`, JWT utils | Present and tested |
| Request validation | `express-validator` in modules | Present (coverage varies by endpoint) |
| RBAC/ownership & admin PII guard | Middleware/services + tests | Present and tested |

## Findings

| ID | Module/Endpoint | Severity | Status | Evidence | Expected | Actual | Impact | Recommendation |
|---|---|---|---|---|---|---|---|---|
| SEC-001 | `POST /api/payments/webhooks/:provider` (`server/src/modules/payments/*`) | **High** | **Reproduced by inspection (design gap)** | Unauthenticated route; `handleWebhook` trusts payload `providerReference/status` without signature verification | Provider webhooks must be authenticated (HMAC/signature) and verified | Stub/idempotent handler processes payload outcomes without cryptographic verification | Spoofed payment success/failure if endpoint reachable; booking/payment state manipulation risk | Implement provider-specific signature verification, replay protection, strict allowlists, and secret management before production exposure |
| SEC-002 | Auth/API surface (`/api/auth/*`, others) | **Medium** | **Observed** | No rate limiting/throttling middleware found in source scan | Brute-force/abuse protection on login, registration, password reset, webhooks | No limiter configured | Credential stuffing, enumeration, DoS amplification risk | Add rate limiting (e.g. per-IP/account), lockout/backoff, and monitoring |
| SEC-003 | Request handling/data layer | **Medium** | **Observed** | No explicit mongo-sanitize/xss/CSRF middleware found; Mongoose/validators used | Defense-in-depth against injection and malformed payloads | Reliance on defaults/validators | Potential NoSQL/operator injection or payload abuse on insufficiently validated paths | Add query sanitization, strict schema validation, and security tests for operator injection |
| SEC-004 | Auth/session config (`server/.env.example`, cookies) | **Medium** | **Observed** | Placeholder `JWT_SECRET`; cookie auth with credentials | Strong secrets, secure cookie attributes in prod, CSRF strategy aligned to cookie auth | Secure/SameSite behavior depends on config (typ. Lax); secret must be rotated/strong | Token compromise or CSRF/session risks if misconfigured | Enforce strong secrets via env management, `Secure`+appropriate `SameSite` in prod, consider CSRF tokens/origin checks for state-changing cookie flows |
| SEC-005 | Error handling/logging | **Low/Informational** | **Not fully tested** | Centralized error handler exists; detailed behavior under all failures not exhaustively probed | No sensitive stack/secret leakage to clients | Unknown across all paths | Information disclosure in edge cases | Verify production error responses/log redaction |
| SEC-006 | Uploads/advanced inputs | **Informational** | **Not applicable/observed** | No file upload flows identified in audited scope | Strict file/type/size validation if added | N/A | Future risk | Apply secure upload controls when introduced |

## OWASP-oriented checklist (summary)
- **Broken Access Control/IDOR:** mitigations and tests present for covered resources; **not exhaustively proven** across all endpoints. (Residual risk)
- **Cryptographic failures:** bcrypt/JWT used; secret management operational concern.
- **Injection:** validators/Mongoose in use; explicit sanitization middleware not observed.
- **Insecure design:** payment gateway deferred (known).
- **Security misconfiguration:** helmet/cors present; rate limits/CSRF hardening incomplete.
- **Vulnerable components:** npm audit clean at time of scan.
- **Auth failures:** auth flows tested; no rate limiting.
- **Integrity failures:** webhook verification missing (stub).
- **Logging/monitoring:** not assessed in depth.
- **SSRF:** no obvious server-side URL fetch from untrusted input except routing to OSRM base URL/config (review needed for configurability).

## Safe tests executed
- Automated auth/RBAC/ownership/notification isolation tests: **PASS**.
- Dependency audits: **PASS (0 known vulns)**.
- No penetration/exploit execution against running external services.

## Priority remediation
1. **Blocker before production payments:** signed webhook verification + strict idempotency/replay handling.
2. **High priority:** rate limiting, auth abuse protections, and security test coverage for IDOR/injection.
3. **Hardening:** CSRF/origin protections for cookie-auth flows, secret/config validation, and expanded negative security tests.