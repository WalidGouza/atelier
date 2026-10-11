# Atelier

A wardrobe and outfit creator with a separate React/TypeScript frontend and Python/FastAPI backend. The redesigned interface uses warm ivory and charcoal surfaces, coral accents, editorial typography, a wardrobe outfit board, and larger garment previews. Motion provides spring-based selection markers, outfit reveals, dialog entry, and save feedback. Keyboard-triggered transitions are instant and operating-system reduced-motion preferences are respected.

## Run the app

For Render/Vercel deployment and durable Supabase photo storage, follow [RENDER_STORAGE_FIX.md](RENDER_STORAGE_FIX.md). The default local upload folder is for development; hosted uploads need persistent storage.

Prerequisites: Python 3.12+, Node 22.18+, and Docker Compose (or an existing PostgreSQL installation with pgvector). The CLIP model needs a first-time download from Hugging Face. CPU inference is supported; download and dependency sizes depend on your platform.

### 1. Database

From the project root:

```bash
docker compose up -d db
```

The development database is bound to localhost. Its defaults match `backend/.env.example`. To use an existing database, set `DATABASE_URL` in the backend `.env`. The database user must be able to create the `vector` extension, or an administrator must install it beforehand.

### 2. Backend — its own terminal

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup_env.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On Windows, activate with `.venv\Scripts\Activate.ps1` in PowerShell. Run all backend commands from `backend/` so `.env` resolves correctly.

`setup_env.py` creates `.env`, generates a JWT secret, and preserves existing configuration. Set your database credentials and private matching parameters there. Do not commit `.env`.

API documentation: http://localhost:8000/docs

Database health: http://localhost:8000/health

### 3. Frontend — a separate terminal

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

On Windows, replace `cp` with `Copy-Item`. Open http://localhost:5173. On Windows, localhost can resolve differently from 127.0.0.1; keep the exact frontend URL consistent with `FRONTEND_ORIGIN` in the backend `.env`.

The frontend uses `VITE_API_URL=/api` with a Vite development proxy to `API_PROXY_TARGET=http://127.0.0.1:8000`. Restart Vite after changing `.env`. For a deployed frontend, use the deployed FastAPI URL instead; the development proxy is not part of the static build. Business rules and backend secrets never use the `VITE_` prefix.

### 4. Try your clothes

1. Sign in from the sidebar and create an account.
2. Create a wardrobe, such as Everyday, Work, or Travel.
3. Add clear, individual garment photos. Choose tops, pants, shoes, or jackets, then confirm fabric, style, and the main garment color.
4. Add at least one top, one pair of pants, and one pair of shoes.
5. Choose a style, color direction, optional starting piece, and whether to include a jacket.
6. Generate outfits and save your favorites. Saved outfits belong to the selected wardrobe.

Photo embeddings are automatic. Category, texture, and color are user-confirmed metadata, not automatic garment segmentation or fabric detection. Images are decoded and re-encoded as JPEG, removing original image metadata. Uploads are limited to 10 MB and approximately 16 million pixels.

## Appearance and Supabase

The header appearance selector supports Light, Dark, and System. A wardrobe selector and live collection counts appear above the styling board. The mobile menu includes an outside-click backdrop and close control. Preferences persist in this browser; System responds to operating-system theme changes. Dark mode covers navigation, garment cards, outfit cards, uploads, auth dialogs, native form controls, and feedback.

For an existing Supabase database and account request errors, follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Supabase stores the database while FastAPI handles this app’s authentication.

## How matching works

- A local Sentence Transformers CLIP model creates normalized **512-dimensional** image vectors. The `clothes.embedding` column is a pgvector `Vector(512)`.
- The selected style becomes a text embedding. If a starting piece is selected, its image vector is combined with the style query.
- Candidate retrieval is scoped to the current user's wardrobe and category, ordered by pgvector cosine distance. The schema includes a cosine HNSW index. Actual query planning depends on the database and dataset; small wardrobes can use an exact scan.
- Candidate combinations contain one top, one pair of pants, one pair of shoes, and optionally one jacket. The starting piece, when selected, is mandatory.
- Semantic similarity is combined with hue-wheel heuristics (neutral, analogous, complementary, triadic) and a configurable texture-pair table. Scores are heuristic rankings, not calibrated probabilities or objective fashion ratings.
- Results are bounded by candidate and combination limits; a diversity pass avoids repeating a base outfit just to change its jacket.
- Rules, thresholds, pair scores, ranking weights, and limits are configured in backend `.env` as `BUSINESS_RULES_JSON`. Color directions change which harmony rules are enabled. The server never sends the rule configuration to the browser.

The mathematical rule implementation is source code; `.env` holds its private configuration. Keeping settings in `.env` does not hide source code from someone who has the source archive.

References used for implementation:
- [Sentence Transformers image/text CLIP embeddings](https://www.sbert.net/examples/sentence_transformer/applications/image-search/README.html)
- [pgvector SQLAlchemy integration](https://github.com/pgvector/pgvector-python#sqlalchemy)

## Sample mode

Before sign-in, the frontend shows two illustrated sample wardrobes. It can create sample combinations, choose a starting piece, browse categories, and save sample outfits to this browser's local storage. Each sample wardrobe has its own saved collection. This mode does **not** call CLIP or pgvector; upload and account-backed matching require the API. Sample fabric illustrations are SVG, not photographs of user uploads. Color/style controls are previews in sample mode; real scoring happens on the backend.

## Structure

```text
backend/
  app/config.py       .env loading and scoring configuration validation
  app/models.py       users, wardrobes, clothes, outfits and vector index
  app/embeddings.py   lazy-loaded local CLIP image/text embeddings
  app/matching.py     hue/texture scoring, outfit assembly and diversity
  app/main.py         auth, ownership checks, uploads and outfit API
  tests/              matching, authorization and optional DB integration
  setup_env.py        creates local .env with a generated secret
frontend/
  src/main.tsx        wardrobe, upload, auth, outfit and collection flows
  src/style.css       responsive UI and accessibility states
compose.yaml          PostgreSQL + pgvector, separate from both apps
```

## Verification

```bash
cd frontend
npm run build
npm test
```

```bash
cd backend
source .venv/bin/activate
python -m pytest tests -q
```

For real PostgreSQL route integration tests, create a **dedicated disposable test database** with pgvector installed, then run:

```bash
TEST_DATABASE_URL=postgresql+psycopg://atelier:atelier@localhost:5432/atelier_test python -m pytest tests/test_integration.py -q
```

Integration tests recreate the schema in that dedicated database and stub model inference with deterministic vectors. The test rejects a database name that does not end in `_test`. Actual CLIP inference should also be smoke-tested by uploading real photos after downloading the model.

Verified during creation: TypeScript/Vite production build and matching/authorization unit tests. PostgreSQL integration, actual CLIP inference, and browser visual QA were not executed in the creation environment. See `VERIFICATION.md` for exact results.

## Deployment scope

This is a self-hosted development project with separately runnable applications. The database and Python service are not hosted by the included frontend build. Deploy the API with HTTPS, configure `FRONTEND_ORIGIN` and `VITE_API_URL`, and rebuild the frontend for its API URL. Keep `.env` server-side; back up both PostgreSQL data and uploaded images. The included database password is for local development. Before exposing registration publicly, add rate limiting, account recovery, operational monitoring, and a migration workflow. Initial schema creation is currently handled by SQLAlchemy at startup.

Motion implementation reference: https://motion.dev/docs/react-motion-config

## Sign-in loading fix

Authenticated catalogs are scoped to the current login token. Clothing and saved-outfit requests wait until the catalog loads and a real wardrobe is selected. The sample IDs are used only in signed-out sample mode. Session and selection changes abort obsolete requests and ignore their results/errors. To apply this update, replace the frontend source and package files, preserve frontend `.env`, run `npm ci`, then restart the development server (or build and redeploy the frontend). No backend/database migration is required.
