document.addEventListener('DOMContentLoaded', function() {
  // 获取页面上的元素
  const cursorOptions = document.querySelectorAll('.cursor-option');
  const trailToggle = document.getElementById('trail-toggle');
  const trailColor = document.getElementById('trail-color');
  const trailLength = document.getElementById('trail-length');
  const trailFade = document.getElementById('trail-fade');
  const cursorUpload = document.getElementById('cursor-upload');
  const customCursorList = document.getElementById('custom-cursor-list');
  const trailTypeOptions = document.querySelectorAll('.trail-type-option');
  const emojiSelector = document.getElementById('emoji-selector');
  const emojiGrid = document.getElementById('emoji-grid');
  const customEmojiInput = document.getElementById('custom-emoji-input');
  const applyEmojiBtn = document.getElementById('apply-emoji');
  const colorOptionRow = document.getElementById('color-option-row');

  // 默认emoji列表
  const defaultEmojis = ['✨', '💫', '⭐', '🌟', '💖', '🔥', '🌈', '🎈', '🎯', '🚀', '🌸', '🍀', '🦋', '🍭', '💎', '💼', '💡', '🍪'];

  // 存储自定义光标数据和设置
  let customCursors = [];
  let currentSettings = {
    cursorType: 'default',
    trailEnabled: false,
    trailColor: '#4285f4',
    trailLength: 20,
    trailFade: 5,
    trailType: 'dot',
    trailEmoji: '✨'
  };

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
    currentSettings = items;
    
    // 设置光标选项
    cursorOptions.forEach(option => {
      if (option.dataset.cursor === items.cursorType) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // 设置轨迹选项
    trailToggle.checked = items.trailEnabled;
    trailColor.value = items.trailColor;
    trailLength.value = items.trailLength;
    trailFade.value = items.trailFade;
    
    // 设置轨迹类型
    trailTypeOptions.forEach(option => {
      if (option.dataset.type === items.trailType) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    
    // 设置emoji选择器可见性
    updateEmojiSelectorVisibility(items.trailType);
    
    // 加载自定义光标列表
    customCursors = items.customCursors;
    renderCustomCursorList();
    
    // 初始化emoji网格
    renderEmojiGrid(items.trailEmoji);
    
    // 如果当前选择的是自定义光标，高亮显示
    if (items.cursorType.startsWith('custom_')) {
      // 移除其他选项的高亮
      cursorOptions.forEach(opt => opt.classList.remove('active'));
      // 这里不需要在预设选项中高亮，因为自定义光标在单独的列表中
    }
  });

  // 光标选项点击事件
  cursorOptions.forEach(option => {
    option.addEventListener('click', function() {
      // 更新UI
      cursorOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');

      // 保存设置
      const cursorType = this.dataset.cursor;
      chrome.storage.sync.set({ cursorType: cursorType });

      // 通知内容脚本更新光标
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateCursor',
          cursorType: cursorType 
        });
      });
    });
  });

  // 轨迹开关事件
  trailToggle.addEventListener('change', function() {
    const trailEnabled = this.checked;
    chrome.storage.sync.set({ trailEnabled: trailEnabled });

    // 通知内容脚本更新轨迹设置
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'updateTrail',
        trailEnabled: trailEnabled 
      });
    });
  });

  // 轨迹颜色事件
  trailColor.addEventListener('change', function() {
    const color = this.value;
    chrome.storage.sync.set({ trailColor: color });

    // 通知内容脚本更新轨迹颜色
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'updateTrail',
        trailColor: color 
      });
    });
  });

  // 轨迹长度事件
  trailLength.addEventListener('input', function() {
    const length = this.value;
    chrome.storage.sync.set({ trailLength: length });

    // 通知内容脚本更新轨迹长度
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'updateTrail',
        trailLength: parseInt(length) 
      });
    });
  });

  // 轨迹消失速度事件
  trailFade.addEventListener('input', function() {
    const fade = this.value;
    chrome.storage.sync.set({ trailFade: fade });

    // 通知内容脚本更新轨迹消失速度
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'updateTrail',
        trailFade: parseInt(fade) 
      });
    });
  });
  
  // 轨迹类型选择事件
  trailTypeOptions.forEach(option => {
    option.addEventListener('click', function() {
      // 更新UI
      trailTypeOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      
      // 保存设置
      const trailType = this.dataset.type;
      chrome.storage.sync.set({ trailType: trailType });
      
      // 更新emoji选择器可见性
      updateEmojiSelectorVisibility(trailType);
      
      // 通知内容脚本更新轨迹类型
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateTrail',
          trailType: trailType 
        });
      });
    });
  });
  
  // 更新emoji选择器可见性
  function updateEmojiSelectorVisibility(trailType) {
    if (trailType === 'emoji') {
      emojiSelector.style.display = 'block';
      colorOptionRow.style.display = 'none';
    } else {
      emojiSelector.style.display = 'none';
      colorOptionRow.style.display = 'flex';
    }
  }
  
  // 渲染emoji网格
  function renderEmojiGrid(selectedEmoji) {
    emojiGrid.innerHTML = '';
    
    defaultEmojis.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      if (emoji === selectedEmoji) {
        emojiItem.classList.add('active');
      }
      emojiItem.textContent = emoji;
      emojiItem.addEventListener('click', function() {
        // 更新UI
        document.querySelectorAll('.emoji-item').forEach(item => {
          item.classList.remove('active');
        });
        this.classList.add('active');
        
        // 保存设置
        const selectedEmoji = this.textContent;
        chrome.storage.sync.set({ trailEmoji: selectedEmoji });
        
        // 通知内容脚本更新emoji
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateTrail',
            trailEmoji: selectedEmoji 
          });
        });
      });
      
      emojiGrid.appendChild(emojiItem);
    });
  }
  
  // 自定义emoji输入
  applyEmojiBtn.addEventListener('click', function() {
    const customEmoji = customEmojiInput.value.trim();
    if (customEmoji) {
      // 保存设置
      chrome.storage.sync.set({ trailEmoji: customEmoji });
      
      // 通知内容脚本更新emoji
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateTrail',
          trailEmoji: customEmoji 
        });
      });
      
      // 更新UI
      document.querySelectorAll('.emoji-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // 可能需要重新渲染emoji网格来包含新的自定义emoji
      if (!defaultEmojis.includes(customEmoji)) {
        // 添加到默认列表的开头，如果列表太长则移除最后一个
        defaultEmojis.unshift(customEmoji);
        if (defaultEmojis.length > 18) {
          defaultEmojis.pop();
        }
      }
      
      renderEmojiGrid(customEmoji);
    }
  });
  
  // 光标文件上传处理
  cursorUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件扩展名
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'cur' && fileExt !== 'ani') {
      alert('只支持.cur和.ani格式的光标文件！');
      return;
    }
    
    // 将文件保存到扩展存储
    const reader = new FileReader();
    reader.onload = function(e) {
      const fileData = e.target.result;
      
      // 创建光标对象
      const cursorId = 'custom_' + Date.now(); // 使用时间戳作为唯一ID
      const newCursor = {
        id: cursorId,
        name: file.name,
        type: fileExt,
        data: fileData
      };
      
      // 保存到自定义光标列表
      customCursors.push(newCursor);
      chrome.storage.sync.set({ customCursors: customCursors }, function() {
        console.log("保存了新的自定义光标:", newCursor.name);
        
        // 通知内容脚本更新光标缓存
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'addCustomCursor',
            cursor: newCursor,
            applyNow: false  // 不立即应用
          }, function(response) {
            console.log("内容脚本响应:", response);
          });
        });
      });
      
      // 更新光标列表UI
      renderCustomCursorList();
      
      // 清空文件输入，以便再次选择相同文件
      cursorUpload.value = '';
    };
    
    reader.readAsDataURL(file);
  });
  
  // 渲染自定义光标列表
  function renderCustomCursorList() {
    // 清空现有列表
    customCursorList.innerHTML = '';
    
    if (customCursors.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = '没有自定义光标';
      emptyMessage.style.padding = '10px';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = '#999';
      customCursorList.appendChild(emptyMessage);
      return;
    }
    
    // 添加每个自定义光标
    customCursors.forEach(cursor => {
      const item = document.createElement('div');
      item.className = 'custom-cursor-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'custom-cursor-name';
      nameSpan.textContent = cursor.name;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'custom-cursor-actions';
      
      const useButton = document.createElement('button');
      useButton.className = 'cursor-btn';
      useButton.textContent = '使用';
      useButton.onclick = function() {
        applyCursor(cursor.id);
      };
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'cursor-btn delete';
      deleteButton.textContent = '删除';
      deleteButton.onclick = function() {
        deleteCursor(cursor.id);
      };
      
      actionsDiv.appendChild(useButton);
      actionsDiv.appendChild(deleteButton);
      
      item.appendChild(nameSpan);
      item.appendChild(actionsDiv);
      
      customCursorList.appendChild(item);
    });
  }
  
  // 应用自定义光标
  function applyCursor(cursorId) {
    console.log("正在应用自定义光标:", cursorId);
    
    // 更新UI，取消选中预设光标
    cursorOptions.forEach(opt => opt.classList.remove('active'));
    
    // 保存设置
    chrome.storage.sync.set({ cursorType: cursorId });
    
    // 找到对应的光标对象
    const cursor = customCursors.find(c => c.id === cursorId);
    
    // 通知内容脚本更新光标
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (cursor) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'addCustomCursor',
          cursor: cursor,
          applyNow: true  // 立即应用
        });
      } else {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateCursor',
          cursorType: cursorId 
        });
      }
    });
  }
  
  // 删除自定义光标
  function deleteCursor(cursorId) {
    // 从数组中删除
    const index = customCursors.findIndex(c => c.id === cursorId);
    if (index !== -1) {
      customCursors.splice(index, 1);
      
      // 更新存储
      chrome.storage.sync.set({ customCursors: customCursors });
      
      // 如果当前使用的就是被删除的光标，则重置为默认光标
      chrome.storage.sync.get({ cursorType: 'default' }, function(items) {
        if (items.cursorType === cursorId) {
          chrome.storage.sync.set({ cursorType: 'default' });
          
          // 重置UI
          cursorOptions.forEach(opt => {
            if (opt.dataset.cursor === 'default') {
              opt.classList.add('active');
            } else {
              opt.classList.remove('active');
            }
          });
          
          // 通知内容脚本
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'updateCursor',
              cursorType: 'default' 
            });
          });
        }
      });
      
      // 更新UI
      renderCustomCursorList();
    }
  }
}); 