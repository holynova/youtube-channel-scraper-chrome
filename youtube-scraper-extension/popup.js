document.addEventListener('DOMContentLoaded', () => {
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
            statusDiv.textContent = `✅ 完成！共抓取 ${data.length} 个视频。`;
            btnStart.disabled = false;
            btnStart.textContent = "重新抓取";
            btnCopy.style.display = "block";
        }
        else if (request.action === "scrape_error") {
            statusDiv.textContent = `❌ 错误: ${request.message}`;
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
});