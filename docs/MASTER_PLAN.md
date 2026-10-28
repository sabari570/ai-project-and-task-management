# ProjectHub AI --- FastAPI Master Project Documentation

**Document version:** 1.0\
**Status:** Source of truth for implementation and learning\
**Learning style:** Balanced --- complete working code, concise
explanations, tests, and practical exercises\
**AI strategy:** Local-first with Ollama; hosted providers supported
behind the same interface\
**Scope:** Backend first; React frontend is a later integration phase

------------------------------------------------------------------------

## 1. How to use this document

This document is the project's source of truth. Paste it into a new
ChatGPT conversation when continuing the project. Then request one
numbered task at a time, for example:

> Read the ProjectHub AI master documentation. Implement Task T001 only.
> Give me the complete code for every file created or modified, short
> explanations of important code, exact commands to run, tests, expected
> results, and an updated progress checkpoint. Do not implement later
> tasks.

Do not ask for the entire project code in one response. Implement one
task, run it, fix errors, and mark it complete before moving to
dependent tasks.

### Rules for every implementation response

1.  Follow the current document and the existing project state.
2.  Provide complete file contents for each file created or changed. Do
    not use unexplained `...`, pseudocode, or omitted sections.
3.  Name each file using its exact project-relative path.
4.  Include required imports, configuration, validation, error handling,
    and integration changes.
5.  Keep explanations concise: usually one or two sentences per
    important function or code block.
6.  Include exact terminal commands and expected results.
7.  Include tests for new behavior. Do not claim tests passed unless
    they were actually run.
8.  For schema changes, include the Alembic migration and explain how to
    upgrade and downgrade.
9.  Never expose secrets. Use `.env.example` with placeholders and keep
    `.env` out of version control.
10. Preserve existing naming and architecture unless a documented change
    is needed. Explain breaking changes before making them.
11. If existing files are needed to avoid conflicts, ask for them or
    inspect provided project files before generating replacements.
12. When something fails, debug the reported error first; do not add
    unrelated features on top of a broken state.
13. Update the progress checkpoint at the end: completed task, files
    changed, tests run, known issues, and next task.
14. Keep code explanations understandable and short; place deeper theory
    in optional notes only when needed.
15. Use current stable compatible versions and pin dependencies through
    the project's chosen dependency manager. Do not invent version
    numbers when the environment should determine them.

### Standard task response format

For every task, respond in this order:

1.  **Goal and concepts** --- short description.
2.  **Prerequisites** --- completed task IDs and configuration needed.
3.  **Files** --- exact paths to create or change.
4.  **Complete implementation** --- full contents for each affected
    file.
5.  **Why it works** --- concise explanation of the key design choices.
6.  **Commands** --- install, migrate, run, and test commands.
7.  **Verification** --- requests, expected responses, and tests.
8.  **Acceptance checklist** --- criteria from this document.
9.  **Progress checkpoint** --- task status and next task.

If a task is too large for one answer, split it into clearly numbered
subparts without omitting files. Finish one coherent subpart at a time.

------------------------------------------------------------------------

## 2. Project overview

### Project name

**ProjectHub AI --- Intelligent Project and Team Management Platform**

### Product description

ProjectHub AI is a multi-user project management backend. Users create
workspaces, invite teammates, manage projects, assign tasks, discuss
work, attach documents, receive notifications, and use AI to summarize
documents or suggest task plans. Users can only access workspaces and
resources for which they have permission.

The project is intentionally broad enough to teach FastAPI, relational
database design, performance, security, asynchronous work, AI
integrations, testing, and deployment in one coherent application.

### Primary learning outcome

By the end, the learner should be able to design, implement, test,
optimize, and deploy a maintainable FastAPI backend and understand the
reasoning behind its architecture.

### Initial scope

Build a modular monolith. Do not begin with microservices. Keep the API,
business logic, database access, AI provider integration, and background
jobs separated by responsibility, but deploy the core API as one
application until there is a concrete reason to split it.

### Core user journeys

1.  A user registers and signs in.
2.  The user creates a workspace and invites another user.
3.  A member creates a project and tasks.
4.  Members assign tasks, add comments, upload attachments, and update
    status.
5.  A user filters tasks and views project progress.
6.  The application sends notifications and records important activity.
7.  A user asks the AI assistant about authorized project information.
8.  A user asks AI to draft tasks from a requirement and reviews the
    suggestions before saving.
9.  A user uploads a document; a background worker extracts text and
    prepares summaries/searchable chunks.
10. Administrators monitor errors, performance, and background job
    status.

------------------------------------------------------------------------

## 3. Technology choices

Use these as the default stack. Confirm compatible current stable
releases when the repository is created; pin exact versions in the
lockfile.

  -----------------------------------------------------------------------
  Area                                Default
  ----------------------------------- -----------------------------------
  Language                            Python 3.12+ (choose a supported
                                      version available in the
                                      environment)

  API                                 FastAPI

  ASGI server                         Uvicorn

  Validation and settings             Pydantic v2, pydantic-settings

  Relational database                 PostgreSQL

  ORM                                 SQLAlchemy 2.x

  Migrations                          Alembic

  Database driver                     Psycopg 3; async driver only
                                      if/when adopting async DB access

  HTTP client                         HTTPX

  Testing                             pytest, pytest-asyncio if needed,
                                      HTTPX

  Password hashing                    Argon2id via a maintained library
                                      such as pwdlib

  Authentication                      Short-lived signed access JWTs;
                                      rotating refresh-token/session
                                      records

  Local AI                            Ollama HTTP API

  Hosted AI                           Provider adapter behind a shared
                                      application interface

  Embeddings/vector search            Ollama embeddings initially;
                                      pgvector in PostgreSQL

  Cache and queue broker              Redis

  Durable background jobs             Celery or ARQ, chosen when the
                                      queue phase begins

  File storage                        Local development storage behind an
                                      interface; object storage later

  Containers                          Docker and Docker Compose

  Frontend later                      React, Vite, TypeScript
  -----------------------------------------------------------------------

### Sync versus async policy

Start with synchronous SQLAlchemy sessions for the first database tasks
if that makes the lifecycle easier to understand. FastAPI can run
regular `def` path operations in a thread pool. Do not call blocking
database or HTTP clients directly inside `async def` endpoints.
Introduce async database access only in a dedicated task, then keep each
session/engine pattern consistent. Async does not automatically make
every query faster.

### AI provider policy

Create an `AIProvider` interface/service boundary. Implement Ollama
first. Add one hosted provider adapter later. Business logic should not
depend on provider-specific response shapes. Keep model names and
endpoints in environment configuration. AI features must continue to
fail gracefully if the model is unavailable.

### Security baseline

-   Never store plain-text passwords.
-   Keep secrets outside source control.
-   Validate all user input.
-   Enforce authorization on the server for every resource access.
-   Treat AI output and uploaded document content as untrusted input.
-   Do not let AI decide access permissions or execute arbitrary SQL.
-   Do not expose internal exceptions, secrets, or stack traces to
    clients.
-   Use rate limits and quotas for expensive or abuse-prone endpoints.
-   Use HTTPS in production.
-   Keep uploads outside the public web root and validate size/type.
-   Use a separate database for automated tests.

------------------------------------------------------------------------

## 4. Planned features

### Core application

-   User registration, login, profile, password change/reset flow, and
    account status.
-   Workspace creation and membership.
-   Invitations with expiry and single-use acceptance.
-   Workspace roles: `owner`, `admin`, `member`, `viewer`.
-   Projects with status, dates, description, and project membership
    through workspace membership.
-   Tasks with status, priority, due date, creator, assignee, and
    optional parent task.
-   Task dependencies.
-   Labels and task-label association.
-   Comments and activity records.
-   File attachments.
-   In-app notifications.
-   Project/task filtering, sorting, pagination, and search.
-   Project metrics and reporting.
-   Audit events for important actions.

### AI features

-   Generate a proposed task/subtask plan from a project requirement.
-   Project assistant that answers questions using only data the current
    user is allowed to access.
-   Document extraction, summarization, chunking, embeddings, and
    retrieval-augmented generation (RAG).
-   Stream assistant responses.
-   Record AI conversations and usage metadata without unnecessarily
    storing sensitive prompts.
-   Provider timeout, retries with limits, usage quotas, and safe
    fallback errors.
-   AI suggestions are drafts until the user explicitly accepts them.

### Advanced backend

-   Redis caching for suitable read-heavy data.
-   Durable queue for long-running document and AI tasks.
-   WebSockets for real-time task updates.
-   Email invitations and password reset messages.
-   Scheduled due-date reminders.
-   Health/readiness checks, structured logs, request IDs, metrics,
    tracing.
-   Dockerized local environment and production deployment.
-   Load testing and performance tuning.
-   Later React frontend integration.

------------------------------------------------------------------------

## 5. Architecture and code organization

Target structure; create files only as their task arrives.

``` text
projecthub-ai/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   ├── api/
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   └── routes/
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── ai/
│   ├── tasks/
│   └── integrations/
├── alembic/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── scripts/
├── docs/
│   ├── MASTER_PLAN.md
│   ├── DATABASE_DESIGN.md
│   ├── API_CONTRACT.md
│   ├── TASK_TRACKER.md
│   └── LEARNING_NOTES.md
├── .env.example
├── .gitignore
├── alembic.ini
├── pyproject.toml
├── Dockerfile
├── compose.yaml
└── README.md
```

### Responsibilities

-   `main.py`: application creation, lifespan, middleware registration,
    router registration.
-   `core/`: settings, security helpers, logging, and shared exceptions.
-   `api/routes/`: HTTP-specific path operations and response codes.
-   `api/dependencies.py`: shared request dependencies such as current
    user and DB session.
-   `models/`: SQLAlchemy database models only.
-   `schemas/`: Pydantic request/response schemas.
-   `repositories/`: database query composition where it provides value.
-   `services/`: business rules and transaction boundaries.
-   `db/`: engine, session factory, model registry/base.
-   `ai/`: provider interface, adapters, prompt templates, retrieval
    logic.
-   `tasks/`: durable background task definitions.
-   `integrations/`: email, file storage, and other external adapters.
-   `tests/`: unit and integration tests.
-   `docs/`: project design and progress.

Avoid adding repository/service abstractions mechanically to every
trivial endpoint. Use them when they improve reuse, testability, or
clarity. Keep HTTP concerns out of business services where practical.

### Request flow

`Client → FastAPI route → validation/dependencies → service → repository/SQLAlchemy → PostgreSQL → response schema`

For AI requests:

`Route → authorization and data retrieval → AI service/provider → validate output → response`

For long-running work:

`Route → enqueue durable job → worker → process document/AI work → update job state → notify client`

------------------------------------------------------------------------

## 6. Database design

PostgreSQL is the source of truth for relational application data. Every
table should have an explicit primary key, timestamps where useful,
constraints, and indexes based on actual query patterns. Use
timezone-aware timestamps in UTC. Use UUID primary keys for
public-facing entities by default, unless an exercise explicitly
compares integer and UUID keys.

The following is the target logical schema. It is a learning schema;
implementation tasks may refine types and constraints, but changes must
be documented.

### 6.1 `users`

  -----------------------------------------------------------------------
  Column                  Type/constraints        Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 User identifier

  `email`                 VARCHAR(320), NOT NULL, Login and communication
                          UNIQUE (normalized)     

  `password_hash`         TEXT, NOT NULL          Password hash only

  `display_name`          VARCHAR(120), NOT NULL  Display name

  `is_active`             BOOLEAN, NOT NULL,      Account status
                          default true            

  `is_verified`           BOOLEAN, NOT NULL,      Email verification
                          default false           state

  `created_at`            TIMESTAMPTZ, NOT NULL   Creation time

  `updated_at`            TIMESTAMPTZ, NOT NULL   Last update
  -----------------------------------------------------------------------

Normalize email consistently before saving and comparing. Do not rely
only on application-level checks for uniqueness; keep a database unique
constraint.

### 6.2 `user_profiles`

  -----------------------------------------------------------------------
  Column                  Type/constraints        Purpose
  ----------------------- ----------------------- -----------------------
  `user_id`               UUID PK, FK →           One-to-one owner
                          `users.id`, ON DELETE   
                          CASCADE                 

  `bio`                   TEXT, nullable          Short bio

  `avatar_url`            TEXT, nullable          Avatar reference

  `timezone`              VARCHAR(64), nullable   Display preferences

  `created_at`,           TIMESTAMPTZ             Timestamps
  `updated_at`                                    
  -----------------------------------------------------------------------

One-to-one relationship: `user_profiles.user_id` is both primary key and
foreign key.

### 6.3 `workspaces`

  Column                       Type/constraints                 Purpose
  ---------------------------- -------------------------------- -------------------------
  `id`                         UUID PK                          Workspace identifier
  `name`                       VARCHAR(160), NOT NULL           Workspace name
  `slug`                       VARCHAR(180), NOT NULL, UNIQUE   URL-friendly identifier
  `description`                TEXT, nullable                   Description
  `created_by`                 UUID FK → `users.id`, RESTRICT   Creator
  `created_at`, `updated_at`   TIMESTAMPTZ                      Timestamps

### 6.4 `workspace_memberships`

  -----------------------------------------------------------------------
  Column                  Type/constraints        Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Membership row

  `workspace_id`          UUID FK →               Workspace
                          `workspaces.id`,        
                          CASCADE                 

  `user_id`               UUID FK → `users.id`,   Member
                          CASCADE                 

  `role`                  VARCHAR/enum, NOT NULL  `owner`, `admin`,
                                                  `member`, `viewer`

  `joined_at`             TIMESTAMPTZ             Join time
  -----------------------------------------------------------------------

Constraints and indexes: - Unique `(workspace_id, user_id)`. - Index
`(user_id, workspace_id)` for a user's workspace list if query plans
justify it. - Index `(workspace_id, role)` if role filtering is
common. - Enforce at least one owner through application transaction
logic or a stronger database design; do not assume a simple row
constraint can guarantee that a workspace always has an owner.

This is the association table for the many-to-many `users ↔ workspaces`
relationship. Role belongs on the association because a user's role can
differ by workspace.

### 6.5 `workspace_invitations`

Fields: `id UUID PK`, `workspace_id FK CASCADE`, `invited_email`,
`role`, `token_hash`, `invited_by FK users`, `expires_at`,
`accepted_at nullable`, `created_at`.

Store only a hash of a high-entropy invitation token. Enforce
appropriate uniqueness for pending invitations and use a transaction
when accepting an invitation.

### 6.6 `projects`

Fields: - `id UUID PK` -
`workspace_id UUID FK → workspaces.id ON DELETE CASCADE` -
`name VARCHAR(180) NOT NULL` - `description TEXT nullable` - `status`
(`planned`, `active`, `on_hold`, `completed`, `archived`) -
`start_date DATE nullable` - `due_date DATE nullable` -
`created_by UUID FK → users.id RESTRICT` - `created_at`,
`updated_at TIMESTAMPTZ`

Common index candidate: `(workspace_id, status, created_at DESC)`.
Validate against actual filters and sorting.

### 6.7 `tasks`

Fields: - `id UUID PK` -
`project_id UUID FK → projects.id ON DELETE CASCADE` -
`parent_task_id UUID FK → tasks.id ON DELETE SET NULL`, nullable -
`title VARCHAR(240) NOT NULL` - `description TEXT nullable` - `status`
(`backlog`, `todo`, `in_progress`, `blocked`, `done`, `cancelled`) -
`priority` (`low`, `normal`, `high`, `urgent`) -
`creator_id UUID FK → users.id RESTRICT` -
`assignee_id UUID FK → users.id SET NULL`, nullable -
`due_at TIMESTAMPTZ nullable` - `position INTEGER NOT NULL, default 0` -
`version INTEGER NOT NULL, default 1` for optimistic concurrency
exercise - `created_at`, `updated_at TIMESTAMPTZ`

Index candidates: - `(project_id, status, position)` -
`(assignee_id, status, due_at)` - `(project_id, created_at DESC)` -
Partial index for open tasks only if the real workload benefits from
it. - Add indexes to referencing foreign-key columns when query patterns
or PostgreSQL referential actions warrant them; PostgreSQL does not
automatically index every referencing FK column.

Avoid blindly indexing every column: indexes consume storage and slow
writes. Measure with `EXPLAIN (ANALYZE, BUFFERS)` in a safe test
environment.

### 6.8 `task_dependencies`

Fields: `task_id FK tasks CASCADE`,
`depends_on_task_id FK tasks CASCADE`, `created_at`; composite primary
key `(task_id, depends_on_task_id)`.

Prevent self-dependencies with a check constraint. Detect longer
dependency cycles in service logic or with a deliberate graph-validation
strategy. Index `depends_on_task_id` to support reverse lookups.

### 6.9 `labels` and `task_labels`

`labels`: `id UUID PK`, `workspace_id FK workspaces CASCADE`,
`name VARCHAR(60)`, `color VARCHAR(20) nullable`, `created_at`; unique
`(workspace_id, name)`.

`task_labels`: `task_id FK tasks CASCADE`, `label_id FK labels CASCADE`,
composite PK `(task_id, label_id)`. Add reverse index beginning with
`label_id` if queries list tasks by label.

Ensure labels and tasks belong to the same workspace through service
validation or an explicitly stronger schema design.

### 6.10 `comments`

Fields: `id UUID PK`, `task_id FK tasks CASCADE`,
`author_id FK users RESTRICT`, `body TEXT NOT NULL`, `created_at`,
`updated_at`, `deleted_at nullable`.

Index `(task_id, created_at)` for comment history. Apply authorization
before reads and writes. If soft deletion is used, define how deleted
comments appear in responses and aggregates.

### 6.11 `attachments`

Fields: `id UUID PK`, `task_id FK tasks CASCADE`,
`uploaded_by FK users RESTRICT`, `storage_key TEXT NOT NULL`,
`original_filename VARCHAR(255) NOT NULL`, `content_type VARCHAR(150)`,
`size_bytes BIGINT NOT NULL`, `checksum VARCHAR(128) nullable`,
`created_at`.

Store file bytes in a storage backend, not directly in the relational
row by default. Validate upload size and content, generate storage keys
on the server, and do not trust filenames or content types supplied by
clients.

### 6.12 `activity_logs`

Fields: `id UUID PK`, `workspace_id FK workspaces CASCADE`,
`actor_id FK users SET NULL`, `entity_type VARCHAR(80)`,
`entity_id UUID`, `action VARCHAR(100)`, `metadata JSONB`, `created_at`.

Index `(workspace_id, created_at DESC)` and optionally
`(entity_type, entity_id, created_at DESC)`. `entity_id` is polymorphic
and therefore not a normal FK; document this trade-off. Never put
passwords, access tokens, or sensitive document content in metadata.

### 6.13 `notifications`

Fields: `id UUID PK`, `recipient_id FK users CASCADE`,
`workspace_id FK workspaces SET NULL`, `type VARCHAR(80)`,
`title VARCHAR(200)`, `body TEXT`, `payload JSONB`,
`read_at TIMESTAMPTZ nullable`, `created_at`.

Index `(recipient_id, read_at, created_at DESC)` for unread/recent
notifications.

### 6.14 Authentication/session tables

`refresh_sessions`: `id UUID PK`, `user_id FK users CASCADE`,
`token_hash`, `expires_at`, `revoked_at nullable`, `created_at`,
`replaced_by_id nullable`. Store refresh-token hashes, rotate refresh
tokens, and revoke sessions on logout or detected reuse.

Optional verification/reset token records should store token hashes,
expiration, usage state, and owner FK. Keep tokens single-use.

### 6.15 AI tables

`ai_conversations`: `id UUID PK`, `user_id FK users CASCADE`,
`workspace_id FK workspaces CASCADE`, `title`, `created_at`,
`updated_at`.

`ai_messages`: `id UUID PK`,
`conversation_id FK ai_conversations CASCADE`, `role`, `content`,
`model`, `input_tokens nullable`, `output_tokens nullable`,
`created_at`. Decide retention and redaction policies before storing
full content.

`documents`: `id UUID PK`, `workspace_id FK workspaces CASCADE`,
`uploaded_by FK users RESTRICT`,
`attachment_id nullable FK attachments SET NULL`, `status`,
`error_code nullable`, `created_at`, `updated_at`.

`document_chunks`: `id UUID PK`, `document_id FK documents CASCADE`,
`chunk_index INTEGER`, `content TEXT`, `token_count INTEGER nullable`,
`embedding VECTOR(nullable, configured dimension)`, `metadata JSONB`,
`created_at`. Unique `(document_id, chunk_index)`. Enable pgvector only
in the phase that introduces embeddings. Choose the embedding dimension
to match the selected model and never mix incompatible embedding spaces
in one index.

`ai_usage_events`: `id UUID PK`, `user_id FK users SET NULL`,
`workspace_id FK workspaces SET NULL`, `provider`, `model`, `feature`,
`input_tokens`, `output_tokens`, `latency_ms`, `status`, `created_at`.
Avoid logging sensitive prompts by default.

### 6.16 Background jobs and outbox

`job_records`: `id UUID PK`, `job_type`, `status`,
`requested_by FK users SET NULL`, `workspace_id FK workspaces SET NULL`,
`input_ref JSONB`, `result_ref JSONB nullable`, `error_code nullable`,
`attempt_count`, `created_at`, `started_at nullable`,
`finished_at nullable`.

Later, `outbox_events`: `id UUID PK`, `aggregate_type`, `aggregate_id`,
`event_type`, `payload JSONB`, `created_at`, `published_at nullable`.
Use the outbox pattern only when reliable publication of events is
needed; update business data and insert the outbox event in the same
database transaction.

### 6.17 Relationship summary

-   User 1---1 UserProfile.
-   User M---N Workspace through WorkspaceMembership.
-   Workspace 1---N Projects.
-   Workspace 1---N Labels, Invitations, ActivityLogs.
-   Project 1---N Tasks.
-   Task 1---N Comments and Attachments.
-   Task M---N Labels through TaskLabels.
-   Task M---N Task through TaskDependencies.
-   User 1---N created tasks, assigned tasks, comments, notifications,
    and sessions.
-   User 1---N AI conversations; conversation 1---N messages.
-   Document 1---N DocumentChunks.
-   Workspace and user 1---N AI usage events, with nullable references
    for retention/deletion flexibility.

### 6.18 Database design rules

1.  Use real database constraints for uniqueness, nullability, and valid
    references.
2.  Define deletion behavior intentionally for every FK.
3.  Do not cascade-delete user records through business history without
    considering audit and ownership needs.
4.  Keep authorization checks in service logic; a foreign key does not
    grant access.
5.  Avoid returning ORM models directly. Use response schemas.
6.  Avoid loading huge relationships by default.
7.  Never run schema creation automatically in production startup; use
    migrations.
8.  Add indexes in response to known query patterns and measured query
    plans.
9.  Keep transaction boundaries around one coherent business operation.
10. For paginated lists, use deterministic ordering with a unique
    tie-breaker.
11. Use database migrations for all schema changes and test them against
    a disposable database.
12. Do not store binary uploads in PostgreSQL unless there is a specific
    reason.

------------------------------------------------------------------------

## 7. API plan

Prefix versioned routes with `/api/v1`. Keep health endpoints separate
if desired. Exact schemas and response shapes are finalized in each
endpoint task and recorded in `docs/API_CONTRACT.md`.

### 7.1 Health and system

  Method   Endpoint          Purpose
  -------- ----------------- -----------------------------
  GET      `/health/live`    Process liveness
  GET      `/health/ready`   Check required dependencies
  GET      `/api/v1/meta`    API/version metadata

Readiness checks should be bounded by timeouts and should not reveal
credentials or infrastructure details.

### 7.2 Authentication and users

  Method   Endpoint                                   Purpose
  -------- ------------------------------------------ -------------------------------
  POST     `/api/v1/auth/register`                    Register account
  POST     `/api/v1/auth/login`                       Authenticate and issue tokens
  POST     `/api/v1/auth/refresh`                     Rotate refresh token
  POST     `/api/v1/auth/logout`                      Revoke current session
  POST     `/api/v1/auth/forgot-password`             Request reset flow
  POST     `/api/v1/auth/reset-password`              Complete reset
  POST     `/api/v1/auth/verify-email`                Verify account
  GET      `/api/v1/users/me`                         Current profile
  PATCH    `/api/v1/users/me`                         Update profile
  PATCH    `/api/v1/users/me/password`                Change password
  GET      `/api/v1/users/me/sessions`                List active sessions
  DELETE   `/api/v1/users/me/sessions/{session_id}`   Revoke a session

Return generic messages for password-reset requests so the endpoint does
not reveal whether an email exists.

### 7.3 Workspaces and invitations

  -------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                Purpose
  ----------------------- ------------------------------------------------------- -----------------------
  POST                    `/api/v1/workspaces`                                    Create workspace

  GET                     `/api/v1/workspaces`                                    List user's workspaces

  GET                     `/api/v1/workspaces/{workspace_id}`                     Get authorized
                                                                                  workspace

  PATCH                   `/api/v1/workspaces/{workspace_id}`                     Update workspace

  DELETE                  `/api/v1/workspaces/{workspace_id}`                     Delete/archive
                                                                                  according to policy

  GET                     `/api/v1/workspaces/{workspace_id}/members`             List members

  PATCH                   `/api/v1/workspaces/{workspace_id}/members/{user_id}`   Change member role

  DELETE                  `/api/v1/workspaces/{workspace_id}/members/{user_id}`   Remove member

  POST                    `/api/v1/workspaces/{workspace_id}/invitations`         Invite member

  POST                    `/api/v1/invitations/accept`                            Accept invitation
  -------------------------------------------------------------------------------------------------------

### 7.4 Projects

  ----------------------------------------------------------------------------------------------
  Method                  Endpoint                                       Purpose
  ----------------------- ---------------------------------------------- -----------------------
  POST                    `/api/v1/workspaces/{workspace_id}/projects`   Create project

  GET                     `/api/v1/workspaces/{workspace_id}/projects`   List/filter projects

  GET                     `/api/v1/projects/{project_id}`                Project details

  PATCH                   `/api/v1/projects/{project_id}`                Update project

  DELETE                  `/api/v1/projects/{project_id}`                Delete/archive project

  GET                     `/api/v1/projects/{project_id}/summary`        Metrics and progress
  ----------------------------------------------------------------------------------------------

### 7.5 Tasks and collaboration

  --------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                 Purpose
  ----------------------- -------------------------------------------------------- -----------------------
  POST                    `/api/v1/projects/{project_id}/tasks`                    Create task

  GET                     `/api/v1/projects/{project_id}/tasks`                    List/filter/sort tasks

  GET                     `/api/v1/tasks/{task_id}`                                Task details

  PATCH                   `/api/v1/tasks/{task_id}`                                Update task

  DELETE                  `/api/v1/tasks/{task_id}`                                Delete task

  POST                    `/api/v1/tasks/{task_id}/comments`                       Add comment

  GET                     `/api/v1/tasks/{task_id}/comments`                       List comments

  PATCH                   `/api/v1/comments/{comment_id}`                          Edit own comment or
                                                                                   permitted comment

  DELETE                  `/api/v1/comments/{comment_id}`                          Delete/soft-delete
                                                                                   comment

  PUT                     `/api/v1/tasks/{task_id}/labels/{label_id}`              Attach label

  DELETE                  `/api/v1/tasks/{task_id}/labels/{label_id}`              Detach label

  PUT                     `/api/v1/tasks/{task_id}/dependencies/{depends_on_id}`   Add dependency

  DELETE                  `/api/v1/tasks/{task_id}/dependencies/{depends_on_id}`   Remove dependency

  POST                    `/api/v1/tasks/{task_id}/attachments`                    Upload attachment

  GET                     `/api/v1/attachments/{attachment_id}`                    Authorized
                                                                                   metadata/download

  GET                     `/api/v1/workspaces/{workspace_id}/activity`             Activity feed
  --------------------------------------------------------------------------------------------------------

Use `PATCH` for partial updates and distinguish omitted fields from
explicit `null` where nullable values are supported.

### 7.6 Notifications and reporting

  ------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                               Purpose
  ----------------------- ------------------------------------------------------ -----------------------
  GET                     `/api/v1/notifications`                                List user's
                                                                                 notifications

  PATCH                   `/api/v1/notifications/{notification_id}`              Mark read/unread

  POST                    `/api/v1/notifications/read-all`                       Mark all read

  GET                     `/api/v1/workspaces/{workspace_id}/reports/overview`   Workspace metrics

  GET                     `/api/v1/projects/{project_id}/reports/tasks`          Task breakdown

  GET                     `/api/v1/workspaces/{workspace_id}/reports/export`     Export authorized
                                                                                 report
  ------------------------------------------------------------------------------------------------------

### 7.7 AI and documents

  -------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                Purpose
  ----------------------- ------------------------------------------------------- -----------------------
  POST                    `/api/v1/ai/task-plans`                                 Generate task plan
                                                                                  draft

  POST                    `/api/v1/ai/conversations`                              Create conversation

  GET                     `/api/v1/ai/conversations`                              List authorized
                                                                                  conversations

  GET                     `/api/v1/ai/conversations/{conversation_id}`            Get conversation

  POST                    `/api/v1/ai/conversations/{conversation_id}/messages`   Send message

  POST                    `/api/v1/ai/conversations/{conversation_id}/stream`     Stream response,
                                                                                  e.g. SSE

  POST                    `/api/v1/documents`                                     Upload document

  GET                     `/api/v1/documents/{document_id}`                       Document/job status

  POST                    `/api/v1/documents/{document_id}/summarize`             Request summary

  POST                    `/api/v1/documents/{document_id}/reindex`               Rebuild
                                                                                  chunks/embeddings if
                                                                                  authorized
  -------------------------------------------------------------------------------------------------------

AI endpoints must authorize the workspace and source records before
retrieval. Never trust a workspace ID or document ID merely because it
is present in a request.

### API conventions

-   Use Pydantic request and response schemas.
-   Use meaningful HTTP status codes (`201` on creation, `204` when a
    delete has no response body, `404` for
    unavailable/unauthorized-to-discover resources according to policy,
    `409` for conflicts, `422` for validation failures).
-   Define a consistent error response format.
-   Use limit/offset pagination initially; teach keyset pagination for
    large datasets later.
-   Add deterministic sorting and maximum page sizes.
-   Never return password hashes, token hashes, internal storage keys,
    or secrets.
-   Document authentication requirements and role permissions.
-   Keep endpoint behavior recorded in `API_CONTRACT.md`.

------------------------------------------------------------------------

## 8. FastAPI and backend concepts covered

### Fundamentals

-   ASGI, Uvicorn, application startup and lifespan.
-   Path operations and HTTP verbs.
-   Path/query parameters and request bodies.
-   Pydantic validation and serialization.
-   Response models, status codes, headers.
-   Swagger/OpenAPI documentation.
-   Routers and modular applications.
-   Settings and environment variables.
-   Exception handling and consistent errors.

### Dependency injection

-   `Depends`, nested dependencies, reusable dependencies.
-   `yield` dependencies and resource cleanup.
-   Current-user and authorization dependencies.
-   Dependency overrides in tests.
-   Lifespan-managed clients and engines.

### Database and ORM

-   SQLAlchemy 2.x sessions, queries, mappings, relationships.
-   Foreign keys, association tables, cascade rules.
-   Alembic migrations.
-   Joins, subqueries, CTEs, aggregations.
-   Eager/lazy loading, N+1 queries.
-   Transactions, isolation, locks, optimistic concurrency.
-   Indexes, query plans, pooling, bulk operations.
-   JSONB, full-text search, pgvector.

### Security

-   Password hashing, JWTs, refresh rotation, session revocation.
-   Role and resource authorization.
-   CORS and trusted hosts.
-   Rate limiting, input/file validation, secret management.
-   SQL injection and insecure direct object reference prevention.
-   AI prompt injection and data-access boundaries.

### Advanced API behavior

-   Middleware, custom exception handlers, request IDs.
-   Upload/download, streaming responses, SSE, WebSockets.
-   HTTPX, timeouts, retries.
-   Background tasks versus durable queues.
-   API versioning and deprecation.

### Reliability and performance

-   Pytest, integration tests, test DB fixtures, dependency overrides.
-   Structured logs, metrics, traces, health checks.
-   Caching and invalidation.
-   Idempotency, retries, dead-letter handling.
-   Docker, CI/CD, graceful shutdown, load testing.

------------------------------------------------------------------------

## 9. AI design

### 9.1 Local-first development

1.  Install Ollama separately and pull a model suitable for the machine.
2.  Configure `OLLAMA_BASE_URL` and the model name through environment
    settings.
3.  Use a small model for early development if hardware is limited.
4.  Test the provider through a health/diagnostic script before
    connecting it to endpoints.
5.  Never make the application fail to start solely because Ollama is
    temporarily unavailable.
6.  Provide a hosted provider adapter as an optional configuration, not
    a hard dependency.

Model quality, memory use, and speed vary by model and hardware.
Document the exact model used during experiments rather than promising a
fixed performance level.

### 9.2 Provider interface

The application-facing AI service should expose a small,
provider-neutral interface, such as: - `generate_text(...)` -
`generate_structured(...)` - `stream_text(...)` -
`create_embeddings(...)`

The exact signatures should be implemented when Task T071 begins. Avoid
building a generic framework with unnecessary abstraction. Convert
provider errors to safe application-level exceptions and record
operational metadata.

### 9.3 Task generation

Flow: 1. Author submits a requirement and optional project context. 2.
API authenticates user and verifies project access. 3. Service calls the
AI provider with a bounded prompt. 4. AI output is parsed into a
Pydantic schema. 5. Invalid output is rejected or retried a limited
number of times. 6. API returns a draft list of tasks. 7. User confirms
which suggestions to persist. 8. Service saves accepted tasks in a
transaction and logs the action.

AI-generated output must not be automatically trusted or executed.

### 9.4 Project assistant and RAG

Flow: 1. Authenticate the user. 2. Determine workspace and resource
access using normal authorization logic. 3. Retrieve only records and
document chunks that the user may access. 4. Build a bounded context
with source identifiers. 5. Call the model. 6. Return a grounded answer
and citations/references to application documents where possible. 7.
Record usage metadata without storing more sensitive content than
necessary.

Do not give the model unrestricted database access. Treat document text
as untrusted, including instructions embedded inside documents.
Retrieved content must never override system rules or access controls.

### 9.5 Document pipeline

1.  Upload and validate file.
2.  Save file to private storage and create a `documents` row.
3.  Enqueue a durable job.
4.  Extract text in the worker.
5.  Normalize and chunk text.
6.  Create embeddings.
7.  Store chunks and vectors.
8.  Update processing status.
9.  Allow authorized summaries and retrieval.
10. Handle retries, duplicate jobs, and partial failures.

### 9.6 AI safeguards

-   Provider timeout and bounded retries.
-   Per-user/workspace quotas and request-size limits.
-   Input/output token limits where supported.
-   Safe handling of provider outages.
-   Structured-output validation.
-   Authorization before retrieval and before saving results.
-   No API keys in client responses or logs.
-   Audit sensitive actions.
-   Document retention/deletion policy.
-   Tests with mocked AI responses; CI tests must not require a paid
    API.
-   Evaluate output quality on a small curated set of prompts and
    documents.

------------------------------------------------------------------------

## 10. Database performance learning lab

For every optimization exercise, record a baseline before changing code.

### Required procedure

1.  Create representative seed data (enough rows to expose behavior).
2.  Run the endpoint/query and record query count and latency.
3.  Inspect generated SQL where useful.
4.  Run `EXPLAIN (ANALYZE, BUFFERS)` in a safe development database.
5.  Identify the bottleneck: repeated queries, sequential scan, bad join
    order, excess columns, poor pagination, lock contention, or
    application work.
6.  Change one thing at a time.
7.  Repeat the same measurement.
8.  Document the result and trade-offs.

### Required exercises

-   E1: Reproduce and fix N+1 loading for tasks and assignees.
-   E2: Compare `selectinload` and `joinedload` for
    one-to-many/many-to-one use cases.
-   E3: Add a composite index for a real filter/order query; compare
    query plans.
-   E4: Compare offset pagination with keyset pagination on a large task
    list.
-   E5: Compare join-plus-grouping with a subquery for comment counts.
-   E6: Use one transaction to create a project and initial tasks
    atomically.
-   E7: Demonstrate a race condition in task updates and fix it with a
    version column or locking.
-   E8: Demonstrate bulk inserts versus per-row inserts.
-   E9: Introduce Redis caching for a read-heavy summary and test
    invalidation.
-   E10: Tune connection pool settings only after measuring concurrency
    and database limits.

Do not claim an index improves performance based only on theory. It can
make writes slower or be unused by the planner. Capture the
before-and-after evidence.

------------------------------------------------------------------------

## 11. Task roadmap with dependencies and acceptance criteria

Task IDs are stable references. Implement in order unless a task
explicitly permits parallel work. Each task should become a small commit
when practical.

### Phase 0 --- Planning and tools

**T001 --- Create repository and learning docs**\
Depends on: none.\
Build: Git repository, README, `.gitignore`, `docs/MASTER_PLAN.md`,
`docs/TASK_TRACKER.md`, and a minimal `pyproject.toml`.\
Concepts: Git, project setup, reproducibility.\
Acceptance: - Repository initializes and commits successfully. -
Secrets, virtual environments, caches, and local databases are
ignored. - Documentation describes setup and task workflow.

**T002 --- Python environment and FastAPI hello world**\
Depends on: T001.\
Build: virtual environment, FastAPI app, Uvicorn command, root/health
route.\
Concepts: ASGI, Uvicorn, path operations.\
Acceptance: - App starts using documented commands. - Health route
returns a valid JSON response. - Swagger UI opens and lists the route.

### Phase 1 --- HTTP and validation

**T003 --- Path/query parameters and response schemas**\
Depends on: T002.\
Acceptance: validated parameters, response model, documented status
codes, tests for valid and invalid input.

**T004 --- Pydantic request schemas and CRUD in memory**\
Depends on: T003.\
Build temporary workspace/project CRUD with in-memory storage.\
Acceptance: create/read/update/delete flows work; input validation and
`404` handling tested; learner understands this storage is temporary.

**T005 --- Routers, errors, and API conventions**\
Depends on: T004.\
Acceptance: routes split into modules, common error response defined,
route prefix/version established, tests remain green.

**T006 --- Configuration and settings**\
Depends on: T005.\
Build settings with environment variables and `.env.example`.\
Acceptance: no secrets in code; missing required production settings
fail clearly; local defaults are documented.

### Phase 2 --- PostgreSQL and SQLAlchemy

**T010 --- Start PostgreSQL and configure connection**\
Depends on: T006.\
Acceptance: database can be started locally; connection is configured
via environment; a safe connectivity check works.

**T011 --- SQLAlchemy engine, session factory, and DB dependency**\
Depends on: T010.\
Acceptance: session opens/closes reliably; exceptions roll back as
appropriate; no global shared Session object; tests can override the
dependency.

**T012 --- First model and Pydantic schemas**\
Depends on: T011.\
Build users model and create/read schemas without authentication yet.\
Acceptance: data persists after restart; response never exposes password
hash; database operations have tests.

**T013 --- Alembic initialization and migrations**\
Depends on: T012.\
Acceptance: initial migration creates schema from a clean database;
upgrade and downgrade commands documented; schema changes are not
performed at app startup.

**T014 --- CRUD services and transaction boundaries**\
Depends on: T013.\
Acceptance: route/service/database responsibilities are clear; failures
roll back; CRUD integration tests pass.

### Phase 3 --- Relationships and core domain

**T020 --- Workspace and membership schema**\
Depends on: T014.\
Build workspaces and workspace_memberships.\
Acceptance: FK constraints work; duplicate membership rejected; role
stored on membership; relationship tests cover deletion behavior.

**T021 --- Project model and workspace relationships**\
Depends on: T020.\
Acceptance: projects belong to workspaces; invalid workspace references
fail; project list scoped by workspace.

**T022 --- Task model, creator, assignee, and subtasks**\
Depends on: T021.\
Acceptance: task FKs and self-reference work; nullable assignee behavior
is tested; responses use schemas.

**T023 --- Comments, labels, and association table**\
Depends on: T022.\
Acceptance: comments reference tasks/authors; tasks can have multiple
labels; duplicate task-label pair is rejected.

**T024 --- Task dependencies and cycle validation**\
Depends on: T023.\
Acceptance: self-dependency is rejected; duplicate edge prevented; cycle
validation tested.

**T025 --- Remaining schema: invitations, attachments, notifications,
activity**\
Depends on: T023.\
Acceptance: constraints and deletion policies documented; migration
applies on clean DB; model relationship tests pass.

**T026 --- Database design review and schema documentation**\
Depends on: T024, T025.\
Acceptance: `DATABASE_DESIGN.md` includes tables, columns, FKs,
cardinalities, constraints, indexes, and deletion policy.

### Phase 4 --- Authentication and authorization

**T030 --- Password hashing and registration**\
Depends on: T012, T006.\
Acceptance: passwords are hashed; duplicate normalized emails rejected;
password hash never returned; tests cover invalid data.

**T031 --- Login and access JWTs**\
Depends on: T030.\
Acceptance: valid login returns documented token response; invalid login
is generic; token signature and expiry are checked.

**T032 --- Refresh sessions, rotation, and logout**\
Depends on: T031.\
Acceptance: refresh token stored as hash; refresh rotates/revokes old
token; logout revokes session; replay behavior tested.

**T033 --- Current-user dependency and protected routes**\
Depends on: T031.\
Acceptance: missing/invalid token rejected; valid token resolves user;
deactivated account cannot use protected APIs.

**T034 --- Workspace role and resource authorization**\
Depends on: T020, T033.\
Acceptance: owner/admin/member/viewer permissions are explicit;
cross-workspace ID guessing cannot disclose data; permission tests cover
each role.

**T035 --- Password reset and email verification flows**\
Depends on: T030, T032.\
Acceptance: tokens are high-entropy, hashed, expiring, single-use;
responses avoid email enumeration; email delivery may be mocked locally.

**T036 --- Security review**\
Depends on: T034, T035.\
Acceptance: authorization matrix documented; sensitive values redacted;
CORS and trusted-host settings configurable; common access-control tests
pass.

### Phase 5 --- Core business APIs

**T040 --- Workspace endpoints and invitations**\
Depends on: T034.\
Acceptance: workspace CRUD and member listing work; invitation token
expiry and acceptance are tested; role changes enforce owner/admin
rules.

**T041 --- Project endpoints**\
Depends on: T021, T034.\
Acceptance: authorized project CRUD; workspace scope enforced; filtering
and stable pagination work.

**T042 --- Task CRUD and assignment rules**\
Depends on: T022, T034.\
Acceptance: task CRUD and assignment work; assignee must be eligible for
the workspace; invalid transitions/rules handled.

**T043 --- Filtering, sorting, pagination, and search**\
Depends on: T041, T042.\
Acceptance: max page size enforced; ordering deterministic; invalid
filters rejected; tests cover empty and large result sets.

**T044 --- Comments, labels, dependencies**\
Depends on: T023, T024, T034.\
Acceptance: authorized collaboration operations work; relationships
validated; duplicate operations behave predictably.

**T045 --- Attachments and private file storage**\
Depends on: T025, T034.\
Acceptance: size/type limits enforced; unsafe filenames not used as
storage paths; unauthorized download blocked; cleanup behavior
documented.

**T046 --- Activity feed and audit records**\
Depends on: T025, T040, T041, T042.\
Acceptance: selected business actions generate records in the same
transaction when required; secrets are excluded; feed is paginated.

**T047 --- Notifications**\
Depends on: T025, T034.\
Acceptance: users can list and mark their notifications; one user cannot
alter another user's notifications; unread count query is tested.

**T048 --- Reports and aggregation queries**\
Depends on: T041, T042.\
Acceptance: project progress and task breakdowns use authorized data;
aggregate results are correct against test fixtures.

### Phase 6 --- Database optimization

**T050 --- Query count instrumentation and baseline**\
Depends on: T043, T048.\
Acceptance: a repeatable dataset and measurement instructions exist;
baseline SQL/query counts and timings are recorded.

**T051 --- N+1 reproduction and eager-loading fixes**\
Depends on: T050.\
Acceptance: test proves query count grows in the inefficient version and
stays bounded in the optimized version; `selectinload`/`joinedload`
choice explained.

**T052 --- Indexing and EXPLAIN practice**\
Depends on: T050.\
Acceptance: at least one measured index experiment recorded; migration
includes index; write/storage trade-off discussed.

**T053 --- Pagination and aggregation optimization**\
Depends on: T051, T052.\
Acceptance: compare offset/keyset and aggregate approaches; stable
ordering and correct counts verified.

**T054 --- Transactions, isolation, and locking**\
Depends on: T042, T050.\
Acceptance: atomic multi-row operation tested; race condition
demonstrated; optimistic versioning or row lock used where appropriate.

**T055 --- Bulk operations and pool tuning**\
Depends on: T052, T054.\
Acceptance: bulk versus row-by-row measurements recorded; pool settings
documented with concurrency assumptions; no unmeasured magic values.

**T056 --- Redis cache and invalidation**\
Depends on: T048, T050.\
Acceptance: cache key includes relevant scope; invalidation tested on
writes; application works safely if cache is unavailable where intended.

### Phase 7 --- AI

**T070 --- AI settings and provider interface**\
Depends on: T006.\
Acceptance: provider configured through settings; no key in code;
application can start without provider availability; mocked provider
tests pass.

**T071 --- Ollama adapter and diagnostic script**\
Depends on: T070.\
Acceptance: local generation works when Ollama/model is available;
timeout and unavailable-server errors are handled; manual verification
documented.

**T072 --- Hosted provider adapter**\
Depends on: T070.\
Acceptance: one hosted provider can be configured without changing
business services; credentials remain server-side; tests mock network
calls.

**T073 --- Structured AI task-plan generation**\
Depends on: T042, T070.\
Acceptance: output validates against Pydantic schema; invalid output is
handled; generated tasks remain drafts until user acceptance.

**T074 --- AI conversations and project assistant**\
Depends on: T034, T070.\
Acceptance: conversation ownership/workspace access enforced; assistant
uses authorized context only; provider errors and long prompts handled.

**T075 --- Streaming AI responses**\
Depends on: T074.\
Acceptance: stream uses a documented protocol (prefer SSE for one-way
token streaming); disconnects and timeouts handled; tests verify event
shape.

**T076 --- Document extraction and summary**\
Depends on: T045, T070.\
Acceptance: document status tracked; parser errors are safe; large files
bounded; summary only accessible to authorized users.

**T077 --- Embeddings and pgvector**\
Depends on: T076.\
Acceptance: extension/migration documented; model dimension consistent;
similarity search returns expected fixtures; indexes chosen and
justified.

**T078 --- RAG assistant with references**\
Depends on: T074, T077.\
Acceptance: retrieval is permission-scoped; response cites relevant
document/chunk references; prompt injection test cannot grant extra
access.

**T079 --- AI usage limits, logging, and evaluation**\
Depends on: T073, T074.\
Acceptance: usage/latency/status tracked; quotas enforced; sensitive
content is not logged by default; small evaluation set is documented.

### Phase 8 --- Background jobs and real-time features

**T080 --- Durable queue and worker setup**\
Depends on: T025, T070.\
Acceptance: API enqueues a job; worker processes it independently; retry
and failure states visible; duplicate processing considered.

**T081 --- Document processing pipeline**\
Depends on: T076, T080.\
Acceptance: extraction/chunking/embedding runs in worker; job status
updates; retry is bounded and idempotent.

**T082 --- Email integration**\
Depends on: T035, T080.\
Acceptance: email service abstracted; local development can use a test
backend; delivery errors logged safely.

**T083 --- Scheduled reminders**\
Depends on: T080, T082.\
Acceptance: due-date reminder job is repeat-safe and respects user
preferences/time zones.

**T084 --- WebSocket task updates**\
Depends on: T042, T034.\
Acceptance: connection authorization enforced; unauthorized workspace
events never broadcast; disconnects are handled.

**T085 --- Transactional outbox (advanced)**\
Depends on: T046, T080.\
Acceptance: business update and outbox event commit atomically;
publisher retries safely; duplicate delivery is tolerated.

### Phase 9 --- Testing and observability

**T090 --- Test fixtures and isolated database**\
Depends on: T014.\
Acceptance: tests do not use production data; setup/teardown is
repeatable; test database URL is explicit.

**T091 --- Unit and integration coverage for core APIs**\
Depends on: T040--T048.\
Acceptance: success, validation, authorization, not-found, and conflict
cases covered; no real AI network calls in CI.

**T092 --- Concurrency and performance tests**\
Depends on: T050, T054.\
Acceptance: repeatable load test and concurrency test exist; results
include environment and dataset details.

**T093 --- Structured logging and request IDs**\
Depends on: T005.\
Acceptance: request ID appears in logs; secrets and sensitive payloads
redacted; exception logs retain useful diagnostic context.

**T094 --- Metrics, tracing, and health/readiness**\
Depends on: T093, T010.\
Acceptance: health semantics documented; dependency timeouts bounded;
useful request/database/job metrics available locally.

### Phase 10 --- Deployment

**T100 --- Docker and Compose**\
Depends on: T010, T013.\
Acceptance: API and PostgreSQL start from documented Compose
configuration; secrets are not baked into image; volumes persist local
DB data.

**T101 --- Production configuration and migrations**\
Depends on: T100.\
Acceptance: separate dev/test/prod settings; migration runs as a
controlled deployment step; graceful shutdown tested.

**T102 --- CI pipeline**\
Depends on: T090, T100.\
Acceptance: lint/type checks/tests run on changes; CI does not require
real AI credentials; failures block the pipeline.

**T103 --- Deployment and HTTPS**\
Depends on: T101, T102.\
Acceptance: deployment steps documented; TLS/reverse proxy configuration
considered; backups and restore procedure documented.

**T104 --- Final security and performance review**\
Depends on: T036, T056, T079, T092, T103.\
Acceptance: review checklist completed; known limitations documented;
baseline performance and security tests recorded.

### Phase 11 --- Architecture and frontend integration

**T110 --- Architecture review and module boundaries**\
Depends on: T104.\
Acceptance: document service boundaries and operational pain points; no
microservice split without a concrete reason.

**T111 --- Optional service extraction exercise**\
Depends on: T110.\
Acceptance: extract a worker or AI component only if educationally
useful; define API/message contract, authentication, retries, and
failure behavior.

**T120 --- React frontend integration**\
Depends on: T041--T048, T031, T034.\
Acceptance: React app can sign in, list workspaces/projects/tasks, and
perform authorized CRUD through documented API; CORS configured
narrowly; frontend never holds provider secrets.

------------------------------------------------------------------------

## 12. Testing strategy

### Test levels

-   **Unit tests:** business rules, validation helpers, permission
    decisions, provider response parsing.
-   **API tests:** route behavior, status codes, schemas,
    authentication, and error cases.
-   **Database integration tests:** real PostgreSQL constraints,
    relationships, migrations, and transactions.
-   **Contract tests:** ensure responses match documented API schemas.
-   **AI tests:** mocked providers, malformed structured output,
    timeouts, empty responses, and quota failures.
-   **Worker tests:** retries, idempotency, failed jobs, and job status.
-   **Performance tests:** query counts, response time under a specified
    dataset/load, and query-plan comparisons.
-   **End-to-end tests:** core user journey across registration,
    workspace, project, task, and collaboration.

### Minimum endpoint test cases

For each protected resource endpoint: 1. Valid authorized request. 2.
Missing token. 3. Invalid/expired token. 4. Authenticated user without
permission. 5. Resource does not exist. 6. Invalid request body/query.
7. Database constraint or business-rule conflict. 8. Successful mutation
persists expected state. 9. Sensitive fields do not appear in response.

Use a real disposable PostgreSQL database for DB-specific behavior.
SQLite can be useful for some isolated tests but is not a full
substitute for PostgreSQL constraints, query plans, JSONB, locking, or
pgvector.

------------------------------------------------------------------------

## 13. Code quality and operating standards

-   Use type hints for public functions and service interfaces.
-   Use Pydantic for external input/output and SQLAlchemy models for
    persistence.
-   Keep business logic testable and avoid putting all logic in route
    functions.
-   Use explicit transaction boundaries.
-   Avoid broad `except Exception` unless the exception is logged and
    converted at a deliberate boundary.
-   Use structured logs; do not log passwords, access tokens, raw
    refresh tokens, or unnecessary sensitive AI content.
-   Keep `.env` out of Git and commit `.env.example`.
-   Keep migrations small and review their generated SQL where
    appropriate.
-   Avoid hidden startup side effects.
-   Set timeouts on outbound network calls.
-   Use bounded retries with backoff only for retryable errors.
-   Design queued work to be idempotent.
-   Do not cache private data without including user/workspace scope in
    the cache key.
-   Use UTC in storage; convert to user time zones only for
    display/scheduling.
-   Prefer explicit query projections for reporting endpoints.
-   Document intentional shortcuts made for learning and revisit them
    before production.
-   Use a linter/formatter and type checker once the initial app
    structure is stable.

------------------------------------------------------------------------

## 14. Documentation files to maintain

### `docs/MASTER_PLAN.md`

This document, including task IDs, architecture, and implementation
rules.

### `docs/DATABASE_DESIGN.md`

The implemented schema, column types, FKs, cardinalities, constraints,
deletion rules, migrations, and index rationale.

### `docs/API_CONTRACT.md`

For each endpoint: method, path, auth, required role, request schema,
response schema, status codes, errors, and examples.

### `docs/TASK_TRACKER.md`

Use this template:

``` text
Current phase:
Current task:
Completed tasks:
Blocked tasks:
Known issues:
Last verified command:
Last verified test result:
Next task:
Last updated:
```

Do not mark a task complete just because code was generated. Mark it
complete only after local verification or clearly label it
`implemented, not yet verified`.

### `docs/LEARNING_NOTES.md`

For each completed task, record: - Concepts learned. - One-sentence
explanation of the key design decision. - Important command/query. - Bug
encountered and fix. - Follow-up experiment, if any.

------------------------------------------------------------------------

## 15. Progress and completion rules

Use these statuses: - `NOT STARTED` - `IN PROGRESS` -
`IMPLEMENTED — NOT VERIFIED` - `BLOCKED` - `DONE`

A task is `DONE` only when: - Acceptance criteria are met. - Relevant
tests pass. - Commands and environment requirements are documented. -
Migrations are applied and reviewed if relevant. - No known regression
is left unexplained. - Task tracker and learning notes are updated.

If the environment cannot run a task (for example, Ollama is not
installed), mark the integration test as not run and provide a
mock-based test plus exact manual verification steps. Do not pretend it
passed.

------------------------------------------------------------------------

## 16. First commands and setup expectations

The exact commands depend on the operating system and chosen package
manager. During T001/T002, select one supported workflow and document it
consistently. A typical local setup will include:

1.  Install a supported Python version and Git.
2.  Create and activate a virtual environment.
3.  Install the project and development dependencies.
4.  Start PostgreSQL locally (initially through Docker Compose or an
    existing local installation).
5.  Copy `.env.example` to `.env` and fill local-only values.
6.  Run Alembic migrations.
7.  Start Uvicorn with reload for development.
8.  Open `/docs`.
9.  Run pytest.

Do not put real credentials in shell history or commit them. Use
separate credentials and databases for development and testing.

------------------------------------------------------------------------

## 17. Master prompt for future coding sessions

Copy the following prompt after providing this document:

> You are my implementation tutor for ProjectHub AI. Treat the
> ProjectHub AI Master Project Documentation as the source of truth.
>
> Implement **\[TASK ID and title\] only**.
>
> First check the task dependencies and the current repository state. If
> the current files are not available in the conversation, ask me to
> provide the relevant files or a file tree rather than guessing their
> contents.
>
> Give me: 1. A short goal and list of concepts being taught. 2. Exact
> files to create or modify. 3. Complete code for every affected file,
> with no missing sections or unexplained placeholders. 4. Concise
> explanations of why the important code is used. 5. Required
> package/configuration changes. 6. Exact commands to run, migrate, and
> test. 7. Tests for success, validation failures, and relevant
> authorization/error cases. 8. Expected output and troubleshooting
> tips. 9. An acceptance checklist based on the master document. 10. A
> progress checkpoint showing task status, files changed, tests actually
> run, known issues, and the next task.
>
> Keep explanations simple and short. Do not implement later tasks. Do
> not claim code was executed or tests passed unless that was actually
> verified. Preserve compatibility with the current project. If a design
> change is necessary, explain it and update the relevant documentation.
> For database schema changes, include an Alembic migration. For AI
> integrations, include mock-based tests so the normal test suite does
> not require a running model or paid API.

------------------------------------------------------------------------

## 18. Recommended starting sequence

Start with **T001**, then continue in order. Resist the temptation to
begin with JWT, AI, or a large ORM model before the fundamentals work.

The first practical milestone is T005: a clean, validated FastAPI
application with routers and tests. The first database milestone is
T026: the relational schema and migrations are documented and verified.
The first complete application milestone is T048: the main user journeys
and reporting APIs work with authorization. The final milestone is T104:
a tested, measured, deployable backend with AI and production concerns
addressed.

**The core learning principle:** build a working version, test it,
inspect what it does, then improve it. You will learn far more from
measuring and fixing a real N+1 query, authorization bug, or transaction
race than from memorizing a list of concepts.
