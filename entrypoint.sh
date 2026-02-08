#!/bin/sh
set -e

DB_PATH="/app/prisma/blog.db"

if [ ! -f "$DB_PATH" ]; then
  echo "[entrypoint] Database not found. Creating and applying schema..."

  # Create the Prisma migrations table so Prisma client doesn't complain
  sqlite3 "$DB_PATH" <<'SQL'
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "checksum" TEXT NOT NULL,
  "finished_at" DATETIME,
  "migration_name" TEXT NOT NULL,
  "logs" TEXT,
  "rolled_back_at" DATETIME,
  "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
SQL

  # Apply each migration SQL file
  for dir in /app/prisma/migrations/*/; do
    migration_name=$(basename "$dir")
    if [ "$migration_name" = "migration_lock.toml" ]; then continue; fi

    sql_file="$dir/migration.sql"
    if [ -f "$sql_file" ]; then
      echo "[entrypoint] Applying migration: $migration_name"
      sqlite3 "$DB_PATH" < "$sql_file"

      # Record migration as applied
      sqlite3 "$DB_PATH" "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (lower(hex(randomblob(16))), '', datetime('now'), '$migration_name', 1);"
    fi
  done

  echo "[entrypoint] Schema applied."
else
  echo "[entrypoint] Database exists. Skipping migrations."
fi

echo "[entrypoint] Starting server..."
exec node server.js
