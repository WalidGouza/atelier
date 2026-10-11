# Verification

Checks performed on 2026-10-10 in the creation environment:

| Check | Result |
| --- | --- |
| `frontend: npm run build` | Passed; TypeScript check and Vite production build |
| `frontend: npm test` | 6 passed: API URL handling, transport errors, proxy failures, validation responses, theme selection |
| `backend: python -m pytest tests -q` | 20 passed, 2 skipped |
| Color-rule tests | Complementary vs triadic, neutral handling, hue wraparound |
| Texture-rule tests | Symmetric texture pair scoring |
| Outfit tests | Required categories, anchor inclusion, diversity, candidate limits, ordering |
| Authorization tests | Ownership check, missing/private wardrobe rejection, tampered and deleted-user token rejection |
| Configuration tests | Invalid scoring weights rejected |
| Supabase configuration and CORS tests | URI normalization, SSL settings, password encoding, local aliases, origin rejection, database JSON errors with CORS headers |
| Real PostgreSQL API integration | Not run; no PostgreSQL service available |
| Real CLIP inference | Not run; model dependencies/weights not installed in the creation environment |
| Browser visual and interaction QA | Not run; supported browser QA capability unavailable |

The included PostgreSQL integration tests cover registration, multi-wardrobe isolation, image upload/access isolation, vector retrieval with deterministic embeddings, outfit generation, save/removal, and invalid uploads. They require a dedicated `_test` database and remain unverified until executed there.

The test runner emitted one Starlette deprecation warning concerning its httpx-based TestClient. It did not cause test failures.

No backend, database, or frontend has been deployed to a public host. The source includes separately runnable backend/frontend applications, a Docker Compose database, `.env.example` templates, and a script that creates the private backend `.env`.

Dark mode and API/Supabase connection changes verified on 2026-10-10. No connection was made to the user’s Supabase instance, so the original failure in that environment remains unconfirmed. The supported browser QA capability remains unavailable.
