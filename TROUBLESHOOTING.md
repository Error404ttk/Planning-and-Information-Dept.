# Troubleshooting Guide

## Common Issues and Solutions

### 1. 502 Bad Gateway Error

**Symptoms**:
```
GET https://it.sarapeehospital.go.th/ 502 (Bad Gateway)
```

**Causes**:
- Backend not running
- Prisma Client not generated
- Nginx/Apache misconfiguration

**Solution**:

```bash
# 1. Check PM2 status
pm2 list

# 2. Check backend logs
pm2 logs saraphi-backend --lines 50

# 3. If Prisma error, regenerate client
cd /home/Planning-and-Information-Dept./server
npx prisma generate

# 4. Restart backend
pm2 restart saraphi-backend

# 5. Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

---

### 2. Prisma Client Error

**Symptoms**:
```
Error: Cannot find module '@prisma/client/runtime/library.js'
```

**Cause**: Prisma Client not generated after installation

**Solution**:

```bash
# IMPORTANT: Must run in server directory!
cd /home/Planning-and-Information-Dept./server

# Clean install
rm -rf node_modules package-lock.json
npm install
npm install @prisma/client

# Generate Prisma Client
npx prisma generate

# Verify installation
ls -la node_modules/.prisma/client/

# Restart PM2
pm2 restart saraphi-backend
```

**Key Points**:
- ✅ Always run `npx prisma generate` in `/server` directory
- ✅ Run after every `npm install`
- ✅ Run after schema changes
- ✅ Run after pulling new code

---

### 3. 429 Too Many Requests

**Symptoms**:
```
Failed to load resource: the server responded with a status of 429
```

**Cause**: Rate limiting triggered (React Strict Mode doubles requests in development)

**Solution**: Already fixed in code - rate limits are higher in development mode

```typescript
// server/src/index.ts
max: process.env.NODE_ENV === 'production' ? 100 : 500
```

**Workaround**: Hard refresh browser (`Cmd+Shift+R` or `Ctrl+Shift+R`)

---

### 4. CORS Error

**Symptoms**:
```
Access to fetch at 'https://it.sarapeehospital.go.th/api/...' has been blocked by CORS policy
```

**Cause**: CORS_ORIGIN not configured correctly

**Solution**:

```bash
# Edit server/.env
nano server/.env

# Set correct origin
CORS_ORIGIN=https://it.sarapeehospital.go.th

# Restart backend
pm2 restart saraphi-backend
```

---

### 5. File Upload Error

**Symptoms**:
```
Error: File type not allowed!
```

**Cause**: File type not in allowed list

**Allowed Types**:
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`
- Spreadsheets: `.xls`, `.xlsx`

**Solution**: Use allowed file types or update `server/src/routes/upload.ts`

---

### 6. 500 Internal Server Error (Behind Reverse Proxy)

**Symptoms**:
```
GET https://it.sarapeehospital.go.th/api/* 500 (Internal Server Error)
```

**Error in logs**:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
code: 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR'
```

**Cause**: Server behind Cloudflare + Apache/Nginx but Express not configured to trust proxy

**Solution**:

**Step 1: Fix Express Configuration** (Already done in code):
```typescript
// server/src/index.ts
// Set to 2 for Cloudflare + Apache/Nginx (2 proxy hops)
app.set('trust proxy', 2);
```

**Step 2: Configure Apache** (Must do on server):

Edit `/etc/apache2/sites-available/it.sarapeehospital.go.th.conf`:

```apache
<VirtualHost *:80>
    ServerName it.sarapeehospital.go.th
    
    # Uploads directory
    Alias /uploads /home/Planning-and-Information-Dept./server/uploads
    <Directory /home/Planning-and-Information-Dept./server/uploads>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        Header set Access-Control-Allow-Origin "*"
    </Directory>
    
    # IMPORTANT: Proxy headers MUST be before ProxyPass
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
    RequestHeader set X-Forwarded-Proto "https"
    
    # Backend API
    ProxyPass /api/ http://localhost:3007/api/
    ProxyPassReverse /api/ http://localhost:3007/api/
    
    # Frontend
    ProxyPass / http://192.168.99.221:5173/
    ProxyPassReverse / http://192.168.99.221:5173/
</VirtualHost>
```

**Step 3: Enable Required Apache Modules**:
```bash
a2enmod proxy proxy_http headers
systemctl restart apache2
```

**Step 4: Verify**:
```bash
# Test from server
curl http://localhost/api/auth/me
curl https://it.sarapeehospital.go.th/api/auth/me

# Check logs
pm2 logs saraphi-backend --lines 10
tail -n 20 /var/log/apache2/error.log
```

**Common Mistakes**:
- ❌ Proxy headers placed **after** `</VirtualHost>` (ignored by Apache)
- ❌ Proxy headers placed **after** `ProxyPass` directives (too late)
- ❌ Proxy modules not enabled
- ❌ Using `trust proxy: true` instead of specific number

---

### 7. Database Connection Error

**Symptoms**:
```
Error: Can't reach database server
```

**Solution**:

```bash
# Check DATABASE_URL in .env
cat server/.env | grep DATABASE_URL

# Test connection
mysql -u username -p -h host database_name

# Verify migrations
cd server
npx prisma migrate deploy
```

---

### 7. PM2 Process Keeps Crashing

**Symptoms**: PM2 shows status "errored" or keeps restarting

**Solution**:

```bash
# Stop all PM2 processes
pm2 stop all

# Check logs for errors
pm2 logs saraphi-backend --lines 100

# Common fixes:
# 1. Regenerate Prisma Client
cd /home/Planning-and-Information-Dept./server
npx prisma generate

# 2. Check .env file exists
ls -la .env

# 3. Verify node_modules
npm install

# 4. Start fresh
pm2 delete all
pm2 start ecosystem.config.cjs
pm2 save
```

---

## Quick Diagnostic Commands

```bash
# Check all services
pm2 list
sudo systemctl status nginx

# Check backend
curl http://localhost:3007/api/resources

# Check frontend
curl http://localhost:3007/

# Check logs
pm2 logs saraphi-backend --lines 50
tail -f /var/log/nginx/error.log

# Check ports
netstat -tulpn | grep 3007
lsof -i :3007
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Update `DATABASE_URL` in `.env`
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Set `CORS_ORIGIN=https://it.sarapeehospital.go.th` in `.env`
- [ ] Generate new `JWT_SECRET`
- [ ] Run `npm install` in server
- [ ] Run `npx prisma generate` in server
- [ ] Run `npx prisma migrate deploy` in server
- [ ] Build frontend: `npm run build`
- [ ] Configure Nginx/Apache
- [ ] Setup SSL certificate
- [ ] Start PM2: `pm2 start ecosystem.config.cjs`
- [ ] Save PM2: `pm2 save`
- [ ] Setup auto-start: `pm2 startup`

---

## Important Notes

### Directory Structure

```
/home/Planning-and-Information-Dept./
├── server/                    ← Backend code
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   ├── .env                   ← Environment variables (DO NOT commit)
│   └── package.json
├── dist/                      ← Built frontend
├── ecosystem.config.cjs       ← PM2 configuration
└── DEPLOYMENT.md
```

### Critical Commands Must Run in Correct Directory

**In `/home/Planning-and-Information-Dept./server`**:
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm install`

**In `/home/Planning-and-Information-Dept.`**:
- `pm2 start ecosystem.config.cjs`
- `npm run build`

---

## Getting Help

1. Check logs: `pm2 logs saraphi-backend`
2. Check this troubleshooting guide
3. See `DEPLOYMENT.md` for deployment steps
4. See `deployment_guide.md` (in artifacts) for detailed guide

---

**Last Updated**: 2025-11-24
