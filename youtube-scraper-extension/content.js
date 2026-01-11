// 工具函数：将浏览量字符串转换为数字
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
        { regex: /(\d+)\s*秒/, unit: 'seconds' },
        { regex: /(\d+)\s*分钟/, unit: 'minutes' },
        { regex: /(\d+)\s*小时/, unit: 'hours' },
        { regex: /(\d+)\s*天/, unit: 'days' },
        { regex: /(\d+)\s*week/i, unit: 'weeks' },
        { regex: /(\d+)\s*month/i, unit: 'months' },
        { regex: /(\d+)\s*year/i, unit: 'years' },
        { regex: /(\d+)\s*second/i, unit: 'seconds' },
        { regex: /(\d+)\s*minute/i, unit: 'minutes' },
        { regex: /(\d+)\s*hour/i, unit: 'hours' },
        { regex: /(\d+)\s*day/i, unit: 'days' }
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
            
            return date.toISOString(); // 返回完整的 ISO 8601 格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
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
                reportStatus(`⏳ 正在检查底部... (${noChangeCount}/3)`);
                
                if (noChangeCount >= 3) break; // 连续3次没有新内容，停止滚动
            } else {
                noChangeCount = 0;
                lastHeight = newHeight;
                // 计算当前已加载的大致元素数量来反馈进度
                const count = document.querySelectorAll('ytd-rich-grid-media').length;
                reportStatus(`⬇️ 已加载更多... (当前约 ${count} 个视频)`);
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
}