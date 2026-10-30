# ProjectHub AI — Task Tracker

Current phase: Phase 0 — Planning and tools
Current task: T002 — Python environment and FastAPI hello world
Completed tasks: None verified locally
Blocked tasks: None
Known issues: T001 local Git verification remains unconfirmed; T002 implementation needs local verification.
Last verified command: Not yet run in the learner's environment.
Last verified test result: Not yet run in the learner's environment.
Next task: Finish T002 verification and commit; then proceed to T003
Last updated: 2026-10-28

## T001 — Create repository and learning docs

Status: IN PROGRESS — local verification not confirmed.

- [ ] Git repository initialized
- [ ] Initial commit created
- [ ] Required files are ignored by .gitignore
- [ ] README and master documentation are present

## T002 — Python environment and FastAPI hello world

Status: IMPLEMENTED — NOT VERIFIED

- [ ] uv dependencies installed successfully
- [ ] FastAPI application starts
- [ ] GET / returns the expected welcome message
- [ ] GET /health returns {"status": "ok"}
- [ ] Swagger UI lists both endpoints
- [ ] All tests pass
- [ ] Changes committed to Git

## T003 — Path parameters, query parameters, and response schemas

Status: IMPLEMENTED — NOT VERIFIED

### Scope
- Add an item path parameter.
- Add query parameters for filtering and pagination.
- Define Pydantic response schemas.
- Validate request parameters.
- Test successful and unsuccessful requests.

### Acceptance criteria
- [ ] Existing root endpoint still works.
- [ ] Existing health endpoint still works.
- [ ] GET /items returns a list matching the response schema.
- [ ] GET /items/{item_id} returns the requested item.
- [ ] Missing item returns HTTP 404.
- [ ] Query filtering works.
- [ ] Pagination works.
- [ ] Invalid parameters return HTTP 422.
- [ ] Swagger UI displays the new endpoints and parameters.
- [ ] All 12 tests pass.
- [ ] Changes committed to Git.

### Verification
- Test command: `uv run pytest -v`
- Actual test result: Not yet run in the learner's environment.
- Server verification: Pending.
- Git commit: Pending.

Next task: T004, only after T003 is verified and committed.

## T004 — Pydantic request schemas and CRUD in memory

Status: IMPLEMENTED — NOT VERIFIED

### Scope
- Define workspace create, update, and response schemas.
- Define project create, update, and response schemas.
- Implement workspace CRUD using in-memory storage.
- Implement project CRUD using in-memory storage.
- Validate input fields and project dates.
- Handle missing resources with HTTP 404.
- Prevent duplicate workspace slugs.
- Delete a workspace's projects when deleting that workspace.

### Acceptance criteria
- [ ] Create workspace works.
- [ ] List workspaces works.
- [ ] Read workspace works.
- [ ] Update workspace works.
- [ ] Delete workspace works.
- [ ] Create project in an existing workspace works.
- [ ] List workspace projects works.
- [ ] Read project works.
- [ ] Update project works.
- [ ] Delete project works.
- [ ] Invalid request data returns HTTP 422.
- [ ] Missing workspace/project returns HTTP 404.
- [ ] Duplicate workspace slug returns HTTP 409.
- [ ] Workspace deletion removes its projects.
- [ ] Learner understands in-memory data is temporary.

### Verification
- Automated test files: Not requested for this task.
- Manual API verification: Pending.
- Actual results: Not yet verified locally.
- Git commit: Pending.

Next task: T005 — Routers, errors, and API conventions.
Do not start until T004 is verified.

## Task history

| Task | Status | Notes |
|---|---|---|
| T001 — Create repository and learning docs | IN PROGRESS | Local verification remains unconfirmed. |
| T002 — Python environment and FastAPI hello world | IMPLEMENTED — NOT VERIFIED | Application and tests created; local verification pending. |

Update this tracker only with commands and tests actually run.