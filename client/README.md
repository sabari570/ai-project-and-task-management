# ProjectHub AI — Client

React + Vite + TypeScript mock-first UI for the full ProjectHub backend surface area.

## Run locally

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

**Mock login:** `alice@acme.dev` / any password ≥ 8 chars (e.g. `password123`).

The API can stay offline — default `VITE_DATA_SOURCE=mock` uses in-memory fixtures.

### With the FastAPI backend

```bash
# terminal 1 (repo root)
uv run uvicorn app.main:app --reload

# terminal 2
cd client && npm run dev
```

Vite proxies `/api` and `/health` to `http://127.0.0.1:8000`.

## Environment

Copy and adjust:

```bash
# client/.env
VITE_DATA_SOURCE=mock
# VITE_USE_API_auth=1
# VITE_USE_API_workspaces=1
```

| Variable | Purpose |
|----------|---------|
| `VITE_DATA_SOURCE` | `mock` (default) or `api` for all domains |
| `VITE_USE_API_<domain>` | Per-domain override: `auth`, `workspaces`, `projects`, `tasks`, `notifications`, `reports`, `ai`, `documents` |
| `VITE_API_BASE_URL` | Optional absolute API base; leave empty to use Vite proxy |

## API integration pattern

Each function in `src/api/*.ts` has a `// API: METHOD /path` comment matching `docs/MASTER_PLAN.md` §7.

1. Implement the `useApiFor('<domain>')` branch with `client.get/post/patch/delete`.
2. Set `VITE_USE_API_<domain>=1` (or global `VITE_DATA_SOURCE=api`).
3. Use the existing React Query hooks / pages — no UI changes required.

### Checklist (backend task → client module)

| Endpoint area | Client module | Backend tasks |
|---------------|---------------|---------------|
| Auth & users | `api/auth.ts`, `api/users.ts` | T030–T035 |
| Workspaces & invites | `api/workspaces.ts` | T040 |
| Projects | `api/projects.ts` | T041 |
| Tasks & collaboration | `api/tasks.ts` | T042, T044, T045 |
| Notifications | `api/notifications.ts` | T047 |
| Reports | `api/reports.ts` | T048 |
| AI | `api/ai.ts` | T073–T075 |
| Documents | `api/documents.ts` | T045, T076 |

## Testing

No automated frontend tests in this repo (manual browser smoke only).