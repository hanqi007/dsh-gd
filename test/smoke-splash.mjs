/* 运行时冒烟：在假 DOM 里真跑一遍 splash.js（场景、星点、跳过、模式、速度） */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const ROOT = path.resolve(import.meta.dirname, '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const source = read('lib/splash.js')
const css = read('lib/splash.css')

let pass = 0
let fail = 0
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name) } else { fail++; console.log('  FAIL ' + name + (detail ? '  → ' + detail : '')) }
}

function run(opts) {
  opts = opts || {}
  const timers = []
  let removed = false
  const added = []
  const stars = []
  const listeners = {}
  const docListeners = {}

  function classList() {
    const set = new Set(opts.classes || [])
    return {
      add(c) { set.add(c) },
      remove(c) { set.delete(c) },
      contains(c) { return set.has(c) },
      toString() { return [...set].join(' ') }
    }
  }

  const black = { classList: classList() }
  const starBox = {
    appendChild(node) {
      if (node && Array.isArray(node.appended)) stars.push.apply(stars, node.appended)
      else stars.push(node)
    }
  }

  const root = {
    innerHTML: '',
    style: { display: 'none', setProperty(k, v) { this[k] = v } },
    classList: classList(),
    querySelector(sel) {
      if (sel === '.gd-black') return black
      if (sel === '.gd-stars') return starBox
      return null
    },
    addEventListener(type, fn) { listeners[type] = fn; added.push(type) },
    removeEventListener() {},
    parentNode: { removeChild() { removed = true } }
  }

  const store = {}
  function storage(name) {
    return {
      getItem(k) { return Object.prototype.hasOwnProperty.call(store, name + ':' + k) ? store[name + ':' + k] : null },
      setItem(k, v) { store[name + ':' + k] = String(v) }
    }
  }

  const elements = []
  const sandbox = {
    console,
    JSON, Object, Array, String, Number, Boolean, Math, Date, RegExp, Error, isFinite,
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length },
    clearTimeout() {},
    document: {
      getElementById(id) { return id === 'dsh-gd-root' ? root : null },
      documentElement: { classList: classList() },
      createElement() {
        const el = { style: {}, classList: classList() }
        elements.push(el)
        return el
      },
      createDocumentFragment() {
        return { appended: [], appendChild(n) { this.appended.push(n) } }
      },
      addEventListener(type, fn) { docListeners[type] = fn },
      removeEventListener() {}
    },
    window: {
      sessionStorage: storage('session'),
      localStorage: storage('local'),
      __DSH_GD_CONFIG__: opts.config || undefined
    }
  }
  if (opts.preload) Object.assign(store, opts.preload)
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox)

  return { root, timers, stars, listeners, docListeners, added, removed: () => removed, store, elements }
}

console.log('\n[1] 场景与图层')
const a = run({ config: { title: '星布谷地', sub: 'LOOMIX · GUDI', speed: 1, duration: 6200 } })
check('构建了 SVG 场景', a.root.innerHTML.includes('<svg class="gd-scene"'))
check('有岛屿路径', a.root.innerHTML.includes('gd-island'))
check('有小屋窗光', a.root.innerHTML.includes('gd-window'))
check('标题被写入', a.root.innerHTML.includes('星布谷地'))
check('副标题被写入', a.root.innerHTML.includes('LOOMIX · GUDI'))
check('有加载条', a.root.innerHTML.includes('gd-load-bar'))
check('有跳过提示', a.root.innerHTML.includes('点击任意处进入'))
check('播放时解除隐藏', a.root.style.display === '')

console.log('\n[2] 星尘')
check('生成了 110 颗星', a.stars.length === 110, String(a.stars.length))
check('每颗都有位置', a.stars[0].style.left != null && a.stars[0].style.top != null)

console.log('\n[3] 时序（按速度缩放）')
const t240 = a.timers.find((t) => t.ms === 240)
check('有 240ms 清黑', !!t240)
const tEnd = a.timers.find((t) => t.ms === 6200)
check('有 6200ms 自动揭幕', !!tEnd)

const fast = run({ config: { speed: 2, duration: 6200 } })
check('速度 2 → 120ms 清黑', !!fast.timers.find((t) => t.ms === 120), JSON.stringify(fast.timers.map((t) => t.ms)))
check('速度 2 → 3100ms 揭幕', !!fast.timers.find((t) => t.ms === 3100))

const slow = run({ config: { speed: 0.5, duration: 6200 } })
check('速度 0.5 → 12400ms 揭幕', !!slow.timers.find((t) => t.ms === 12400))

console.log('\n[4] 跳过')
check('注册了 click', a.added.indexOf('click') !== -1)
check('注册了 keydown', typeof a.docListeners.keydown === 'function')
a.listeners.click()
check('点击后进入淡出', a.root.classList.contains('gd-out'))
check('写了 session 标记', a.store['session:dsh-gd:shown'] === '1', JSON.stringify(a.store))

const noSkip = run({ config: { allowSkip: false } })
check('关闭跳过后不注册 click', noSkip.added.indexOf('click') === -1)
check('关闭跳过后不注册 keydown', typeof noSkip.docListeners.keydown !== 'function')

console.log('\n[5] 模式与开关')
const sessionDone = run({ config: { mode: 'session' }, preload: { 'session:dsh-gd:shown': '1' } })
check('session 已播过就直接移除', sessionDone.removed() === true)
check('session 已播过不构建场景', sessionDone.root.innerHTML === '')

const disabled = run({ config: { enabled: false } })
check('禁用时直接移除', disabled.removed() === true)

const dailyDone = run({
  config: { mode: 'daily' },
  preload: { 'local:dsh-gd:day': new Date().toISOString().slice(0, 10) }
})
check('daily 今天已播则移除', dailyDone.removed() === true)

const onceDone = run({ config: { mode: 'once' }, preload: { 'local:dsh-gd:once': '1' } })
check('once 已播则移除', onceDone.removed() === true)

const always = run({ config: { mode: 'always' }, preload: { 'session:dsh-gd:shown': '1' } })
check('always 不看标记，照常播放', always.root.innerHTML.length > 0)

console.log('\n[6] 文案与开关')
const custom = run({ config: { title: '自定义标题', sub: 'CUSTOM SUB', showLoading: false } })
check('标题可配置', custom.root.innerHTML.includes('自定义标题'))
check('副标题可配置', custom.root.innerHTML.includes('CUSTOM SUB'))
check('可以关掉加载条', !custom.root.innerHTML.includes('gd-load-bar'))

const escaped = run({ config: { title: '<script>x</script>' } })
check('标题做了 HTML 转义', escaped.root.innerHTML.includes('&lt;script&gt;'))

console.log('\n[7] 样式')
check('CSS 有根节点', css.includes('.gd-root'))
check('CSS 有速度变量', css.includes('--gd-speed'))
check('CSS 用变量缩放时长', css.includes('calc(900ms / var(--gd-speed))'))
check('CSS 有滚动锁', css.includes('html.gd-lock'))

console.log('\n============================')
console.log(`  通过 ${pass} / 失败 ${fail}`)
console.log('============================')
process.exit(fail ? 1 : 0)
