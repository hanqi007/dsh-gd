/* dsh-gd runtime — 由 src/scene.js + src/boot.js 构建，请勿手改 */
(function () {
  'use strict'

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
    '<div class="gd-console"><div class="gd-console-bar">GUDI CONSOLE · ATTACHING</div>' +
      '<div class="gd-console-body"></div></div>' +
    '<div class="gd-copy">' +
      '<div class="gd-title">' + escapeHtml(cfg.title) + '</div>' +
      '<div class="gd-sub">' + escapeHtml(cfg.sub) + '</div>' +
    '</div>' +
    (cfg.showLoading === false
      ? ''
      : '<div class="gd-load"><div class="gd-load-bar"><i></i></div></div>') +
    (cfg.allowSkip === false ? '' : '<div class="gd-hint">点击任意处进入</div>')
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* ============================================================================
 * dsh-gd — 运行时（播放、时序、跳过、揭幕）
 * ----------------------------------------------------------------------------
 * 配置来源：window.__DSH_GD_CONFIG__（Host 注入或客户端自举时写入）。
 * 模式判断也在这里做：session / daily 用 storage 标记，命中就立刻移除根节点，
 * 用户不会先看到一帧黑屏再消失。
 * ========================================================================== */

var ROOT_ID = 'dsh-gd-root'


/* ── 桌面端标题栏 ───────────────────────────────────────────────────────────
   Windows 桌面的标题栏是 overlay：右上角三个按钮画在一块白色底上，和深色
   启动动画撞在一起很扎眼。这里在播放期间把那一层的底色与图标一起透明化，
   揭幕 / 跳过 / 异常退出时一律还原。
   非 Windows 桌面端整段空转，不影响 web profile。 */
var chromeSync = (function () {
  var CLEAR = 'rgba(0, 0, 0, 0)'
  var VARS = ['--dsw-specific-sidebar-fill', '--dsw-alias-label-primary']
  var MAX_HOLD_MS = 60000          /* 硬上限：万一动画卡住，别把按钮永久藏住 */
  var rootEl = document.documentElement
  var state = { applied: false, probe: null, settledHits: 0 }
  var savedVars = {}
  var retryTimers = []
  var keepAlive = null
  var holdTimer = null

  function isDesktopWin() {
    try {
      var nav = (typeof window !== 'undefined' && window.navigator) ||
        (typeof navigator !== 'undefined' ? navigator : null)
      if (!nav || !/Win/.test(nav.userAgent || '')) return false
      var loc = (typeof window !== 'undefined' && window.location) ||
        (typeof location !== 'undefined' ? location : null)
      if (loc && loc.protocol === 'dsh-app:') return true
      var de = document && document.documentElement
      return !!(de && de.hasAttribute && de.hasAttribute('data-windows-titlebar'))
    } catch (e) { return false }
  }

  /* preload 的探针是 span，内联 background-color 的声明值里带这个 token 名 */
  function findProbe() {
    try {
      if (!document.querySelector) return null
      var el = document.querySelector('span[style*="dsw-specific-sidebar-fill"]')
      if (el) return el
      if (!document.querySelectorAll) return null
      var spans = document.querySelectorAll('span')
      for (var i = 0; i < spans.length; i++) {
        var sp = spans[i]
        if (!sp.style || typeof sp.style.getPropertyValue !== 'function') continue
        var bg = sp.style.getPropertyValue('background-color')
        if (bg && bg.indexOf('--dsw-specific-sidebar-fill') !== -1) return sp
      }
    } catch (e) { /* 兜底不再抛 */ }
    return null
  }

  /* preload 观察 head 的 childList 与 body 的 style；两条一起打，任一条生效即可 */
  function poke() {
    try {
      if (document.head) {
        var st = document.createElement('style')
        st.setAttribute('data-gd-chrome-poke', '1')
        st.textContent = '/*gd-poke*/'
        document.head.appendChild(st)
        if (st.parentNode) st.parentNode.removeChild(st)
      }
    } catch (e) { /* 兜底不再抛 */ }
    try {
      if (document.body && document.body.style) {
        document.body.style.setProperty('--gd-chrome-poke', String(Date.now() % 1000000))
        document.body.style.removeProperty('--gd-chrome-poke')
      }
    } catch (e) { /* 兜底不再抛 */ }
  }

  function settled() {
    try {
      var p = state.probe
      if (!p || p.isConnected === false) return false
      if (typeof getComputedStyle !== 'function') return false
      return getComputedStyle(p).backgroundColor === CLEAR
    } catch (e) { return false }
  }

  function apply() {
    try {
      var probe = state.probe
      if (!probe || probe.isConnected === false) probe = state.probe = findProbe()
      if (probe) {
        probe.style.setProperty('background-color', CLEAR)
        probe.style.setProperty('color', CLEAR)
      }
      if (rootEl) for (var j = 0; j < VARS.length; j++) rootEl.style.setProperty(VARS[j], CLEAR)
      poke()
    } catch (e) { /* 兜底不再抛 */ }
  }

  function stopTimers() {
    for (var r = 0; r < retryTimers.length; r++) clearTimeout(retryTimers[r])
    retryTimers = []
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null }
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
  }

  function hide() {
    if (!isDesktopWin()) return
    try {
      if (!state.applied) {
        state.applied = true
        state.settledHits = 0
        for (var i = 0; i < VARS.length; i++) savedVars[VARS[i]] = rootEl.style.getPropertyValue(VARS[i])
        state.probe = findProbe()
        holdTimer = setTimeout(show, MAX_HOLD_MS)
      }
      apply()
      for (var r = 0; r < retryTimers.length; r++) clearTimeout(retryTimers[r])
      retryTimers = []
      var delays = [140, 520, 1400]
      for (var d = 0; d < delays.length; d++) retryTimers.push(setTimeout(apply, delays[d]))
      if (!keepAlive) {
        keepAlive = setInterval(function () {
          if (!state.applied) return
          if (settled()) {
            if (++state.settledHits >= 2) { clearInterval(keepAlive); keepAlive = null }
            return
          }
          state.settledHits = 0
          apply()
        }, 600)
      }
    } catch (e) { /* 兜底不再抛 */ }
  }

  function show() {
    if (!state.applied) return
    state.applied = false
    try {
      stopTimers()
      var probe = state.probe
      if (probe) {
        probe.style.removeProperty('background-color')
        probe.style.removeProperty('color')
      }
      if (rootEl) {
        for (var k = 0; k < VARS.length; k++) {
          if (savedVars[VARS[k]]) rootEl.style.setProperty(VARS[k], savedVars[VARS[k]])
          else rootEl.style.removeProperty(VARS[k])
        }
      }
      poke()
      state.probe = null
      state.settledHits = 0
    } catch (e) { /* 兜底不再抛 */ }
  }

  /* 双保险：根节点一被移除就还原标题栏 */
  var observerInstalled = false
  function installObserver() {
    if (observerInstalled) return
    observerInstalled = true
    try {
      if (typeof MutationObserver !== 'function' || !document.body) return
      var mo = new MutationObserver(function (muts) {
        for (var m = 0; m < muts.length; m++) {
          var nodes = muts[m].removedNodes
          for (var n = 0; nodes && n < nodes.length; n++) {
            if (nodes[n] && nodes[n].nodeType === 1 && nodes[n].id === ROOT_ID) { show(); return }
          }
        }
      })
      mo.observe(document.body, { childList: true })
    } catch (e) { /* 兜底不再抛 */ }
  }
  if (document.body) installObserver()
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', installObserver)

  return { hide: hide, show: show, isDesktopWin: isDesktopWin }
})()

var DEFAULTS = {
  enabled: true,
  mode: 'session',
  speed: 1,
  duration: 6200,
  title: '星布谷地',
  sub: 'LOOMIX · GUDI',
  allowSkip: true,
  showLoading: true
}

function num(value, fallback, min, max) {
  var n = Number(value)
  if (!isFinite(n)) n = fallback
  if (n < min) n = min
  if (n > max) n = max
  return n
}

function readFlag(area, key) {
  try {
    return window[area].getItem(key)
  } catch (e) {
    return null
  }
}

function writeFlag(area, key, value) {
  try {
    window[area].setItem(key, value)
  } catch (e) { /* 隐私模式 */ }
}

;(function () {
  'use strict'

  var root = document.getElementById(ROOT_ID)
  if (!root) return
  if (window.__DSH_GD_DONE__) return
  window.__DSH_GD_DONE__ = true

  var cfg = Object.assign({}, DEFAULTS, window.__DSH_GD_CONFIG__ || {})
  cfg.speed = num(cfg.speed, 1, 0.35, 3)
  cfg.duration = num(cfg.duration, DEFAULTS.duration, 1200, 20000)

  function bail() {
    /* 这次不播：把根节点和滚动锁都收回，页面上不留任何黑块 */
    try { document.documentElement.classList.remove('gd-lock') } catch (e) {}
    if (root.parentNode) root.parentNode.removeChild(root)
  }

  if (cfg.enabled === false) { bail(); return }

  var today = new Date().toISOString().slice(0, 10)
  if (cfg.mode === 'session' && readFlag('sessionStorage', 'dsh-gd:shown') === '1') { bail(); return }
  if (cfg.mode === 'daily' && readFlag('localStorage', 'dsh-gd:day') === today) { bail(); return }
  if (cfg.mode === 'once' && readFlag('localStorage', 'dsh-gd:once') === '1') { bail(); return }

  var doc = document.documentElement
  try { doc.classList.add('gd-lock') } catch (e) {}
  /* 根节点注入时是隐藏的：确定要播才显示，跳过时一帧黑屏都不会出现 */
  try { root.style.display = '' } catch (e) {}
  /* 桌面端：播放期间把标题栏那块白底一起藏掉，揭幕时还原 */
  chromeSync.hide()

  var finished = false
  var timers = []

  function at(ms, fn) {
    timers.push(setTimeout(fn, Math.round(ms / cfg.speed)))
  }

  root.innerHTML = buildLayer(cfg)

  /* 星尘：随机撒点，各自闪烁 */
  try {
    var box = root.querySelector('.gd-stars')
    if (box) {
      var frag = document.createDocumentFragment()
      for (var i = 0; i < 110; i++) {
        var s = document.createElement('i')
        s.style.left = (Math.random() * 100).toFixed(2) + '%'
        s.style.top = (Math.random() * 100).toFixed(2) + '%'
        s.style.opacity = (0.2 + Math.random() * 0.6).toFixed(2)
        s.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's'
        s.style.animationDuration = (2.2 + Math.random() * 3).toFixed(2) + 's'
        var size = Math.random() < 0.15 ? 3 : 2
        s.style.width = size + 'px'
        s.style.height = size + 'px'
        frag.appendChild(s)
      }
      box.appendChild(frag)
    }
  } catch (e) { /* 星点只是装饰 */ }

  /* 萤火虫：岛屿周围浮动的暖光点，各自带随机位移 */
  try {
    var fbox = root.querySelector('.gd-fireflies')
    if (fbox) {
      for (var fi = 0; fi < 20; fi++) {
        var fly = document.createElement('i')
        fly.style.left = (33 + Math.random() * 34).toFixed(2) + '%'
        fly.style.top = (40 + Math.random() * 28).toFixed(2) + '%'
        fly.style.animationDelay = (-Math.random() * 7).toFixed(2) + 's'
        fly.style.animationDuration = (4.4 + Math.random() * 4).toFixed(2) + 's'
        fly.style.setProperty('--dx', (Math.random() * 44 - 22).toFixed(1) + 'px')
        fly.style.setProperty('--dy', (-26 - Math.random() * 46).toFixed(1) + 'px')
        fly.style.width = fly.style.height = (Math.random() < 0.3 ? 5 : 4) + 'px'
        fbox.appendChild(fly)
      }
    }
  } catch (e) { /* 装饰 */ }

  /* 流星：隔几秒斜划一颗，随时可能来，但不会太密 */
  try {
    var mbox = root.querySelector('.gd-meteors')
    if (mbox) {
      var meteorTimer = 0
      var spawnMeteor = function () {
        if (!mbox.parentNode || finished) return
        var m = document.createElement('i')
        m.style.left = (6 + Math.random() * 72).toFixed(1) + '%'
        m.style.top = (4 + Math.random() * 34).toFixed(1) + '%'
        m.style.animationDuration = (1.05 + Math.random() * 0.75).toFixed(2) + 's'
        m.style.transform = 'rotate(' + (18 + Math.random() * 16).toFixed(0) + 'deg)'
        mbox.appendChild(m)
        setTimeout(function () {
          if (m.parentNode) m.parentNode.removeChild(m)
        }, 2600)
        meteorTimer = setTimeout(spawnMeteor, 1500 + Math.random() * 2400)
      }
      meteorTimer = setTimeout(spawnMeteor, 700)
      timers.push(meteorTimer)
    }
  } catch (e) { /* 装饰 */ }

  var black = root.querySelector('.gd-black')
  at(240, function () {
    if (black) black.classList.add('gd-clear')
  })

  /* 收尾：场景压暗 → 控制台淡入 → 逐行打印 → 交给 finish */
  try {
    var sceneSv = root.querySelector('.gd-scene')
    var consoleEl = root.querySelector('.gd-console')
    var consoleBody = root.querySelector('.gd-console-body')
    var CONSOLE_LINES = [
      '> mount /gudi/island',
      '  ok · 512 blocks',
      '> load loomix.runtime',
      '  ok · gudi 2.4',
      '> hydrate terrain',
      '  ok · 4 orbs anchored',
      '> ignite cottage lamp',
      '  ok · warm light on',
      '> open gate',
      '  ready · welcome home'
    ]
    if (sceneSv && consoleEl && consoleBody) {
      at(Math.max(1400, cfg.duration - 3600), function () {
        sceneSv.classList.add('gd-dim')
      })
      at(Math.max(1700, cfg.duration - 3300), function () {
        consoleEl.classList.add('gd-in')
        var i = 0
        var tick = function () {
          if (finished) return
          var line = document.createElement('div')
          line.className = 'gd-console-line' + (CONSOLE_LINES[i].indexOf('ok') === 2 ||
            CONSOLE_LINES[i].indexOf('ready') === 2 ? ' gd-ok' : '')
          line.textContent = CONSOLE_LINES[i]
          consoleBody.appendChild(line)
          i++
          if (i < CONSOLE_LINES.length) timers.push(setTimeout(tick, 190))
        }
        tick()
      })
    }
  } catch (e) { /* 控制台只是过场 */ }

  function finish(skipped) {
    if (finished) return
    finished = true
    while (timers.length) clearTimeout(timers.pop())
    try { document.removeEventListener('keydown', onKey) } catch (e) {}
    try { root.removeEventListener('click', onClick) } catch (e) {}

    /* 只有真的播过才写入标记，跳过也算播过（否则下一次还会再来一遍） */
    if (cfg.mode === 'session') writeFlag('sessionStorage', 'dsh-gd:shown', '1')
    if (cfg.mode === 'daily') writeFlag('localStorage', 'dsh-gd:day', today)
    if (cfg.mode === 'once') writeFlag('localStorage', 'dsh-gd:once', '1')

    chromeSync.show()
    root.classList.add('gd-out')
    setTimeout(function () {
      try { doc.classList.remove('gd-lock') } catch (e) {}
      if (root.parentNode) root.parentNode.removeChild(root)
      window.__DSH_GD_DONE__ = true
    }, Math.round(900 / cfg.speed))
  }

  function onClick() { finish(true) }

  function onKey(e) {
    if (e && (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta')) return
    finish(true)
  }

  if (cfg.allowSkip !== false) {
    root.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
  }

  at(cfg.duration, function () { finish(false) })

  /* 兜底：任何异常都不该把用户困在黑屏里 */
  at(cfg.duration + 8000, function () { finish(true) })
})()

})()
