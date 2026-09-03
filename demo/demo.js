/* ============================================================
   見本帳を動かす JS。部品の作法そのものは CSS 側にある。

   ここは starter/lib/*.ts の「素の JS 版」。ビルドを要らなくするために
   移植してあるだけで、考え方は同じ:
     press.ts   … pointerdown で .is-pressed
     theme.ts   … data-theme / data-seed
     loader.ts  … 7つの形を d で補間
     overlay.ts … Popover の位置決めと ↑↓ の操作
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const root = document.documentElement

/* ---------------------------------------------------------- 押下（press.ts） */
const PRESSABLE = [
  '.btn', '.iconbtn', '.fab', '.chip', '.row--link', '.seg__btn', '.navbar__item',
  '.rail__item', '.drawer__item', '.toast__action', '.switch', '.swatch', '.menu__item',
  '.pager__item', '.crumbs__item', '.cal__day', '.togglebtn', '.fabmenu__item',
  '.rating__star', '.tabs__item',
].join(', ')

let pressed = null
const release = () => {
  pressed?.classList.remove('is-pressed')
  pressed = null
}
document.addEventListener(
  'pointerdown',
  (e) => {
    const t = e.target.closest?.(PRESSABLE)
    if (!t || t.disabled) return
    release()
    pressed = t
    t.classList.add('is-pressed')
  },
  { passive: true },
)
for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'scroll'])
  document.addEventListener(type, release, { passive: true, capture: true })

/* ---------------------------------------------------------- 明暗とシード（theme.ts） */
const SEEDS = [
  ['indigo', 'インディゴ', '#575b8c'],
  ['teal', 'ティール', '#206a5f'],
  ['green', 'グリーン', '#496738'],
  ['amber', 'アンバー', '#88522d'],
  ['rose', 'ローズ', '#894d5b'],
  ['violet', 'バイオレット', '#6f33d5'],
  ['graphite', 'グラファイト', '#575f6b'],
]

let seed = 'indigo'
const seedbox = $('#seeds')
const paintSeeds = () => {
  for (const b of seedbox.children) b.setAttribute('aria-pressed', String(b.dataset.id === seed))
}
for (const [id, label, sw] of SEEDS) {
  const b = document.createElement('button')
  b.className = 'swatch'
  b.dataset.id = id
  b.style.background = sw
  b.title = label
  b.setAttribute('aria-label', label)
  b.onclick = () => {
    seed = id
    if (id === 'indigo') root.removeAttribute('data-seed')
    else root.setAttribute('data-seed', id)
    paintSeeds()
  }
  seedbox.appendChild(b)
}
paintSeeds()

let theme = 'system'
$('#themebtn').onclick = () => {
  theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  toast(`明るさ: ${theme}`)
}

/* トップアプリバーは「潜ったら surface-container」。
   ★しきい値をまたいだときだけ class を触る★ */
const main = $('#main')
const appbar = $('#appbar')
let solid = false
main.addEventListener(
  'scroll',
  () => {
    const next = main.scrollTop > 4
    if (next !== solid) appbar.classList.toggle('appbar--solid', (solid = next))
  },
  { passive: true },
)

/* ---------------------------------------------------------- 排他選択の共通処理 */
function exclusive(box, sel, indexVar, attr, onPick) {
  const items = $$(sel, box)
  items.forEach((el, i) => {
    el.onclick = () => {
      if (indexVar) box.style.setProperty(indexVar, i)
      items.forEach((o, j) =>
        o.setAttribute(attr, attr === 'aria-current' ? (i === j ? 'page' : 'false') : String(i === j)),
      )
      onPick?.(i, el)
    }
  })
}

/* ---------------------------------------------------------- 章の切り替え

   ★DOM から消さない（hidden にするだけ）★ 消すと、入力中の値や
   スクロール位置が飛ぶ。ナビゲーションバー・レール・ドロワーの
   3つとも同じ関数で動かす（→ docs/15-adaptive.md） */
const sections = $$('[data-sec]')
function show(i) {
  sections.forEach((s, j) => (s.hidden = i !== j))
  main.scrollTop = 0
  for (const box of ['#nav', '#rail', '#drawer']) {
    const el = $(box)
    el.style.setProperty('--nav-i', i)
    $$('[data-go]', el).forEach((b, j) =>
      b.setAttribute('aria-current', i === j ? 'page' : 'false'),
    )
  }
}
for (const box of ['#nav', '#rail', '#drawer']) {
  $$('[data-go]', $(box)).forEach((b, i) => (b.onclick = () => show(i)))
}
show(0)

/* ---------------------------------------------------------- 部品ごとの動き */
exclusive($('#seg1'), '.seg__btn', '--seg-i', 'aria-pressed')
exclusive($('#tabs1'), '.tabs__item', '--tab-i', 'aria-selected')
exclusive($('#tabs2'), '.tabs__item', '--tab-i', 'aria-selected')
exclusive($('#pager'), '.pager__item[data-p]', null, 'aria-current')

for (const chip of $$('.chip[aria-pressed]'))
  chip.onclick = () => chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true')

for (const tg of $$('.togglebtn[aria-pressed]'))
  tg.onclick = () => tg.setAttribute('aria-pressed', tg.getAttribute('aria-pressed') !== 'true')

const sl = $('#sl')
sl.oninput = () => sl.style.setProperty('--p', sl.value + '%')

/* 評価。押した星までを塗る */
const rating = $('#rating')
$$('.rating__star', rating).forEach((star, i) => {
  star.onclick = () =>
    $$('.rating__star', rating).forEach((s, j) => s.classList.toggle('rating__star--on', j <= i))
})

/* 環の進捗。スライダーで動かして見せる */
const ringSl = $('#ringsl')
ringSl.oninput = () => {
  ringSl.style.setProperty('--p', ringSl.value + '%')
  $('#ring').style.setProperty('--p', ringSl.value)
  $('#ringlabel').textContent = ringSl.value
}

/* カレンダー。1〜30 を並べる */
const grid = $('#calgrid')
for (const d of ['日', '月', '火', '水', '木', '金', '土']) {
  const el = document.createElement('div')
  el.className = 'cal__dow'
  el.textContent = d
  grid.appendChild(el)
}
for (let i = 0; i < 32; i++) {
  const b = document.createElement('button')
  const day = i - 1
  b.className = 'cal__day' + (day < 1 ? ' cal__day--other' : day === 3 ? ' cal__day--today' : '')
  b.textContent = day < 1 ? 30 + day : day
  b.setAttribute('aria-selected', String(day === 12))
  b.setAttribute('aria-label', `9月${day}日`)
  if (day === 8) b.insertAdjacentHTML('beforeend', '<span class="cal__dot"></span>')
  b.onclick = () => {
    $$('.cal__day', grid).forEach((o) => o.setAttribute('aria-selected', 'false'))
    b.setAttribute('aria-selected', 'true')
  }
  grid.appendChild(b)
}

/* 時計のダイヤル。12 個の数字を円周に置く */
const dial = $('#dial')
for (let h = 1; h <= 12; h++) {
  const a = ((h - 3) / 12) * Math.PI * 2
  const el = document.createElement('div')
  el.className = 'dial__n'
  el.textContent = h
  el.style.setProperty('--x', `${50 + 38 * Math.cos(a)}%`)
  el.style.setProperty('--y', `${50 + 38 * Math.sin(a)}%`)
  el.setAttribute('aria-selected', String(h === 9))
  el.onclick = () => {
    $$('.dial__n', dial).forEach((o) => o.setAttribute('aria-selected', 'false'))
    el.setAttribute('aria-selected', 'true')
    dial.style.setProperty('--deg', `${h * 30}deg`)
  }
  dial.appendChild(el)
}

/* 使い捨てコード。1つの input を透明にしてマスの上に敷いてある */
const otp = $('#otp')
const ghost = $('.otp__ghost', otp)
const boxes = $$('.otp__box', otp)
const paintOtp = () => {
  const v = ghost.value
  boxes.forEach((b, i) => {
    b.textContent = v[i] ?? ''
    b.classList.toggle('otp__box--now', i === Math.min(v.length, boxes.length - 1))
  })
}
ghost.oninput = paintOtp
ghost.onfocus = paintOtp
paintOtp()

/* ドロップ領域 */
const dz = $('#dz')
for (const t of ['dragenter', 'dragover']) {
  dz.addEventListener(t, (e) => {
    e.preventDefault()
    dz.classList.add('is-over')
  })
}
for (const t of ['dragleave', 'drop']) {
  dz.addEventListener(t, (e) => {
    e.preventDefault()
    dz.classList.remove('is-over')
    if (t === 'drop') toast(`${e.dataTransfer?.files.length ?? 0}件を受け取りました`, '元に戻す')
  })
}

/* ---------------------------------------------------------- 読み込みの印（loader.ts） */
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
function toPath(r) {
  const pts = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const rr = R * r(t)
    pts.push([50 + rr * Math.cos(t), 50 + rr * Math.sin(t)])
  }
  const at = (i) => pts[((i % N) + N) % N]
  const f = (v) => v.toFixed(2)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < N; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(
      p2[0] - (p3[0] - p1[0]) / 6,
    )} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}
const paths = SHAPES.map(toPath)
for (const p of $$('.loader__shape')) {
  p.setAttribute('d', paths[0])
  try {
    p.animate(
      [...paths, paths[0]].map((d, i) => ({
        d: `path("${d}")`,
        offset: i / paths.length,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      })),
      { duration: 650 * paths.length, iterations: Infinity },
    )
  } catch {
    /* d の補間ができない環境では最初の形のまま回る */
  }
}

/* ---------------------------------------------------------- 重ねるもの（overlay.ts） */
function anchorTo(el, anchor, { placement = 'bottom-start', gap = 4, margin = 8, matchWidth } = {}) {
  const a = anchor.getBoundingClientRect()
  if (matchWidth) el.style.width = `${a.width}px`
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  const r = el.getBoundingClientRect()
  const wantsTop = placement.startsWith('top')
  const wantsEnd = placement.endsWith('end')
  let x = wantsEnd ? a.right - r.width : a.left
  if (placement === 'bottom' || placement === 'top') x = a.left + (a.width - r.width) / 2
  let y = wantsTop ? a.top - r.height - gap : a.bottom + gap
  if (!wantsTop && y + r.height > innerHeight - margin && a.top - r.height - gap > margin)
    y = a.top - r.height - gap
  x = Math.min(Math.max(margin, x), Math.max(margin, innerWidth - r.width - margin))
  y = Math.min(Math.max(margin, y), Math.max(margin, innerHeight - r.height - margin))
  el.style.left = `${Math.round(x)}px`
  el.style.top = `${Math.round(y)}px`
  el.style.setProperty('--menu-origin', `${wantsTop ? 'bottom' : 'top'} ${wantsEnd ? 'right' : 'left'}`)
}

function bindMenu(trigger, menu, opts = {}) {
  const reposition = () => anchorTo(menu, trigger, opts)
  menu.addEventListener('toggle', (e) => {
    const open = e.newState === 'open'
    trigger.setAttribute('aria-expanded', String(open))
    if (!open) {
      removeEventListener('scroll', reposition, { capture: true })
      return
    }
    reposition()
    addEventListener('scroll', reposition, { passive: true, capture: true })
    addEventListener('resize', reposition, { passive: true })
  })
  menu.addEventListener('click', (e) => {
    const item = e.target.closest?.('.menu__item')
    if (item && item.getAttribute('aria-disabled') !== 'true') menu.hidePopover()
  })
}

bindMenu($('#menubtn'), $('#menu1'), { placement: 'bottom-end' })
bindMenu($('#splitmore'), $('#menu2'), { placement: 'bottom-end' })
bindMenu($('#popbtn'), $('#pop1'))
bindMenu($('#comboinput'), $('#combo1'), { matchWidth: true })

/* コンテキストメニュー。右クリックと長押しの両方 */
const ctxArea = $('#ctxarea')
const ctxMenu = $('#menu3')
function positionAt(el, x, y) {
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  const r = el.getBoundingClientRect()
  el.style.left = `${Math.round(Math.min(x, innerWidth - r.width - 8))}px`
  el.style.top = `${Math.round(Math.min(y, innerHeight - r.height - 8))}px`
}
ctxArea.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ctxMenu.showPopover()
  positionAt(ctxMenu, e.clientX, e.clientY)
})
let holdTimer, hx, hy
ctxArea.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return
  ;[hx, hy] = [e.clientX, e.clientY]
  holdTimer = setTimeout(() => {
    ctxMenu.showPopover()
    positionAt(ctxMenu, hx, hy)
    navigator.vibrate?.(12)
  }, 500)
})
ctxArea.addEventListener('pointermove', (e) => {
  if (holdTimer && Math.hypot(e.clientX - hx, e.clientY - hy) > 8) clearTimeout(holdTimer)
})
for (const t of ['pointerup', 'pointercancel'])
  ctxArea.addEventListener(t, () => clearTimeout(holdTimer))

/* ツールチップ。★触る画面には出さない★ */
if (!matchMedia('(pointer: coarse)').matches) {
  const tipBtn = $('#tipbtn')
  const tip = $('#tip1')
  let tipTimer
  const showTip = () => {
    tipTimer = setTimeout(() => {
      tip.showPopover()
      anchorTo(tip, tipBtn, { placement: 'top', gap: 8 })
    }, 400)
  }
  const hideTip = () => {
    clearTimeout(tipTimer)
    tip.hidePopover()
  }
  tipBtn.addEventListener('pointerenter', showTip)
  tipBtn.addEventListener('pointerleave', hideTip)
  tipBtn.addEventListener('focus', showTip)
  tipBtn.addEventListener('blur', hideTip)
} else {
  $('#tipnote').textContent = '（触る画面なので、ツールチップは出しません）'
}

/* コンボボックス。打った文字で絞り、↑↓ で辿る */
const CITIES = ['東京', '大阪', '名古屋', '札幌', '福岡', '仙台', '広島', '那覇']
const comboInput = $('#comboinput')
const comboList = $('#combo1')
function paintCombo() {
  const q = comboInput.value.trim()
  const hits = CITIES.filter((c) => !q || c.includes(q))
  comboList.innerHTML = hits.length
    ? hits
        .map(
          (c, i) =>
            `<button class="menu__item" aria-selected="${i === 0}">${
              q ? c.replace(q, `<b class="combo__hit">${q}</b>`) : c
            }</button>`,
        )
        .join('')
    : '<div class="menu__label">見つかりません</div>'
}
/* ★popovertarget は <button> 系にしか効かない★ 文字入力では
   自分で showPopover() を呼ぶ */
comboInput.addEventListener('focus', () => {
  if (!comboList.matches(':popover-open')) comboList.showPopover()
  anchorTo(comboList, comboInput, { matchWidth: true })
})
comboInput.addEventListener('input', () => {
  paintCombo()
  if (!comboList.matches(':popover-open')) comboList.showPopover()
  anchorTo(comboList, comboInput, { matchWidth: true })
})
comboInput.addEventListener('keydown', (e) => {
  const items = $$('.menu__item', comboList)
  if (!items.length) return
  const i = items.findIndex((el) => el.getAttribute('aria-selected') === 'true')
  const move = (n) => {
    items.forEach((el, j) => el.setAttribute('aria-selected', String(j === n)))
    items[n].scrollIntoView({ block: 'nearest' })
  }
  if (e.key === 'ArrowDown') (e.preventDefault(), move((i + 1) % items.length))
  else if (e.key === 'ArrowUp') (e.preventDefault(), move((i - 1 + items.length) % items.length))
  else if (e.key === 'Enter' && i >= 0) {
    e.preventDefault()
    comboInput.value = items[i].textContent
    comboList.hidePopover()
  }
})
paintCombo()

/* コマンドパレット。⌘K / Ctrl+K */
const cmd = $('#command')
const cmdInput = $('#cmdinput')
addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openCommand()
  }
})
$('#cmdbtn').onclick = openCommand
function openCommand() {
  const close = overlay(() => {
    cmd.hidden = false
    cmdInput.value = ''
    cmdInput.focus()
    cmd.animate([{ opacity: 0, transform: 'translateX(-50%) scale(0.96)' }, {}], {
      duration: 350,
      easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)',
    })
    return cmd
  }, () => (cmd.hidden = true))
  const items = $$('.command__item', cmd)
  cmdInput.onkeydown = (e) => {
    const i = items.findIndex((el) => el.getAttribute('aria-selected') === 'true')
    const move = (n) => items.forEach((el, j) => el.setAttribute('aria-selected', String(j === n)))
    if (e.key === 'ArrowDown') (e.preventDefault(), move((i + 1) % items.length))
    else if (e.key === 'ArrowUp') (e.preventDefault(), move((i - 1 + items.length) % items.length))
    else if (e.key === 'Enter') {
      e.preventDefault()
      toast(`「${items[Math.max(i, 0)].dataset.label}」を実行しました`)
      close()
    } else if (e.key === 'Escape') close()
  }
  for (const it of items) it.onclick = () => (toast(`「${it.dataset.label}」を実行しました`), close())
}

/* ---------------------------------------------------------- 覆いを掛けて出すもの */
function overlay(build, cleanup) {
  const scrim = document.createElement('div')
  scrim.className = 'scrim'
  const el = build()
  const close = () => {
    scrim.remove()
    cleanup ? cleanup() : el.remove()
  }
  scrim.onclick = close
  document.body.append(scrim)
  if (!el.isConnected) document.body.append(el)
  return close
}

$('#sheetbtn').onclick = () => {
  const close = overlay(() => {
    const el = document.createElement('div')
    el.className = 'sheet'
    el.innerHTML = `
      <div class="sheet__grab">
        <div class="sheet__handle"></div>
        <h2 class="sheet__title">並べ替え</h2>
      </div>
      <div class="sheet__body">
        <label class="check"><input type="radio" name="s" class="radio" checked />新しい順</label>
        <label class="check"><input type="radio" name="s" class="radio" />古い順</label>
        <label class="check"><input type="radio" name="s" class="radio" />名前順</label>
        <button class="btn btn--filled btn--full">決定</button>
      </div>`
    el.querySelector('.btn').onclick = () => close()
    el.animate([{ transform: 'translateY(100%)' }, {}], {
      duration: 500,
      easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
    })
    return el
  })
}

$('#sidebtn').onclick = () => {
  const close = overlay(() => {
    const el = document.createElement('aside')
    el.className = 'sidesheet'
    el.innerHTML = `
      <div class="sidesheet__head">
        <h2 class="sidesheet__title">絞り込み</h2>
        <button class="iconbtn" aria-label="閉じる"><svg class="icon"><use href="#i-close"/></svg></button>
      </div>
      <div class="sidesheet__body">
        <div class="section">
          <h3 class="label">費目</h3>
          <label class="check"><input type="checkbox" class="checkbox" checked />食費</label>
          <label class="check"><input type="checkbox" class="checkbox" />日用品</label>
          <label class="check"><input type="checkbox" class="checkbox" />交通</label>
        </div>
        <button class="btn btn--filled btn--full">適用する</button>
      </div>`
    for (const b of el.querySelectorAll('.iconbtn, .btn')) b.onclick = () => close()
    el.animate([{ transform: 'translateX(100%)' }, {}], {
      duration: 500,
      easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
    })
    return el
  })
}

$('#drawerbtn').onclick = () => {
  const close = overlay(() => {
    const el = document.createElement('aside')
    el.className = 'drawer drawer--modal'
    el.innerHTML = `
      <h2 class="drawer__head">見本帳</h2>
      <button class="drawer__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg>基礎</button>
      <button class="drawer__item"><svg class="icon"><use href="#i-layers"/></svg>部品<span class="drawer__n">28</span></button>
      <div class="drawer__label">そのほか</div>
      <button class="drawer__item"><svg class="icon"><use href="#i-gear"/></svg>設定</button>`
    for (const b of el.querySelectorAll('.drawer__item')) b.onclick = () => close()
    el.animate([{ transform: 'translateX(-100%)' }, {}], {
      duration: 500,
      easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
    })
    return el
  })
}

$('#dialogbtn').onclick = () => {
  const close = overlay(() => {
    const el = document.createElement('div')
    el.className = 'dialog dialog--alert'
    el.innerHTML = `
      <svg class="dialog__icon"><use href="#i-trash"/></svg>
      <h2 class="dialog__title">4件を完全に削除しますか</h2>
      <p class="muted">この操作は元に戻せません。ゴミ箱にも残りません。</p>
      <div class="dialog__acts">
        <button class="btn btn--text" data-x>やめる</button>
        <button class="btn btn--danger" data-x>削除する</button>
      </div>`
    for (const b of el.querySelectorAll('[data-x]')) b.onclick = () => close()
    el.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.92)' }, {}], {
      duration: 350,
      easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)',
    })
    return el
  })
}

$('#searchbtn').onclick = () => {
  const view = $('#searchview')
  view.hidden = false
  $('.searchview__input', view).focus()
  view.animate([{ opacity: 0, transform: 'scale(0.98)' }, {}], {
    duration: 350,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  })
  $('#searchclose').onclick = () => (view.hidden = true)
}

$('#toolbarbtn').onclick = () => {
  const old = $('.toolbar')
  if (old) return old.remove()
  const el = document.createElement('div')
  el.className = 'toolbar'
  el.innerHTML = `
    <span class="mono">3件</span>
    <div class="grow"></div>
    <button class="iconbtn"><svg class="icon"><use href="#i-star"/></svg></button>
    <button class="iconbtn"><svg class="icon"><use href="#i-trash"/></svg></button>
    <button class="btn btn--sm" data-x>やめる</button>`
  el.querySelector('[data-x]').onclick = () => el.remove()
  document.body.appendChild(el)
  el.animate([{ transform: 'translateY(24px)', opacity: 0 }, {}], {
    duration: 500,
    easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
  })
}

/* FAB メニュー */
const fabmenu = $('#fabmenu')
const fabBtn = $('#fabmenubtn')
fabBtn.onclick = () => {
  const open = fabBtn.getAttribute('aria-expanded') !== 'true'
  fabBtn.setAttribute('aria-expanded', String(open))
  for (const it of $$('.fabmenu__item', fabmenu)) {
    it.hidden = !open
    if (open)
      it.animate([{ opacity: 0, transform: 'translateY(12px)' }, {}], {
        duration: 400,
        easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
      })
  }
}

/* ---------------------------------------------------------- スナックバー */
const toasts = $('#toasts')
function toast(text, action) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.innerHTML = '<span class="toast__text"></span>'
  $('.toast__text', el).textContent = text
  if (action) {
    const b = document.createElement('button')
    b.className = 'toast__action'
    b.textContent = action
    b.onclick = () => el.remove()
    el.appendChild(b)
  }
  toasts.appendChild(el)
  el.animate([{ transform: 'translateY(-12px)', opacity: 0 }, {}], {
    duration: 300,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  })
  setTimeout(() => el.remove(), 4000)
}
$('#toastbtn').onclick = () => toast('1件を削除しました', '元に戻す')

/* ---------------------------------------------------------- 左スワイプで削除 */
const swipe = $('#swipe')
const content = $('.swiperow__content', swipe)
let x0 = null
swipe.addEventListener('pointerdown', (e) => {
  x0 = e.clientX
  content.style.willChange = 'transform'
})
swipe.addEventListener('pointermove', (e) => {
  if (x0 === null) return
  const dx = Math.min(0, e.clientX - x0)
  content.style.transform = `translateX(${dx}px)`
  swipe.classList.toggle('swiperow--armed', -dx > swipe.offsetWidth * 0.4)
})
const endSwipe = () => {
  if (x0 === null) return
  x0 = null
  content.style.willChange = ''
  const armed = swipe.classList.contains('swiperow--armed')
  content.animate([{}, { transform: 'translateX(0)' }], {
    duration: 500,
    easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
  })
  content.style.transform = ''
  swipe.classList.remove('swiperow--armed')
  if (armed) toast('1件を削除しました', '元に戻す')
}
swipe.addEventListener('pointerup', endSwipe)
swipe.addEventListener('pointercancel', endSwipe)

/* ---------------------------------------------------------- 表の並べ替え */
const table = $('#table')
/* ★aria-sort は <th> が持つ★ 中のボタンではなく親を書き換える */
for (const btn of $$('.table__sort', table)) {
  const th = btn.closest('th')
  btn.onclick = () => {
    const now = th.getAttribute('aria-sort')
    for (const o of $$('th[aria-sort]', table)) o.removeAttribute('aria-sort')
    th.setAttribute('aria-sort', now === 'ascending' ? 'descending' : 'ascending')
  }
}
for (const tr of $$('#table tbody tr')) {
  tr.onclick = () => tr.setAttribute('aria-selected', tr.getAttribute('aria-selected') !== 'true')
}

/* ---------------------------------------------------------- カルーセルの位置の印 */
const carousel = $('#carousel')
const dots = $('#dots')
carousel.addEventListener(
  'scroll',
  () => {
    const i = Math.round(carousel.scrollLeft / (carousel.scrollWidth / dots.children.length))
    for (const [j, d] of [...dots.children].entries())
      d.setAttribute('aria-current', String(j === i))
  },
  { passive: true },
)
