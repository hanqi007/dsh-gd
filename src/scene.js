/**
 * dsh-gd — 星布谷地开机动画
 * Copyright 2026 hanlin (hanqi007)
 *
 * Licensed under the Apache License, Version 2.0, with additional terms:
 *   - Apache 2.0 full text .... LICENSE
 *   - Additional restrictions . LICENSE-CUSTOM.md
 *
 * 允许免费使用与分发；不得以本软件为收费主体，
 * 也不得在自身不是收费主体的前提下进行收费分发。
 * Free to use and distribute, but you may not charge for the software
 * itself, nor charge for distributing it.
 */
/* ============================================================================
 * dsh-gd — 场景绘制（原创，纯 SVG，不含任何外部素材）
 * ----------------------------------------------------------------------------
 * 一座漂浮在星海上的小岛：草地椭圆 + 岩层底座、两棵树、亮着灯的小屋、
 * 四颗漂移的小星球。返回 SVG 字符串；动画交给 boot.css 里的关键帧。
 * ========================================================================== */

function buildScene() {
  return '' +
    '<svg class="gd-scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="gdSky" x1="0" y1="0" x2="0.5" y2="1">' +
          '<stop offset="0" stop-color="#050f1e"/>' +
          '<stop offset="0.5" stop-color="#0a2a3e"/>' +
          '<stop offset="1" stop-color="#0d3a38"/>' +
        '</linearGradient>' +
        '<linearGradient id="gdGrass" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#7fd35a"/>' +
          '<stop offset="1" stop-color="#2f7a3a"/>' +
        '</linearGradient>' +
        '<linearGradient id="gdRock" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8a5a3c"/>' +
          '<stop offset="1" stop-color="#38231a"/>' +
        '</linearGradient>' +
        '<radialGradient id="gdWin" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="#fff2b0" stop-opacity="0.55"/>' +
          '<stop offset="1" stop-color="#ffb648" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="gdAurora" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#4fe6c0" stop-opacity="0"/>' +
          '<stop offset="0.32" stop-color="#4fe6c0" stop-opacity="0.5"/>' +
          '<stop offset="0.68" stop-color="#7fb6ff" stop-opacity="0.38"/>' +
          '<stop offset="1" stop-color="#7fb6ff" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<radialGradient id="gdHalo" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="#8ef2d0" stop-opacity="0.20"/>' +
          '<stop offset="1" stop-color="#8ef2d0" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<filter id="gdSoft" x="-30%" y="-30%" width="160%" height="160%">' +
          '<feGaussianBlur stdDeviation="18"/>' +
        '</filter>' +
        '<filter id="gdSoftSoft" x="-40%" y="-40%" width="180%" height="180%">' +
          '<feGaussianBlur stdDeviation="9"/>' +
        '</filter>' +
      '</defs>' +

      '<rect width="1200" height="700" fill="url(#gdSky)"/>' +

      '<g class="gd-aurora" filter="url(#gdSoft)">' +
        '<path d="M-120 190 C 180 100, 460 250, 740 160 S 1180 110, 1320 180" stroke="url(#gdAurora)" stroke-width="96" fill="none" stroke-linecap="round" opacity="0.42"/>' +
        '<path d="M-120 286 C 220 206, 500 330, 800 240 S 1220 200, 1320 270" stroke="url(#gdAurora)" stroke-width="58" fill="none" stroke-linecap="round" opacity="0.26"/>' +
      '</g>' +

      '<g class="gd-cloud gd-cloud-a" fill="#cfeaff" opacity="0.10" filter="url(#gdSoftSoft)">' +
        '<path d="M120 168 q 26 -34 74 -30 q 22 -30 66 -22 q 30 -20 64 4 q 40 -8 58 22 q 34 -2 40 24 q -26 14 -70 8 q -46 12 -98 4 q -54 10 -104 -2 q -24 -2 -30 -8 z"/>' +
      '</g>' +
      '<g class="gd-cloud gd-cloud-b" fill="#cfeaff" opacity="0.08" filter="url(#gdSoftSoft)">' +
        '<path d="M812 344 q 30 -32 82 -28 q 24 -26 70 -18 q 32 -18 66 6 q 42 -6 60 22 q 32 0 38 22 q -28 14 -72 8 q -48 12 -102 4 q -56 10 -108 -2 q -22 -6 -34 -14 z"/>' +
      '</g>' +

      '<ellipse class="gd-haze" cx="600" cy="300" rx="540" ry="330" fill="url(#gdHalo)"/>' +

      '<g class="gd-orb">' +
        '<circle cx="190" cy="150" r="58" fill="#c9c0a8" opacity="0.85"/>' +
        '<circle cx="176" cy="136" r="18" fill="#e6dfcc" opacity="0.5"/>' +
      '</g>' +
      '<g class="gd-orb">' +
        '<circle cx="1010" cy="128" r="74" fill="#d9a34c" opacity="0.9"/>' +
        '<ellipse cx="1010" cy="128" rx="74" ry="18" fill="#f0c97c" opacity="0.32"/>' +
      '</g>' +
      '<g class="gd-orb"><circle cx="140" cy="560" r="46" fill="#8fd96a" opacity="0.78"/></g>' +
      '<g class="gd-orb"><circle cx="1070" cy="540" r="62" fill="#5f9fd6" opacity="0.72"/></g>' +

      '<g class="gd-debris">' +
        '<ellipse cx="336" cy="556" rx="20" ry="13" fill="#6b5544" opacity="0.85"/>' +
        '<ellipse cx="878" cy="576" rx="24" ry="15" fill="#5a4a3a" opacity="0.8"/>' +
        '<ellipse cx="962" cy="432" rx="13" ry="9" fill="#6b5544" opacity="0.72"/>' +
      '</g>' +

      '<ellipse class="gd-island-halo" cx="600" cy="430" rx="312" ry="162" fill="url(#gdHalo)"/>' +

      '<g class="gd-island">' +
        '<path d="M380 410 C380 520 470 600 600 600 C730 600 820 520 820 410 Z" fill="url(#gdRock)"/>' +
        '<ellipse cx="600" cy="405" rx="235" ry="118" fill="url(#gdGrass)"/>' +
        '<ellipse cx="600" cy="392" rx="228" ry="106" fill="#8ee06a" opacity="0.22"/>' +

        '<g>' +
          '<rect x="432" y="318" width="16" height="58" rx="7" fill="#5b3a22"/>' +
          '<circle cx="440" cy="300" r="52" fill="#3f9d4a"/>' +
          '<circle cx="418" cy="316" r="38" fill="#56b95c"/>' +
          '<circle cx="462" cy="316" r="34" fill="#4aa851"/>' +
        '</g>' +

        '<g>' +
          '<rect x="756" y="318" width="16" height="56" rx="7" fill="#5b3a22"/>' +
          '<circle cx="764" cy="296" r="48" fill="#3f9d4a"/>' +
          '<circle cx="742" cy="314" r="34" fill="#56b95c"/>' +
          '<circle cx="786" cy="312" r="30" fill="#4aa851"/>' +
        '</g>' +

        '<g>' +
          '<path d="M540 300 L600 262 L660 300 Z" fill="#6b4a2f"/>' +
          '<rect x="546" y="300" width="108" height="96" rx="6" fill="#8a6440"/>' +
          '<path d="M570 396 L570 340 Q600 306 630 340 L630 396 Z" fill="#3a2a1c"/>' +
          '<path d="M574 392 L574 342 Q600 312 626 342 L626 392 Z" fill="#ffd76a" opacity="0.9"/>' +
          '<circle class="gd-window" cx="600" cy="322" r="13" fill="#fff0ad"/>' +
          '<rect class="gd-window" x="648" y="330" width="16" height="22" rx="3" fill="#ffe28a"/>' +
        '</g>' +

        '<ellipse cx="600" cy="360" rx="120" ry="90" fill="url(#gdWin)" opacity="0.45"/>' +
      '</g>' +
    '</svg>'
}

/** 图层骨架：黑幕 + 场景 + 星尘容器 + 文字 + 加载条 + 跳过提示 */
function buildLayer(cfg) {
  return '' +
    '<div class="gd-black"></div>' +
    buildScene() +
    '<div class="gd-stars"></div>' +
    '<div class="gd-meteors"></div>' +
    '<div class="gd-fireflies"></div>' +
    '<div class="gd-console"><div class="gd-console-bar">世界控制台 · 正在生成</div>' +
      '<div class="gd-console-body"></div></div>' +
    '<div class="gd-copy">' +
      '<div class="gd-title">' + escapeHtml(cfg.title) + '</div>' +
      '<div class="gd-sub">' + escapeHtml(cfg.sub) + '</div>' +
    '</div>' +
    (cfg.showLoading === false
      ? ''
      : '<div class="gd-load"><div class="gd-load-bar"><i></i></div></div>') +
    (cfg.allowSkip === false ? '' : '<div class="gd-hint">点击任意处进入</div>') +
    ''
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
