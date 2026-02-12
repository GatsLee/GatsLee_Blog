#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { execFileSync } = require('child_process');

const DB_PATH = process.env.DB_PATH || '/app/prisma/blog.db';
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

async function initAdmin() {
  try {
    // Generate bcrypt hash
    const hash = await bcrypt.hash(password, 10);

    // Create a temporary SQL file to avoid shell interpolation issues
    const tmpSqlFile = '/tmp/init-admin.sql';
    const sql = `DELETE FROM AdminUser WHERE username='${username}';\nINSERT INTO AdminUser (username, passwordHash) VALUES ('${username}', '${hash}');`;

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
