// 此脚本用于从SVG生成不同大小的PNG图标
// 如需使用，请安装Node.js并运行npm install sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 图标大小配置
const sizes = [16, 48, 128];

// 从SVG生成PNG图标
async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(path.join(imagesDir, 'icon.svg'));
    
    // 生成不同大小的图标
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(imagesDir, `icon${size}.png`));
      
      console.log(`✓ 成功生成 ${size}×${size} 图标`);
    }
    
    console.log('所有图标生成完成！');
  } catch (err) {
    console.error('生成图标时出错:', err);
  }
}

// 生成一些默认的鼠标图标示例
async function generateCursorIcons() {
  // 箭头光标
  const cursor1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAA00lEQVRYhe2XMQ6CQBBFH9aewB7OYElnqTfQM9jY2dFzA2/CEbyBB9DeEgtXyJLd2WyGhPdXk8nMP282IQFJkiRJksbpDGyBHKiA2rMKOAJroPAc7oEN8PQcHtphqx8FmQFnx8EBuA3sMQNOxsFXYDGwx9TyBnaD04ZndpjEYZp/5Ug5T2wLfCx1T+BgqbsBF0vdHbhb6qquAR1M44ED8LANiOA3gRF0bVo1cAQ6CYig64BNYIPFkW0WDyaogTzaX6B0HKqAw+LEUwBFrECSJEmS/tULlHFWUQCLRdEAAAAASUVORK5CYII=', 'base64');
  
  // 手型光标
  const cursor2 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAA5ElEQVRYhe2XsQ3CMBBFv1n8JAbIAhmAEbICI2SFjMAIsEAGyAhZwLaS/DY5YlvJFEj+kgvLp/vvzo4NURRFURRFqzQDzkAJVEDtCQGUwBFYeQ5vgAPw9By+dMOWIQZUwMVxcAnsgRmwcRyeSvIGDsBjYsBcWn/Kw1cNOAFv45lmKn8c3wPNVN45rhPU1duwC7TQZjf7nU7HEYY9oIU/BM0YG3YD+hQDehwP3YAhxRTiDViQbsA09SZMiOgUnULzLYXX7fD6CfyoKcDdsW8J7GT/VhCLbcSi9xVcA1sgj1VQFEVRFP2pD4dQX2MkxcmuAAAAAElFTkSuQmCC', 'base64');
  
  // 十字光标
  const cursor3 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAA3UlEQVRYhe2XMQ7CMAxFX5H6J2yMXIQzcQcOwgU4U8/BxMZGj9AJVqRIpFXixK7UDu8vsfLl28l3LEmSJEnS/3QErkABVEDtWQHkwAWYew5vgT3w8hy+dsOWHgZUwN1xcA1sgQOwdhweSvIBTsDzx4CptP6Uh09SOAPvxJlmEj/OIwzQJHnluDZQp2/DJtBCm92kO52OGrB3rOuYGNCrOLQBA4op+A2YkW7ANPYmjKjoFJ1C8y2F9+3w+g38qTHAw7FvAWxk/1YQkzJiUvoKboAtMI9VUJIkSZL+1BciU10GTH8zNgAAAABJRU5ErkJggg==', 'base64');
  
  try {
    fs.writeFileSync(path.join(imagesDir, 'cursor1.png'), cursor1);
    fs.writeFileSync(path.join(imagesDir, 'cursor2.png'), cursor2);
    fs.writeFileSync(path.join(imagesDir, 'cursor3.png'), cursor3);
    console.log('✓ 成功生成示例鼠标光标');
  } catch (err) {
    console.error('生成鼠标光标时出错:', err);
  }
}

// 运行生成脚本
generateIcons();
generateCursorIcons(); 