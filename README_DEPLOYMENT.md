# 🚀 คู่มือการ Deploy

## วิธีการ Deploy แบบง่าย (แนะนำ)

หลังจาก `git pull` บน server แล้ว ให้รัน script อัตโนมัติ:

```bash
./deploy.sh
```

Script นี้จะทำทุกอย่างให้อัตโนมัติ:
- ✅ Pull latest code
- ✅ Install dependencies (backend + frontend)
- ✅ Run database migration
- ✅ Generate Prisma Client
- ✅ Seed database (สร้าง default user)
- ✅ Build frontend
- ✅ Restart PM2

---

## วิธีการ Deploy แบบ Manual

ถ้าต้องการทำทีละขั้นตอน:

### 1. Pull Code
```bash
git pull
```

### 2. Backend Setup
```bash
cd server
npm install
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts  # สร้าง default admin user
cd ..
```

### 3. Frontend Setup
```bash
npm install
npm run build
```

### 4. Restart Services
```bash
pm2 restart all
pm2 status
```

---

## ⚠️ สาเหตุที่ข้อมูล Reset

หลัง `git pull` ถ้ารีเฟรชแล้วข้อมูลกลับมาเป็นเหมือนเดิม เพราะ:

1. **ยังไม่ได้ run migration** → ตาราง NavLink, GridItem ยังไม่มีในฐานข้อมูล
2. **ยังไม่ได้ rebuild frontend** → ยังใช้ code เวอร์ชันเก่าที่ compile ไว้
3. **ยังไม่ได้ restart server** → server ยังใช้ code เดิมที่อยู่ใน memory

## 🔍 การตรวจสอบ

### ตรวจสอบว่า Migration รันแล้วหรือยัง
```bash
cd server
npx prisma studio
```
- ดูว่ามีตาราง `NavLink` และ `GridItem` หรือไม่

### ตรวจสอบ PM2 Status
```bash
pm2 status
pm2 logs saraphi-backend --lines 50
```

### ตรวจสอบว่า Frontend Build แล้วหรือยัง
```bash
ls -la dist/
```
- ควรมีไฟล์ `index.html` และ `assets/` ที่ build ใหม่

---

## 🆘 แก้ปัญหาเฉพาะหน้า

### ถ้า Migration ล้มเหลว
```bash
cd server
npx prisma migrate dev --name fix_migration
```

### ถ้า Frontend Build ล้มเหลว
```bash
rm -rf node_modules dist
npm install
npm run build
```

### ถ้า PM2 ไม่ทำงาน
```bash
pm2 delete all
pm2 start ecosystem.config.js  # หรือ pm2.config.js
```

---

## 📝 Default Admin User

หลัง deploy ครั้งแรก:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** SUPER_ADMIN

⚠️ **กรุณาเปลี่ยนรหัสผ่านทันที!**
