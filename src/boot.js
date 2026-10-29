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

  /* 无障碍：系统开启「减少动态效果」时直接跳过，不播动画 */
  try {
    if (cfg.respectReducedMotion !== false &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bail(); return
    }
  } catch (e) { /* 兼容旧内核 */ }

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
      /* 自适应星数：小窗口少画点，减少重绘压力 */
      var area = Math.max(1, window.innerWidth * window.innerHeight)
      var starCount = Math.max(40, Math.min(110, Math.round(area / 12000)))
      for (var i = 0; i < starCount; i++) {
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
      var flyCount = window.innerWidth < 900 ? 10 : 20
      for (var fi = 0; fi < flyCount; fi++) {
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
        /* 同时在飞的流星最多 6 颗：留点余量给低端设备，也避免极端情况下堆积 */
        if (mbox.childElementCount >= 6) {
          meteorTimer = setTimeout(spawnMeteor, 1200 + Math.random() * 1800)
          return
        }
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
      '> 初始化世界坐标',
      '  完成 · 1200 × 700',
      '> 生成岛屿地形',
      '  完成 · 512 块草皮',
      '> 播种植被与树影',
      '  完成 · 2 棵成树',
      '> 点亮小屋灯火',
      '  完成 · 暖光常亮',
      '> 安置浮空星球',
      '  完成 · 四轨锁定',
      '> 世界生成完毕',
      '  欢迎来到星布谷地'
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
          var txt = CONSOLE_LINES[i]
          var isResult = txt.indexOf('  完成') === 0 || txt.indexOf('  欢迎') === 0
          line.className = 'gd-console-line' + (isResult ? ' gd-ok' : '')
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
