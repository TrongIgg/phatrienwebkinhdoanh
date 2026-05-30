import logging
import sqlite3
from pathlib import Path
from typing import Any

from app.core.config import settings

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ModuleNotFoundError:  # Allows API smoke tests to run without local PostgreSQL driver.
    psycopg2 = None
    RealDictCursor = None

logger = logging.getLogger(__name__)


class DatabaseClient:
    """
    Small database adapter for the demo backend.

    SQLite is the default local database so the project can run without a
    separate service. PostgreSQL support is kept for the original schema-first
    direction.
    """

    def __init__(self):
        self.database_url = settings.database_url or "sqlite:///db/tho_demo.sqlite"
        self.backend_root = Path(__file__).resolve().parents[2]
        self.project_root = Path(__file__).resolve().parents[3]
        self.is_sqlite = self.database_url.startswith("sqlite:///")
        if self.is_sqlite:
            self.sqlite_path = self._sqlite_path(self.database_url)
            self._init_sqlite()

    def _sqlite_path(self, database_url: str) -> Path:
        raw_path = database_url.replace("sqlite:///", "", 1)
        return Path(raw_path)

    def _get_connection(self):
        if self.is_sqlite:
            self.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
            conn = sqlite3.connect(str(self.sqlite_path))
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON")
            return conn

        if psycopg2 is None:
            raise RuntimeError("psycopg2 is not installed; using demo fallback data")
        return psycopg2.connect(self.database_url)

    def _init_sqlite(self) -> None:
        schema_path = self.backend_root / "db" / "03_sqlite_schema.sql"
        if not schema_path.exists():
            schema_path = self.project_root / "db" / "03_sqlite_schema.sql"
        if not schema_path.exists():
            logger.warning("SQLite schema not found: %s", schema_path)
            return

        self.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(str(self.sqlite_path)) as conn:
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON")
            conn.executescript(schema_path.read_text(encoding="utf-8"))
            conn.commit()

    def _rows_to_dicts(self, rows: list[Any]) -> list[dict]:
        return [dict(row) for row in rows]

    def fetch_all(self, query: str, params: dict[str, Any] | tuple | None = None) -> list[dict]:
        logger.info("Executing fetch query: %s | params=%s", query.strip(), params)
        try:
            with self._get_connection() as conn:
                if self.is_sqlite:
                    cur = conn.execute(query, params or ())
                    return self._rows_to_dicts(cur.fetchall())

                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(query, params)
                    return cur.fetchall()
        except Exception as e:
            logger.error("DB fetch error: %s", e)
            return []

    def fetch_one(self, query: str, params: dict[str, Any] | tuple | None = None) -> dict | None:
        try:
            with self._get_connection() as conn:
                if self.is_sqlite:
                    cur = conn.execute(query, params or ())
                    row = cur.fetchone()
                    return dict(row) if row else None

                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(query, params)
                    return cur.fetchone()
        except Exception as e:
            logger.error("DB fetch_one error: %s", e)
            return None

    def execute(self, query: str, params: dict[str, Any] | tuple | None = None) -> None:
        logger.info("Executing command: %s | params=%s", query.strip(), params)
        try:
            with self._get_connection() as conn:
                if self.is_sqlite:
                    conn.execute(query, params or ())
                    conn.commit()
                    return

                with conn.cursor() as cur:
                    cur.execute(query, params)
                conn.commit()
        except Exception as e:
            logger.error("DB execute error: %s", e)

    def insert(self, query: str, params: dict[str, Any] | tuple | None = None) -> int:
        logger.info("Executing insert: %s | params=%s", query.strip(), params)
        try:
            with self._get_connection() as conn:
                if self.is_sqlite:
                    cur = conn.execute(query, params or ())
                    conn.commit()
                    return int(cur.lastrowid)

                with conn.cursor() as cur:
                    cur.execute(query, params)
                    conn.commit()
                    return int(cur.fetchone()[0])
        except Exception as e:
            logger.error("DB insert error: %s", e)
            return 0


db_client = DatabaseClient()
