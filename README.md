
# ProjectHub AI

ProjectHub AI is an intelligent project and team management backend, built task-by-task using `docs/MASTER_PLAN.md` as the source of truth.

## Current status

- Current task: T002 — Python environment and FastAPI hello world
- Current functionality: root and health endpoints
- Database, authentication, and AI integrations: not implemented yet

## Prerequisites

- Git
- uv
- Python 3.12 or newer (uv can install Python for you)

Install uv: https://docs.astral.sh/uv/getting-started/installation/

## Setup

Run these commands from the repository root:

```bash
uv python install 3.12
uv sync --extra dev
```

`uv sync --extra dev` creates `.venv` if needed, installs the application and development dependencies, and creates or updates `uv.lock`.

You do not need to activate `.venv` manually when using `uv run`.

## Run the API

```bash
uv run uvicorn app.main:app --reload
```

Open these URLs:

- Root: http://127.0.0.1:8000/
- Health: http://127.0.0.1:8000/health
- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

Stop the server with Ctrl+C.

## Run tests

```bash
uv run pytest
```

## Task workflow

1. Read the current task in `docs/MASTER_PLAN.md`.
2. Implement only that task.
3. Run its verification commands and tests.
4. Update `docs/TASK_TRACKER.md` with actual results.
5. Commit the verified changes.
6. Mark a task DONE only when its acceptance criteria are verified.

Never commit credentials, `.env` files, virtual environments, caches, or local databases.
