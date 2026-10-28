/* ============================================================================
 * dsh-gd — 浏览器半侧（设置面板 + 桌面端自举）
 * ----------------------------------------------------------------------------
 * 1) selfBoot：桌面端不走 Host 的 tapIndex 注入，由这里读配置、按模式决定
 *    是否播放，然后自己挂根节点、拉 CSS 与运行时。
 * 2) 设置面板：注册到「设置」侧栏，改完保存到 Host。
 * ========================================================================== */
window.__ModuleLoader__.load({
  id: 'dsh-gd',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement

    var API = '/dsh-gd'
    var ROOT_ID = 'dsh-gd-root'
    var FALLBACK_VERSION = '2.0.0'

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

    function selfBoot() {
      try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return
        if (!document.body) return
        if (window.__DSH_GD_CONFIG__) return   /* Host 已注入 */
        if (window.__DSH_GD_BOOT__) return     /* 本侧已自举 */
        window.__DSH_GD_BOOT__ = true

        fetch(API + '/config', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json() })
          .then(function (j) {
            var cfg = (j && j.config) || Object.assign({}, DEFAULTS)
            if (cfg.enabled === false) return
            var today = new Date().toISOString().slice(0, 10)
            if (cfg.mode === 'session' && readFlag('sessionStorage', 'dsh-gd:shown') === '1') return
            if (cfg.mode === 'daily' && readFlag('localStorage', 'dsh-gd:day') === today) return
            if (cfg.mode === 'once' && readFlag('localStorage', 'dsh-gd:once') === '1') return
            injectRoot(cfg)
          })
          .catch(function () { /* 自举失败就不播，不影响宿主 */ })
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
      var [draft, setDraft] = react.useState(null)
      var [version, setVersion] = react.useState(FALLBACK_VERSION)
      var [error, setError] = react.useState(null)
      var [notice, setNotice] = react.useState(null)
      var [busy, setBusy] = react.useState(false)

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

      react.useEffect(function () { load() }, [])

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
          { name: 'settings.section', id: 'dsh-gd', order: 29, label: '星布谷地' },
          function () { return h(Panel, {}) }
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
