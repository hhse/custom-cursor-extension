// 配置变量
let settings = {
  cursorType: 'default',
  trailEnabled: false,
  trailColor: '#4285f4',
  trailLength: 20,
  trailFade: 5,
  trailType: 'dot', // 新增：轨迹类型 - dot(点), emoji(表情), fade(渐隐), rainbow(彩虹)
  trailEmoji: '✨' // 新增：自定义emoji
};

// 鼠标轨迹相关变量
let trailElements = [];
let mouseX = 0;
let mouseY = 0;
let isInitialized = false;
let animationId = null;
let customCursorCache = {};

// 默认可选的emoji
const defaultEmojis = ['✨', '💫', '⭐', '🌟', '💖', '🔥', '🌈', '🎈', '🎯', '🚀', '🌸', '🍀', '🦋', '🍭', '💎', '💼', '💡', '🍪'];

// 初始化函数
function initialize() {
  if (isInitialized) return;
  isInitialized = true;

  // 从存储中加载设置
  chrome.storage.sync.get({
    cursorType: 'default',
    trailEnabled: false,
    trailColor: '#4285f4',
    trailLength: 20,
    trailFade: 5,
    trailType: 'dot',
    trailEmoji: '✨',
    customCursors: []
  }, function(items) {
    settings = items;
    
    // 加载自定义光标
    if (items.customCursors && items.customCursors.length > 0) {
      items.customCursors.forEach(cursor => {
        customCursorCache[cursor.id] = cursor.data;
      });
    }
    
    updateCursor(settings.cursorType);
    if (settings.trailEnabled) {
      enableTrail();
    }
  });

  // 监听来自弹出窗口的消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateCursor') {
      updateCursor(request.cursorType);
    } else if (request.action === 'updateTrail') {
      // 更新轨迹设置
      let needsRestart = false;
      
      if (request.hasOwnProperty('trailEnabled')) {
        settings.trailEnabled = request.trailEnabled;
        if (settings.trailEnabled) {
          enableTrail();
        } else {
          disableTrail();
        }
      }
      
      if (request.hasOwnProperty('trailColor')) {
        settings.trailColor = request.trailColor;
      }
      
      if (request.hasOwnProperty('trailLength')) {
        settings.trailLength = request.trailLength;
        needsRestart = true;
      }
      
      if (request.hasOwnProperty('trailFade')) {
        settings.trailFade = request.trailFade;
      }
      
      // 处理新增的轨迹类型和emoji设置
      if (request.hasOwnProperty('trailType')) {
        settings.trailType = request.trailType;
        needsRestart = true;
      }
      
      if (request.hasOwnProperty('trailEmoji')) {
        settings.trailEmoji = request.trailEmoji;
        needsRestart = true;
      }
      
      // 如果设置改变需要重启轨迹效果
      if (needsRestart && settings.trailEnabled) {
        disableTrail();
        enableTrail();
      }
    } else if (request.action === 'addCustomCursor') {
      // 接收新的自定义光标数据
      if (request.cursor) {
        customCursorCache[request.cursor.id] = request.cursor.data;
        
        // 如果设置为当前光标，立即应用
        if (request.applyNow) {
          updateCursor(request.cursor.id);
        }
      }
    }
    
    // 发送响应
    sendResponse({success: true});
    return true;
  });
}

// 更新鼠标样式
function updateCursor(cursorType) {
  settings.cursorType = cursorType;
  console.log("正在更新光标类型:", cursorType);
  
  // 移除现有的自定义样式
  const existingStyle = document.getElementById('custom-cursor-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // 如果是默认光标，不做任何事
  if (cursorType === 'default') {
    return;
  }

  // 添加自定义光标样式
  const style = document.createElement('style');
  style.id = 'custom-cursor-style';
  
  let cursorUrl;
  
  // 处理不同类型的光标文件
  if (cursorType.startsWith('custom_')) {
    // 处理自定义的.cur或.ani文件
    const cursorData = customCursorCache[cursorType];
    if (cursorData) {
      // 使用数据URL直接应用光标
      cursorUrl = cursorData;
      console.log("使用缓存的自定义光标数据");
    } else {
      // 尝试使用文件URL
      const cursorFileName = cursorType.replace('custom_', '');
      cursorUrl = chrome.runtime.getURL(`images/${cursorFileName}.cur`);
      console.log("尝试从文件加载自定义光标:", cursorUrl);
    }
  } else {
    // 处理预设PNG光标
    switch(cursorType) {
      case 'pointer1':
        cursorUrl = chrome.runtime.getURL('images/cursor1.png');
        break;
      case 'pointer2':
        cursorUrl = chrome.runtime.getURL('images/cursor2.png');
        break;
      case 'pointer3':
        cursorUrl = chrome.runtime.getURL('images/cursor3.png');
        break;
      default:
        console.log("未知的光标类型:", cursorType);
        return;
    }
  }

  // 应用光标样式
  if (cursorUrl) {
    // 防止URL太长影响调试输出
    const logUrl = cursorUrl.length > 50 ? cursorUrl.substring(0, 50) + "..." : cursorUrl;
    console.log("应用光标URL:", logUrl);
    
    // 处理不同类型的光标
    if (cursorUrl.startsWith('data:')) {
      // 数据URL格式(base64编码的自定义光标)
      style.textContent = `
        *, a, button, input, select, textarea {
          cursor: url('${cursorUrl}'), auto !important;
        }
        
        /* 针对特定交互元素的样式 */
        a:hover, button:hover, input[type="submit"]:hover, input[type="button"]:hover, .clickable:hover {
          cursor: url('${cursorUrl}'), pointer !important;
        }
      `;
    } else {
      // 文件URL
      style.textContent = `
        *, a, button, input, select, textarea {
          cursor: url('${cursorUrl}'), auto !important;
        }
        
        /* 针对特定交互元素的样式 */
        a:hover, button:hover, input[type="submit"]:hover, input[type="button"]:hover, .clickable:hover {
          cursor: url('${cursorUrl}'), pointer !important;
        }
      `;
    }
    
    document.head.appendChild(style);
    console.log("光标样式已应用");
  } else {
    console.error("无法获取光标URL");
  }
}

// 启用鼠标轨迹
function enableTrail() {
  // 如果已经有容器，先清除
  disableTrail();
  
  // 创建轨迹容器
  const trailContainer = document.createElement('div');
  trailContainer.id = 'custom-cursor-trail-container';
  trailContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(trailContainer);
  
  // 创建轨迹点
  for (let i = 0; i < settings.trailLength; i++) {
    const trailDot = document.createElement('div');
    trailDot.className = 'cursor-trail-dot';
    
    if (settings.trailType === 'emoji') {
      // emoji轨迹样式
      trailDot.style.cssText = `
        position: absolute;
        font-size: ${16 - (i * 0.3)}px;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
      `;
      trailDot.textContent = settings.trailEmoji;
    } else {
      // 默认点状轨迹样式
      trailDot.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${settings.trailColor};
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
      `;
    }
    
    trailContainer.appendChild(trailDot);
    trailElements.push(trailDot);
  }
  
  // 添加鼠标移动监听
  document.addEventListener('mousemove', handleMouseMove);
  
  // 开始动画
  animationId = requestAnimationFrame(animateTrail);
}

// 禁用鼠标轨迹
function disableTrail() {
  const trailContainer = document.getElementById('custom-cursor-trail-container');
  if (trailContainer) {
    trailContainer.remove();
  }
  
  document.removeEventListener('mousemove', handleMouseMove);
  trailElements = [];
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// 处理鼠标移动
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// 轨迹动画
function animateTrail() {
  if (!settings.trailEnabled || trailElements.length === 0) return;
  
  // 根据轨迹类型应用不同的动画效果
  switch (settings.trailType) {
    case 'emoji':
      animateEmojiTrail();
      break;
    case 'rainbow':
      animateRainbowTrail();
      break;
    case 'fade':
      animateFadeTrail();
      break;
    default:
      animateDotTrail(); // 默认点状轨迹
  }
  
  // 循环动画
  animationId = requestAnimationFrame(animateTrail);
}

// 默认点状轨迹动画
function animateDotTrail() {
  for (let i = trailElements.length - 1; i > 0; i--) {
    const prevX = parseFloat(trailElements[i-1].style.left) || mouseX;
    const prevY = parseFloat(trailElements[i-1].style.top) || mouseY;
    
    trailElements[i].style.left = prevX + 'px';
    trailElements[i].style.top = prevY + 'px';
    
    // 计算淡出效果
    const opacity = 1 - (i / trailElements.length);
    trailElements[i].style.opacity = opacity;
    trailElements[i].style.backgroundColor = settings.trailColor;
    
    // 调整大小
    const size = 8 - (i / trailElements.length * 6);
    trailElements[i].style.width = size + 'px';
    trailElements[i].style.height = size + 'px';
  }
  
  // 更新第一个点为当前鼠标位置
  trailElements[0].style.left = mouseX + 'px';
  trailElements[0].style.top = mouseY + 'px';
  trailElements[0].style.opacity = 1;
}

// Emoji轨迹动画
function animateEmojiTrail() {
  for (let i = trailElements.length - 1; i > 0; i--) {
    const prevX = parseFloat(trailElements[i-1].style.left) || mouseX;
    const prevY = parseFloat(trailElements[i-1].style.top) || mouseY;
    
    trailElements[i].style.left = prevX + 'px';
    trailElements[i].style.top = prevY + 'px';
    
    // 计算淡出效果
    const opacity = 1 - (i / trailElements.length);
    trailElements[i].style.opacity = opacity;
    
    // 调整大小和旋转
    const fontSize = 14 - (i * 0.25);
    const rotation = i * (360 / settings.trailLength);
    trailElements[i].style.fontSize = fontSize + 'px';
    trailElements[i].style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }
  
  // 更新第一个emoji为当前鼠标位置
  trailElements[0].style.left = mouseX + 'px';
  trailElements[0].style.top = mouseY + 'px';
  trailElements[0].style.opacity = 1;
  trailElements[0].style.transform = 'translate(-50%, -50%)';
}

// 彩虹轨迹动画
function animateRainbowTrail() {
  const rainbowColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
    '#0000FF', '#4B0082', '#9400D3'
  ];
  
  for (let i = trailElements.length - 1; i > 0; i--) {
    const prevX = parseFloat(trailElements[i-1].style.left) || mouseX;
    const prevY = parseFloat(trailElements[i-1].style.top) || mouseY;
    
    trailElements[i].style.left = prevX + 'px';
    trailElements[i].style.top = prevY + 'px';
    
    // 计算淡出效果
    const opacity = 1 - (i / trailElements.length);
    trailElements[i].style.opacity = opacity;
    
    // 设置彩虹颜色
    const colorIndex = i % rainbowColors.length;
    trailElements[i].style.backgroundColor = rainbowColors[colorIndex];
    
    // 调整大小
    const size = 8 - (i / trailElements.length * 4);
    trailElements[i].style.width = size + 'px';
    trailElements[i].style.height = size + 'px';
  }
  
  // 更新第一个点为当前鼠标位置
  trailElements[0].style.left = mouseX + 'px';
  trailElements[0].style.top = mouseY + 'px';
  trailElements[0].style.opacity = 1;
  trailElements[0].style.backgroundColor = rainbowColors[0];
}

// 渐隐轨迹动画（更平滑的消失效果）
function animateFadeTrail() {
  for (let i = trailElements.length - 1; i > 0; i--) {
    const prevX = parseFloat(trailElements[i-1].style.left) || mouseX;
    const prevY = parseFloat(trailElements[i-1].style.top) || mouseY;
    
    // 添加一点随机偏移，创造更自然的消散效果
    const offsetX = Math.random() * 2 - 1; // -1到1之间的随机数
    const offsetY = Math.random() * 2 - 1; // -1到1之间的随机数
    
    trailElements[i].style.left = (prevX + offsetX * i/5) + 'px';
    trailElements[i].style.top = (prevY + offsetY * i/5) + 'px';
    
    // 计算淡出效果
    const opacity = (1 - (i / trailElements.length)) * (10 - settings.trailFade) / 10;
    trailElements[i].style.opacity = opacity;
    trailElements[i].style.backgroundColor = settings.trailColor;
    
    // 调整大小
    const size = 10 - (i / trailElements.length * 8);
    trailElements[i].style.width = size + 'px';
    trailElements[i].style.height = size + 'px';
    
    // 添加模糊效果
    const blur = i / 3;
    trailElements[i].style.filter = `blur(${blur}px)`;
  }
  
  // 更新第一个点为当前鼠标位置
  trailElements[0].style.left = mouseX + 'px';
  trailElements[0].style.top = mouseY + 'px';
  trailElements[0].style.opacity = 1;
  trailElements[0].style.filter = 'blur(0)';
}

// 初始化扩展
initialize(); 