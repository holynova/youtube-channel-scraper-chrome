const fs = require('fs');
const path = require('path');

// 扩展程序的文件夹名称
const dirName = 'youtube-scraper-extension';
const targetDir = path.join(__dirname, dirName);

// 定义文件内容
const files = {
  'manifest.json': `{
  "manifest_version": 3,
  "name": "YouTube Channel Scraper",
  "version": "1.0",
  "description": "抓取当前 YouTube 频道页面的所有视频信息 (标题, 链接, 浏览量, 发布时间, 是否会员).",
  "permissions": ["activeTab", "scripting"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["*://www.youtube.com/*"],
      "js": ["content.js"]
    }
  ]
}`,

  'popup.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YT Scraper</title>
    <style>
        body {
            width: 350px;
            padding: 15px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
        }
        h2 {
            margin-top: 0;
            color: #ff0000;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        button {
            padding: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        #btn-start {
            background-color: #065fd4;
            color: white;
        }
        #btn-start:hover {
            background-color: #004bb7;
        }
        #btn-start:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        #btn-copy {
            background-color: #2ecc71;
            color: white;
            display: none; /* 初始隐藏 */
        }
        #status {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
            min-height: 20px;
        }
        textarea {
            width: 100%;
            height: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
            resize: vertical;
            font-family: monospace;
            font-size: 11px;
            box-sizing: border-box; /* 防止padding撑破容器 */
        }
        .warning {
            color: #d35400;
            font-size: 12px;
            margin-top: 5px;
            border-left: 3px solid #d35400;
            padding-left: 5px;
        }
    </style>
</head>
<body>

    <h2>📺 YouTube 视频抓取器</h2>
    
    <div id="status">准备就绪，请在 "视频" (Videos) 页面使用。</div>

    <div class="controls">
        <button id="btn-start">开始抓取</button>
        <button id="btn-copy">复制 JSON 到剪贴板</button>
    </div>

    <div class="warning">
        ⚠️ 注意：抓取过程中会自动滚动页面，请保持此弹窗开启，不要关闭。
    </div>

    <textarea id="output" placeholder="抓取结果将显示在这里..."></textarea>

    <script src="popup.js"></script>
</body>
</html>`,

  'popup.js': `document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    const btnCopy = document.getElementById('btn-copy');
    const statusDiv = document.getElementById('status');
    const outputArea = document.getElementById('output');

    // 处理来自 Content Script 的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "update_status") {
            statusDiv.textContent = request.message;
        } 
        else if (request.action === "scrape_complete") {
            const data = request.data;
            outputArea.value = JSON.stringify(data, null, 2);
            statusDiv.textContent = \`✅ 完成！共抓取 \${data.length} 个视频。\`;
            btnStart.disabled = false;
            btnStart.textContent = "重新抓取";
            btnCopy.style.display = "block";
        }
        else if (request.action === "scrape_error") {
            statusDiv.textContent = \`❌ 错误: \${request.message}\`;
            btnStart.disabled = false;
        }
    });

    // 点击开始按钮
    btnStart.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.includes("youtube.com")) {
            statusDiv.textContent = "❌ 请在 YouTube 页面使用此扩展。";
            return;
        }

        btnStart.disabled = true;
        btnStart.textContent = "抓取中...";
        statusDiv.textContent = "正在初始化脚本...";
        outputArea.value = "";
        btnCopy.style.display = "none";

        // 向 content script 发送开始命令
        chrome.tabs.sendMessage(tab.id, { action: "start_scrape" }).catch((error) => {
            statusDiv.textContent = "⚠️ 连接失败，请刷新页面后重试。";
            btnStart.disabled = false;
            console.error(error);
        });
    });

    // 点击复制按钮
    btnCopy.addEventListener('click', () => {
        outputArea.select();
        document.execCommand('copy');
        const originalText = btnCopy.textContent;
        btnCopy.textContent = "已复制！";
        setTimeout(() => {
            btnCopy.textContent = originalText;
        }, 2000);
    });
});`,

  'content.js': `// 工具函数：将浏览量字符串转换为数字
function parseViews(viewsText) {
    if (!viewsText || viewsText === 'N/A') return 0;
    
    // 移除 "views" 和多余空格
    const cleanText = viewsText.replace(/views?/i, '').trim();
    
    // 处理 K, M, B 等单位
    const multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        '万': 10000,
        '亿': 100000000
    };
    
    for (const [unit, multiplier] of Object.entries(multipliers)) {
        if (cleanText.includes(unit)) {
            const num = parseFloat(cleanText.replace(unit, '').trim());
            return Math.round(num * multiplier);
        }
    }
    
    // 移除逗号并转换为数字
    return parseInt(cleanText.replace(/,/g, ''), 10) || 0;
}

// 工具函数：将相对时间转换为日期字符串
function parsePublishDate(publishText) {
    if (!publishText || publishText === 'N/A') return null;
    
    const now = new Date();
    const lowerText = publishText.toLowerCase().trim();
    
    // 匹配模式：数字 + 时间单位 + ago
    const patterns = [
        { regex: /(\\d+)\\s*秒/, unit: 'seconds' },
        { regex: /(\\d+)\\s*分钟/, unit: 'minutes' },
        { regex: /(\\d+)\\s*小时/, unit: 'hours' },
        { regex: /(\\d+)\\s*天/, unit: 'days' },
        { regex: /(\\d+)\\s*week/i, unit: 'weeks' },
        { regex: /(\\d+)\\s*month/i, unit: 'months' },
        { regex: /(\\d+)\\s*year/i, unit: 'years' },
        { regex: /(\\d+)\\s*second/i, unit: 'seconds' },
        { regex: /(\\d+)\\s*minute/i, unit: 'minutes' },
        { regex: /(\\d+)\\s*hour/i, unit: 'hours' },
        { regex: /(\\d+)\\s*day/i, unit: 'days' }
    ];
    
    for (const pattern of patterns) {
        const match = lowerText.match(pattern.regex);
        if (match) {
            const value = parseInt(match[1], 10);
            const date = new Date(now);
            
            switch (pattern.unit) {
                case 'seconds':
                    date.setSeconds(date.getSeconds() - value);
                    break;
                case 'minutes':
                    date.setMinutes(date.getMinutes() - value);
                    break;
                case 'hours':
                    date.setHours(date.getHours() - value);
                    break;
                case 'days':
                    date.setDate(date.getDate() - value);
                    break;
                case 'weeks':
                    date.setDate(date.getDate() - (value * 7));
                    break;
                case 'months':
                    date.setMonth(date.getMonth() - value);
                    break;
                case 'years':
                    date.setFullYear(date.getFullYear() - value);
                    break;
            }
            
            return date.toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式
        }
    }
    
    return publishText; // 如果无法解析，返回原文
}

// 监听来自 Popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start_scrape") {
        scrapeYouTubeVideos();
    }
});

async function scrapeYouTubeVideos() {
    // 辅助函数：向 Popup 发送状态更新
    const reportStatus = (msg) => {
        chrome.runtime.sendMessage({ action: "update_status", message: msg }).catch(() => {
            // 忽略 popup 关闭导致的错误
        });
    };

    // 辅助函数：等待
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    reportStatus("🚀 开始抓取... 正在自动滚动加载视频...");

    // ---------------------------------------------------------
    // 1. 自动滚动逻辑
    // ---------------------------------------------------------
    let lastHeight = document.documentElement.scrollHeight;
    let noChangeCount = 0;

    try {
        while (true) {
            window.scrollTo(0, document.documentElement.scrollHeight);
            
            // 每次滚动后等待 2 秒
            await wait(2000); 

            let newHeight = document.documentElement.scrollHeight;
            if (newHeight === lastHeight) {
                noChangeCount++;
                reportStatus(\`⏳ 正在检查底部... (\${noChangeCount}/3)\`);
                
                if (noChangeCount >= 3) break; // 连续3次没有新内容，停止滚动
            } else {
                noChangeCount = 0;
                lastHeight = newHeight;
                // 计算当前已加载的大致元素数量来反馈进度
                const count = document.querySelectorAll('ytd-rich-grid-media').length;
                reportStatus(\`⬇️ 已加载更多... (当前约 \${count} 个视频)\`);
            }
        }
    } catch (err) {
        chrome.runtime.sendMessage({ action: "scrape_error", message: "滚动过程中出错: " + err.message });
        return;
    }

    reportStatus("✅ 滚动完成，正在解析数据...");

    // ---------------------------------------------------------
    // 2. 数据提取逻辑
    // ---------------------------------------------------------
    const videoElements = document.querySelectorAll('ytd-rich-grid-media');
    const videos = [];

    videoElements.forEach(video => {
        try {
            // 2.1 基础信息
            const titleElement = video.querySelector('#video-title');
            const linkElement = video.querySelector('a#video-title-link');
            
            const title = titleElement ? titleElement.textContent.trim() : null;
            const url = linkElement ? linkElement.href : null;

            // 2.2 元数据 (浏览量 & 发布时间)
            const metaSpans = video.querySelectorAll('#metadata-line .inline-metadata-item');
            let views = "N/A";
            let publish_time = "N/A";

            if (metaSpans.length >= 2) {
                views = metaSpans[0].textContent.trim();
                publish_time = metaSpans[1].textContent.trim();
            } else if (metaSpans.length === 1) {
                views = metaSpans[0].textContent.trim();
            }

            // 2.3 会员视频检测
            let is_members_only = false;
            const badges = video.querySelectorAll('ytd-badge-supported-renderer');
            badges.forEach(badge => {
                const badgeText = badge.textContent.trim().toLowerCase();
                if (badgeText.includes('会员') || badgeText.includes('members')) {
                    is_members_only = true;
                }
            });

            // 2.4 数据组装
            if (title && url) {
                videos.push({
                    title: title,
                    views: parseViews(views),  // 转换为数字
                    url: url,
                    publish_time: parsePublishDate(publish_time),  // 转换为日期
                    is_members_only: is_members_only
                });
            }

        } catch (e) {
            console.error("解析单个视频失败:", e);
        }
    });

    // ---------------------------------------------------------
    // 3. 发送结果回 Popup
    // ---------------------------------------------------------
    chrome.runtime.sendMessage({ 
        action: "scrape_complete", 
        data: videos 
    });
}`
};

// ---------------------------------------------------------
// 执行写入操作
// ---------------------------------------------------------

console.log(`\n📦 正在准备创建扩展程序...`);

// 1. 创建目录
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
    console.log(`✅ 已创建目录: ${dirName}`);
} else {
    console.log(`ℹ️ 目录已存在: ${dirName}`);
}

// 2. 写入文件
try {
    Object.entries(files).forEach(([fileName, content]) => {
        const filePath = path.join(targetDir, fileName);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   📄 已写入: ${fileName}`);
    });
    
    console.log(`\n🎉 成功！所有文件已生成在 "${dirName}" 目录中。`);
    console.log(`👉 请在 Chrome 扩展管理页面加载此目录即可使用。`);
} catch (err) {
    console.error(`❌ 发生错误:`, err.message);
}