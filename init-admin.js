#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { execFileSync } = require('child_process');

const DB_PATH = process.env.DB_PATH || '/app/prisma/blog.db';
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

// Input validation
function validateInputs() {
  if (!username || !password) {
    console.error('[init-admin] ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set');
    process.exit(1);
  }

  if (username.length < 3 || username.length > 20) {
    console.error('[init-admin] ERROR: Username must be 3-20 characters');
    process.exit(1);
  }

  // Only allow alphanumeric, underscore, and dash
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    console.error('[init-admin] ERROR: Username can only contain letters, numbers, underscore, and dash');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[init-admin] ERROR: Password must be at least 8 characters');
    process.exit(1);
  }
}

async function initAdmin() {
  try {
    // Validate inputs first
    validateInputs();

    // Generate bcrypt hash
    const hash = await bcrypt.hash(password, 10);

    // Use a safer approach: escape single quotes in username
    // This prevents SQL injection while maintaining compatibility
    const escapedUsername = username.replace(/'/g, "''");
    const escapedHash = hash.replace(/'/g, "''");

    // Create a temporary SQL file
    const tmpSqlFile = '/tmp/init-admin.sql';
    const sql = `DELETE FROM AdminUser WHERE username='${escapedUsername}';\nINSERT INTO AdminUser (username, passwordHash) VALUES ('${escapedUsername}', '${escapedHash}');`;

    fs.writeFileSync(tmpSqlFile, sql);

    // Execute SQL file
    execFileSync('sqlite3', [DB_PATH, `.read ${tmpSqlFile}`], { stdio: 'inherit' });

    // Clean up
    fs.unlinkSync(tmpSqlFile);

    console.log(`[init-admin] Admin user '${username}' created/updated successfully.`);
  } catch (error) {
    console.error('[init-admin] Error:', error.message);
    process.exit(1);
  }
}

initAdmin();
