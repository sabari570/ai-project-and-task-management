# ProjectHub AI

ProjectHub AI is an intelligent project and team management backend. The project is built task-by-task using the master plan in `docs/MASTER_PLAN.md`.

## Current status

- Current task: T001 — Create repository and learning docs
- API implementation: not started (planned for T002)
- Database and AI integrations: not started

## Prerequisites

- Python 3.12 or newer
- Git

## Initial setup

### 1. Create and enter the repository

If you extracted this starter folder, enter the `ProjectHub_AI_T001` directory (or rename it to `projecthub-ai`).

```bash
cd projecthub-ai
git init
```

### 2. Create a virtual environment

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

T001 has no runtime application dependencies yet. The optional `dev` group provides pytest for future tests.

## Project workflow

1. Read the task and dependencies in `docs/MASTER_PLAN.md`.
2. Implement only the current task.
3. Run the documented verification commands.
4. Update `docs/TASK_TRACKER.md` with what was actually verified.
5. Commit the task as a small, focused Git commit.
6. Do not mark a task `DONE` until its acceptance criteria and tests are verified.

## Task status vocabulary

- `NOT STARTED`
- `IN PROGRESS`
- `IMPLEMENTED — NOT VERIFIED`
- `BLOCKED`
- `DONE`

## Useful commands

```bash
git status
git add README.md .gitignore pyproject.toml docs/MASTER_PLAN.md docs/TASK_TRACKER.md
git commit -m "T001: create repository and learning docs"
python -m pytest
```

`python -m pytest` may report that no tests were collected in T001 because this task does not introduce application behavior or tests. Do not interpret that as a passing test suite. T002 introduces the first application behavior.

## Documentation

- `docs/MASTER_PLAN.md` — full project source of truth and roadmap.
- `docs/TASK_TRACKER.md` — current task checkpoint.

Never commit `.env`, credentials, virtual environments, caches, or local database files.
