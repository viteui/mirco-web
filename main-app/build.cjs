const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 确保 public 目录存在
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// 构建子应用
console.log('Building sub-app...');
execSync('cd ../sub-app && npm run build', { stdio: 'inherit' });

// 构建主应用
console.log('Building main-app...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed!'); 