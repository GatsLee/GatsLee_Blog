# Security Audit Report - CRITICAL ISSUES FOUND

## 🔴 CRITICAL Vulnerabilities

### 1. SQL Injection in init-admin.js (SEVERITY: CRITICAL)
**Location:** `init-admin.js:17`
```javascript
const sql = `DELETE FROM AdminUser WHERE username='${username}';\nINSERT INTO AdminUser (username, passwordHash) VALUES ('${username}', '${hash}');`;
```

**Issue:** Direct string interpolation allows SQL injection through ADMIN_USERNAME environment variable.

**Exploit Example:**
```bash
ADMIN_USERNAME="admin'; DROP TABLE Post; --"
```

**Fix Required:**
```javascript
// Use parameterized queries instead
const tmpSqlFile = '/tmp/init-admin.sql';
fs.writeFileSync(tmpSqlFile, `
DELETE FROM AdminUser WHERE username=?;
INSERT INTO AdminUser (username, passwordHash) VALUES (?, ?);
`);

// Execute with parameters
execFileSync('sqlite3', [
  DB_PATH,
  `-cmd`,
  `.param set 1 "${username}"`,
  `.param set 2 "${username}"`,
  `.param set 3 "${hash}"`,
  `.read ${tmpSqlFile}`
]);
```

### 2. Sensitive Data in Docker Volume (SEVERITY: HIGH)
**Location:** `/var/lib/docker/volumes/blog_blog-data/_data/seed.ts`

**Issue:** seed.ts still exists in Docker volume with:
- Default password: "admin123"
- Sample data structure revealing schema

**Fix Required:**
```bash
# Delete seed.ts from Docker volume immediately
docker run --rm -v blog_blog-data:/data alpine rm -f /data/seed.ts
```

### 3. Credentials in Version Control (SEVERITY: HIGH)
**Location:** `.env` file

**Exposed Data:**
- `ADMIN_PASSWORD="a@9051561"` (plain text)
- `JWT_SECRET="1fkwjnfdlkwj334l1j39fd0j3dlkedj1lkjq202idk1w"`
- Database paths

**Fix Required:**
1. Add `.env` to `.gitignore` (if not already)
2. Use `.env.example` with placeholder values
3. Rotate JWT_SECRET immediately
4. Change admin password

## 🟡 MEDIUM Vulnerabilities

### 4. No Input Validation (SEVERITY: MEDIUM)
**Location:** `init-admin.js`, `entrypoint.sh`

**Issue:** No validation of:
- Username format (allows special characters)
- Password strength requirements
- Environment variable existence

**Fix Required:**
```javascript
// Add validation in init-admin.js
if (!username || !password) {
  console.error('[init-admin] ADMIN_USERNAME and ADMIN_PASSWORD must be set');
  process.exit(1);
}

if (username.length < 3 || username.length > 20) {
  console.error('[init-admin] Username must be 3-20 characters');
  process.exit(1);
}

if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
  console.error('[init-admin] Username can only contain alphanumeric, underscore, and dash');
  process.exit(1);
}

if (password.length < 8) {
  console.error('[init-admin] Password must be at least 8 characters');
  process.exit(1);
}
```

### 5. Weak Default Credentials (SEVERITY: MEDIUM)
**Location:** `seed.ts` (in Docker volume)

**Issue:** Fallback password "admin123" is extremely weak

**Fix:** Already addressed by deleting seed.ts

## 🟢 LOW Vulnerabilities

### 6. Database File Permissions (SEVERITY: LOW)
**Location:** Docker volume

**Issue:** No explicit permission restrictions on database files

**Recommendation:**
```bash
# In entrypoint.sh, after DB creation:
chmod 600 "$DB_PATH"
```

### 7. No Rate Limiting on Admin Creation (SEVERITY: LOW)
**Issue:** Admin user creation script has no rate limiting

**Recommendation:** Consider adding exponential backoff or locking mechanism

## 📋 Immediate Action Items

### Priority 1 (Do Now):
1. ✅ Delete seed.ts from Docker volume
2. ✅ Fix SQL injection in init-admin.js
3. ✅ Rotate JWT_SECRET
4. ✅ Change ADMIN_PASSWORD
5. ✅ Ensure .env is in .gitignore

### Priority 2 (Do Soon):
1. Add input validation to init-admin.js
2. Implement password strength requirements
3. Add rate limiting for admin operations
4. Set strict file permissions on database

### Priority 3 (Do Eventually):
1. Implement secrets management (e.g., Docker secrets, HashiCorp Vault)
2. Add security headers to Next.js
3. Implement CSRF protection
4. Add audit logging for admin actions
5. Regular security dependency updates

## 🔒 Best Practices Recommendations

1. **Never commit .env files** - Use .env.example instead
2. **Use parameterized queries** - Never string interpolation for SQL
3. **Rotate secrets regularly** - Especially after exposure
4. **Implement principle of least privilege** - Database permissions
5. **Add security monitoring** - Log suspicious activities
6. **Use secrets management** - For production environments
7. **Regular security audits** - Automated and manual
8. **Keep dependencies updated** - npm audit fix regularly

## 📊 Risk Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1 | ⚠️ Needs immediate fix |
| HIGH | 2 | ⚠️ Needs immediate fix |
| MEDIUM | 2 | ⚠️ Should fix soon |
| LOW | 2 | ℹ️ Monitor |

**Overall Risk Level:** 🔴 **HIGH** - Immediate action required
