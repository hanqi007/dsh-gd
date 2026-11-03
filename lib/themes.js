/* ============================================================================
 * dsh-gd — 主题引擎（星布谷地开机动画）
 * ----------------------------------------------------------------------------
 * 主题 = 一组配色 + 一张程序化生成的背景图（SVG，纯几何，全部原创）。
 *
 * 星布谷地的气质偏「夜色 / 星野 / 田园」：低对比、柔和光、留白多。
 * 所以这里的 8 套主题都按这个方向做，不用硬边和强对比。
 *
 * 三个来源：
 *   1) 内置：本文件的 BUILTIN_THEMES，代码生成
 *   2) 用户导入：~/.dsh/gd-themes/<id>/theme.json + background.svg
 *   3) 当前选择存在 dsh-gd.json 的 theme 字段
 * ========================================================================== */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
export const USER_THEME_DIR = path.join(DSH_HOME, 'gd-themes')

const W = 1600
const H = 900

const svgOpen = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">'

/** 稳定伪随机：同一 seed 每次生成一致 */
function seeded(seed) {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** 星点：在给定区域撒 n 个不同大小的圆 */
function stars(rnd, n, color, maxR, y0, y1, maxOpacity) {
  let out = ''
  for (let i = 0; i < n; i++) {
    const x = rnd() * W
    const y = y0 + rnd() * (y1 - y0)
    const r = 0.4 + rnd() * maxR
    const op = (0.15 + rnd() * maxOpacity).toFixed(3)
    out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) +
      '" fill="' + color + '" opacity="' + op + '"/>'
  }
  return out
}

/* ── 内置主题 ───────────────────────────────────────────────────────────── */

/* 1) 极光：绿色光幕，从上方垂下来 */
function auroraBg() {
  const rnd = seeded('aurora')
  let curtains = ''
  for (let i = 0; i < 5; i++) {
    const x0 = -100 + i * 380 + rnd() * 80
    const h = 320 + rnd() * 260
    const hue = i % 2 === 0 ? '#4fe0a8' : '#5fc8ff'
    curtains += '<path d="M' + x0.toFixed(0) + ' 0 Q' + (x0 + 90).toFixed(0) + ' ' + (h * 0.55).toFixed(0) +
      ' ' + (x0 + 40).toFixed(0) + ' ' + h.toFixed(0) + ' L' + (x0 + 300).toFixed(0) + ' ' + h.toFixed(0) +
      ' Q' + (x0 + 340).toFixed(0) + ' ' + (h * 0.5).toFixed(0) + ' ' + (x0 + 260).toFixed(0) + ' 0 Z" fill="' + hue +
      '" opacity="' + (0.05 + rnd() * 0.06).toFixed(3) + '"/>'
  }
  return svgOpen() +
    '<defs><linearGradient id="au-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#04121a"/><stop offset="55%" stop-color="#03080f"/><stop offset="100%" stop-color="#010407"/>' +
    '</linearGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#au-base)"/>' +
    curtains +
    stars(rnd, 90, '#cfefff', 1.3, 0, H * 0.7, 0.5) +
    '</svg>'
}

/* 2) 黄昏：暖橙到紫的渐变天幕 + 远山剪影 */
function duskBg() {
  const rnd = seeded('dusk')
  return svgOpen() +
    '<defs><linearGradient id="du-sky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#241a3a"/><stop offset="42%" stop-color="#5b3050"/>' +
    '<stop offset="68%" stop-color="#b25e46"/><stop offset="100%" stop-color="#2a1520"/>' +
    '</linearGradient>' +
    '<radialGradient id="du-sun" cx="50%" cy="66%" r="22%">' +
    '<stop offset="0%" stop-color="#ffd9a0" stop-opacity="0.75"/><stop offset="100%" stop-color="#ff9a5c" stop-opacity="0"/>' +
    '</radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#du-sky)"/>' +
    '<circle cx="820" cy="' + (H * 0.66) + '" r="290" fill="url(#du-sun)"/>' +
    stars(rnd, 34, '#ffe6cc', 0.9, 0, H * 0.42, 0.35) +
    '<path d="M0 640 L220 520 L400 600 L610 470 L820 580 L1020 500 L1260 610 L1450 520 L' + W + ' 600 L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="#140b18" opacity="0.82"/>' +
    '<path d="M0 720 L260 640 L520 700 L760 610 L1040 700 L1300 640 L' + W + ' 700 L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="#0a050d" opacity="0.9"/>' +
    '</svg>'
}

/* 3) 午夜：深蓝 + 银河带 + 密集星点 */
function midnightBg() {
  const rnd = seeded('midnight')
  return svgOpen() +
    '<defs><linearGradient id="mi-base" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#050a1c"/><stop offset="60%" stop-color="#03060f"/><stop offset="100%" stop-color="#010208"/>' +
    '</linearGradient>' +
    '<filter id="mi-blur"><feGaussianBlur stdDeviation="38"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#mi-base)"/>' +
    '<ellipse cx="820" cy="380" rx="620" ry="120" fill="#5f7fd8" opacity="0.10" filter="url(#mi-blur)" transform="rotate(-22 820 380)"/>' +
    stars(rnd, 220, '#dfe8ff', 1.4, 0, H, 0.55) +
    '</svg>'
}

/* 4) 樱：淡粉雾 + 飘落花瓣 */
function sakuraBg() {
  const rnd = seeded('sakura')
  let petals = ''
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W
    const y = rnd() * H
    const s = 4 + rnd() * 9
    const rot = rnd() * 360
    const op = (0.12 + rnd() * 0.22).toFixed(3)
    petals += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + s.toFixed(1) + '" ry="' + (s * 0.45).toFixed(1) +
      '" fill="#ffb7d0" opacity="' + op + '" transform="rotate(' + rot.toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>'
  }
  return svgOpen() +
    '<defs><linearGradient id="sa-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#2a1622"/><stop offset="55%" stop-color="#180d15"/><stop offset="100%" stop-color="#0a050a"/>' +
    '</linearGradient>' +
    '<filter id="sa-soft"><feGaussianBlur stdDeviation="70"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#sa-base)"/>' +
    '<circle cx="1180" cy="180" r="330" fill="#ff9ec4" opacity="0.09" filter="url(#sa-soft)"/>' +
    '<circle cx="320" cy="700" r="260" fill="#ff79a8" opacity="0.06" filter="url(#sa-soft)"/>' +
    petals +
    '</svg>'
}

/* 5) 余烬：暗底 + 底部火星与热浪 */
function emberBg() {
  const rnd = seeded('ember')
  let sparks = ''
  for (let i = 0; i < 120; i++) {
    const x = rnd() * W
    const y = H * 0.55 + rnd() * H * 0.45
    const r = 0.6 + rnd() * 2.2
    const op = (0.15 + rnd() * 0.5).toFixed(3)
    const hue = rnd() > 0.6 ? '#ffd08a' : '#ff7a3c'
    sparks += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(1) + '" fill="' + hue + '" opacity="' + op + '"/>'
  }
  return svgOpen() +
    '<defs><linearGradient id="em-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#0d0708"/><stop offset="62%" stop-color="#160a08"/><stop offset="100%" stop-color="#2a1006"/>' +
    '</linearGradient>' +
    '<radialGradient id="em-glow" cx="50%" cy="100%" r="60%">' +
    '<stop offset="0%" stop-color="#ff7a3c" stop-opacity="0.30"/><stop offset="100%" stop-color="#ff5a1c" stop-opacity="0"/>' +
    '</radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#em-base)"/>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#em-glow)"/>' +
    sparks +
    '</svg>'
}

/* 6) 露水：清晨草地，淡绿雾 + 微小水光 */
function dewBg() {
  const rnd = seeded('dew')
  return svgOpen() +
    '<defs><linearGradient id="de-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#0a1a14"/><stop offset="50%" stop-color="#0c1f18"/><stop offset="100%" stop-color="#040c09"/>' +
    '</linearGradient>' +
    '<filter id="de-soft"><feGaussianBlur stdDeviation="52"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#de-base)"/>' +
    '<ellipse cx="500" cy="300" rx="520" ry="220" fill="#7fe0b0" opacity="0.07" filter="url(#de-soft)"/>' +
    '<ellipse cx="1200" cy="640" rx="460" ry="200" fill="#8ad8ff" opacity="0.05" filter="url(#de-soft)"/>' +
    stars(rnd, 44, '#c8ffe8', 1.1, H * 0.1, H * 0.8, 0.35) +
    '</svg>'
}

/* 7) 麦田：横向柔光条 + 穗状短竖线 */
function wheatBg() {
  const rnd = seeded('wheat')
  let stalks = ''
  for (let i = 0; i < 180; i++) {
    const x = rnd() * W
    const y = H * 0.62 + rnd() * H * 0.38
    const len = 12 + rnd() * 46
    const op = (0.06 + rnd() * 0.14).toFixed(3)
    stalks += '<line x1="' + x.toFixed(0) + '" y1="' + y.toFixed(0) + '" x2="' + (x + (rnd() - 0.5) * 6).toFixed(1) +
      '" y2="' + (y - len).toFixed(0) + '" stroke="#e8c87a" stroke-width="1" opacity="' + op + '"/>'
  }
  return svgOpen() +
    '<defs><linearGradient id="wh-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#1d1808"/><stop offset="48%" stop-color="#2a2410"/><stop offset="100%" stop-color="#0c0a05"/>' +
    '</linearGradient>' +
    '<radialGradient id="wh-glow" cx="50%" cy="30%" r="70%">' +
    '<stop offset="0%" stop-color="#ffe9a8" stop-opacity="0.14"/><stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>' +
    '</radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#wh-base)"/>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#wh-glow)"/>' +
    stalks +
    '</svg>'
}

/* 8) 晨雾：大面积柔和灰白，几乎无结构 */
function mistBg() {
  const rnd = seeded('mist')
  return svgOpen() +
    '<defs><linearGradient id="ms-base" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#1b1f24"/><stop offset="60%" stop-color="#12161a"/><stop offset="100%" stop-color="#090b0e"/>' +
    '</linearGradient>' +
    '<filter id="ms-blur"><feGaussianBlur stdDeviation="90"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#ms-base)"/>' +
    '<ellipse cx="400" cy="' + (H * 0.42) + '" rx="640" ry="240" fill="#dfe8f0" opacity="0.06" filter="url(#ms-blur)"/>' +
    '<ellipse cx="1200" cy="' + (H * 0.68) + '" rx="560" ry="220" fill="#c8d4e0" opacity="0.05" filter="url(#ms-blur)"/>' +
    stars(rnd, 30, '#eef4ff', 0.9, 0, H * 0.5, 0.28) +
    '</svg>'
}

export const BUILTIN_THEMES = [
  {
    id: 'aurora', name: '极光', desc: '绿色光幕垂落，星点铺满夜空',
    colors: { accent: '#4fe0a8', fg: '#dcfff2', dim: '#3f8f76', panel: 'rgba(4,18,26,0.72)' },
    bg: auroraBg
  },
  {
    id: 'dusk', name: '黄昏', desc: '暖橙天幕与远山剪影',
    colors: { accent: '#ffb072', fg: '#ffe9d8', dim: '#a86848', panel: 'rgba(26,16,26,0.72)' },
    bg: duskBg
  },
  {
    id: 'midnight', name: '午夜', desc: '深蓝银河，密星闪烁',
    colors: { accent: '#6f8fe8', fg: '#e2e9ff', dim: '#4a5f96', panel: 'rgba(4,8,20,0.76)' },
    bg: midnightBg
  },
  {
    id: 'sakura', name: '樱', desc: '淡粉雾面，花瓣飘落',
    colors: { accent: '#ff9ec4', fg: '#ffe4ee', dim: '#a86580', panel: 'rgba(26,14,20,0.74)' },
    bg: sakuraBg
  },
  {
    id: 'ember', name: '余烬', desc: '底部火星与热浪',
    colors: { accent: '#ff8a4c', fg: '#ffe2cc', dim: '#a36040', panel: 'rgba(20,9,8,0.76)' },
    bg: emberBg
  },
  {
    id: 'dew', name: '露水', desc: '清晨草地，淡绿与水光',
    colors: { accent: '#7fe0b0', fg: '#dcfff0', dim: '#4a8a70', panel: 'rgba(6,18,14,0.74)' },
    bg: dewBg
  },
  {
    id: 'wheat', name: '麦田', desc: '横向柔光与穗影',
    colors: { accent: '#e8c87a', fg: '#fff4d8', dim: '#9c8450', panel: 'rgba(20,17,8,0.74)' },
    bg: wheatBg
  },
  {
    id: 'mist', name: '晨雾', desc: '大面积柔和灰白，几乎无结构',
    colors: { accent: '#c8d4e0', fg: '#eef2f6', dim: '#7a8794', panel: 'rgba(10,13,16,0.74)' },
    bg: mistBg
  }
]

/* ── 用户导入 ───────────────────────────────────────────────────────────── */

const ID_RE = /^[a-z0-9][a-z0-9._-]{0,40}$/i

export function readUserTheme(dir) {
  const metaPath = path.join(dir, 'theme.json')
  if (!fs.existsSync(metaPath)) return { ok: false, error: '缺 theme.json' }
  let meta
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  } catch (err) {
    return { ok: false, error: 'theme.json 不是合法 JSON：' + err.message }
  }
  const id = String(meta.id || path.basename(dir))
  if (!ID_RE.test(id)) return { ok: false, error: 'id 不合法：' + id }
  const colors = meta.colors && typeof meta.colors === 'object' ? meta.colors : {}
  const bgFile = String(meta.background || 'background.svg')
  const bgPath = path.join(dir, bgFile)
  let bg = ''
  if (fs.existsSync(bgPath)) {
    try {
      const text = fs.readFileSync(bgPath, 'utf8')
      if (!/^\s*<svg[\s>]/i.test(text)) return { ok: false, error: bgFile + ' 不是 SVG' }
      bg = text
    } catch (err) {
      return { ok: false, error: '读 ' + bgFile + ' 失败：' + err.message }
    }
  }
  return {
    ok: true,
    theme: {
      id,
      name: String(meta.name || id),
      desc: String(meta.desc || '用户导入'),
      colors: {
        accent: String(colors.accent || '#4fe0a8'),
        fg: String(colors.fg || '#dcfff2'),
        dim: String(colors.dim || '#3f8f76'),
        panel: String(colors.panel || 'rgba(4,18,26,0.72)')
      },
      bg,
      user: true
    }
  }
}

export function listUserThemes() {
  if (!fs.existsSync(USER_THEME_DIR)) return []
  let names = []
  try { names = fs.readdirSync(USER_THEME_DIR) } catch (err) { return [] }
  const out = []
  for (const n of names) {
    const d = path.join(USER_THEME_DIR, n)
    try { if (!fs.statSync(d).isDirectory()) continue } catch (err) { continue }
    const r = readUserTheme(d)
    if (r.ok) out.push(r.theme)
    else out.push({ id: n, name: n, desc: '导入失败：' + r.error, colors: {}, bg: '', user: true, broken: true })
  }
  return out
}

export function importThemeDir(srcDir) {
  const r = readUserTheme(srcDir)
  if (!r.ok) return r
  const dest = path.join(USER_THEME_DIR, r.theme.id)
  fs.mkdirSync(dest, { recursive: true })
  fs.copyFileSync(path.join(srcDir, 'theme.json'), path.join(dest, 'theme.json'))
  for (const f of ['background.svg', 'preview.svg', 'preview.png']) {
    const p = path.join(srcDir, f)
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(dest, f))
  }
  return { ok: true, id: r.theme.id, dir: dest }
}

export function removeUserTheme(id) {
  const key = String(id || '')
  if (!ID_RE.test(key)) return { ok: false, error: 'id 不合法' }
  const d = path.join(USER_THEME_DIR, key)
  if (!fs.existsSync(d)) return { ok: false, error: '没有这个主题：' + key }
  try {
    fs.rmSync(d, { recursive: true, force: true })
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) }
  }
  return { ok: true }
}

/* ── 汇总 ───────────────────────────────────────────────────────────────── */

export function allThemes() {
  const out = BUILTIN_THEMES.map((t) => ({
    id: t.id, name: t.name, desc: t.desc, colors: t.colors, user: false, bg: t.bg()
  }))
  for (const t of listUserThemes()) out.push(t)
  return out
}

export function findTheme(id) {
  const all = allThemes()
  return all.find((t) => t.id === id) || all[0]
}

export function themeIds() {
  return allThemes().map((t) => t.id)
}
