#!/bin/bash

# Fix Git Pull Issues on Server
# This script helps resolve "Your local changes would be overwritten by merge" errors

echo "🔧 Fixing Git Pull Issues..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  WARNING: This will discard local changes to package.json and package-lock.json${NC}"
echo -e "${YELLOW}These files will be reset to match the remote repository.${NC}"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

echo -e "${YELLOW}📋 Checking current git status...${NC}"
git status

echo -e "\n${YELLOW}🔄 Discarding local changes to package files...${NC}"
git checkout HEAD -- server/package.json server/package-lock.json

echo -e "${GREEN}✅ Local changes discarded${NC}\n"

echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Git pull successful!${NC}"
    echo -e "${GREEN}You can now run ./deploy.sh to complete the deployment.${NC}\n"
else
    echo -e "\n${RED}❌ Git pull failed. Please check the error above.${NC}\n"
    exit 1
fi
