import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保 public 目录存在
const publicDir = join(__dirname, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir);
}

// 构建子应用
console.log('Building sub-app...');
execSync('cd ../sub-app && npm run build', { stdio: 'inherit' });

// 构建主应用
console.log('Building main-app...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed!'); 