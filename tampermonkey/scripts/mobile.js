// ==UserScript==
// @name         VK-Video-Downloader-mobile
// @namespace    https://github.com/JustKappaMan
// @version      1.1.1
// @license      MIT
// @description  Скачивайте видео с сайта «ВКонтакте» в желаемом качестве
// @author       Kirill "JustKappaMan" Volozhanin
// @match        https://m.vk.com/*
// @run-at       document-idle
// @iconURL      https://raw.githubusercontent.com/JustKappaMan/VK-Video-Downloader/main/tampermonkey/icons/icon128.png
// @homepageURL  https://github.com/JustKappaMan/VK-Video-Downloader
// @supportURL   https://github.com/JustKappaMan/VK-Video-Downloader/issues
// @downloadURL  https://raw.githubusercontent.com/JustKappaMan/VK-Video-Downloader/main/tampermonkey/scripts/mobile.js
// @updateURL    https://raw.githubusercontent.com/JustKappaMan/VK-Video-Downloader/main/tampermonkey/scripts/mobile.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let lastUrl = location.href;
  let mainHasBeenCalled = false;

  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      mainHasBeenCalled = false;
    }

    if (
      location.pathname.startsWith('/video') &&
      !location.pathname.startsWith('/videos')
    ) {
      const checker = setInterval(() => {
        if (document.querySelector('div.VideoPage__video')) {
          clearInterval(checker);
          if (!mainHasBeenCalled) {
            mainHasBeenCalled = true;
            main();
          }
        }
      }, 100);
    }
  }).observe(document.body, { subtree: true, childList: true });

  function main() {
    if (document.querySelector('div.VideoPage__video iframe')) {
      showPanel(createErrorPanel());
    } else if (document.querySelector('div.VideoPage__video video')) {
      showPanel(createDownloadPanel(getVideoSources()));
    }
  }

  function getVideoSources() {
    const sourceTags = Array.from(
      document.querySelectorAll('video source[type="video/mp4"]')
    ).reverse();
    let videoSources = {};

    for (const tag of sourceTags) {
      if (tag.src.includes('&type=4')) {
        /*
         * Да, 144p выбивается из общей логики и имеет тип 4.
         * Возможно отголоски какого-то легаси.
         */
        videoSources['144p'] = tag.src;
      } else if (tag.src.includes('&type=0')) {
        videoSources['240p'] = tag.src;
      } else if (tag.src.includes('&type=1')) {
        videoSources['360p'] = tag.src;
      } else if (tag.src.includes('&type=2')) {
        videoSources['480p'] = tag.src;
      } else if (tag.src.includes('&type=3')) {
        videoSources['720p'] = tag.src;
      } else if (tag.src.includes('&type=5')) {
        videoSources['1080p'] = tag.src;
      } else if (tag.src.includes('&type=6')) {
        videoSources['1440p'] = tag.src;
      } else if (tag.src.includes('&type=7')) {
        videoSources['2160p'] = tag.src;
      }
    }

    return videoSources;
  }

  function createDownloadPanel(videoSources) {
    const label = document.createElement('span');
    label.innerText = 'Скачать:';
    label.style.marginRight = '2px';

    const panel = document.createElement('div');
    panel.id = 'vkVideoDownloaderPanel';
    panel.style.margin = '8px 12px';
    panel.appendChild(label);

    for (const [quality, url] of Object.entries(videoSources)) {
      const aTag = document.createElement('a');
      aTag.href = url;
      aTag.innerText = quality;
      aTag.style.margin = '0 2px';
      panel.appendChild(aTag);
    }

    return panel;
  }

  function createErrorPanel() {
    const label = document.createElement('span');
    label.innerText =
      'Видео со стороннего сайта. Воспользуйтесь инструментами для скачивания с исходного сайта.';
    label.style.color = '#f00';

    const panel = document.createElement('div');
    panel.id = 'vkVideoDownloaderPanel';
    panel.style.margin = '8px 12px';
    panel.appendChild(label);

    return panel;
  }

  function showPanel(panel) {
    document.querySelector('div.VideoPage__video').after(panel);
  }
})();