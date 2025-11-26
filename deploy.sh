#!/bin/bash

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${BLUE}📥 Step 1: Pulling latest code from Git...${NC}"
git pull
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git pull completed${NC}\n"

# Step 2: Install backend dependencies
echo -e "${BLUE}📦 Step 2: Installing backend dependencies...${NC}"
cd server
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend npm install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}\n"

# Step 3: Run Prisma migration
echo -e "${BLUE}🗄️  Step 3: Running Prisma migration...${NC}"
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Prisma migration failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Migration completed${NC}\n"

# Step 4: Generate Prisma Client
echo -e "${BLUE}🔧 Step 4: Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Prisma generate failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# Step 5: Run seed (if needed)
echo -e "${BLUE}🌱 Step 5: Running database seed...${NC}"
npx tsx prisma/seed.ts
# Don't fail if seed fails (might already have users)
echo -e "${GREEN}✅ Seed completed (or skipped if users exist)${NC}\n"

cd ..

# Step 6: Install frontend dependencies
echo -e "${BLUE}📦 Step 6: Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend npm install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"

# Step 7: Build frontend
echo -e "${BLUE}🏗️  Step 7: Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend build completed${NC}\n"

# Step 8: Restart PM2
echo -e "${BLUE}🔄 Step 8: Restarting PM2 processes...${NC}"
pm2 restart all
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PM2 restarted${NC}\n"

# Step 9: Show PM2 status
echo -e "${BLUE}📊 Step 9: Checking PM2 status...${NC}"
pm2 status

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}💡 The application should now be running with the latest changes.${NC}\n"
