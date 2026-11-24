# ProjectHub AI — Database Design (Implemented Schema)

**Document version:** 1.0  
**Status:** Reflects Phase 3 schema through **T025** (Alembic head `81b6971b315b`)  
**Database:** PostgreSQL  
**ORM:** SQLAlchemy 2.x (synchronous sessions)  
**Migrations:** Alembic (`alembic/versions/`)

This document describes the **implemented** relational schema. Future phases add authentication tables (`refresh_sessions`, etc.), AI tables, and job tables per `MASTER_PLAN.md` §6.14–6.16.

---

## 1. Overview

### Design principles

1. **UUID primary keys** for user-facing entities.
2. **TIMESTAMPTZ** in UTC for all timestamps.
3. **Database constraints** for uniqueness, enums (check constraints), and referential integrity.
4. **Intentional `ON DELETE` policies** on every foreign key (documented below).
5. **No schema creation at app startup** — only Alembic migrations.
6. **Authorization in services**, not inferred from foreign keys alone.

### ORM model files

| Table(s) | SQLAlchemy model | File |
|----------|------------------|------|
| `users` | `User` | `app/models/user.py` |
| `workspaces`, `workspace_memberships` | `Workspace`, `WorkspaceMembership` | `app/models/workspace.py` |
| `projects` | `Project` | `app/models/project.py` |
| `tasks` | `Task` | `app/models/task.py` |
| `task_dependencies` | `TaskDependency` | `app/models/task_dependency.py` |
| `labels`, `task_labels` | `Label`, `task_labels` | `app/models/label.py` |
| `comments` | `Comment` | `app/models/comment.py` |
| `workspace_invitations` | `WorkspaceInvitation` | `app/models/workspace_invitation.py` |
| `attachments` | `Attachment` | `app/models/attachment.py` |
| `notifications` | `Notification` | `app/models/notification.py` |
| `activity_logs` | `ActivityLog` | `app/models/activity_log.py` |

---

## 2. Migration history

Apply in order (`uv run alembic upgrade head`):

| Revision | File | Summary |
|----------|------|---------|
| `20261106_01` | `20261106_01_create_users_table.py` | Initial `users` table |
| `023b8dfe796f` | `023b8dfe796f_create_users_and_workspaces_tables.py` | Workspaces, memberships |
| `bc7fa534a850` | `bc7fa534a850_created_project_tables.py` | Projects |
| `661d3cfbdf87` | `661d3cfbdf87_created_tasks_table.py` | Tasks |
| `9411994b82b2` | `9411994b82b2_create_comments_labels_and_task_label_.py` | Comments, labels, `task_labels` |
| `930f037b15ab` | `930f037b15ab_created_task_dependency_table.py` | `task_dependencies` |
| `46b51efa82b3` | `46b51efa82b3_create_task_dependencies_table.py` | No-op placeholder (keep for linear history) |
| `81b6971b315b` | `81b6971b315b_created_workspace_invitations_.py` | Invitations, attachments, notifications, activity logs |

**Current head:** `81b6971b315b`

---

## 3. Entity-relationship summary

```
User 1──* Workspace (created_by, RESTRICT)
User M──N Workspace via workspace_memberships
Workspace 1──* Project, Label, WorkspaceInvitation, ActivityLog
Workspace 1──* Notification (optional FK, SET NULL on workspace delete)
Project 1──* Task
Task 1──* Comment, Attachment
Task *──N Label via task_labels
Task M──N Task via task_dependencies (directed: task_id depends on depends_on_task_id)
Task 0..1──* Task (parent_task_id subtasks)
User 1──* Task (creator RESTRICT, assignee SET NULL)
```

### Cardinalities

| From | To | Cardinality | Link |
|------|-----|-------------|------|
| User | Workspace | 1:N | `workspaces.created_by` |
| User | Workspace | M:N | `workspace_memberships` |
| Workspace | Project | 1:N | `projects.workspace_id` |
| Project | Task | 1:N | `tasks.project_id` |
| Task | Task | 1:N (optional parent) | `tasks.parent_task_id` |
| Task | Task | M:N (dependencies) | `task_dependencies` |
| Task | Label | M:N | `task_labels` |
| Task | Comment | 1:N | `comments.task_id` |
| Task | Attachment | 1:N | `attachments.task_id` |
| Workspace | Label | 1:N | `labels.workspace_id` |
| Workspace | WorkspaceInvitation | 1:N | `workspace_invitations.workspace_id` |
| Workspace | ActivityLog | 1:N | `activity_logs.workspace_id` |
| User | Notification | 1:N | `notifications.recipient_id` |
| User | ActivityLog | 1:N (optional actor) | `activity_logs.actor_id` |

---

## 4. Tables (columns, constraints, indexes)

### 4.1 `users`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | app-generated | PK |
| `email` | VARCHAR(320) | NO | — | Normalized (lowercase) via ORM `@validates` |
| `password_hash` | TEXT | NO | — | Never exposed in API schemas |
| `display_name` | VARCHAR(120) | NO | — | |
| `is_active` | BOOLEAN | NO | `true` | |
| `is_verified` | BOOLEAN | NO | `false` | Email verification (T035) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | ORM `onupdate` |

**Constraints:** `uq_users_email` UNIQUE (`email`)

**Deletion policy:** User deletion is RESTRICTed where history matters (`workspaces.created_by`, `projects.created_by`, `tasks.creator_id`, `comments.author_id`, etc.). CASCADE on `workspace_memberships.user_id` and `notifications.recipient_id`. See child tables.

---

### 4.2 `workspaces`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | UUID | NO | PK |
| `name` | VARCHAR(160) | NO | |
| `slug` | VARCHAR(180) | NO | Normalized lowercase |
| `description` | TEXT | YES | |
| `created_by` | UUID | NO | FK → `users.id` **RESTRICT** |
| `created_at` | TIMESTAMPTZ | NO | `now()` |
| `updated_at` | TIMESTAMPTZ | NO | `now()` |

**Constraints:** `uq_workspaces_slug` UNIQUE (`slug`)

**Deletion policy:** Deleting a workspace **CASCADE**s to memberships, projects, labels, invitations, activity logs, and (via project) tasks and related rows. Notifications: `workspace_id` **SET NULL**.

---

### 4.3 `workspace_memberships`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | UUID | NO | PK |
| `workspace_id` | UUID | NO | FK → `workspaces.id` **CASCADE** |
| `user_id` | UUID | NO | FK → `users.id` **CASCADE** |
| `role` | VARCHAR(20) | NO | `member` |
| `joined_at` | TIMESTAMPTZ | NO | `now()` |

**Constraints:**

- `uq_workspace_memberships_workspace_user` UNIQUE (`workspace_id`, `user_id`)
- `ck_workspace_memberships_role`: `role IN ('owner', 'admin', 'member', 'viewer')`

**Application note:** At least one `owner` per workspace is enforced in service logic (T034), not by a simple DB constraint.

---

### 4.4 `projects`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | UUID | NO | PK |
| `workspace_id` | UUID | NO | FK → `workspaces.id` **CASCADE** |
| `name` | VARCHAR(180) | NO | |
| `description` | TEXT | YES | |
| `status` | VARCHAR(20) | NO | `planned` |
| `start_date` | DATE | YES | |
| `due_date` | DATE | YES | |
| `created_by` | UUID | NO | FK → `users.id` **RESTRICT** |
| `created_at` | TIMESTAMPTZ | NO | `now()` |
| `updated_at` | TIMESTAMPTZ | NO | `now()` |

**Constraints:** `ck_projects_status`: `planned`, `active`, `on_hold`, `completed`, `archived`

**Indexes:** `ix_projects_workspace_status_created` (`workspace_id`, `status`, `created_at`) — list/filter projects by workspace and status.

---

### 4.5 `tasks`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | UUID | NO | PK |
| `project_id` | UUID | NO | FK → `projects.id` **CASCADE** |
| `parent_task_id` | UUID | YES | FK → `tasks.id` **SET NULL** |
| `title` | VARCHAR(240) | NO | |
| `description` | TEXT | YES | |
| `status` | VARCHAR(20) | NO | `backlog` |
| `priority` | VARCHAR(20) | NO | `normal` |
| `creator_id` | UUID | NO | FK → `users.id` **RESTRICT** |
| `assignee_id` | UUID | YES | FK → `users.id` **SET NULL** |
| `due_at` | TIMESTAMPTZ | YES | |
| `position` | INTEGER | NO | `0` |
| `version` | INTEGER | NO | `1` | Optimistic concurrency (T054) |
| `created_at` | TIMESTAMPTZ | NO | `now()` |
| `updated_at` | TIMESTAMPTZ | NO | `now()` |

**Check constraints:**

- `ck_tasks_status`: backlog, todo, in_progress, blocked, done, cancelled
- `ck_tasks_priority`: low, normal, high, urgent
- `ck_tasks_position_nonnegative`: `position >= 0`
- `ck_tasks_version_positive`: `version >= 1`

**Indexes:**

| Name | Columns | Rationale |
|------|---------|-----------|
| `ix_tasks_project_status_position` | project_id, status, position | Board ordering within project |
| `ix_tasks_assignee_status_due` | assignee_id, status, due_at | “My tasks” views |
| `ix_tasks_project_created` | project_id, created_at | Recent tasks in project |
| `ix_tasks_parent_task_id` | parent_task_id | Subtask lookups |

**Deletion policy:** Deleting a task CASCADEs comments, attachments, dependency edges, and `task_labels` rows. Deleting assignee user SET NULL on `assignee_id`.

---

### 4.6 `task_dependencies`

Directed edge: **`task_id` depends on `depends_on_task_id`** (prerequisite must complete first).

| Column | Type | Nullable |
|--------|------|----------|
| `task_id` | UUID | NO | PK, FK → `tasks.id` **CASCADE** |
| `depends_on_task_id` | UUID | NO | PK, FK → `tasks.id` **CASCADE** |
| `created_at` | TIMESTAMPTZ | NO |

**Constraints:**

- Composite PK (`task_id`, `depends_on_task_id`) — prevents duplicate edges
- `ck_task_dependencies_no_self`: `task_id <> depends_on_task_id`

**Indexes:** `ix_task_dependencies_depends_on_task_id` — reverse “what depends on this task?”

**Application logic:** Cycle detection in `app/services/task_dependencies.py` (BFS); DB does not enforce acyclic graph.

**Deletion policy:** Deleting either task removes incident dependency rows (CASCADE).

---

### 4.7 `labels`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `workspace_id` | UUID | NO | FK → `workspaces.id` **CASCADE** |
| `name` | VARCHAR(60) | NO |
| `color` | VARCHAR(20) | YES |
| `created_at` | TIMESTAMPTZ | NO |

**Constraints:** `uq_labels_workspace_name` UNIQUE (`workspace_id`, `name`)

**Indexes:** `ix_labels_workspace_id` on `workspace_id`

**Application note:** Task and label must belong to the same workspace (validated in services when APIs exist — no cross-workspace FK today).

---

### 4.8 `task_labels` (association)

| Column | Type | Nullable |
|--------|------|----------|
| `task_id` | UUID | NO | PK, FK → `tasks.id` **CASCADE** |
| `label_id` | UUID | NO | PK, FK → `labels.id` **CASCADE** |

**Indexes:** `ix_task_labels_label_id` — list tasks by label

---

### 4.9 `comments`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `task_id` | UUID | NO | FK → `tasks.id` **CASCADE** |
| `author_id` | UUID | NO | FK → `users.id` **RESTRICT** |
| `body` | TEXT | NO |
| `created_at` | TIMESTAMPTZ | NO |
| `updated_at` | TIMESTAMPTZ | NO |
| `deleted_at` | TIMESTAMPTZ | YES | Soft delete |

**Indexes:** `ix_comments_task_created` (`task_id`, `created_at`)

---

### 4.10 `workspace_invitations`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `workspace_id` | UUID | NO | FK → `workspaces.id` **CASCADE** |
| `invited_email` | VARCHAR(320) | NO | Normalized lowercase |
| `role` | VARCHAR(20) | NO | default `member` |
| `token_hash` | TEXT | NO | Raw token never stored |
| `invited_by` | UUID | NO | FK → `users.id` **RESTRICT** |
| `expires_at` | TIMESTAMPTZ | NO |
| `accepted_at` | TIMESTAMPTZ | YES |
| `created_at` | TIMESTAMPTZ | NO |

**Constraints:**

- `ck_workspace_invitations_role`: owner, admin, member, viewer
- **Partial unique index** `uq_workspace_invitations_workspace_email_pending` on (`workspace_id`, `invited_email`) **WHERE `accepted_at IS NULL`** — one pending invite per email per workspace

**Indexes:** `ix_workspace_invitations_workspace_id`

---

### 4.11 `attachments`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `task_id` | UUID | NO | FK → `tasks.id` **CASCADE** |
| `uploaded_by` | UUID | NO | FK → `users.id` **RESTRICT** |
| `storage_key` | TEXT | NO | Server-generated path/key (T045) |
| `original_filename` | VARCHAR(255) | NO |
| `content_type` | VARCHAR(150) | YES |
| `size_bytes` | BIGINT | NO |
| `checksum` | VARCHAR(128) | YES |
| `created_at` | TIMESTAMPTZ | NO |

**Indexes:** `ix_attachments_task_id`

**Note:** File bytes are not stored in PostgreSQL.

---

### 4.12 `notifications`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `recipient_id` | UUID | NO | FK → `users.id` **CASCADE** |
| `workspace_id` | UUID | YES | FK → `workspaces.id` **SET NULL** |
| `type` | VARCHAR(80) | NO |
| `title` | VARCHAR(200) | NO |
| `body` | TEXT | YES |
| `payload` | JSONB | YES |
| `read_at` | TIMESTAMPTZ | YES |
| `created_at` | TIMESTAMPTZ | NO |

**Indexes:** `ix_notifications_recipient_read_created` (`recipient_id`, `read_at`, `created_at` DESC)

**JSONB policy:** Do not store secrets or full document bodies in `payload`.

---

### 4.13 `activity_logs`

| Column | Type | Nullable |
|--------|------|----------|
| `id` | UUID | NO | PK |
| `workspace_id` | UUID | NO | FK → `workspaces.id` **CASCADE** |
| `actor_id` | UUID | YES | FK → `users.id` **SET NULL** |
| `entity_type` | VARCHAR(80) | NO |
| `entity_id` | UUID | NO | **No FK** (polymorphic reference) |
| `action` | VARCHAR(100) | NO |
| `metadata` | JSONB | YES | ORM attribute: `activity_metadata` |
| `created_at` | TIMESTAMPTZ | NO |

**Indexes:**

- `ix_activity_logs_workspace_created` (`workspace_id`, `created_at` DESC)
- `ix_activity_logs_entity_created` (`entity_type`, `entity_id`, `created_at` DESC)

**Polymorphic trade-off:** `entity_id` is not validated by the database; services must ensure `(entity_type, entity_id)` points to an entity the actor may access.

---

## 5. Deletion policy matrix

| Child table | Parent | ON DELETE | Rationale |
|-------------|--------|-----------|-----------|
| `workspace_memberships` | `workspaces` | CASCADE | Membership is scoped to workspace |
| `workspace_memberships` | `users` | CASCADE | Remove memberships when user deleted |
| `projects` | `workspaces` | CASCADE | Projects belong to workspace |
| `tasks` | `projects` | CASCADE | Tasks belong to project |
| `tasks` | `tasks` (parent) | SET NULL | Subtasks become top-level |
| `tasks.creator_id` | `users` | RESTRICT | Preserve creator attribution |
| `tasks.assignee_id` | `users` | SET NULL | Task remains without assignee |
| `comments` | `tasks` | CASCADE | |
| `comments.author_id` | `users` | RESTRICT | |
| `attachments` | `tasks` | CASCADE | |
| `attachments.uploaded_by` | `users` | RESTRICT | |
| `task_dependencies` | `tasks` | CASCADE | Both FK columns |
| `task_labels` | `tasks` / `labels` | CASCADE | |
| `labels` | `workspaces` | CASCADE | |
| `workspace_invitations` | `workspaces` | CASCADE | |
| `workspace_invitations.invited_by` | `users` | RESTRICT | |
| `notifications` | `users` (recipient) | CASCADE | |
| `notifications` | `workspaces` | SET NULL | Keep notification, drop workspace link |
| `activity_logs` | `workspaces` | CASCADE | |
| `activity_logs.actor_id` | `users` | SET NULL | Keep audit row, anonymize actor |
| `workspaces.created_by` | `users` | RESTRICT | |
| `projects.created_by` | `users` | RESTRICT | |

---

## 6. Index rationale (summary)

Indexes were added for **known access patterns** from the master plan (listing, filtering, feeds)—not on every column. Further tuning belongs to Phase 6 (T050–T056) with `EXPLAIN (ANALYZE, BUFFERS)`.

| Area | Index | Purpose |
|------|-------|---------|
| Projects | `ix_projects_workspace_status_created` | Workspace project lists |
| Tasks | `ix_tasks_project_status_position` | Kanban-style boards |
| Tasks | `ix_tasks_assignee_status_due` | Assignee dashboards |
| Comments | `ix_comments_task_created` | Comment thread order |
| Task labels | `ix_task_labels_label_id` | Tasks by label |
| Dependencies | `ix_task_dependencies_depends_on_task_id` | Dependent task lookup |
| Invitations | partial unique + workspace_id | Pending invite uniqueness |
| Notifications | recipient + read + created | Inbox / unread queries |
| Activity | workspace / entity composite | Activity feed |

---

## 7. Not yet implemented (future tasks)

The following are specified in `MASTER_PLAN.md` but **not** in the current migration chain:

| Area | Tables | Planned task |
|------|--------|--------------|
| Auth | `refresh_sessions`, password-reset tokens | T030–T032, T035 |
| Profile | `user_profiles` | Optional / later |
| AI | `ai_conversations`, `ai_messages`, `documents`, `document_chunks`, `ai_usage_events` | T070+ |
| Jobs | `job_records`, optional `outbox_events` | T080+ |

---

## 8. Review notes (T026)

### Verified

- Alembic linear history through head `81b6971b315b`.
- Fifteen application tables match SQLAlchemy models under `app/models/`.
- Check constraints align with master plan enums for roles, task status, project status.
- Task dependency cycles handled in `app/services/task_dependencies.py`.

### Fixes applied during review

- **ORM:** `Workspace.invitations`, `Workspace.activity_logs`, and `Workspace.notifications` relationships were mistakenly declared on `WorkspaceMembership`; moved to `Workspace` so `back_populates` matches invitation/notification/activity models.

### Known limitations

- `46b51efa82b3` is an empty migration kept for history; safe to leave in place.
- Label–task workspace consistency is application-enforced only.
- No partial index on “open tasks only” yet (optional optimization per master plan §6.7).

---

## 9. Verification commands

```bash
# Migration status
uv run alembic heads
uv run alembic current
uv run alembic upgrade head

# List tables (requires running Postgres)
uv run python -c "
from sqlalchemy import inspect
from app.db.session import engine
print(sorted(inspect(engine).get_table_names()))
"
```

Expected tables (15): `activity_logs`, `alembic_version`, `attachments`, `comments`, `labels`, `notifications`, `projects`, `task_dependencies`, `task_labels`, `tasks`, `users`, `workspace_invitations`, `workspace_memberships`, `workspaces`

---

**Last updated:** 2026-11-24 (Task T026)