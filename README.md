# YouTube Channel Scraper Extension

[中文说明](#使用说明) | [English](#usage-guide)

## Introduction / 简介

Chrome extension to scrape all video information from a YouTube channel page. It auto-scrolls to load all videos and exports data to JSON.
这是一个 Chrome 浏览器扩展，用于一键抓取 YouTube 频道的所有视频信息。它会自动滚动加载所有视频并支持导出为 JSON 格式。

## Key Features / 主要功能

- **Auto-Scroll Scraping**: Automatically scrolls to load all videos. / **自动滚动**: 自动加载频道所有视频。
- **Data Export**: Support copying data as JSON, URL list, or Title-URL pairs. / **多格式导出**: 支持导出 JSON、URL列表或标题-链接对。
- **Stop & Resume**: Can stop scraping at any time. / **随时停止**: 支持中途停止抓取并保存已加载数据。
- **Global Sort & Filter**: Sort by Views/Time and Filter by Member status across all views. / **全局排序筛选**: 支持按播放量/时间排序，及会员视频筛选。
- **Limit Control**: Set maximum number of videos to scrape. / **数量限制**: 可设置最大抓取数量。
- **Row Actions**: One-click copy for individual video links. / **便捷操作**: 每行提供复制按钮，快速复制视频链接。
- **Green/White Theme**: Clean and modern UI. / **清新主题**: 全新绿白配色，界面简洁现代。
- 📊 **Rich Data / 丰富数据**: Extracts Title, URL, Views, Publish Time, Members-only status. | 提取标题、链接、播放量、发布时间、是否会员专享等信息。
- 📋 **Easy Export / 便捷导出**: Copy formatted JSON or just URLs with one click. | 一键复制格式化的 JSON 数据或纯视频链接列表。

---

## 使用说明

### 1. 安装扩展
1. 下载本项目源代码。
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`。
3. 打开右上角的 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择本项目的 `youtube-scraper-extension` 文件夹。

### 2. 如何使用
1. 打开任意 YouTube 频道的 **"视频 (Videos)"** 页面 (例如 `https://www.youtube.com/@channel/videos`)。
2. 点击浏览器右上角的扩展图标。
3. (可选) 在输入框中设置 **抓取数量限制**（0 表示无限制）。
4. 点击 **"开始抓取"** 按钮。
5. 页面会自动向下滚动加载视频。
   - 此时你可以随时点击 **"⏹ 停止抓取"** 按钮来中断过程并获取当前数据。
6. 抓取完成后，你可以在扩展窗口中：
   - 预览抓取结果列表。
   - 使用 **"复制 JSON"** 按钮获取完整数据。
   - 切换到 "URL列表" 标签页复制所有视频链接。

---

## Usage Guide

### 1. Installation
1. Download this project source code.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `youtube-scraper-extension` folder.

### 2. How to Use
1. Go to any YouTube Channel's **"Videos"** page (e.g., `https://www.youtube.com/@channel/videos`).
2. Click the extension icon in the browser toolbar.
3. (Optional) Set a **Max Videos limit** (0 for unlimited).
4. Click **"Start Scraping"**.
5. The page will auto-scroll to load videos.
   - You can click **"⏹ Stop"** at any time to halt and save current data.
6. Once finished, you can:
   - Preview the results list.
   - Click **"Copy JSON"** to get the full data.
   - Switch to the "URL List" tab to copy all video links.

