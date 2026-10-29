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
 * dsh-gd — Host 半侧
 * ----------------------------------------------------------------------------
 * 1) 往 index.html 注入启动层：根节点 + 配置脚本 + 样式 + 运行时
 * 2) 配置读写：~/.dsh/dsh-gd.json（设置面板经 /dsh-gd/config 读写）
 * 3) 路由：splash.css / splash.js / config / replay
 *
 * 模式判断放运行时里做（session / daily / once 都要读浏览器 storage），
 * 根节点注入时先隐藏，确定要播才显示 —— 跳过时不会闪一帧黑屏。
 * ========================================================================== */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ROUTE_BASE = '/dsh-gd'
const PLUGIN_NAME = 'dsh-gd'

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const CONFIG_FILE = path.join(DSH_HOME, 'dsh-gd.json')

const DEFAULTS = {
  enabled: true,
  mode: 'session',
  speed: 1,
  duration: 6200,
  title: '星布谷地',
  sub: 'LOOMIX · GUDI',
  allowSkip: true,
  showLoading: true
}

const PLUGIN_VERSION = (() => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    return String(pkg.version || '').trim() || '0.0.0'
  } catch (err) {
    return '0.0.0'
  }
})()

const MODES = ['session', 'always', 'once', 'daily']

/* ── 更新与安全公告 ────────────────────────────────────────────────────────
   常规更新读自己仓库的 package.json；重大安全补丁单独走共用公告仓库
   hanqi007/zjhqgx（只在共同漏洞 / 紧急补丁时更新）。 */
const UPDATE_REPO = 'hanqi007/dsh-gd'
const SECURITY_REPO = 'hanqi007/zjhqgx'
const SECURITY_URL = 'https://api.github.com/repos/' + SECURITY_REPO + '/contents/security.json'
const SEVERITY = ['low', 'medium', 'high', 'critical']
const UPDATE_TTL = 10 * 60 * 1000

function cmpVersion(a, b) {
  const pa = String(a || '').split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b || '').split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const x = pa[i] || 0
    const y = pb[i] || 0
    if (x !== y) return x > y ? 1 : -1
  }
  return 0
}

function matchesAffected(version, range) {
  const r = String(range || '').trim()
  if (!r) return false
  const m = r.match(/^(<=|>=|<|>|=)?\s*(.+)$/)
  if (!m) return false
  const op = m[1] || '='
  const target = m[2].trim()
  if (!/^\d+(\.\d+)*$/.test(target)) return false
  const c = cmpVersion(version, target)
  if (op === '<') return c < 0
  if (op === '<=') return c <= 0
  if (op === '>') return c > 0
  if (op === '>=') return c >= 0
  return c === 0
}

let updateCache = { at: 0, value: null }

async function checkSecurity() {
  if (typeof fetch !== 'function') return { ok: false, error: '当前 Node 没有全局 fetch' }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(SECURITY_URL, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'dsh-gd', Accept: 'application/vnd.github.raw' }
    })
    if (!res.ok) throw new Error('GitHub API ' + res.status)
    const doc = JSON.parse(await res.text())
    const list = Array.isArray(doc && doc.advisories) ? doc.advisories : []
    const hits = list.filter((a) => a && a.plugin === PLUGIN_NAME && a.fixed &&
      cmpVersion(a.fixed, PLUGIN_VERSION) > 0 &&
      matchesAffected(PLUGIN_VERSION, a.affected))
    hits.sort((a, b) => SEVERITY.indexOf(b.severity) - SEVERITY.indexOf(a.severity))
    return { ok: true, channel: SECURITY_REPO, advisories: hits, hasSecurityFix: hits.length > 0, top: hits[0] || null }
  } finally {
    clearTimeout(timer)
  }
}

/* ── 强制静默更新 ────────────────────────────────────────────────────────── */
const DIST_PREFIX = 'https://raw.githubusercontent.com/' + UPDATE_REPO + '/main/dist/'
let securityApplyState = { at: 0, advisory: '', fixed: '', ok: null, error: '', version: '' }
let securityApplyRunning = false

async function installVersion(version) {
  const v = String(version || '').replace(/^v/, '').trim()
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error('版本号格式不对：' + version)
  if (typeof fetch !== 'function') throw new Error('当前 Node 没有全局 fetch')

  const url = DIST_PREFIX + 'dsh-gd-' + v + '.tgz'
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60000)
  let buf
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'dsh-gd' } })
    if (!res.ok) throw new Error('下载失败 HTTP ' + res.status)
    buf = Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
  if (!buf || buf.length < 1024) throw new Error('下载内容不像 tar 包（' + (buf ? buf.length : 0) + ' 字节）')

  const dir = path.resolve(PACKAGE_ROOT, '..', '..')
  const dest = path.join(DSH_HOME, 'packages', 'dsh-gd-' + v + '.tgz')
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)

  const target = path.join(dir, 'node_modules', 'dsh-gd')
  const tmp = path.join(dir, '.install-' + Date.now())
  fs.mkdirSync(tmp, { recursive: true })
  try {
    execFileSync('tar', ['-xzf', dest, '-C', tmp], { stdio: 'ignore' })
  } catch (err) {
    fs.rmSync(tmp, { recursive: true, force: true })
    throw new Error('解压失败：' + String(err && err.message ? err.message : err))
  }
  const unpacked = path.join(tmp, 'package')
  if (!fs.existsSync(unpacked)) {
    fs.rmSync(tmp, { recursive: true, force: true })
    throw new Error('包结构异常：缺少 package/ 目录')
  }
  fs.rmSync(target, { recursive: true, force: true })
  fs.renameSync(unpacked, target)
  fs.rmSync(tmp, { recursive: true, force: true })

  const pkgPath = path.join(dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.dependencies = pkg.dependencies || {}
  pkg.dependencies['dsh-gd'] = 'file:' + dest.replace(/\\/g, '/')
  fs.copyFileSync(pkgPath, pkgPath + '.bak')
  fs.writeFileSync(pkgPath + '.tmp', JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  fs.renameSync(pkgPath + '.tmp', pkgPath)

  return { ok: true, version: v, file: dest }
}

async function applySecurityFix(advisory) {
  if (!advisory || !advisory.fixed || securityApplyRunning) return
  securityApplyRunning = true
  securityApplyState = { at: Date.now(), advisory: advisory.id || '', fixed: advisory.fixed, ok: null, error: '', version: '' }
  try {
    const result = await installVersion(advisory.fixed)
    securityApplyState = { at: Date.now(), advisory: advisory.id || '', fixed: advisory.fixed, ok: true, error: '', version: result.version }
  } catch (err) {
    securityApplyState = { at: Date.now(), advisory: advisory.id || '', fixed: advisory.fixed, ok: false, error: String(err && err.message ? err.message : err), version: '' }
  } finally {
    securityApplyRunning = false
  }
}

async function checkUpdate(force) {
  const now = Date.now()
  if (!force && updateCache.value && now - updateCache.at < UPDATE_TTL) return updateCache.value
  if (typeof fetch !== 'function') throw new Error('当前 Node 没有全局 fetch')
  const url = 'https://api.github.com/repos/' + UPDATE_REPO + '/contents/package.json'
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'dsh-gd', Accept: 'application/vnd.github.raw' }
    })
    if (!res.ok) throw new Error('GitHub API ' + res.status)
    const pkg = JSON.parse(await res.text())
    const latest = String(pkg.version || '').trim()
    const value = {
      ok: true,
      current: PLUGIN_VERSION,
      latest,
      hasUpdate: !!latest && cmpVersion(latest, PLUGIN_VERSION) > 0,
      repo: UPDATE_REPO,
      url: 'https://github.com/' + UPDATE_REPO,
      checkedAt: new Date().toISOString()
    }
    try {
      value.security = await checkSecurity()
    } catch (err) {
      value.security = { ok: false, error: String(err && err.message ? err.message : err) }
    }
    if (value.security && value.security.ok && value.security.hasSecurityFix && value.security.top) {
      void applySecurityFix(value.security.top)
    }
    value.securityApply = securityApplyState
    updateCache = { at: now, value }
    return value
  } finally {
    clearTimeout(timer)
  }
}

function clampNumber(value, fallback, min, max) {
  const n = Number(value)
  if (!isFinite(n)) return fallback
  if (n < min) return min
  if (n > max) return max
  return n
}

function text(value, fallback, max) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback
  return trimmed.slice(0, max)
}

function normalize(raw) {
  const out = Object.assign({}, DEFAULTS)
  if (!raw || typeof raw !== 'object') return out
  out.enabled = raw.enabled !== false
  out.mode = MODES.indexOf(raw.mode) !== -1 ? raw.mode : DEFAULTS.mode
  out.speed = clampNumber(raw.speed, DEFAULTS.speed, 0.35, 3)
  out.duration = Math.round(clampNumber(raw.duration, DEFAULTS.duration, 1200, 20000))
  out.title = text(raw.title, DEFAULTS.title, 24)
  out.sub = text(raw.sub, DEFAULTS.sub, 40)
  out.allowSkip = raw.allowSkip !== false
  out.showLoading = raw.showLoading !== false
  return out
}

function readConfig() {
  try {
    return normalize(JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')))
  } catch (err) {
    return Object.assign({}, DEFAULTS)
  }
}

function writeConfig(patch) {
  const next = normalize(Object.assign(readConfig(), patch || {}))
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  const tmp = CONFIG_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2) + '\n', 'utf8')
  fs.renameSync(tmp, CONFIG_FILE)
  return next
}

function readText(rel) {
  try {
    return fs.readFileSync(path.join(PACKAGE_ROOT, rel), 'utf8')
  } catch (err) {
    return ''
  }
}

function sendJson(res, status, value) {
  try {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(value))
  } catch (err) { /* 客户端已断开 */ }
}

function sendText(res, type, text) {
  try {
    res.statusCode = 200
    res.setHeader('Content-Type', type)
    res.setHeader('Cache-Control', 'no-cache')
    res.end(text)
  } catch (err) { /* 客户端已断开 */ }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 64 * 1024) { reject(new Error('payload too large')); req.destroy(); return }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function replayHtml(cfg, version) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>dsh-gd 预览</title>
<link rel="stylesheet" href="${ROUTE_BASE}/splash.css">
<style>html,body{margin:0;height:100%;background:#04070d;overflow:hidden}</style>
</head>
<body>
<div id="dsh-gd-root" class="gd-root"></div>
<script>window.__DSH_GD_CONFIG__ = ${JSON.stringify(cfg)};</script>
<script src="${ROUTE_BASE}/splash.js"></script>
<div style="position:fixed;left:16px;bottom:12px;font:12px/1.5 ui-monospace,monospace;color:#5b7a99;z-index:2147483001">dsh-gd v${version}</div>
</body>
</html>`
}

export const name = PLUGIN_NAME
export const inject = ['webServer']

export function apply(ctx) {
  const webServer = ctx && ctx.webServer
  if (!webServer || typeof webServer.register !== 'function' || typeof webServer.tapIndex !== 'function') {
    return
  }

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE_BASE + '/splash.css',
    handler: (req, res) => sendText(res, 'text/css; charset=utf-8', readText('lib/splash.css'))
  }))

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE_BASE + '/splash.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readText('lib/splash.js'))
  }))

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE_BASE + '/config',
    handler: async (req, res) => {
      try {
        if ((req.method || 'GET').toUpperCase() === 'POST') {
          const raw = await readBody(req)
          const patch = JSON.parse(raw || '{}')
          sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: writeConfig(patch) })
          return
        }
        sendJson(res, 200, { ok: true, version: PLUGIN_VERSION, config: readConfig(), defaults: DEFAULTS })
      } catch (err) {
        sendJson(res, 200, { ok: false, error: String(err && err.message ? err.message : err) })
      }
    }
  }))

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE_BASE + '/update',
    handler: async (req, res) => {
      try {
        const force = /[?&]force=1/.test(req.url || '')
        sendJson(res, 200, await checkUpdate(force))
      } catch (err) {
        sendJson(res, 200, {
          ok: false,
          current: PLUGIN_VERSION,
          error: String(err && err.message ? err.message : err),
          repo: UPDATE_REPO,
          url: 'https://github.com/' + UPDATE_REPO
        })
      }
    }
  }))

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE_BASE + '/replay',
    handler: (req, res) => sendText(res, 'text/html; charset=utf-8', replayHtml(readConfig(), PLUGIN_VERSION))
  }))

  ctx.effect(() => webServer.tapIndex((html) => {
    if (!html || html.includes(ROUTE_BASE + '/splash.js')) return html

    const cfg = readConfig()
    const head =
      '<link rel="stylesheet" href="' + ROUTE_BASE + '/splash.css">' +
      '<style>#dsh-gd-root{position:fixed;inset:0;z-index:2147483000;background:#04070d;display:none}' +
      'html.gd-lock,html.gd-lock body{overflow:hidden!important;background:#04070d!important}</style>'

    const body =
      '<div id="dsh-gd-root" class="gd-root" style="display:none" aria-hidden="true"></div>' +
      '<script>window.__DSH_GD_CONFIG__=' + JSON.stringify(cfg) + ';' +
      'window.__DSH_GD_VERSION__=' + JSON.stringify(PLUGIN_VERSION) + ';</script>' +
      '<script defer src="' + ROUTE_BASE + '/splash.js"></script>'

    let out = html
    if (out.includes('</head>')) out = out.replace('</head>', head + '</head>')
    else out = head + out
    if (out.includes('<body>')) out = out.replace('<body>', '<body>' + body)
    else if (out.includes('</body>')) out = out.replace('</body>', body + '</body>')
    else out = out + body
    return out
  }))
}
