document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const btnCopy = document.getElementById('btn-copy');
    const btnCopyUrls = document.getElementById('btn-copy-urls');
    const statusDiv = document.getElementById('status');
    const jsonContainer = document.getElementById('json-container');
    const urlOutput = document.getElementById('url-output');
    const resultsList = document.getElementById('results-list');
    const sortSelect = document.getElementById('sort-select');
    const filterSelect = document.getElementById('filter-select');
    const resultCount = document.getElementById('result-count');
    const controlsBar = document.getElementById('controls-bar');
    const maxVideosInput = document.getElementById('max-videos');

    // 存储原始数据
    let allVideos = [];
    let jsonData = null; // 存储原始JSON用于复制

    // 加载保存的设置
    const savedMaxVideos = localStorage.getItem('maxVideos');
    if (savedMaxVideos !== null) {
        maxVideosInput.value = savedMaxVideos;
    }

    // 保存设置当输入改变时
    maxVideosInput.addEventListener('change', () => {
        localStorage.setItem('maxVideos', maxVideosInput.value);
    });

    // JSON 语法高亮函数
    function highlightJSON(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // 标签页切换
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // 切换按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 切换内容区域
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });

    // 排序和筛选事件监听
    sortSelect.addEventListener('change', updateDisplayedVideos);
    filterSelect.addEventListener('change', updateDisplayedVideos);

    // 应用排序和筛选
    function updateDisplayedVideos() {
        if (!allVideos || allVideos.length === 0) return;

        let videos = [...allVideos]; // 复制数组

        // 应用筛选
        const filterValue = filterSelect.value;
        if (filterValue === 'members') {
            videos = videos.filter(v => v.is_members_only);
        } else if (filterValue === 'non-members') {
            videos = videos.filter(v => !v.is_members_only);
        }

        // 应用排序
        const sortValue = sortSelect.value;
        if (sortValue === 'views-desc') {
            videos.sort((a, b) => b.views - a.views);
        } else if (sortValue === 'views-asc') {
            videos.sort((a, b) => a.views - b.views);
        } else if (sortValue === 'time-desc') {
            videos.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time));
        } else if (sortValue === 'time-asc') {
            videos.sort((a, b) => new Date(a.publish_time) - new Date(b.publish_time));
        }

        // 更新显示
        renderVideoList(videos);
        resultCount.textContent = `显示 ${videos.length} / ${allVideos.length} 个视频`;
    }

    // 渲染列表视图
    function renderVideoList(videos) {
        if (!videos || videos.length === 0) {
            resultsList.innerHTML = '<div class="empty-state">暂无数据</div>';
            return;
        }

        let html = '';
        videos.forEach((video, index) => {
            const viewsFormatted = video.views.toLocaleString();
            const membersOnly = video.is_members_only 
                ? '<span class="badge">会员专属</span>' 
                : '';
            
            html += `
                <div class="video-item">
                    <div class="video-title">${escapeHtml(video.title)}</div>
                    <div class="video-meta">
                        <span class="meta-item">👁️ ${viewsFormatted}</span>
                        <span class="meta-item">📅 ${formatDateTime(video.publish_time)}</span>
                        ${membersOnly}
                    </div>
                    <a class="video-link" href="${escapeHtml(video.url)}" target="_blank" title="${escapeHtml(video.url)}">
                        ${truncateUrl(video.url)}
                    </a>
                </div>
            `;
        });

        resultsList.innerHTML = html;
    }

    // HTML 转义函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // URL截断函数
    function truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    // 格式化时间显示
    function formatDateTime(isoString) {
        if (!isoString || isoString === 'N/A') return 'N/A';
        
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 处理来自 Content Script 的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "update_status") {
            statusDiv.textContent = request.message;
        } 
        else if (request.action === "scrape_complete") {
            const data = request.data;
            
            // 保存原始数据
            allVideos = data;
            
            // 保存JSON用于复制
            jsonData = JSON.stringify(data, null, 2);
            
            // 更新JSON视图（带语法高亮）
            const highlightedJSON = highlightJSON(data);
            jsonContainer.innerHTML = '<pre style="margin: 0;">' + highlightedJSON + '</pre>';
            
            // 更新URL列表视图
            const urls = data.map(video => video.url).join('\n');
            urlOutput.value = urls;
            
            // 显示控制栏和按钮
            controlsBar.style.display = 'flex';
            btnCopyUrls.style.display = 'inline-block';
            
            // 重置筛选和排序
            sortSelect.value = 'views-desc';
            filterSelect.value = 'all';
            
            // 更新列表视图（应用默认排序）
            updateDisplayedVideos();
            
            // 更新状态
            statusDiv.textContent = `✅ 完成！共抓取 ${data.length} 个视频。`;
            btnStart.disabled = false;
            btnStart.style.display = "inline-block"; // 显示开始按钮
            btnStop.style.display = "none"; // 隐藏停止按钮
            btnStop.disabled = false; // 恢复停止按钮状态
            btnStart.textContent = "重新抓取";
            btnCopy.style.display = "block";
        }
        else if (request.action === "scrape_error") {
            statusDiv.textContent = `❌ 错误: ${request.message}`;
            btnStart.disabled = false;
            btnStart.style.display = "inline-block";
            btnStop.style.display = "none";
            btnStop.disabled = false;
            btnStart.textContent = "开始抓取";
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
        btnStart.style.display = "none"; // 隐藏开始按钮
        btnStop.style.display = "inline-block"; // 显示停止按钮
        btnStart.textContent = "抓取中...";
        statusDiv.textContent = "正在初始化脚本...";
        jsonContainer.innerHTML = ""; // 清空JSON显示
        urlOutput.value = ""; // 清空URL列表
        resultsList.innerHTML = '<div class="empty-state">正在抓取数据...</div>';
        btnCopy.style.display = "none";
        btnCopyUrls.style.display = "none"; // 隐藏URL复制按钮
        controlsBar.style.display = "none"; // 隐藏控制栏
        allVideos = []; // 清空数据
        jsonData = null; // 清空JSON数据

        // 读取并验证数量限制
        let maxVideos = parseInt(maxVideosInput.value) || 0;
        if (maxVideos < 0) {
            maxVideos = 0;
            maxVideosInput.value = 0;
        }

        // 向 content script 发送开始命令（包含数量限制）
        chrome.tabs.sendMessage(tab.id, { 
            action: "start_scrape",
            maxVideos: maxVideos
        }).catch((error) => {
            statusDiv.textContent = "⚠️ 连接失败，请刷新页面后重试。";
            btnStart.disabled = false;
            console.error(error);
        });
    });

    // 点击停止按钮
    btnStop.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        btnStop.disabled = true;
        statusDiv.textContent = "⏹ 正在停止抓取...";
        
        // 发送停止消息到 content script
        chrome.tabs.sendMessage(tab.id, { action: "stop_scrape" }).catch((error) => {
            console.error("发送停止消息失败:", error);
        });
    });

    // 点击复制JSON按钮
    btnCopy.addEventListener('click', async () => {
        if (!jsonData) return;
        
        try {
            await navigator.clipboard.writeText(jsonData);
            const originalText = btnCopy.textContent;
            btnCopy.textContent = "✅ 已复制！";
            setTimeout(() => {
                btnCopy.textContent = originalText;
            }, 2000);
        } catch (err) {
            // 降级到旧方法
            const textarea = document.createElement('textarea');
            textarea.value = jsonData;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            const originalText = btnCopy.textContent;
            btnCopy.textContent = "✅ 已复制！";
            setTimeout(() => {
                btnCopy.textContent = originalText;
            }, 2000);
        }
    });

    // 点击复制URL按钮
    btnCopyUrls.addEventListener('click', async () => {
        if (!urlOutput.value) return;
        
        try {
            await navigator.clipboard.writeText(urlOutput.value);
            const originalText = btnCopyUrls.textContent;
            btnCopyUrls.textContent = "✅ 已复制！";
            setTimeout(() => {
                btnCopyUrls.textContent = originalText;
            }, 2000);
        } catch (err) {
            // 降级到旧方法
            urlOutput.select();
            document.execCommand('copy');
            
            const originalText = btnCopyUrls.textContent;
            btnCopyUrls.textContent = "✅ 已复制！";
            setTimeout(() => {
                btnCopyUrls.textContent = originalText;
            }, 2000);
        }
    });
});