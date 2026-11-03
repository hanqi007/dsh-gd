/* Host 冒烟：默认配置 / 归一化 / 路由 / index 注入 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

let pass = 0
let fail = 0
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name) } else { fail++; console.log('  FAIL ' + name + (detail ? '  → ' + detail : '')) }
}

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-gd-'))
process.env.DSH_HOME = home

const mod = await import('../lib/index.js')

console.log('\n[1] 插件形状')
check('name 是 dsh-gd', mod.name === 'dsh-gd', String(mod.name))
check('inject 含 webServer', Array.isArray(mod.inject) && mod.inject.includes('webServer'))
check('导出 apply', typeof mod.apply === 'function')

const routes = []
const taps = []
const ctx = {
  webServer: {
    register(route) { routes.push(route); return () => {} },
    tapIndex(fn) { taps.push(fn); return () => {} }
  },
  effect(fn) { return fn() }
}
mod.apply(ctx)
const byPath = Object.fromEntries(routes.map((r) => [r.path, r]))
check('注册了 5 条路由', routes.length === 5, String(routes.length))
check('有 splash.css', !!byPath['/dsh-gd/splash.css'])
check('有 splash.js', !!byPath['/dsh-gd/splash.js'])
check('有 config', !!byPath['/dsh-gd/config'])
check('有 replay', !!byPath['/dsh-gd/replay'])
check('有 update', !!byPath['/dsh-gd/update'])
check('注册了 tapIndex', taps.length === 1)

function fakeReq(method, body, url) {
  const req = Readable.from(body ? [Buffer.from(body)] : [])
  req.method = method
  req.url = url || ''
  return req
}
function fakeRes() {
  return { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v }, end(t) { this.body = t || '' } }
}
async function call(pathname, method, body) {
  const res = fakeRes()
  await byPath[pathname].handler(fakeReq(method, body, pathname), res)
  return JSON.parse(res.body)
}

console.log('\n[2] 默认配置')
const cfg0 = await call('/dsh-gd/config', 'GET')
check('ok', cfg0.ok === true)
check('默认启用', cfg0.config.enabled === true)
check('默认 session', cfg0.config.mode === 'session')
check('默认速度 1', cfg0.config.speed === 1)
check('默认时长 6200', cfg0.config.duration === 6200)
check('默认标题「星布谷地」', cfg0.config.title === '星布谷地', cfg0.config.title)
check('默认副标题', cfg0.config.sub === 'LOOMIX · GUDI')
check('默认允许跳过', cfg0.config.allowSkip === true)
check('带版本号', typeof cfg0.version === 'string' && cfg0.version.length > 0, cfg0.version)

console.log('\n[3] 归一化（脏数据也不会写坏）')
const cfg1 = await call('/dsh-gd/config', 'POST', JSON.stringify({
  mode: 'nonsense',
  speed: 99,
  duration: 5,
  title: '   ',
  sub: 'x'.repeat(99),
  allowSkip: false
}))
check('非法 mode 回退 session', cfg1.config.mode === 'session')
check('速度夹到 3', cfg1.config.speed === 3, String(cfg1.config.speed))
check('时长夹到 1200', cfg1.config.duration === 1200, String(cfg1.config.duration))
check('空白标题回退默认', cfg1.config.title === '星布谷地')
check('副标题截到 40', cfg1.config.sub.length === 40, String(cfg1.config.sub.length))
check('allowSkip 能关', cfg1.config.allowSkip === false)
check('落盘文件存在', fs.existsSync(path.join(home, 'dsh-gd.json')))

const cfg2 = await call('/dsh-gd/config', 'GET')
check('读回一致', cfg2.config.speed === 3 && cfg2.config.allowSkip === false)

console.log('\n[4] index 注入')
const html = taps[0]('<html><head><title>x</title></head><body><div id="app"></div></body></html>')
check('注入了根节点', html.includes('id="dsh-gd-root"'))
check('根节点默认隐藏（防闪黑）', /id="dsh-gd-root"[^>]*style="display:none"/.test(html))
check('注入了配置脚本', html.includes('window.__DSH_GD_CONFIG__'))
check('注入了样式表', html.includes('/dsh-gd/splash.css'))
check('注入了运行时', html.includes('/dsh-gd/splash.js'))
check('样式里锁了滚动', html.includes('gd-lock'))
check('重复注入不会叠加', taps[0](html) === html)

console.log('\n[5] replay 页面')
const res = fakeRes()
await byPath['/dsh-gd/replay'].handler(fakeReq('GET', null, '/dsh-gd/replay'), res)
check('返回 HTML', String(res.headers['Content-Type']).includes('text/html'))
check('含根节点', res.body.includes('dsh-gd-root'))
check('含配置', res.body.includes('__DSH_GD_CONFIG__'))

fs.rmSync(home, { recursive: true, force: true })
check('临时目录已清理', !fs.existsSync(home))

console.log('\n============================')
console.log(`  通过 ${pass} / 失败 ${fail}`)
console.log('============================')
process.exit(fail ? 1 : 0)
