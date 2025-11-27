# Deployment Notes - Image Upload Enhancement

## 📋 Overview
This update includes major improvements to image upload functionality and **requires a database migration**.

## ⚠️ Breaking Changes
- **Database Schema Change**: `NewsArticle.imageUrl` column changed from `VARCHAR(255)` to `LONGTEXT`
- **Migration Required**: You must run Prisma migration after pulling

## 🚀 Deployment Steps

### Step 1: Pull Latest Code
```bash
cd /path/to/Planning-and-Information-Dept.
git pull origin main
```

### Step 2: Install Dependencies
```bash
# Frontend dependencies (heic2any removed)
npm install

# Backend dependencies (Prisma updated to 5.10.0)
cd server
npm install
```

### Step 3: Run Database Migration ⚠️ CRITICAL
```bash
cd server
npx prisma migrate deploy
```

**Expected output:**
```
Applying migration `20251127064325_update_news_imageurl_to_longtext`
✔ Migration completed
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Build Backend
```bash
npm run build
```

### Step 6: Build Frontend
```bash
cd ..
npm run build
```

### Step 7: Restart Services
```bash
pm2 restart all
```

### Step 8: Verify Deployment
```bash
# Check backend logs
pm2 logs saraphi-backend --lines 20

# Test: Try to create a news article with image
# Should work without 500 error
```

## 📝 What Changed

### Database
- **NewsArticle.imageUrl**: `VARCHAR(255)` → `LONGTEXT`
  - Now supports large base64-encoded images
  - Critical for storing processed/compressed images

### Frontend Features
- ✅ Image size limit increased: 5MB → 20MB
- ✅ Real-time upload progress bar with percentage
- ✅ Better error messages for unsupported formats
- ✅ HEIC validation with helpful conversion instructions
- ✅ Fixed empty img src warnings

### Backend Improvements
- ✅ Enhanced error logging in news routes
- ✅ Support for larger image data in database
- ✅ Better error handling

### Removed Features
- ❌ HEIC auto-conversion (browser support unreliable)
  - Users must convert HEIC to JPEG/PNG manually
  - Clear instructions provided in error message

### Dependencies
- **Removed**: `heic2any` (1.3MB) - reduced bundle size
- **Updated**: `prisma` and `@prisma/client` to `5.10.0`

## 🔧 Troubleshooting

### Issue: Migration fails
**Solution:**
```bash
# Check current migration status
cd server
npx prisma migrate status

# If needed, reset and re-apply
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue: Prisma Client errors
**Solution:**
```bash
# Regenerate Prisma Client
cd server
rm -rf node_modules/@prisma node_modules/.prisma
npm install prisma @prisma/client
npx prisma generate
npm run build
```

### Issue: Login fails after deployment
**Solution:**
```bash
# Check backend logs
pm2 logs saraphi-backend --lines 50

# Verify Prisma Client is working
cd server
npx prisma studio  # Opens database browser
```

### Issue: Images still can't upload
**Solution:**
1. Check database migration was applied:
   ```bash
   cd server
   npx prisma migrate status
   ```
2. Verify column type in database:
   ```sql
   DESCRIBE NewsArticle;
   -- imageUrl should be LONGTEXT
   ```
3. Check server logs for errors:
   ```bash
   pm2 logs saraphi-backend
   ```

## 📊 Testing Checklist

After deployment, test these scenarios:

- [ ] Login works
- [ ] Can create news with small image (<1MB)
- [ ] Can create news with large image (5-15MB)
- [ ] Progress bar appears during upload
- [ ] HEIC file shows helpful error message
- [ ] Can edit existing news articles
- [ ] Can delete news articles
- [ ] Existing news items still display correctly

## 🔙 Rollback Procedure

If deployment fails and you need to rollback:

```bash
# 1. Revert code
git reset --hard HEAD~1

# 2. Rollback database migration
cd server
npx prisma migrate resolve --rolled-back 20251127064325_update_news_imageurl_to_longtext

# 3. Reinstall dependencies
npm install
cd ..
npm install

# 4. Rebuild
cd server && npm run build
cd .. && npm run build

# 5. restart
pm2 restart all
```

## 📞 Support

If you encounter issues:
1. Check `pm2 logs saraphi-backend` for errors
2. Verify migration status: `npx prisma migrate status`
3. Check database directly: `npx prisma studio`

---
**Last Updated**: 2025-11-27  
**Migration**: `20251127064325_update_news_imageurl_to_longtext`
