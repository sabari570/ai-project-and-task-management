import sys

import psycopg
from psycopg import OperationalError

from app.core.config import get_settings

# COMMANDS TO RUN THE POSTGRES DB FROM DOCKER
#       Command to start the postgres container: docker compose up -d postgres
#       Command to stop postgres: docker compose stop postgres
#       Command to start postgres: docker compose start postgres


def check_database_connection() -> bool:
    settings = get_settings()

    try:
        with psycopg.connect(
            settings.database_url,
            connect_timeout=5,
        ) as connection, connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()

        if result == (1,):
            print("Database connection successful.")
            print("PostgreSQL is ready for ProjectHub AI.")
            return True

        print("Database connection check returned an unexpected result.")
        return False

    except OperationalError:
        print(
            "Database connection failed. "
            "Check that PostgreSQL is running and DATABASE_URL is correct."
        )
        return False


if __name__ == "__main__":
    if not check_database_connection():
        sys.exit(1)