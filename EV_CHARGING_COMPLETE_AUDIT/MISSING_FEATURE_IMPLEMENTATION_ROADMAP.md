# Missing & Incomplete Feature — Prioritized Implementation Roadmap

**Project:** GreenCharge EV Charging Platform  
**Date:** 2026-11-15  
**Basis:** `MISSING_INCOMPLETE_FEATURE_AUDIT.md`, `Requirements.md`, `UserFlow.md`, `WebsiteStructure.md`, `SystemArchitecture.md`, `techStack.md`, `ProjectState.md`, prior Phase 0 audit artifacts.  
**Goal:** Close every identified missing/incomplete feature and verification gap in priority order while preserving architecture, RBAC/ownership guarantees, and data integrity.

---

## Priority definitions
- **CRITICAL:** Financial/security correctness or production-blocking risk (must fix before real payments/production exposure).
- **HIGH:** Core user journey correctness, account/data integrity, or major security/quality risk.
- **MEDIUM:** Important product completeness, compliance/operability, or scalability/readiness improvements.
- **LOW:** Enhancements, polish, or non-blocking convenience features.

---

## P0 — CRITICAL (blockers: payments & trust boundary)

| # | Feature / gap | Status | Affected paths (primary) | Implementation scope | Dependencies | Required test cases / acceptance evidence |
|---|---|---|---|---|---|---|
| P0.1 | Real payment gateway integration (checkout/redirect/capture, provider selection per Pakistan market) | DEFERRED/PARTIAL | `server/src/modules/payments/{routes,controller,service,model}.ts`, `client/src/pages/customer/MyBookingsPage.tsx`, `client/src/services/payments.ts`, env/config | Replace stub initiate/success/failure with provider session/intent, secure return handling, server-side capture/verification, amount/currency integrity, booking confirmation coupling | Provider credentials/sandbox, compliance decisions | Sandbox E2E: success, failure, cancel, timeout; no double-charge; booking/payment state consistent; idempotent retries |
| P0.2 | Cryptographically verified payment webhooks + replay/idempotency hardening | PARTIAL (insecure) | `server/src/modules/payments/routes.ts`, `server/src/modules/payments/service.ts` | Verify provider signatures/HMAC, timestamp tolerance, event dedupe/idempotency keys, strict payload validation, safe error handling/logging | P0.1 provider event model | Valid sig processed once; invalid/missing/tampered/replayed rejected; out-of-order events handled; no state corruption |
| P0.3 | Financial correctness for refunds & adjustments (provider-backed) | PARTIAL/MISSING | `server/src/modules/payments/*`, `server/src/modules/bookings/*`, notifications | Implement full/partial refund APIs/workflows, provider refund calls + webhook handling, policy/permission checks, booking/payment/earnings consistency | P0.1–P0.2, business rules | Full/partial refund, failed refund, duplicate events, correct totals/statuses, notifications, auditability |

**Exit criteria (P0):** No real charges without verified callbacks; all payment state transitions provider-authoritative and idempotent; refund flows reconciled and tested.

---

## P1 — HIGH (core correctness, account security, and confidence)

| # | Feature / gap | Status | Affected paths (primary) | Implementation scope | Dependencies | Required test cases / acceptance evidence |
|---|---|---|---|---|---|---|
| P1.1 | Complete password reset flow (delivery + UI completion) | PARTIAL | `server/src/modules/auth/{service,controller,routes,model}.ts`, `client/src/App.tsx`, `client/src/pages/auth/ForgotPasswordPage.tsx`, (new reset page), `client/src/services/auth.ts`, email/SMS provider config | Send secure reset link/token via provider; add reset-password route/form; token expiry/one-time use; non-enumerating responses | Provider selection (email/SMS) | Request/reset/expired/invalid/reuse; delivery mocked/integration-tested; login after reset; rate-limited abuse cases |
| P1.2 | Email/phone verification (OTP/link) lifecycle | MISSING/PARTIAL | `server/src/modules/auth/*`, user/profile models, auth/profile UI pages | Issue/verify/resend challenges, persist verification state transitions, enforce policy gates where required | P1.1 delivery infra reusable | Verify success/fail/expire/resend; unverified restrictions (if any); no leakage/enumeration |
| P1.3 | Persisted customer/supplier profile & settings (bind UI to real data/APIs) | PARTIAL (UI-only) | `client/src/components/dashboard/ProfileSettings.tsx`, `client/src/pages/customer/CustomerProfilePage.tsx`, `client/src/pages/supplier/SupplierProfilePage.tsx`, `server/src/routes/index.ts`, new/extended profile endpoints & services, auth/user/profile models | Create read/update APIs for user/profile/preferences; load real session/profile data; save toggles/fields with validation and ownership; remove hardcoded preview identities/messages | Auth context stable | Load/save per role, validation errors, cross-user isolation, reload persistence, preference effects |
| P1.4 | Authenticated password change | MISSING | `server/src/modules/auth/*`, `client/src/components/dashboard/ProfileSettings.tsx` | Add change-password endpoint/UI with current-password verification and policy checks | P1.3 | Correct/incorrect current password, weak password rejected, reauth/session behavior as designed |
| P1.5 | Abuse protection & request hardening | MISSING/PARTIAL | `server/src/index.ts`, auth/payment/notification routes, middleware, `server/package.json` | Rate limiting/throttling (per IP/account), optional lockouts/backoff, query/input sanitization, CSRF/origin strategy for cookie-auth state changes, secure headers review | None (can parallelize) | 429/lockout behavior, injection/operator payloads blocked, CSRF defenses validated, legit flows unaffected |
| P1.6 | Authorization regression (IDOR/BOLA) coverage across all resources | PARTIAL (coverage gap) | `server/tests/*` (new suites), all ID-based modules | Automated matrix: unauthenticated, wrong role, non-owner, owner for every resource/action | Test harness | 401/403/404 correctness per case; no data leakage in errors/bodies |
| P1.7 | Browser E2E for critical journeys & UI verification | MISSING/PARTIAL | `client/*`, (add Playwright config/tests), CI config | Playwright flows: auth/reset, vehicle CRUD, station/terminal CRUD, discovery→book→pay (stub/gateway sandbox), supplier accept/reject, notifications, admin oversight, account switching/stale-state checks | Stable selectors/test env | Green CI runs with screenshots/traces/logs; key controls verified (not assumed) |
| P1.8 | Supplier settlements/payout domain (records, statuses, reconciliation) | PARTIAL/MISSING | new `server/src/modules/settlements/*` (or extend payments), `server/src/modules/payments/*`, supplier/admin UI, `server/src/routes/index.ts` | Model settlements/payouts (gross, fee, refunds, net, status, references, schedule), accrual/reconciliation logic, APIs and UI | P0 refund correctness, commission rules | Accurate settlement generation, adjustments on refunds, payout state transitions, access control |

**Exit criteria (P1):** Users can securely recover/verify/manage accounts with persisted data; endpoints protected against common abuse/IDOR; critical UI journeys evidenced by automated browser tests; supplier financials traceable beyond calculated earnings.

---

## P2 — MEDIUM (product completeness, operability, and readiness)

| # | Feature / gap | Status | Affected paths (primary) | Implementation scope | Dependencies | Required test cases / acceptance evidence |
|---|---|---|---|---|---|---|
| P2.1 | Real-time notifications (Socket.IO/SSE) | MISSING | `server/src/index.ts`, `server/src/modules/notifications/*`, `client/*` | Authenticated real-time channels, event fanout, fallback/reconciliation with persisted notifications | Notification model stable | Authorized delivery only, reconnect/offline persistence, ordering/dedupe sanity |
| P2.2 | Email/SMS/push notification delivery | MISSING/DEFERRED | notifications/auth modules, config, provider integrations | Provider adapters, templates, preferences, retries, observability | Provider accounts/policies | Delivery success/failure/retry, opt-in enforcement, PII-safe payloads |
| P2.3 | Charging session records, receipts/invoices, and booking history enrichment | PARTIAL/MISSING | bookings/payments modules (+ possible sessions module), client history/detail views | Session entity/metrics if required, immutable receipt/invoice artifacts linked to payments/bookings | P0 payments finalized | Receipt accuracy, access control, refunds reflected, history completeness |
| P2.4 | Booking reschedule/modify workflow (if in scope) | MISSING/NOT VERIFIED | `server/src/modules/bookings/*`, customer/supplier UI | Policy-driven reschedule endpoints, availability/conflict checks, notifications | Core booking stable | Allowed/denied windows, conflicts, audit/notifications |
| P2.5 | Supplier verification & document workflow | DEFERRED/PARTIAL | auth/supplier profile/admin modules, uploads, admin UI | Submission, document handling, admin review/approve/reject, operational gating | P2.8 uploads, admin actions | Status transitions, doc security, permission checks, notifications |
| P2.6 | Admin governance expansion & immutable audit logging | PARTIAL/MISSING | `server/src/modules/admin/*`, new audit-log model/module, admin UI | Broader safe admin actions, audit trail for sensitive operations (auth/admin/payments/bookings) | Domain policies | Audit emitted for actions, tamper-evident storage approach, admin-only access |
| P2.7 | Discovery/routing/search contract parity & quality | PARTIAL | `server/src/modules/discovery/*`, `routes/*`, `client/src/services/discovery.ts`, API docs | Align endpoint naming/contract (`/search` alias if needed), robust sorting/filter semantics, geocoding provider integration/handling | Provider decisions | Filter/sort correctness, road-distance ranking strategy, failure fallbacks |
| P2.8 | Secure file/media uploads (profiles, stations, terminals, docs) | MISSING | new upload service/middleware, storage provider, models, client UI | Validated uploads, storage refs, access control, lifecycle management | Provider (Cloudinary/S3/etc.) | Type/size/malware-safe checks, authz, replace/delete behavior |
| P2.9 | PWA, responsiveness, and performance validation/polish | PARTIAL/NOT VERIFIED | `client/public/*`, `client/src/main.tsx`, build config, map-heavy routes | Device install/offline tests, viewport regression, code-splitting (Leaflet), bundle budgets, lint/effect cleanup | QA tooling | Install/offline behavior, 390/820/1440 checks, perf budgets, clean lint where feasible |
| P2.10 | API/ops hardening & observability | PARTIAL | server config/middleware, deployment docs | Config validation (fail-fast on weak secrets in prod), structured logging, health/metrics, backup/restore runbooks | Infra/env | Startup guards, log redaction, monitored error rates |

---

## P3 — LOW (enhancements / scope-dependent)

| # | Feature / gap | Status | Affected paths (primary) | Implementation scope | Dependencies | Required test cases / acceptance evidence |
|---|---|---|---|---|---|---|
| P3.1 | Reviews & ratings | MISSING/NOT VERIFIED | new reviews module, station/supplier UI | Eligibility, moderation, aggregates, anti-abuse | Completed bookings/sessions | Create/edit rules, moderation, aggregation correctness |
| P3.2 | Favorites/saved items | MISSING/NOT VERIFIED | new favorites module, client UI | Save/list/remove favorites with ownership | None | CRUD/ownership/duplicate handling |
| P3.3 | In-app chat/messaging/support tickets | MISSING/NOT VERIFIED | new messaging module, realtime/channel integration, UI | Conversations/messages, permissions, notifications, moderation | P2.1 useful | Delivery/history/access control, abuse controls |
| P3.4 | Advanced analytics, exports, and reporting depth | PARTIAL | `server/src/modules/admin/*`, admin UI | Richer KPIs, exports, filters, audited report access | Data completeness | Report accuracy vs source-of-truth queries, permissions |

---

## Cross-cutting implementation sequence (recommended)

1. **P0.1 → P0.2 → P0.3:** gateway, verified webhooks, refunds/reconciliation (financial safety first).  
2. **P1.5 + P1.6 in parallel:** harden and lock down authz/abuse surfaces early.  
3. **P1.1 → P1.2 → P1.3 → P1.4:** complete account lifecycle and persisted profile/settings UX.  
4. **P1.8:** settlement/payout ledgering once payment/refund truth is stable.  
5. **P1.7 continuously:** add Playwright coverage alongside each delivered journey.  
6. **P2 items by dependency:** uploads/verification/audit/notifications/receipts/parity; validate PWA/perf/responsiveness.  
7. **P3:** scope-confirmed enhancements.

## Traceability & governance
- **Frontend → API → controller → service → DB** must be traced and tested for every changed feature (especially profile persistence, auth flows, payments/refunds/settlements, uploads, and admin actions).
- Update `Project Description/ProjectState.md` and append `Project Description/DevLog.md` for every meaningful completed/attempted milestone (do not overwrite history).
- Preserve uncommitted work; keep commits focused with verified build/test evidence.
- Treat any feature with UI present but unwired persistence/delivery as **not complete** until end-to-end behavior and tests pass.