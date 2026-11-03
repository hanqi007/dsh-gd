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
 * dsh-gd — 浏览器半侧（设置面板 + 桌面端自举）
 * ----------------------------------------------------------------------------
 * 1) selfBoot：桌面端不走 Host 的 tapIndex 注入，由这里读配置、按模式决定
 *    是否播放，然后自己挂根节点、拉 CSS 与运行时。
 * 2) 设置面板：注册到「设置」侧栏，改完保存到 Host。
 * ========================================================================== */
window.__ModuleLoader__.load({
  id: 'dsh-gd-v2',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement

    var API = '/dsh-gd'

    /* ── 主界面主题：即时应用 ──────────────────────────────────────────────
       切换主题时直接改 <style> 的 textContent，不走页面刷新。
       变量与 Host 首屏注入用的是同一套（--dsw-alias-*）。 */
    var UI_STYLE_ID = 'gd-ui-theme-live'
    var UI_THEMES = [
      { id: 'default', name: '跟随系统', desc: '不覆盖任何变量', vars: {} },
      { id: 'paper', name: '纸白', desc: '浅色底、深灰字', vars: { '--dsw-alias-bg-layer': '#ffffff', '--dsw-alias-bg-layer-2': '#f7f8fa', '--dsw-alias-bg-layer-3': '#eef0f4', '--dsw-alias-bg-secondary': '#f7f8fa', '--dsw-alias-label-primary': '#1f2430', '--dsw-alias-label-secondary': '#3a4150', '--dsw-alias-label-tertiary': '#697086', '--dsw-alias-border-secondary': '#e3e6ec', '--dsw-alias-border-l2': '#e3e6ec', '--dsw-alias-state-business-primary': '#2563eb', 'color-scheme': 'light' } },
      { id: 'ink', name: '墨黑', desc: '深色底、柔和白字', vars: { '--dsw-alias-bg-layer': '#14161c', '--dsw-alias-bg-layer-2': '#1b1e26', '--dsw-alias-bg-layer-3': '#242833', '--dsw-alias-bg-secondary': '#1b1e26', '--dsw-alias-label-primary': '#e8ebf2', '--dsw-alias-label-secondary': '#c2c8d4', '--dsw-alias-label-tertiary': '#8b93a3', '--dsw-alias-border-secondary': '#2f3441', '--dsw-alias-border-l2': '#2f3441', '--dsw-alias-state-business-primary': '#6b9bff', 'color-scheme': 'dark' } },
      { id: 'sand', name: '暖沙', desc: '米黄纸感', vars: { '--dsw-alias-bg-layer': '#fbf6ec', '--dsw-alias-bg-layer-2': '#f5eede', '--dsw-alias-bg-layer-3': '#ebe1cd', '--dsw-alias-bg-secondary': '#f5eede', '--dsw-alias-label-primary': '#3b3225', '--dsw-alias-label-secondary': '#5c5040', '--dsw-alias-label-tertiary': '#8a7b64', '--dsw-alias-border-secondary': '#ded2ba', '--dsw-alias-border-l2': '#ded2ba', '--dsw-alias-state-business-primary': '#b45309', 'color-scheme': 'light' } },
      { id: 'azure', name: '苍蓝', desc: '冷调蓝灰', vars: { '--dsw-alias-bg-layer': '#f4f7fb', '--dsw-alias-bg-layer-2': '#eaf0f8', '--dsw-alias-bg-layer-3': '#dde6f2', '--dsw-alias-bg-secondary': '#eaf0f8', '--dsw-alias-label-primary': '#1c2a3a', '--dsw-alias-label-secondary': '#38495e', '--dsw-alias-label-tertiary': '#6c7d93', '--dsw-alias-border-secondary': '#cfdbe8', '--dsw-alias-border-l2': '#cfdbe8', '--dsw-alias-state-business-primary': '#0e7490', 'color-scheme': 'light' } },
      { id: 'moss', name: '苔绿', desc: '低饱和绿', vars: { '--dsw-alias-bg-layer': '#f4f8f3', '--dsw-alias-bg-layer-2': '#e9f1e7', '--dsw-alias-bg-layer-3': '#dce8d9', '--dsw-alias-bg-secondary': '#e9f1e7', '--dsw-alias-label-primary': '#22301f', '--dsw-alias-label-secondary': '#3d4f39', '--dsw-alias-label-tertiary': '#6f8369', '--dsw-alias-border-secondary': '#d0ddcb', '--dsw-alias-border-l2': '#d0ddcb', '--dsw-alias-state-business-primary': '#2f7d4f', 'color-scheme': 'light' } },
      { id: 'violet', name: '紫罗兰', desc: '淡紫底', vars: { '--dsw-alias-bg-layer': '#f8f5fd', '--dsw-alias-bg-layer-2': '#f0eaf9', '--dsw-alias-bg-layer-3': '#e5dcf4', '--dsw-alias-bg-secondary': '#f0eaf9', '--dsw-alias-label-primary': '#2c2338', '--dsw-alias-label-secondary': '#4a3d5c', '--dsw-alias-label-tertiary': '#7c6e91', '--dsw-alias-border-secondary': '#ddd2ee', '--dsw-alias-border-l2': '#ddd2ee', '--dsw-alias-state-business-primary': '#7c3aed', 'color-scheme': 'light' } },
      { id: 'amber', name: '琥珀', desc: '暖橙、深色底', vars: { '--dsw-alias-bg-layer': '#191410', '--dsw-alias-bg-layer-2': '#221a14', '--dsw-alias-bg-layer-3': '#2e231a', '--dsw-alias-bg-secondary': '#221a14', '--dsw-alias-label-primary': '#f5e9dc', '--dsw-alias-label-secondary': '#d8c6b2', '--dsw-alias-label-tertiary': '#9c8873', '--dsw-alias-border-secondary': '#3a2c20', '--dsw-alias-border-l2': '#3a2c20', '--dsw-alias-state-business-primary': '#f59e0b', 'color-scheme': 'dark' } },
      { id: 'sakura', name: '樱粉', desc: '浅粉底', vars: { '--dsw-alias-bg-layer': '#fff7f9', '--dsw-alias-bg-layer-2': '#fdedf1', '--dsw-alias-bg-layer-3': '#f8dde4', '--dsw-alias-bg-secondary': '#fdedf1', '--dsw-alias-label-primary': '#38222a', '--dsw-alias-label-secondary': '#5a3d47', '--dsw-alias-label-tertiary': '#8d6c77', '--dsw-alias-border-secondary': '#efd0d9', '--dsw-alias-border-l2': '#efd0d9', '--dsw-alias-state-business-primary': '#db2777', 'color-scheme': 'light' } }
    ]
    function applyUiTheme(theme) {
      var vars = (theme && theme.ui) || {}
      var keys = Object.keys(vars)
      var node = document.getElementById(UI_STYLE_ID)
      if (!keys.length) {
        if (node && node.parentNode) node.parentNode.removeChild(node)
        return
      }
      if (!node) {
        node = document.createElement('style')
        node.id = UI_STYLE_ID
        node.setAttribute('data-boot-ui-theme', '1')
        document.head.appendChild(node)
      }
      node.textContent = ':root{' + keys.map(function (k) { return k + ':' + vars[k] + ';' }).join('') + '}'
    }
    function loadUiTheme() {
      fetch(API + '/config', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json() })
        .then(function (j) {
          var cfg = (j && j.config) || {}
          var hit = UI_THEMES.filter(function (x) { return x.id === (cfg.uiTheme || 'default') })[0] || UI_THEMES[0]
          applyUiTheme(hit)
        })
        .catch(function () { /* 拿不到就保持现状 */ })
    }
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadUiTheme, { once: true })
      else loadUiTheme()
    }
    var ROOT_ID = 'dsh-gd-root'
    var FALLBACK_VERSION = '2.7.0-beta.6'

    var DEFAULTS = {
  "enabled": true,
  "mode": "session",
  "speed": 1,
  "duration": 6200,
  "title": "星布谷地",
  "sub": "LOOMIX · GUDI",
  "allowSkip": true,
  "showLoading": true
}

    /* ── 自举 ────────────────────────────────────────────────────────────── */
    function readFlag(area, key) {
      try { return window[area].getItem(key) } catch (e) { return null }
    }

    function writeFlag(area, key, value) {
      try { window[area].setItem(key, value) } catch (e) { /* 隐私模式 */ }
    }

    function injectRoot(cfg) {
      if (document.getElementById(ROOT_ID)) return
      if (!document.querySelector('link[data-gd-css]')) {
        var link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = API + '/splash.css'
        link.setAttribute('data-gd-css', '1')
        document.head.appendChild(link)
      }
      var root = document.createElement('div')
      root.id = ROOT_ID
      root.className = 'gd-root'
      root.style.display = 'none'
      document.body.appendChild(root)
      window.__DSH_GD_CONFIG__ = cfg
      var script = document.createElement('script')
      script.src = API + '/splash.js'
      script.async = true
      document.body.appendChild(script)
    }

    /* ── 桌面端标题栏（自举路径）────────────────────────────────────────────
       splash.js 自己也会藏，但它要等 fetch 完才加载；这段在 fetch 之前就把
       白块清掉，避免「点开就闪一下」。判定与运行时完全一致。 */
    var TITLE_VARS = ['--dsw-specific-sidebar-fill', '--dsw-alias-label-primary']
    var CLEAR = 'rgba(0, 0, 0, 0)'
    var savedTitleVars = {}

    function isDesktopWin() {
      try {
        var nav = typeof navigator !== 'undefined' ? navigator : null
        if (!nav || !/Win/.test(nav.userAgent || '')) return false
        var loc = typeof location !== 'undefined' ? location : null
        if (loc && loc.protocol === 'dsh-app:') return true
        return !!(document.documentElement && document.documentElement.hasAttribute &&
          document.documentElement.hasAttribute('data-windows-titlebar'))
      } catch (e) { return false }
    }

    function earlyHideTitlebar() {
      try {
        if (!isDesktopWin()) return
        var probe = document.querySelector && document.querySelector('span[style*="dsw-specific-sidebar-fill"]')
        if (probe && probe.style) {
          probe.style.setProperty('background-color', CLEAR)
          probe.style.setProperty('color', CLEAR)
        }
        var de = document.documentElement
        if (!de) return
        for (var i = 0; i < TITLE_VARS.length; i++) {
          savedTitleVars[TITLE_VARS[i]] = de.style.getPropertyValue(TITLE_VARS[i])
          de.style.setProperty(TITLE_VARS[i], CLEAR)
        }
      } catch (e) { /* 兜底 */ }
    }

    function restoreTitlebar() {
      try {
        var de = document.documentElement
        if (!de) return
        for (var i = 0; i < TITLE_VARS.length; i++) {
          var saved = savedTitleVars[TITLE_VARS[i]]
          if (saved) de.style.setProperty(TITLE_VARS[i], saved)
          else de.style.removeProperty(TITLE_VARS[i])
        }
      } catch (e) { /* 兜底 */ }
    }

    function selfBoot() {
      try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return
        if (!document.body) return
        if (window.__DSH_GD_CONFIG__) return   /* Host 已注入 */
        if (window.__DSH_GD_BOOT__) return     /* 本侧已自举 */
        window.__DSH_GD_BOOT__ = true

        earlyHideTitlebar()

        fetch(API + '/config', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) {
            var cfg = (j && j.config) || Object.assign({}, DEFAULTS)
            if (cfg.enabled === false) { restoreTitlebar(); return }
            var today = new Date().toISOString().slice(0, 10)
            if (cfg.mode === 'session' && readFlag('sessionStorage', 'dsh-gd:shown') === '1') { restoreTitlebar(); return }
            if (cfg.mode === 'daily' && readFlag('localStorage', 'dsh-gd:day') === today) { restoreTitlebar(); return }
            if (cfg.mode === 'once' && readFlag('localStorage', 'dsh-gd:once') === '1') { restoreTitlebar(); return }
            injectRoot(cfg)
          })
          .catch(function () { restoreTitlebar() /* 自举失败就不播，不影响宿主 */ })
      } catch (e) { /* 兜底 */ }
    }

    /* ── 样式 ────────────────────────────────────────────────────────────── */
    var CSS = [
      '.__gd_root{max-width:640px;display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--dsw-alias-label-primary)}',
      '.__gd_version{font-family:ui-monospace,Consolas,monospace;font-size:12px;color:var(--dsw-alias-label-tertiary)}',
      '.__gd_group{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-3)}',
      '.__gd_groupTitle{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}',
      '.__gd_field{display:flex;flex-direction:column;gap:6px}',
      '.__gd_check{flex-direction:row;align-items:flex-start;gap:9px;cursor:pointer}',
      '.__gd_check input{margin-top:2px;accent-color:var(--dsw-alias-state-business-primary)}',
      '.__gd_label{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-secondary)}',
      '.__gd_hint{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}',
      '.__gd_input{font:inherit;font-size:12.5px;padding:7px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);width:100%}',
      '.__gd_row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.__gd_btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font:inherit;font-size:12.5px;cursor:pointer}',
      '.__gd_btn.primary{background:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse,#fff);font-weight:600}',
      '.__gd_btn[disabled]{opacity:.5;cursor:default}',
      '.__gd_notice{font-size:12px;color:var(--dsw-alias-label-tertiary)}'
    ].join('\n')

    var CSS_ID = 'dsh-gd/panel.css'
    function ensureStyle() {
      if (typeof document === 'undefined' || !document.head) return function () {}
      if (document.querySelector('style[data-plugin-css="' + CSS_ID + '"]')) return function () {}
      var tag = document.createElement('style')
      tag.setAttribute('data-plugin-css', CSS_ID)
      tag.textContent = CSS
      document.head.appendChild(tag)
      return function () {
        try { if (tag.parentNode) tag.parentNode.removeChild(tag) } catch (e) {}
      }
    }

    /* ── 小控件 ──────────────────────────────────────────────────────────── */
    function Field(props) {
      return h('label', { className: '__gd_field' },
        h('span', { className: '__gd_label' }, props.label),
        props.children,
        props.hint ? h('span', { className: '__gd_hint' }, props.hint) : null)
    }

    var MODES = [
      ['session', '每个浏览器会话一次'],
      ['always', '每次打开都播放'],
      ['once', '只播放一次'],
      ['daily', '每天一次']
    ]

    /* ── 面板 ────────────────────────────────────────────────────────────── */
    function Panel() {
      function loadThemes() {
        fetch(API + '/themes', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) { setThemes(j && j.themes ? j.themes : []); setThemeDir(j && j.dir ? j.dir : '') })
          .catch(function () { setThemes([]) })
      }

      function importTheme() {
        var p2 = String(importPath || '').trim()
        if (!p2) { setNotice('先填一个目录路径'); return }
        fetch(API + '/themes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importDir: p2 })
        })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '导入失败')
            setThemes(j.themes || [])
            setNotice('已导入主题 ' + j.id)
            setImportPath('')
          })
          .catch(function (e) { setNotice('导入失败：' + String(e && e.message ? e.message : e)) })
      }

      function deleteTheme(id) {
        if (!window.confirm('删除主题 ' + id + ' ？')) return
        fetch(API + '/themes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delete: id })
        })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '删除失败')
            setThemes(j.themes || [])
            if (draft.theme === id) set('theme', 'aurora')
          })
          .catch(function (e) { setNotice('删除失败：' + String(e && e.message ? e.message : e)) })
      }

      function uiThemeGrid() {
        var cur = draft.uiTheme || 'default'
        return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' } },
          UI_THEMES.map(function (t) {
            var on = cur === t.id
            var v = t.vars || {}
            return h('div', {
              key: t.id,
              onClick: function () {
                set('uiTheme', t.id)
                applyUiTheme(t)
              },
              style: {
                cursor: 'pointer', padding: '5px', borderRadius: '8px',
                border: '2px solid ' + (on ? '#4fe0a8' : 'var(--dsw-alias-border-l2)'),
                background: on ? 'rgba(79,224,168,0.08)' : 'transparent'
              }
            },
              h('div', { style: { display: 'flex', height: '34px', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-secondary)' } },
                h('i', { style: { flex: '1', background: v['--dsw-alias-bg-layer'] || '#ffffff' } }),
                h('i', { style: { flex: '1', background: v['--dsw-alias-label-primary'] || '#1f2430' } }),
                h('i', { style: { flex: '1', background: v['--dsw-alias-state-business-primary'] || '#2563eb' } })
              ),
              h('div', { style: { fontSize: '12px', fontWeight: 600, marginTop: '4px' } }, t.name),
              h('div', { style: { fontSize: '11px', opacity: .68, lineHeight: 1.3 } }, t.desc)
            )
          })
        )
      }

      function themeGrid() {
        if (!themes) return h('div', { className: '__gd_hint' }, '读取主题中…')
        return h('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(126px, 1fr))', gap: '9px' }
        }, themes.map(function (t) {
          var active = draft.theme === t.id
          var thumb = t.bg
            ? h('img', {
              src: 'data:image/svg+xml;utf8,' + encodeURIComponent(t.bg),
              alt: t.name,
              style: { width: '100%', height: '50px', objectFit: 'cover', borderRadius: '6px', display: 'block' }
            })
            : h('div', {
              style: { width: '100%', height: '50px', borderRadius: '6px', background: (t.colors && t.colors.accent) || '#666' }
            })
          return h('div', {
            key: t.id,
            onClick: function () { set('theme', t.id); applyUiTheme(t) },
            style: {
              cursor: 'pointer', padding: '5px', borderRadius: '8px',
              border: '2px solid ' + (active ? '#4fe0a8' : 'var(--dsw-alias-border-l2)'),
              background: active ? 'rgba(79,224,168,0.08)' : 'transparent'
            }
          },
            thumb,
            h('div', { style: { fontSize: '12px', fontWeight: 600, marginTop: '4px' } },
              t.name,
              t.user ? h('span', { style: { fontSize: '10.5px', color: '#4fe0a8', marginLeft: '3px' } }, '导入') : null),
            h('div', { style: { fontSize: '11px', opacity: .68, lineHeight: 1.3 } }, t.desc || ''),
            t.user ? h('button', {
              className: '__gd_btn',
              style: { marginTop: '3px', padding: '0 6px', fontSize: '11px', color: '#e5484d' },
              onClick: function (e) { e.stopPropagation(); deleteTheme(t.id) }
            }, '删除') : null
          )
        }))
      }

      var [draft, setDraft] = react.useState(null)
      var [version, setVersion] = react.useState(FALLBACK_VERSION)
      var [error, setError] = react.useState(null)
      var [notice, setNotice] = react.useState(null)
      var [busy, setBusy] = react.useState(false)
      var [themes, setThemes] = react.useState(null)
      var [themeDir, setThemeDir] = react.useState('')
      var [importPath, setImportPath] = react.useState('')

      function set(key, value) {
        setDraft(function (d) {
          if (!d) return d
          var next = Object.assign({}, d)
          next[key] = value
          return next
        })
        setNotice(null)
      }

      function load() {
        setError(null)
        return fetch(API + '/config', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '读取失败')
            setDraft(Object.assign({}, DEFAULTS, j.config))
            if (j.version) setVersion(j.version)
          })
          .catch(function (e) { setError('读取失败：' + String(e && e.message ? e.message : e)) })
      }

      react.useEffect(function () { load(); loadThemes() }, [])

      function save() {
        setBusy(true)
        setNotice(null)
        fetch(API + '/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft)
        })
          .then(function (r) { return r.json() })
          .then(function (j) {
            if (!j || j.ok !== true) throw new Error((j && j.error) || '保存失败')
            setDraft(Object.assign({}, DEFAULTS, j.config))
            setNotice('已保存 · 下次刷新生效')
          })
          .catch(function (e) { setNotice('保存失败：' + String(e && e.message ? e.message : e)) })
          .then(function () { setBusy(false) })
      }

      function preview() {
        window.open(API + '/replay', '_blank', 'width=1280,height=760')
      }

      if (!draft) {
        return h('div', { className: '__gd_root' },
          h('div', { className: '__gd_version' }, '版本 v' + version),
          h('div', { className: '__gd_notice' }, error || '读取中…'),
          error ? h('div', { className: '__gd_row' },
            h('button', { className: '__gd_btn', onClick: load }, '重试')) : null)
      }

      return h('div', { className: '__gd_root' },
        h('div', { className: '__gd_row' },
          h('span', { className: '__gd_version' }, '版本 v' + version),
          h('button', { className: '__gd_btn', onClick: preview }, '立即预览')),

        h('div', { className: '__gd_group' },
          h('div', { className: '__gd_groupTitle' }, '主题'),
          h('div', { className: '__gd_hint' }, '内置主题的图案全部由代码生成（纯几何 SVG），不含任何外部素材。'),
          themeGrid(),
          h(Field, { label: '导入主题目录', hint: '目录里要有 theme.json；导入后复制到 ' + (themeDir || '~/.dsh/gd-themes') },
            h('div', { className: '__gd_row' },
              h('input', {
                className: '__gd_input',
                style: { flex: '1', minWidth: '180px' },
                placeholder: '例如 D:\\my-theme',
                value: importPath,
                onChange: function (e) { setImportPath(e.target.value) }
              }),
              h('button', { className: '__gd_btn', onClick: importTheme }, '导入')
            )
          )
        ),

        h('div', { className: '__gd_group' },
          h('div', { className: '__gd_groupTitle' }, '主界面主题'),
          h('div', { className: '__gd_hint' },
            '只改 DSH 界面的配色（侧边栏、对话区、按钮），与上面的开机动画主题完全独立。'),
          uiThemeGrid()
        ),

        h('div', { className: '__gd_group' },
          h('div', { className: '__gd_groupTitle' }, '播放'),
          h('label', { className: '__gd_field __gd_check' },
            h('input', {
              type: 'checkbox',
              checked: draft.enabled !== false,
              onChange: function (e) { set('enabled', e.target.checked) }
            }),
            h('span', null,
              h('span', { className: '__gd_label' }, '启用启动动画'),
              h('span', { className: '__gd_hint' }, '关闭后直接进主界面，不再显示星布谷地'))),

          h(Field, { label: '播放时机' },
            h('select', {
              className: '__gd_input',
              value: draft.mode || 'session',
              onChange: function (e) { set('mode', e.target.value) }
            }, MODES.map(function (m) { return h('option', { key: m[0], value: m[0] }, m[1]) }))),

          h(Field, {
            label: '速度倍率',
            hint: '0.35 慢放 · 1 原速 · 3 快放；文字、加载条、漂浮动画都跟着变'
          }, h('div', { className: '__gd_row' },
            h('input', {
              type: 'range',
              min: '0.35',
              max: '3',
              step: '0.05',
              value: draft.speed,
              onChange: function (e) { set('speed', Number(e.target.value)) },
              style: { flex: '1' }
            }),
            h('span', { className: '__gd_version' }, Number(draft.speed).toFixed(2) + '×'))),

          h(Field, { label: '停留时长（毫秒）', hint: '不操作时多久自动揭幕，1200 – 20000' },
            h('input', {
              className: '__gd_input',
              type: 'number',
              min: '1200',
              max: '20000',
              step: '100',
              value: draft.duration,
              onChange: function (e) { set('duration', Number(e.target.value)) }
            }))
        ),

        h('div', { className: '__gd_group' },
          h('div', { className: '__gd_groupTitle' }, '文案'),
          h(Field, { label: '标题' },
            h('input', {
              className: '__gd_input',
              value: draft.title,
              maxLength: 24,
              onChange: function (e) { set('title', e.target.value) }
            })),
          h(Field, { label: '副标题' },
            h('input', {
              className: '__gd_input',
              value: draft.sub,
              maxLength: 40,
              onChange: function (e) { set('sub', e.target.value) }
            }))
        ),

        h('div', { className: '__gd_group' },
          h('div', { className: '__gd_groupTitle' }, '交互'),
          h('label', { className: '__gd_field __gd_check' },
            h('input', {
              type: 'checkbox',
              checked: draft.allowSkip !== false,
              onChange: function (e) { set('allowSkip', e.target.checked) }
            }),
            h('span', null,
              h('span', { className: '__gd_label' }, '允许跳过'),
              h('span', { className: '__gd_hint' }, '点击任意处或按任意键直接进主界面'))),
          h('label', { className: '__gd_field __gd_check' },
            h('input', {
              type: 'checkbox',
              checked: draft.showLoading !== false,
              onChange: function (e) { set('showLoading', e.target.checked) }
            }),
            h('span', null,
              h('span', { className: '__gd_label' }, '显示加载条'),
              h('span', { className: '__gd_hint' }, '底部那条细进度条')))
        ),

        h('div', { className: '__gd_row' },
          h('button', { className: '__gd_btn primary', disabled: busy, onClick: save },
            busy ? '保存中…' : '保存'),
          h('button', { className: '__gd_btn', onClick: load }, '重新读取'),
          notice ? h('span', { className: '__gd_notice' }, notice) : null)
      )
    }

    /* ── 插件 ────────────────────────────────────────────────────────────── */
    var inject = ['slots']

    function apply(ctx) {
      selfBoot()
      var removeStyle = ensureStyle()
      ctx.effect(function () { return removeStyle })
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'dsh-gd-v2', order: 29, label: '星布谷地 ✓主题' },
          function () { return h(Panel, {}) }
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
