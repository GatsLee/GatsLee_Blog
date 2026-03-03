#!/bin/sh
set -e

DB_PATH="/app/prisma/blog.db"

# Ensure the migrations table exists (idempotent)
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

if [ ! -f "$DB_PATH" ] || [ "$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM _prisma_migrations;")" = "0" ]; then
  echo "[entrypoint] Fresh database — applying all migrations..."
  FRESH=1
else
  echo "[entrypoint] Existing database — applying pending migrations..."
  FRESH=0
fi

# Apply any migration not already recorded in _prisma_migrations
for dir in /app/prisma/migrations/*/; do
  migration_name=$(basename "$dir")
  if [ "$migration_name" = "migration_lock.toml" ]; then continue; fi

  sql_file="$dir/migration.sql"
  if [ ! -f "$sql_file" ]; then continue; fi

  ALREADY_APPLIED=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name='$migration_name';")
  if [ "$ALREADY_APPLIED" = "0" ]; then
    echo "[entrypoint] Applying migration: $migration_name"
    sqlite3 "$DB_PATH" < "$sql_file"
    sqlite3 "$DB_PATH" "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (lower(hex(randomblob(16))), '', datetime('now'), '$migration_name', 1);"
  else
    echo "[entrypoint] Skipping already applied: $migration_name"
  fi
done

echo "[entrypoint] Migrations complete."

# Ensure admin user exists
ADMIN_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM AdminUser WHERE username='${ADMIN_USERNAME}';")
if [ "$ADMIN_EXISTS" = "0" ]; then
  echo "[entrypoint] Creating admin user..."
  DB_PATH="$DB_PATH" node /app/init-admin.js
fi

echo "[entrypoint] Starting server..."
exec node server.js
