@echo off
node -v
npm -v
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force
npm install
npx prisma generate
npm run dev
pause
