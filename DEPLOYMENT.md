# Production Deployment Checklist

## Before Deploying to https://it.sarapeehospital.go.th/

### 1. Environment Configuration

- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Update `DATABASE_URL` with production database credentials
- [ ] Change `NODE_ENV=production`
- [ ] Generate new `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set `CORS_ORIGIN=https://it.sarapeehospital.go.th`

### 2. Build & Dependencies

- [ ] Run `npm install --production` in root
- [ ] Run `npm install --production` in server
- [ ] Run `npm run build` to create production bundle
- [ ] Run `npx prisma generate` in server

### 3. Database

- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed: `npm run seed`
- [ ] Backup database before deployment

### 4. Web Server

- [ ] Install and configure Nginx or Apache
- [ ] Setup SSL certificate (Let's Encrypt recommended)
- [ ] Configure reverse proxy for `/api/` → `http://localhost:3007`
- [ ] Configure static file serving from `dist/`
- [ ] Configure uploads serving from `server/uploads/`

### 5. PM2 Setup

- [ ] Update `ecosystem.config.cjs` for production (set `watch: false`)
- [ ] Start backend: `pm2 start ecosystem.config.cjs --env production`
- [ ] Save PM2 list: `pm2 save`
- [ ] Setup auto-start: `pm2 startup`

### 6. Security

- [ ] Verify CORS settings
- [ ] Check rate limiting is enabled
- [ ] Ensure JWT_SECRET is strong and unique
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enable HTTPS only
- [ ] Configure firewall rules

### 7. Testing

- [ ] Test login functionality
- [ ] Test file upload
- [ ] Test file download and tracking
- [ ] Test all API endpoints
- [ ] Check SSL certificate validity
- [ ] Verify CORS headers

### 8. Monitoring

- [ ] Setup PM2 monitoring: `pm2 monit`
- [ ] Configure log rotation
- [ ] Setup backup schedule
- [ ] Monitor disk space
- [ ] Monitor memory usage

## Quick Commands

```bash
# Build
npm run build

# Database
cd server
npx prisma migrate deploy
npx prisma generate

# PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# SSL (Let's Encrypt)
sudo certbot --nginx -d it.sarapeehospital.go.th
```

## Important Files

- `server/.env` - Environment variables (DO NOT commit to git)
- `server/.env.example` - Template for environment variables
- `ecosystem.config.cjs` - PM2 configuration
- `dist/` - Built frontend files
- `server/uploads/` - User uploaded files

## Support

For detailed instructions, see `deployment_guide.md` in the artifacts folder.

---

## Server Deployment Steps (After Git Pull)

### ขั้นตอนการ Deploy บน Production Server

เมื่อ pull code ใหม่จาก Git แล้ว ให้ทำตามขั้นตอนนี้เสมอ:

#### 1. Backend Deployment

```bash
cd /home/Planning-and-Information-Dept./server

# Install dependencies (if package.json changed)
npm install

# ⚠️ IMPORTANT: Generate Prisma Client
npx prisma generate

# Run database migrations (if schema changed)
npx prisma migrate deploy

# Build TypeScript
npm run build

# Restart backend
pm2 restart saraphi-backend
```

#### 2. Frontend Deployment

```bash
cd /home/Planning-and-Information-Dept.

# Install dependencies (if package.json changed)
npm install

# Build frontend
npm run build

# Restart frontend
pm2 restart saraphi-frontend
```

### ⚠️ ปัญหาที่พบบ่อยและวิธีแก้

#### Error: Property 'systemSetting' does not exist on PrismaClient

**สาเหตุ:** ยังไม่ได้ run `npx prisma generate` หลังจากเพิ่ม/แก้ไข Prisma schema

**วิธีแก้:**
```bash
cd server
npx prisma generate
npm run build
pm2 restart saraphi-backend
```

#### Error: Cannot find module

**สาเหตุ:** ไม่ได้ install dependencies

**วิธีแก้:**
```bash
npm install
cd server && npm install
```

### 📝 หมายเหตุสำคัญ

- **ทุกครั้งที่ pull code ใหม่** ต้องรัน `npx prisma generate` เสมอ (หาก schema.prisma มีการเปลี่ยนแปลง)
- **ห้าม commit ไฟล์ `.env`** - ถูก exclude ใน `.gitignore` แล้ว
- **ห้าม commit folder `uploads`** - เป็น user-generated content
- ควร backup database ก่อน run migration ทุกครั้ง
