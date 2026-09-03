/* ============================================================
   図鑑のエンジン

   やっていることは4つ。
     1. catalog.js から索引を描く（検索つき）
     2. 選ばれた部品を iframe に流し込んでプレビューにする
     3. 同じ文字列をコード欄に出す（★見本とコードが絶対にズレない★）
     4. 明暗・シード・幅を iframe に伝える

   ★なぜ iframe なのか★
     - .toast / .sheet / .fab / .navbar は position: fixed。素の div に
       入れると図鑑の画面いっぱいに飛び出す
     - 幅を 360 に切り替えれば、PC のブラウザのまま「携帯で崩れるか」を
       確認できる。適応レイアウトもここで見える
     - 図鑑自身の CSS と部品の CSS が絶対に混ざらない
   ============================================================ */

import { CATALOG, GROUPS } from './catalog.js'
import { SPRITE } from './icons.js'

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const root = document.documentElement

const SEEDS = [
  ['indigo', 'インディゴ', '#575b8c'],
  ['teal', 'ティール', '#206a5f'],
  ['green', 'グリーン', '#496738'],
  ['amber', 'アンバー', '#88522d'],
  ['rose', 'ローズ', '#894d5b'],
  ['violet', 'バイオレット', '#6f33d5'],
  ['graphite', 'グラファイト', '#575f6b'],
]
const WIDTHS = [360, 720, 1100]

const state = {
  id: location.hash.slice(1) || CATALOG[0].id,
  q: '',
  theme: 'system',
  seed: 'indigo',
  w: null, // null = entry の既定
}

/* ============================================================
   iframe に流し込むプレビュー
   ============================================================ */

/** srcdoc の中身を組み立てる。★starter/ の CSS をそのまま読む★ */
function docFor(entry, dark) {
  const inner =
    entry.frame === 'app'
      ? `<div class="app ${entry.appClass ?? ''}">${entry.html}</div>`
      : `<div class="pv">${entry.html}</div>`
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../starter/styles/components.css">
<style>
  /* プレビューの下敷き。部品のスタイルは上書きしない */
  body { background: var(--surface); }
  .pv { padding: 16px; display: flex; flex-direction: column; }
  /* 外殻を持たない部品では、バーのぶんの余白を 0 にする（body.no-bars と同じ） */
  body.no-bars { --inset-top: 0px; --inset-bottom: 0px; }
</style>
</head>
<body class="${entry.frame === 'app' ? '' : 'no-bars'}">
${SPRITE}
${inner}
</body>
</html>`
}

/** 押下の即時反応。lib/press.ts と同じことを iframe の document に付ける */
const PRESSABLE = [
  '.btn', '.iconbtn', '.fab', '.chip', '.row--link', '.seg__btn', '.navbar__item',
  '.rail__item', '.drawer__item', '.toast__action', '.switch', '.swatch', '.menu__item',
  '.pager__item', '.crumbs__item', '.cal__day', '.togglebtn', '.fabmenu__item',
  '.rating__star', '.tabs__item', '.command__item', '.dial__n',
].join(', ')

function attachPress(d) {
  let cur = null
  const release = () => {
    cur?.classList.remove('is-pressed')
    cur = null
  }
  d.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target.closest?.(PRESSABLE)
      if (!t || t.disabled) return
      release()
      cur = t
      t.classList.add('is-pressed')
    },
    { passive: true },
  )
  for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'scroll'])
    d.addEventListener(type, release, { passive: true, capture: true })
}

/* ============================================================
   entry.init に渡す道具箱。starter/lib/*.ts の素の JS 版
   ============================================================ */
const U = {
  $: (s, r) => r.querySelector(s),
  $$: (s, r) => [...r.querySelectorAll(s)],

  /** 排他選択。indexVar を渡すとインジケータの位置も動かす */
  exclusive(box, sel, indexVar, attr) {
    const items = [...box.querySelectorAll(sel)]
    items.forEach((el, i) => {
      el.onclick = () => {
        if (indexVar) box.style.setProperty(indexVar, i)
        items.forEach((o, j) =>
          o.setAttribute(
            attr,
            attr === 'aria-current' ? (i === j ? 'page' : 'false') : String(i === j),
          ),
        )
      }
    })
  },

  /** トップアプリバーの「潜ったら色が変わる」 */
  scrollBar(d) {
    const main = d.querySelector('.main')
    const bar = d.querySelector('.appbar')
    if (!main || !bar) return
    let solid = false
    main.addEventListener(
      'scroll',
      () => {
        const next = main.scrollTop > 4
        if (next !== solid) bar.classList.toggle('appbar--solid', (solid = next))
      },
      { passive: true },
    )
  },

  /** 開いた popover を起点に合わせる（lib/overlay.ts の anchorTo） */
  anchorTo(d, el, anchor, { placement = 'bottom-start', gap = 4, margin = 8, matchWidth } = {}) {
    const win = d.defaultView
    const a = anchor.getBoundingClientRect()
    if (matchWidth) el.style.width = `${a.width}px`
    el.style.position = 'fixed'
    el.style.left = '0px'
    el.style.top = '0px'
    const r = el.getBoundingClientRect()
    const top = placement.startsWith('top')
    const end = placement.endsWith('end')
    let x = end ? a.right - r.width : a.left
    if (placement === 'bottom' || placement === 'top') x = a.left + (a.width - r.width) / 2
    let y = top ? a.top - r.height - gap : a.bottom + gap
    if (!top && y + r.height > win.innerHeight - margin && a.top - r.height - gap > margin)
      y = a.top - r.height - gap
    x = Math.min(Math.max(margin, x), Math.max(margin, win.innerWidth - r.width - margin))
    y = Math.min(Math.max(margin, y), Math.max(margin, win.innerHeight - r.height - margin))
    el.style.left = `${Math.round(x)}px`
    el.style.top = `${Math.round(y)}px`
    el.style.setProperty('--menu-origin', `${top ? 'bottom' : 'top'} ${end ? 'right' : 'left'}`)
  },

  /** 出し入れは Popover API に任せ、位置決めと追従だけ足す */
  bindMenu(d, trigger, menu, opts = {}) {
    const reposition = () => U.anchorTo(d, menu, trigger, opts)
    menu.addEventListener('toggle', (e) => {
      const open = e.newState === 'open'
      trigger.setAttribute('aria-expanded', String(open))
      if (open) reposition()
    })
    menu.addEventListener('click', (e) => {
      const it = e.target.closest?.('.menu__item')
      if (it && it.getAttribute('aria-disabled') !== 'true') menu.hidePopover()
    })
  },

  /** 右クリック（PC）と長押し 500ms（触る画面） */
  bindContextMenu(d, area, menu) {
    const win = d.defaultView
    const at = (x, y) => {
      menu.style.position = 'fixed'
      menu.style.left = '0px'
      menu.style.top = '0px'
      const r = menu.getBoundingClientRect()
      menu.style.left = `${Math.round(Math.min(x, win.innerWidth - r.width - 8))}px`
      menu.style.top = `${Math.round(Math.min(y, win.innerHeight - r.height - 8))}px`
    }
    area.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      menu.showPopover()
      at(e.clientX, e.clientY)
    })
    let timer, sx, sy
    area.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return
      ;[sx, sy] = [e.clientX, e.clientY]
      timer = win.setTimeout(() => {
        menu.showPopover()
        at(sx, sy)
        win.navigator.vibrate?.(12)
      }, 500)
    })
    area.addEventListener('pointermove', (e) => {
      if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) win.clearTimeout(timer)
    })
    for (const t of ['pointerup', 'pointercancel'])
      area.addEventListener(t, () => win.clearTimeout(timer))
  },

  /** ★触る画面には出さない★ */
  bindTooltip(d, trigger, tip, delay = 400) {
    const win = d.defaultView
    if (win.matchMedia('(pointer: coarse)').matches) return
    let timer
    const show = () => {
      timer = win.setTimeout(() => {
        tip.showPopover()
        U.anchorTo(d, tip, trigger, { placement: 'top', gap: 8 })
      }, delay)
    }
    const hide = () => {
      win.clearTimeout(timer)
      tip.hidePopover()
    }
    trigger.addEventListener('pointerenter', show)
    trigger.addEventListener('pointerleave', hide)
    trigger.addEventListener('focus', show)
    trigger.addEventListener('blur', hide)
  },

  /** 暗幕を敷いて何かを出す。返り値を呼ぶと閉じる */
  overlay(d, build, cleanup) {
    const scrim = d.createElement('div')
    scrim.className = 'scrim'
    const el = build()
    const close = () => {
      scrim.remove()
      cleanup ? cleanup() : el.remove()
    }
    scrim.onclick = close
    d.body.append(scrim)
    if (!el.isConnected) d.body.append(el)
    return close
  },

  /** スナックバー */
  toast(d, text, action) {
    let box = d.querySelector('.toasts')
    if (!box) {
      box = d.createElement('div')
      box.className = 'toasts'
      d.body.appendChild(box)
    }
    const el = d.createElement('div')
    el.className = 'toast'
    el.innerHTML = '<span class="toast__text"></span>'
    el.querySelector('.toast__text').textContent = text
    if (action) {
      const b = d.createElement('button')
      b.className = 'toast__action'
      b.textContent = action
      b.onclick = () => el.remove()
      el.appendChild(b)
    }
    box.appendChild(el)
    el.animate([{ transform: 'translateY(-12px)', opacity: 0 }, {}], {
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    })
    d.defaultView.setTimeout(() => el.remove(), 4000)
  },

  /** 読み込みの印。lib/loader.ts の移植（極座標 → 3次ベジェ → d の補間） */
  loader(d) {
    const N = 48
    const R = 33
    const ell = (a, b, t) => {
      const c = b * Math.cos(t)
      const s = a * Math.sin(t)
      return (a * b) / Math.sqrt(c * c + s * s)
    }
    const SHAPES = [
      (t) => 1 + 0.16 * Math.cos(10 * t),
      (t) => 1 + 0.09 * Math.cos(9 * t),
      (t) => 1 + 0.1 * Math.cos(5 * t),
      (t) => ell(1.22, 0.7, t),
      (t) => 1 + 0.18 * Math.cos(8 * t),
      (t) => 1 + 0.14 * Math.cos(4 * t),
      (t) => ell(1.1, 0.86, t - Math.PI / 4),
    ]
    const toPath = (r) => {
      const pts = []
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2
        const rr = R * r(t)
        pts.push([50 + rr * Math.cos(t), 50 + rr * Math.sin(t)])
      }
      const at = (i) => pts[((i % N) + N) % N]
      const f = (v) => v.toFixed(2)
      let s = `M${f(pts[0][0])} ${f(pts[0][1])}`
      for (let i = 0; i < N; i++) {
        const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
        s += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(
          p2[0] - (p3[0] - p1[0]) / 6,
        )} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
      }
      return s + 'Z'
    }
    const paths = SHAPES.map(toPath)
    for (const p of d.querySelectorAll('.loader__shape')) {
      p.setAttribute('d', paths[0])
      try {
        p.animate(
          [...paths, paths[0]].map((s, i) => ({
            d: `path("${s}")`,
            offset: i / paths.length,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          })),
          { duration: 650 * paths.length, iterations: Infinity },
        )
      } catch {
        /* d の補間ができない環境では最初の形のまま回る */
      }
    }
  },
}

/* ============================================================
   描く
   ============================================================ */
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

function matches(e, q) {
  if (!q) return true
  const hay = `${e.id} ${e.name} ${e.m3} ${e.group} ${e.tags} ${e.note}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => hay.includes(t))
}

function renderIndex() {
  const list = $('#index')
  const hits = CATALOG.filter((e) => matches(e, state.q))
  if (!hits.length) {
    list.innerHTML = '<p class="index__empty">見つかりません</p>'
    return
  }
  list.innerHTML = GROUPS.map((g) => {
    const items = hits.filter((e) => e.group === g)
    if (!items.length) return ''
    return (
      `<div class="index__group">${g}</div>` +
      items
        .map(
          (e) =>
            `<button class="index__item" data-id="${e.id}" aria-current="${e.id === state.id}">` +
            `<span>${e.name}</span><span class="index__m3">${esc(e.m3)}</span></button>`,
        )
        .join('')
    )
  }).join('')
  for (const b of $$('.index__item', list))
    b.onclick = () => {
      location.hash = b.dataset.id
      $('#index-panel').classList.remove('is-open')
    }
}

let frameSeq = 0

function renderDetail() {
  const e = CATALOG.find((x) => x.id === state.id) ?? CATALOG[0]
  const w = state.w ?? e.w ?? 'auto'
  const detail = $('#detail')

  detail.innerHTML = `
    <div class="detail__head">
      <h1 class="detail__title">${e.name}</h1>
      <div class="detail__meta">
        <span class="badge">${e.group}</span>
        <span>${esc(e.m3)}</span>
        <span>·</span>
        <span>components-${e.file}.css</span>
        <span>·</span>
        <a class="btn btn--text btn--sm" href="../docs/${e.doc}.md">docs/${e.doc}.md</a>
      </div>
    </div>
    <p class="detail__note">${e.note}</p>

    <div class="bar">
      <div class="seg" id="wseg" style="--seg-n:4; --seg-i:${
        w === 'auto' ? 0 : WIDTHS.indexOf(w) + 1
      }; max-width:320px; flex:1">
        <div class="seg__ind"></div>
        <button class="seg__btn" data-w="auto" aria-pressed="${w === 'auto'}">自動</button>
        ${WIDTHS.map(
          (n) => `<button class="seg__btn" data-w="${n}" aria-pressed="${w === n}">${n}</button>`,
        ).join('')}
      </div>
      <button class="btn btn--sm" id="reload">やり直す</button>
    </div>

    <div class="stage" id="stage"></div>

    ${
      e.contracts?.length
        ? `<div class="section"><h2 class="label">守ること</h2>
             <ul class="contracts">${e.contracts.map((c) => `<li>${c}</li>`).join('')}</ul></div>`
        : ''
    }

    <div class="section">
      <h2 class="label">HTML</h2>
      <div class="src">
        <pre class="code" id="src">${esc(e.html)}</pre>
        <button class="btn btn--sm src__copy" id="copy">コピー</button>
      </div>
    </div>
  `

  /* 幅の切り替え */
  const seg = $('#wseg')
  $$('.seg__btn', seg).forEach((b, i) => {
    b.onclick = () => {
      state.w = b.dataset.w === 'auto' ? null : Number(b.dataset.w)
      seg.style.setProperty('--seg-i', i)
      $$('.seg__btn', seg).forEach((o, j) => o.setAttribute('aria-pressed', String(i === j)))
      mountFrame(e)
    }
  })
  $('#reload').onclick = () => mountFrame(e)

  $('#copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(e.html)
      $('#copy').textContent = 'コピーした'
      setTimeout(() => ($('#copy').textContent = 'コピー'), 1500)
    } catch {
      $('#copy').textContent = '手で選んでコピー'
    }
  }

  mountFrame(e)
  renderIndex()
}

function mountFrame(e) {
  const stage = $('#stage')
  const w = state.w ?? e.w ?? 'auto'
  const f = document.createElement('iframe')
  f.title = `${e.name} のプレビュー`
  f.style.width = w === 'auto' ? '100%' : `${w}px`
  f.style.height = `${e.h ?? 240}px`
  /* ★毎回新しい iframe を作る★ 使い回すと、前の部品が付けたイベントや
     開きっぱなしの popover が残る */
  const seq = ++frameSeq
  stage.replaceChildren(f)
  f.srcdoc = docFor(e)
  f.onload = () => {
    if (seq !== frameSeq) return
    const d = f.contentDocument
    applyThemeTo(d)
    attachPress(d)
    try {
      e.init?.(d, U)
    } catch (err) {
      console.error(`[${e.id}] init に失敗:`, err)
    }
  }
}

/* ============================================================
   明暗とシード
   ============================================================ */
function applyThemeTo(d) {
  const h = d.documentElement
  if (state.theme === 'system') h.removeAttribute('data-theme')
  else h.setAttribute('data-theme', state.theme)
  if (state.seed === 'indigo') h.removeAttribute('data-seed')
  else h.setAttribute('data-seed', state.seed)
}

function applyTheme() {
  applyThemeTo(document)
  for (const f of $$('#stage iframe')) if (f.contentDocument) applyThemeTo(f.contentDocument)
}

/* ============================================================
   組み立て
   ============================================================ */
const seedbox = $('#seeds')
for (const [id, label, sw] of SEEDS) {
  const b = document.createElement('button')
  b.className = 'swatch'
  b.style.background = sw
  b.title = label
  b.setAttribute('aria-label', label)
  b.setAttribute('aria-pressed', String(id === state.seed))
  b.onclick = () => {
    state.seed = id
    for (const o of seedbox.children) o.setAttribute('aria-pressed', String(o === b))
    applyTheme()
  }
  seedbox.appendChild(b)
}

$('#theme').onclick = () => {
  state.theme = state.theme === 'system' ? 'dark' : state.theme === 'dark' ? 'light' : 'system'
  $('#theme').setAttribute('aria-label', `明るさ: ${state.theme}`)
  applyTheme()
}

const search = $('#q')
search.addEventListener('input', () => {
  state.q = search.value
  renderIndex()
})
/* ⌘K / Ctrl+K で検索へ。図鑑自身も同じ作法で作る */
addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
    ev.preventDefault()
    search.focus()
    search.select()
  }
})

$('#menu').onclick = () => $('#index-panel').classList.toggle('is-open')

addEventListener('hashchange', () => {
  const id = location.hash.slice(1)
  if (CATALOG.some((e) => e.id === id)) {
    state.id = id
    state.w = null
    renderDetail()
    $('#detail').scrollTop = 0
  }
})

$('#count').textContent = `${CATALOG.length} 部品`
applyTheme()
renderIndex()
renderDetail()
