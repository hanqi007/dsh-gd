/* 面板渲染冒烟：注册 section、渲染表单、控件齐全 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const ROOT = path.resolve(import.meta.dirname, '..')
const source = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')

let pass = 0
let fail = 0
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name) } else { fail++; console.log('  FAIL ' + name + (detail ? '  → ' + detail : '')) }
}

let hookIndex = 0
let presets = []
function createElement(type, props) {
  var children = Array.prototype.slice.call(arguments, 2)
  return { type, props: props || {}, children }
}
function useState(init) {
  var i = hookIndex++
  var value = i < presets.length ? presets[i] : (typeof init === 'function' ? init() : init)
  return [value, function () {}]
}
function useEffect() { hookIndex++ }
const reactShim = { createElement, useState, useEffect }

let factory = null
const sandbox = {
  console,
  JSON, Object, Array, String, Number, Boolean, Math, Date, RegExp, Error, Symbol, isFinite,
  setTimeout,
  fetch: function () { return Promise.reject(new Error('no network in test')) },
  window: {
    __ModuleLoader__: { load(options) { factory = options.factory } },
    open: function () {},
    sessionStorage: { getItem: () => null, setItem: () => {} },
    localStorage: { getItem: () => null, setItem: () => {} }
  },
  document: {
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({ dataset: {}, setAttribute: () => {}, style: {}, parentNode: null }),
    documentElement: { classList: { add: () => {}, remove: () => {} } }
  }
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(source, sandbox)
check('bundle 被接收', !!factory)

const mod = factory((name) => {
  if (name === 'react') return reactShim
  throw new Error('unexpected require: ' + name)
})
check('导出 apply', typeof mod.apply === 'function')

let registered = null
const ctx = {
  slots: {
    inject(name, fn) { fn() },
    register(def, render) { registered = { def, render }; return () => {} }
  },
  effect(fn) { return fn() }
}
mod.apply(ctx)
check('注册 id 是 dsh-gd', !!registered && registered.def.id === 'dsh-gd')
check('section 标签是「星布谷地」', !!registered && registered.def.label === '星布谷地')
check('order 是 29', !!registered && registered.def.order === 29)

const draft = {
  enabled: true,
  mode: 'session',
  speed: 1,
  duration: 6200,
  title: '星布谷地',
  sub: 'LOOMIX · GUDI',
  allowSkip: true,
  showLoading: true
}

function walk(node, out) {
  if (node == null || node === false) return
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out)); return }
  if (typeof node !== 'object') return
  if (typeof node.type === 'function') {
    let rendered = null
    try {
      rendered = node.type(Object.assign({}, node.props, { children: node.children }))
    } catch (e) {
      out.push({ cls: '__render_error', text: String(e && e.message ? e.message : e) })
      return
    }
    walk(rendered, out)
    return
  }
  if (node.props && typeof node.props.className === 'string') {
    out.push({ cls: node.props.className, text: textOf(node), tag: node.type })
  }
  ;(node.children || []).forEach((c) => walk(c, out))
}
function textOf(node) {
  let s = ''
  ;(node.children || []).forEach((c) => {
    if (typeof c === 'string' || typeof c === 'number') s += String(c)
    else if (Array.isArray(c)) c.forEach((x) => { if (typeof x === 'string') s += x })
    else if (c && typeof c === 'object') s += textOf(c)
  })
  return s
}

function render(state) {
  hookIndex = 0
  presets = [state, '2.0.0', null, null, false]
  const out = []
  walk(registered.render(), out)
  return out
}

console.log('\n[1] 加载完成的面板')
const view = render(draft)
check('渲染不抛错', view.length > 0)
check('没有渲染错误', !view.some((n) => n.cls === '__render_error'), (view.find((n) => n.cls === '__render_error') || {}).text)
check('显示版本', view.some((n) => n.text === '版本 v2.0.0'))
check('有「立即预览」', view.some((n) => n.text === '立即预览'))
check('有播放分组', view.some((n) => n.cls === '__gd_groupTitle' && n.text === '播放'))
check('有文案分组', view.some((n) => n.cls === '__gd_groupTitle' && n.text === '文案'))
check('有交互分组', view.some((n) => n.cls === '__gd_groupTitle' && n.text === '交互'))
check('有「启用启动动画」', view.some((n) => n.text.indexOf('启用启动动画') >= 0))
check('有「播放时机」', view.some((n) => n.text === '播放时机'))
check('有「速度倍率」', view.some((n) => n.text === '速度倍率'))
check('有「停留时长」', view.some((n) => n.text.indexOf('停留时长') >= 0))
check('有「标题」输入', view.some((n) => n.text === '标题'))
check('有「副标题」', view.some((n) => n.text === '副标题'))
check('有「允许跳过」', view.some((n) => n.text.indexOf('允许跳过') >= 0))
check('有「显示加载条」', view.some((n) => n.text.indexOf('显示加载条') >= 0))
check('有「保存」按钮', view.some((n) => n.text === '保存'))
check('有「重新读取」', view.some((n) => n.text === '重新读取'))
check('速度按倍率显示', view.some((n) => n.text === '1.00×'))

console.log('\n[2] 未加载时的占位')
const loading = (() => {
  hookIndex = 0
  presets = [null, '2.0.0', null, null, false]
  const out = []
  walk(registered.render(), out)
  return out
})()
check('显示「读取中…」', loading.some((n) => n.text === '读取中…'))
check('未加载时不渲染表单', !loading.some((n) => n.cls === '__gd_groupTitle'))

console.log('\n[3] 关闭状态')
const off = render(Object.assign({}, draft, { enabled: false, allowSkip: false, showLoading: false }))
check('关闭启用后仍能渲染', off.length > 0 && !off.some((n) => n.cls === '__render_error'))

console.log('\n============================')
console.log(`  通过 ${pass} / 失败 ${fail}`)
console.log('============================')
process.exit(fail ? 1 : 0)
