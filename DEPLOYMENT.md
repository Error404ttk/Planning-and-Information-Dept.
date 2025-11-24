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
