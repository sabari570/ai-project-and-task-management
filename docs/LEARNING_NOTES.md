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