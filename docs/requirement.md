
# 新需求
如果检测到页面的url是youtube, 并且包含playlist, 则启动另外的抓取逻辑
严格区分playlist和channel, 采用不同的抓取方法, 不要混在一起

# 示例
以: https://www.youtube.com/playlist?list=PLU0HyYmOgH8Xn06fDThwLDh95igfZpurQ
为例子, 这是一个包含playlist的url
这是其中一条视频的dom
```
<div id="content" class="style-scope ytd-playlist-video-renderer">
  <div id="container" class="style-scope ytd-playlist-video-renderer">
    <ytd-thumbnail id="thumbnail" hide-playback-status="" class="style-scope ytd-playlist-video-renderer" size="medium" loaded=""><!--css-build:shady--><!--css_build_scope:ytd-thumbnail--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="null" href="/watch?v=s0q1sgX1jqg&amp;list=PLU0HyYmOgH8Xn06fDThwLDh95igfZpurQ&amp;index=47&amp;pp=iAQB">
  <yt-image class="style-scope ytd-thumbnail">
  <img alt="true" class="ytCoreImageHost ytCoreImageFillParentHeight ytCoreImageFillParentWidth ytCoreImageContentModeScaleAspectFill ytCoreImageLoaded" style="background-color: transparent;" src="https://i.ytimg.com/vi/s0q1sgX1jqg/hqdefault.jpg?sqp=-oaymwFBCNACELwBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AHAAoAC1gGKAgwIABABGGUgTyhBMA8=&amp;rs=AOn4CLDWc3HdyVrC0nsfvbiZkXiBmcW25w"></yt-image>
  
  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" hide-time-status="" overlay-style="DEFAULT"><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-time-status-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><ytd-badge-supported-renderer is-thumbnail-badge="" class="style-scope ytd-thumbnail-overlay-time-status-renderer" system-icons="" use-badge-shape=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer><div class="thumbnail-overlay-badge-shape style-scope ytd-thumbnail-overlay-time-status-renderer"><badge-shape class="yt-badge-shape yt-badge-shape--thumbnail-default yt-badge-shape--thumbnail-badge yt-badge-shape--typography" role="img" aria-label="51 minutes, 39 seconds"><div class="yt-badge-shape__text">51:39</div></badge-shape></div><div id="time-status" class="style-scope ytd-thumbnail-overlay-time-status-renderer" hidden=""><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span id="text" class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="51 minutes, 39 seconds">
    51:39
  </span></div></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail" now-playing-badge=""><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-now-playing-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><span id="overlay-text" class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span>
<ytd-thumbnail-overlay-equalizer class="style-scope ytd-thumbnail-overlay-now-playing-renderer"><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-equalizer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><svg xmlns="http://www.w3.org/2000/svg" id="equalizer" viewBox="0 0 55 95" class="style-scope ytd-thumbnail-overlay-equalizer">
  <g class="style-scope ytd-thumbnail-overlay-equalizer">
    <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="0"></rect>
    <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="20"></rect>
    <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="40"></rect>
  </g>
</svg>
</ytd-thumbnail-overlay-equalizer>
</ytd-thumbnail-overlay-now-playing-renderer></div>
  <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div>
  <div id="hover-overlays" class="style-scope ytd-thumbnail"></div>
</a>
</ytd-thumbnail>
    <div id="meta" class="style-scope ytd-playlist-video-renderer">
      <h3 class="style-scope ytd-playlist-video-renderer" aria-label="Leonard Bernstein - Young People's Concerts: Two Ballet Birds 51 minutes">
        <ytd-badge-supported-renderer id="top-standalone-badge" class="style-scope ytd-playlist-video-renderer" system-icons="" use-badge-shape=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
        <a id="video-title" class="yt-simple-endpoint style-scope ytd-playlist-video-renderer" title="Leonard Bernstein - Young People's Concerts: Two Ballet Birds" href="/watch?v=s0q1sgX1jqg&amp;list=PLU0HyYmOgH8Xn06fDThwLDh95igfZpurQ&amp;index=47&amp;pp=iAQB">
          Leonard Bernstein - Young People's Concerts: Two Ballet Birds
        </a>
      </h3>
      <ytd-video-meta-block class="playlist style-scope ytd-playlist-video-renderer byline-separated" amsterdam-post-mvp=""><!--css-build:shady--><!--css_build_scope:ytd-video-meta-block--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
<div id="metadata" class="style-scope ytd-video-meta-block">
  <div id="byline-container" class="style-scope ytd-video-meta-block">
    <div id="attributed-channel-name" class="style-scope ytd-video-meta-block" hidden=""></div>
    <ytd-channel-name id="channel-name" class=" style-scope ytd-video-meta-block style-scope ytd-video-meta-block"><!--css-build:shady--><!--css_build_scope:ytd-channel-name--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="container" class="style-scope ytd-channel-name">
  <div id="text-container" class="style-scope ytd-channel-name">
    <yt-formatted-string id="text" link-inherit-color="" respect-lang-dir="" title="Trillo" class="style-scope ytd-channel-name complex-string" ellipsis-truncate="" ellipsis-truncate-styling="" dir="auto" has-link-only_="" style="text-align: left;"><a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false" href="/@trine5044">Trillo</a></yt-formatted-string>
  </div>
  <tp-yt-paper-tooltip aria-hidden="true" fit-to-visible-bounds="" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1" aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js--><div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
  
    Trillo
  
</div>
</tp-yt-paper-tooltip>
</div>
<ytd-badge-supported-renderer class="style-scope ytd-channel-name" system-icons="" use-badge-shape="" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
</ytd-channel-name>
    <div id="separator" class="style-scope ytd-video-meta-block">•</div>
    <yt-formatted-string id="video-info" class="style-scope ytd-video-meta-block"><span dir="auto" class="style-scope yt-formatted-string">2.9K views</span><span dir="auto" class="style-scope yt-formatted-string"> • </span><span dir="auto" class="style-scope yt-formatted-string">3 years ago</span></yt-formatted-string>
  </div>
  <div id="metadata-line" class="style-scope ytd-video-meta-block">
    
    <ytd-badge-supported-renderer class="inline-metadata-badge style-scope ytd-video-meta-block" system-icons="" use-badge-shape="" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
    <div id="separator" class="style-scope ytd-video-meta-block" hidden="">•</div>
    <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat>
  </div>
</div>
<div id="additional-metadata-line" class="style-scope ytd-video-meta-block">
  <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat>
</div>

</ytd-video-meta-block>
      <ytd-badge-supported-renderer id="bottom-badges" class="style-scope ytd-playlist-video-renderer" system-icons="" use-badge-shape="" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
      <ytd-badge-supported-renderer id="bottom-standalone-badge" class="style-scope ytd-playlist-video-renderer" system-icons="" use-badge-shape="" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
      <div id="engagement-bar" class="style-scope ytd-playlist-video-renderer"></div>
    </div>
  </div>
  <ytd-badge-supported-renderer id="badges" class="style-scope ytd-playlist-video-renderer" system-icons="" use-badge-shape="" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
  <yt-formatted-string id="contributor" link-inherit-color="" class="style-scope ytd-playlist-video-renderer" is-empty="" hidden=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
  <div id="offer-button" class="style-scope ytd-playlist-video-renderer"></div>
</div>
```
dom中包含了json数据需要的字段, 比如
 标题, 完整视频链接, 发布日期, 访问量等
从中抓取这些数据形成json文件
# 其他逻辑

其他逻辑跟原来的实现完全一致
1. 自动滚动到最底端
2. 抓取的内容输出为3种格
3. 限制视频数量

