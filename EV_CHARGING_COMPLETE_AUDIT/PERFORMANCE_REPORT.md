# Performance Report

## Method
Limited evidence from production build output and source inspection. No profiling, load testing, or runtime APM executed in this audit.

## Observed evidence
| Area | Evidence | Result |
|---|---|---|
| Client production build | `npm run build` (Vite) | **PASS**, with chunk-size warning: main JS ~603 kB minified (~176 kB gzip) attributed largely to mapping dependencies |
| Server build/lint | `tsc` checks/build | **PASS** |
| Automated functional tests duration | Server 17 files/73 tests ~38s (sequential, in-memory DB); Client 7 files/26 tests ~10–12s | Acceptable for suite; mongodb-memory-server startup sensitive under load |
| Console/runtime errors | Not observed in automated runs captured | **No blocking errors evidenced**; browser runtime not fully exercised |

## Not tested (required by prompt but not executable with evidence here)
- Slow API endpoint profiling, MongoDB slow query/index analysis on real DB, memory leak detection, React re-render profiling, network waterfall/broken asset scans in browser, and reasonable load tests (k6/artillery/etc.) against a running isolated environment.

## Risks/notes
- **Bundle size:** Leaflet and related map code increase initial payload; consider route-level code splitting/lazy loading.
- **Test environment performance:** in-memory MongoDB can contend under parallel load (observed earlier timeouts) — CI resource tuning may be needed.

## Recommendations
1. Add performance budgets and lazy-load map/discovery routes.
2. Profile API/DB with representative datasets and enable query logging/index review in staging.
3. Add basic load/smoke tests for auth, discovery, and booking creation endpoints.