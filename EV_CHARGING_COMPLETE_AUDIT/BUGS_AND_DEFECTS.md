# Bugs and Defects

Evidence-based findings from executed tests/builds and source inspection. Items marked NOT TESTED/NOT REPRODUCED are not claimed as pass or fail without evidence.

| ID | Module | Feature | Status | Classification | Severity | Evidence | Expected | Actual | Recommendation |
|---|---|---|---|---|---|---|---|---|---|
| DEF-001 | Payments (`server/src/modules/payments`) | Webhook verification | **FAIL (security design gap)** | Dynamic (deferred) | **High** | `routes.ts`, `service.ts` webhook handler; unauthenticated endpoint | Verify provider signatures/authenticity before state changes | Payload-driven processing without cryptographic signature verification | Implement signed webhooks, replay protection, strict validation before production exposure |
| DEF-002 | Server (cross-cutting) | Rate limiting / abuse protection | **FAIL (missing control)** | Dynamic | **Medium** | Source scan: no limiter middleware; auth endpoints exposed | Throttle/login protection on sensitive endpoints | Not configured | Add rate limiting, lockout/backoff, monitoring |
| DEF-003 | Server (cross-cutting) | Input/query sanitization hardening | **PARTIAL** | Dynamic | **Medium** | Validators/Mongoose present; no explicit sanitize middleware found | Defense-in-depth against injection/operator abuse | Relies on defaults/validators | Add sanitization middleware and negative injection tests |
| DEF-004 | Payments | Real gateway/redirect/refunds | **NOT IMPLEMENTED (deferred)** | Dynamic | **Medium** | Payments tests are stub-flow; ProjectState/DevLog | Production-grade payment processing | Stubbed initiate/confirm transitions and records only | Integrate provider, handle refunds/webhook signatures/idempotency end-to-end |
| DEF-005 | Client (global) | Automated browser E2E / exhaustive UI control verification | **NOT TESTED** | Mixed | **Medium** | No Playwright; 7 client test files only | All controls/pages verified by interaction evidence | Only limited automated UI logic tests | Add Playwright suite and manual/automated UI matrix evidence |
| DEF-006 | Client dashboards/profile areas | Profile field persistence & some UI states | **NOT TESTED / NEEDS VERIFICATION** | Mixed | **Low–Medium** | `ProfileSettings.tsx` and various pages not fully covered by tests | Every editable field persists correctly per user | Persistence not exhaustively verified | Field-level integration/UI tests and browser verification |
| DEF-007 | Client build/perf | Bundle size | **PARTIAL** | Static build artifact | **Low** | `npm run build` chunk-size warning (~603 kB JS) | Optimized initial load | Large bundle (maps) | Code-split/lazy-load Leaflet routes |
| DEF-008 | Tooling/quality | Lint warnings & data-fetch patterns | **PARTIAL** | Static/Dynamic | **Low** | `oxlint` warnings (fast-refresh, set-state-in-effect) | Clean lint and robust effects | Pre-existing warnings remain | Refactor effects/exports as appropriate |
| DEF-009 | Test infrastructure | In-memory DB stability under concurrent full runs | **PARTIAL (env sensitivity)** | N/A | **Low** | Earlier concurrent run had hook timeouts; sequential run passed 17/73 | Reliable CI/local full-suite runs | Environment-sensitive under load | Tune timeouts/resources, run sequentially in constrained envs, consider CI config |
| DEF-010 | Responsiveness/PWA runtime | Mobile/tablet/desktop & install/offline behavior | **NOT TESTED** | Mixed | **Low** | No viewport/device/PWA execution evidence | Verified responsive and installable experience | Baseline manifest/SW added but unverified on devices | Run viewport and device/PWA validation tests |

## Reproducible runtime failures in executed automated suites
- **None recorded** in successful verification runs (server 73/73, client 26/26). All listed defects above are gaps, design/deferred items, or untested areas with evidence. 

## Duplicate/overlap notes
- DEF-004 overlaps with SEC-001 (integration and security aspects tracked separately for remediation ownership). 

## Test-environment vs application issues
- DEF-009 classified as **test-environment sensitivity**, not a confirmed functional application defect. All others are application/design/coverage findings.