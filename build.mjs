/* ============================================================================
 * dsh-gd — 构建脚本
 * ----------------------------------------------------------------------------
 * src/scene.js + src/boot.js  →  lib/splash.js   （一个 IIFE，先场景后运行时）
 * src/boot.css                →  lib/splash.css
 * src/client.js               →  lib/client.js   （把 DEFAULTS 注入占位符）
 *           默认配置           →  demo.html       （本地双击预览）
 * ========================================================================== */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(ROOT, 'src')
const LIB = path.join(ROOT, 'lib')

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

function read(name) {
  return fs.readFileSync(path.join(SRC, name), 'utf8')
}

const LICENSE_BANNER = [
  '/* dsh-gd — 星布谷地开机动画',
  ' * Copyright 2026 hanlin (hanqi007)',
  ' * Licensed under the Apache License 2.0 with additional terms.',
  ' * See LICENSE and LICENSE-CUSTOM.md. */'
].join('\n')

function wrapRuntime(scene, runtime) {
  return [
    '/* dsh-gd runtime — 由 src/scene.js + src/boot.js 构建，请勿手改 */',
    LICENSE_BANNER + '\n' + '(function () {',
    '  \'use strict\'',
    '',
    scene.trim(),
    '',
    runtime.trim(),
    '',
    '})()',
    ''
  ].join('\n')
}

function buildSplash() {
  const scene = read('scene.js')
  const runtime = read('boot.js')
  const js = wrapRuntime(scene, runtime)
  fs.writeFileSync(path.join(LIB, 'splash.js'), js, 'utf8')
  return js.length
}

function buildCss() {
  const css = read('boot.css')
  fs.writeFileSync(path.join(LIB, 'splash.css'), css, 'utf8')
  return css.length
}

function buildClient() {
  let js = read('client.js')
  if (!js.includes('__GD_DEFAULTS__')) {
    throw new Error('src/client.js 缺少 __GD_DEFAULTS__ 占位符')
  }
  js = js.split('__GD_DEFAULTS__').join(JSON.stringify(DEFAULTS, null, 2))
  fs.writeFileSync(path.join(LIB, 'client.js'), js, 'utf8')
  return js.length
}

function buildDemo() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>dsh-gd 预览</title>
  <link rel="stylesheet" href="lib/splash.css">
  <style>html,body{margin:0;height:100%;background:#04070d;overflow:hidden}</style>
</head>
<body>
  <div id="dsh-gd-root" class="gd-root"></div>
  <script>window.__DSH_GD_CONFIG__ = ${JSON.stringify(DEFAULTS)};</script>
  <script src="lib/splash.js"></script>
</body>
</html>
`
  fs.writeFileSync(path.join(ROOT, 'demo.html'), html, 'utf8')
  return html.length
}

fs.mkdirSync(LIB, { recursive: true })
const splashLen = buildSplash()
const cssLen = buildCss()
const clientLen = buildClient()
buildDemo()

console.log('lib/splash.js   ' + (splashLen / 1024).toFixed(1) + ' KB')
console.log('lib/splash.css  ' + (cssLen / 1024).toFixed(1) + ' KB')
console.log('lib/client.js   ' + (clientLen / 1024).toFixed(1) + ' KB')
console.log('demo.html       ok')
