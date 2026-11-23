"""Business rules for task dependency edges."""

from collections import deque
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.task_dependency import TaskDependency


class TaskNotFoundError(Exception):
    """Raised when a task id does not exist."""


class SelfDependencyError(Exception):
    """Raised when a task would depend on itself."""


class DuplicateDependencyError(Exception):
    """Raised when the same dependency edge already exists."""


class DependencyCycleError(Exception):
    """Raised when a new edge would create a circular dependency."""


class TaskProjectMismatchError(Exception):
    """Raised when two tasks do not belong to the same project."""


def _get_task_or_raise(db: Session, task_id: UUID) -> Task:
    task = db.get(Task, task_id)

    if task is None:
        raise TaskNotFoundError(f"Task {task_id} was not found.")

    return task


def would_create_dependency_cycle(
    db: Session,
    *,
    task_id: UUID,
    depends_on_task_id: UUID,
) -> bool:
    """
  Return True if adding (task_id -> depends_on_task_id) closes a loop.

  Walk from depends_on_task_id along existing edges:
  each row (x, y) means x depends on y, so follow x's prerequisites.
  """
    if task_id == depends_on_task_id:
        return True

    visited: set[UUID] = set()
    queue: deque[UUID] = deque([depends_on_task_id])

    while queue:
        current = queue.popleft()

        if current == task_id:
            return True

        if current in visited:
            continue

        visited.add(current)

        statement = select(TaskDependency.depends_on_task_id).where(
            TaskDependency.task_id == current,
        )

        for prerequisite_id in db.scalars(statement):
            queue.append(prerequisite_id)

    return False


def list_task_dependencies(db: Session, task_id: UUID) -> list[TaskDependency]:
    """Return dependency rows where task_id is the dependent task."""
    _get_task_or_raise(db, task_id)

    statement = (
        select(TaskDependency)
        .where(TaskDependency.task_id == task_id)
        .order_by(
            TaskDependency.created_at,
            TaskDependency.depends_on_task_id,
        )
    )

    return list(db.scalars(statement).all())


def add_task_dependency(
    db: Session,
    *,
    task_id: UUID,
    depends_on_task_id: UUID,
) -> TaskDependency:
    """
    Add one dependency: task_id depends on depends_on_task_id.

    Raises domain errors before commit; IntegrityError still maps duplicates
    if two requests race.
    """
    if task_id == depends_on_task_id:
        raise SelfDependencyError("A task cannot depend on itself.")

    task = _get_task_or_raise(db, task_id)
    prerequisite = _get_task_or_raise(db, depends_on_task_id)

    if task.project_id != prerequisite.project_id:
        raise TaskProjectMismatchError(
            "Both tasks must belong to the same project.",
        )

    if would_create_dependency_cycle(
        db,
        task_id=task_id,
        depends_on_task_id=depends_on_task_id,
    ):
        raise DependencyCycleError(
            "This dependency would create a circular dependency chain.",
        )

    existing = db.get(
        TaskDependency,
        {"task_id": task_id, "depends_on_task_id": depends_on_task_id},
    )

    if existing is not None:
        raise DuplicateDependencyError("This dependency already exists.")

    dependency = TaskDependency(
        task_id=task_id,
        depends_on_task_id=depends_on_task_id,
    )

    db.add(dependency)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        message = str(exc.orig) if exc.orig is not None else str(exc)

        if "ck_task_dependencies_no_self" in message:
            raise SelfDependencyError("A task cannot depend on itself.") from exc

        if "task_dependencies_pkey" in message or "duplicate key" in message.lower():
            raise DuplicateDependencyError("This dependency already exists.") from exc

        raise

    db.refresh(dependency)

    return dependency


def remove_task_dependency(
    db: Session,
    *,
    task_id: UUID,
    depends_on_task_id: UUID,
) -> bool:
    """Remove one edge. Return False if the edge did not exist."""
    dependency = db.get(
        TaskDependency,
        {"task_id": task_id, "depends_on_task_id": depends_on_task_id},
    )

    if dependency is None:
        return False

    db.delete(dependency)
    db.commit()

    return True