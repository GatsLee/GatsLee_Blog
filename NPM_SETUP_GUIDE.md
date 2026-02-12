# Nginx Proxy Manager Setup Guide

Since you're already using **Nginx Proxy Manager (NPM)**, this is much simpler! NPM will handle SSL certificates and reverse proxying automatically.

## Overview

```
Internet → blog.gatslee.com
              ↓
       DNS A Record
              ↓
       Your Server IP
              ↓
   Nginx Proxy Manager (Ports 80/443)
              ↓
   Blog Container (Port 3001 internal)
```

## Step-by-Step Setup

### Step 1: Stop Current Traefik Setup

Since we don't need Traefik with NPM:

```bash
cd /home/gatslee/Desktop/docker/blog
docker compose -f docker-compose.prod.yml down
```

### Step 2: Start Blog with NPM Configuration

```bash
# Use the NPM-compatible docker-compose
docker compose -f docker-compose.npm.yml up -d

# Verify it's running
docker compose -f docker-compose.npm.yml ps
```

The blog is now running on the `proxy-net` network that NPM can access.

### Step 3: Configure DNS

Add an A record for your domain:

```
Type: A
Name: blog
Value: <YOUR_SERVER_IP>
TTL: 300
```

**Find your server IP:**
```bash
curl ifconfig.me
```

**Verify DNS (wait 5-10 minutes):**
```bash
dig blog.gatslee.com
```

### Step 4: Add Proxy Host in NPM

1. **Open Nginx Proxy Manager**
   - Usually at: `http://your-server-ip:81`
   - Login with your NPM credentials

2. **Click "Proxy Hosts" → "Add Proxy Host"**

3. **Configure the Details tab:**
   ```
   Domain Names: blog.gatslee.com
   Scheme: http
   Forward Hostname / IP: blog
   Forward Port: 3001
   Cache Assets: ✓ (optional)
   Block Common Exploits: ✓ (recommended)
   Websockets Support: ✓ (optional)
   ```

4. **Configure the SSL tab:**
   ```
   SSL Certificate: Request a new SSL Certificate
   Force SSL: ✓ (redirect HTTP to HTTPS)
   HTTP/2 Support: ✓
   HSTS Enabled: ✓ (optional, recommended)

   Email Address for Let's Encrypt: your-email@example.com

   ✓ I Agree to the Let's Encrypt Terms of Service
   ```

5. **Click "Save"**

NPM will automatically:
- Request an SSL certificate from Let's Encrypt
- Configure HTTPS
- Set up HTTP → HTTPS redirect
- Renew certificates automatically

### Step 5: Verify Setup

1. **Wait 30-60 seconds** for SSL certificate generation

2. **Visit your blog:**
   ```
   https://blog.gatslee.com
   ```

3. **Check for:**
   - 🔒 Green padlock in browser
   - Valid SSL certificate
   - Your blog loads correctly

## Troubleshooting

### Blog Not Accessible

```bash
# Check blog container is running
docker compose -f docker-compose.npm.yml ps

# Check blog logs
docker logs blog -f

# Test blog internally
docker compose -f docker-compose.npm.yml exec blog curl http://localhost:3001

# Verify blog is on proxy-net network
docker network inspect proxy-net | grep blog
```

### SSL Certificate Failed

In NPM:
1. Check "SSL Certificates" tab
2. Look for errors
3. Common issues:
   - DNS not propagated (wait 10 minutes)
   - Port 80/443 blocked (check firewall)
   - Email not valid

### NPM Can't Reach Blog

```bash
# Ensure blog is on proxy-net network
docker network inspect proxy-net

# Should show 'blog' container

# Restart blog if needed
docker compose -f docker-compose.npm.yml restart blog
```

## Common NPM Commands

### Update Blog

```bash
cd /home/gatslee/Desktop/docker/blog

# Rebuild and restart
docker compose -f docker-compose.npm.yml build blog
docker compose -f docker-compose.npm.yml up -d blog

# Check logs
docker logs blog -f
```

### View Blog Logs

```bash
docker logs blog -f
```

### Stop Blog

```bash
docker compose -f docker-compose.npm.yml down
```

### Start Blog

```bash
docker compose -f docker-compose.npm.yml up -d
```

## Advanced Configuration

### Custom NPM Settings (Optional)

In NPM Proxy Host → Advanced tab, you can add:

```nginx
# Increase upload size for images
client_max_body_size 50M;

# Better security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Optional: Rate limiting
limit_req_zone $binary_remote_addr zone=blog_limit:10m rate=10r/s;
limit_req zone=blog_limit burst=20 nodelay;
```

### Multiple Domains

To add `www.blog.gatslee.com`:

1. Add DNS A record for `www`
2. In NPM, edit the proxy host
3. Add to "Domain Names": `www.blog.gatslee.com`
4. Save

NPM will automatically handle SSL for both domains.

### Backup Configuration

NPM stores all configuration. To backup your blog data:

```bash
# Backup blog database
docker compose -f docker-compose.npm.yml exec blog cp /app/prisma/blog.db /tmp/backup.db
docker cp blog:/tmp/backup.db ./blog-backup-$(date +%Y%m%d).db

# Backup volume
docker run --rm -v blog_blog-data:/data -v $(pwd):/backup alpine tar czf /backup/blog-data-backup.tar.gz /data
```

## Security Checklist

- [x] NPM handles SSL automatically ✓
- [x] HTTP to HTTPS redirect ✓
- [ ] Strong admin password in `.env`
- [ ] Generate secure JWT secret
- [ ] Block Common Exploits enabled in NPM
- [ ] Force SSL enabled in NPM
- [ ] HSTS enabled in NPM (optional)
- [ ] Firewall allows only 80, 443, 22

### Generate Secure Secrets

```bash
# Create .env file
cp .env.example .env

# Generate JWT secret
openssl rand -base64 32

# Edit .env and add the generated secret
nano .env
```

## Network Architecture

Your blog is connected to both networks:

- **proxy-net** (external): NPM → Blog communication
- **default** (internal): Blog internal services

This allows NPM to reach the blog while keeping the blog isolated from direct internet access.

## Quick Reference

```bash
# Start blog
docker compose -f docker-compose.npm.yml up -d

# Stop blog
docker compose -f docker-compose.npm.yml down

# Restart blog
docker compose -f docker-compose.npm.yml restart blog

# View logs
docker logs blog -f

# Update blog
docker compose -f docker-compose.npm.yml build blog
docker compose -f docker-compose.npm.yml up -d blog

# Check status
docker compose -f docker-compose.npm.yml ps
```

## NPM Proxy Host Summary

**Quick Settings:**
```
Domain: blog.gatslee.com
Forward Host: blog
Forward Port: 3001
SSL: Request new certificate
Force SSL: Yes
```

That's it! NPM handles everything else automatically.

## Benefits of Using NPM

✅ **Easy GUI** - No config files needed
✅ **Automatic SSL** - Let's Encrypt integration
✅ **Auto-renewal** - Certificates renew automatically
✅ **Multiple domains** - Easy to manage
✅ **Access Lists** - Built-in authentication
✅ **Logs** - View access logs in NPM

---

**You're done!** Your blog should be live at `https://blog.gatslee.com` 🚀
