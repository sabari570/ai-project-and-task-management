# ProjectHub AI — Learning Notes

## T013 — Alembic Initialization and Migrations

### What is a database migration?

A database migration is a version-controlled change to the database
structure.

Examples:
- Creating a table.
- Adding a column.
- Removing a column.
- Adding a database constraint.

### What is Alembic?

Alembic is a database migration tool commonly used with SQLAlchemy.

It keeps track of database schema changes through migration files.

### Important files

- `alembic.ini`: Main Alembic configuration.
- `alembic/env.py`: Connects Alembic to application settings and models.
- `alembic/script.py.mako`: Template for new migration files.
- `alembic/versions/`: Stores migration history.

### Important commands

- Suppose you want to create a new model and then migrate it to DB, first create the model in the app/models/ directory

- Then register the model with SQLAlechmy by adding the model to app/models/__init__.py file

- After that run this command from your project root to generate a migraton file successfully:
    uv run alembic revision --autogenerate -m "create tasks table"

- Then Apply all pending migrations:

    uv run alembic upgrade head

Show migration history:

    uv run alembic history

Show the current database migration:

    uv run alembic current

Reverse all migrations:

    uv run alembic downgrade base

### Upgrade and downgrade

Upgrade applies database changes.

Downgrade reverses database changes.

The initial ProjectHub AI migration creates the users table.

### Important rule

Do not create or modify database tables automatically
when the FastAPI application starts.

Use Alembic migration commands to manage schema changes.


## T014 — CRUD Services and Transaction Boundaries

### 1. Application layers

- API routes handle HTTP requests, validation and HTTP responses.
- Services contain business operations and database transaction logic.
- SQLAlchemy models represent database tables.
- The database session dependency creates and closes request sessions.

### 2. CRUD operations

CRUD means:

- Create: insert a record.
- Read: retrieve a record.
- Update: modify a record.
- Delete: remove a record.

The User service implements these operations.

### 3. Transaction management

A transaction groups database operations into one coherent unit.

- Commit saves successful changes.
- Rollback cancels uncommitted changes after failure.
- A failed database write must not leave a partially applied operation.

### 4. Session management

The get_db dependency creates one session per request.

The service owns write commits and rollbacks.
The dependency owns session cleanup.

### 5. Response schemas

UserResponse controls the fields returned by the API.
The password_hash field must never appear in API responses.

### 6. Important commands

Run the application:

    uv run uvicorn app.main:app --reload

Check Alembic:

    uv run alembic current

Run existing tests:

    uv run pytest -q

### 7. Scope boundary

Public registration and password hashing belong to T030.
Authentication and protected routes belong to later authentication tasks.