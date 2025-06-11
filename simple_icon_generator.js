// 这是一个简单的图标生成脚本，生成基本的图标文件
// 不依赖外部库，直接创建纯色的PNG图标
// 这些图标只是为了让扩展能够正常加载，用户可以在扩展加载后替换成自己的图标

const fs = require('fs');
const path = require('path');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 创建简单的图标文件
function generateSimpleIcon(size, filename) {
  console.log(`正在生成 ${filename} (${size}×${size})...`);
  
  // 创建一个简单的图标 - 只是一个占位符，确保扩展能加载
  const iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size/5}" fill="#4285F4"/>
    <text x="${size/2}" y="${size*0.6}" font-family="Arial" font-size="${size*0.6}" fill="white" text-anchor="middle">🖱️</text>
  </svg>`;
  
  fs.writeFileSync(path.join(imagesDir, filename), iconContent);
  console.log(`✓ 成功创建 ${filename}`);
}

// 生成各种尺寸的图标
generateSimpleIcon(16, 'icon16.svg');
generateSimpleIcon(48, 'icon48.svg');
generateSimpleIcon(128, 'icon128.svg');

console.log('图标文件生成完成！');
console.log('请注意：这些只是简单的SVG图标，你可能需要转换成PNG格式，');
console.log('或者直接修改manifest.json使用SVG图标。'); 