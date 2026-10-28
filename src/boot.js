/* ============================================================================
 * dsh-gd — 运行时（播放、时序、跳过、揭幕）
 * ----------------------------------------------------------------------------
 * 配置来源：window.__DSH_GD_CONFIG__（Host 注入或客户端自举时写入）。
 * 模式判断也在这里做：session / daily 用 storage 标记，命中就立刻移除根节点，
 * 用户不会先看到一帧黑屏再消失。
 * ========================================================================== */

var ROOT_ID = 'dsh-gd-root'

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

  var black = root.querySelector('.gd-black')
  at(240, function () {
    if (black) black.classList.add('gd-clear')
  })

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
