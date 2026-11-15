# Prioritized Fix Roadmap

## P0 — Critical before production exposure (security/integrity)
1. **Payment webhook security & production integration (SEC-001, DEF-001, DEF-004)**
   - Implement real payment gateway (checkout/redirect, captures, refunds/partials as needed).
   - Add **cryptographic webhook signature verification**, timestamp/replay protection, and strict event-to-payment idempotency.
   - Restrict webhook endpoint exposure (IP allowlists where applicable), secrets in vault/env, and comprehensive audit logging.
   - *Verify with:* provider sandbox tests, signed webhook simulations, failure/retry/idempotency cases.

## P1 — High priority (security and confidence)
2. **Abuse protection and hardening (SEC-002, SEC-003, SEC-004)**
   - Add rate limiting/throttling (auth, password reset, payments, webhooks) and account/IP safeguards.
   - Introduce request/query sanitization and strengthen validation; add CSRF/origin protections aligned with cookie auth.
   - Enforce strong JWT secrets, secure cookie flags in production, and config validation.
   - *Verify with:* negative security tests, operator-injection attempts, auth abuse simulations.

3. **Authorization regression coverage (residual IDOR/BOLA risk)**
   - Build an endpoint matrix testing unauthenticated/wrong-role/non-owner/owner for every ID-based resource.
   - *Verify with:* automated API security suite in CI.

## P2 — Quality and release assurance
4. **Browser E2E and UI verification (DEF-005, DEF-006, responsiveness gap)**
   - Add Playwright tests for critical journeys, account switching, stale-state checks, and key admin/supplier/customer flows.
   - Validate profile/settings persistence and all primary controls with evidence (screenshots/logs).
   - *Verify with:* CI browser runs across viewports.

5. **Test reliability and coverage metrics (DEF-009)**
   - Stabilize mongodb-memory-server usage (timeouts/resources/serialization) and/or add real-Mongo CI job.
   - Add instrumented coverage reporting (targets agreed by team) without claiming unmeasured coverage.
   - *Verify with:* consistent full-suite passes.

## P3 — Performance and maintainability
6. **Frontend performance and polish (DEF-007, DEF-008)**
   - Code-split/lazy-load map/discovery bundles; optimize assets.
   - Address lint warnings and effect/data-fetch patterns; improve loading/empty/error UX consistency.
   - *Verify with:* build budgets, Lighthouse/UX checks.

7. **PWA and operational readiness (DEF-010)**
   - Validate manifest/installability/offline behavior on target devices; refine caching/update strategy.
   - Add observability (structured logs, alerts) and production runbooks.

## Suggested sequencing
P0 → P1 → P2 → P3. Do not enable real payment processing in production until P0 is complete and verified. Keep this roadmap aligned with `ProjectState.md` and append verified progress to `DevLog.md`.