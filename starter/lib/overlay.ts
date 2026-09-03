/* ============================================================
   重ねるものの位置決めとキーボード操作

   ★出し入れ自体は Popover API に任せる★
   `popover` 属性が付いた要素は、外側を押して閉じる・Esc で閉じる・
   最前面に出す（top layer）をブラウザがやってくれる。
   自前の「外側クリック検出」は書かない — 必ずスクロール中や
   iframe の中で漏れる。

   ここでやるのは2つだけ:
     1. 開いた後の位置決め（CSS anchor positioning が全ブラウザに
        入るまでの繋ぎ）
     2. ↑↓ で候補を辿るキーボード操作（aria-selected を動かす）

   ★top layer に出た要素は transform の影響を受けない★ ので、
   親に transform が載っていても位置がズレない。fixed 座標で計算してよい。
   ============================================================ */

export type Placement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'top'

type AnchorOpts = {
  placement?: Placement
  /** 起点との隙間 */
  gap?: number
  /** 画面端との最小の余白 */
  margin?: number
  /** 起点と同じ幅にする（コンボボックスの候補） */
  matchWidth?: boolean
}

/** 開いている popover を、起点の要素に合わせて置く */
export function anchorTo(el: HTMLElement, anchor: Element, opts: AnchorOpts = {}) {
  const { placement = 'bottom-start', gap = 4, margin = 8, matchWidth = false } = opts
  const a = anchor.getBoundingClientRect()

  if (matchWidth) el.style.setProperty('--combo-w', `${a.width}px`)

  // 幅・高さを測るために一度置く（popover は既に表示されている前提）
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  const r = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const wantsTop = placement.startsWith('top')
  const wantsEnd = placement.endsWith('end')

  let x = wantsEnd ? a.right - r.width : a.left
  if (placement === 'bottom' || placement === 'top') x = a.left + (a.width - r.width) / 2

  let y = wantsTop ? a.top - r.height - gap : a.bottom + gap

  /* 入りきらないなら反対側へ返す。★縮めずに返す★
     高さを削ると、中身が2行になって却って読めなくなる */
  if (!wantsTop && y + r.height > vh - margin && a.top - r.height - gap > margin) {
    y = a.top - r.height - gap
  } else if (wantsTop && y < margin && a.bottom + gap + r.height < vh - margin) {
    y = a.bottom + gap
  }

  // 画面内に押し込む
  x = Math.min(Math.max(margin, x), Math.max(margin, vw - r.width - margin))
  y = Math.min(Math.max(margin, y), Math.max(margin, vh - r.height - margin))

  el.style.left = `${Math.round(x)}px`
  el.style.top = `${Math.round(y)}px`
  // 開くときの伸びを、起点のある側から始める
  el.style.setProperty('--menu-origin', `${wantsTop ? 'bottom' : 'top'} ${wantsEnd ? 'right' : 'left'}`)
}

/** 指定した座標に置く（コンテキストメニュー） */
export function positionAt(el: HTMLElement, x: number, y: number, margin = 8) {
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  const r = el.getBoundingClientRect()
  el.style.left = `${Math.round(Math.min(x, window.innerWidth - r.width - margin))}px`
  el.style.top = `${Math.round(Math.min(y, window.innerHeight - r.height - margin))}px`
  el.style.setProperty('--menu-origin', 'top left')
}

/* ---------------------------------------------------------- メニューを繋ぐ

   <button popovertarget="m1">…</button>
   <div popover id="m1" class="menu">…</div>

   HTML 側で popovertarget を書けば開閉は動く。ここでは
   「開いたら位置を合わせ、開いている間だけ追従させる」を足す。 */
export function bindMenu(trigger: HTMLElement, menu: HTMLElement, opts: AnchorOpts = {}) {
  const reposition = () => anchorTo(menu, trigger, opts)

  menu.addEventListener('toggle', (e) => {
    const open = (e as ToggleEvent).newState === 'open'
    trigger.setAttribute('aria-expanded', String(open))
    if (!open) return
    reposition()
    /* ★スクロールとリサイズに追従させる★ これが無いと、開いたまま
       スクロールしたときにメニューだけが画面に残って起点から離れる。
       capture: true にするのは、内側のスクローラも拾うため */
    window.addEventListener('scroll', reposition, { passive: true, capture: true })
    window.addEventListener('resize', reposition, { passive: true })
  })

  menu.addEventListener('beforetoggle', (e) => {
    if ((e as ToggleEvent).newState === 'closed') {
      window.removeEventListener('scroll', reposition, { capture: true })
      window.removeEventListener('resize', reposition)
    }
  })

  /* 項目を押したら閉じる。メニューは「選んで終わり」のもの */
  menu.addEventListener('click', (e) => {
    const item = (e.target as Element | null)?.closest?.('.menu__item')
    if (item && item.getAttribute('aria-disabled') !== 'true') menu.hidePopover()
  })

  return { reposition }
}

/* ---------------------------------------------------------- コンテキストメニュー */
export function bindContextMenu(area: HTMLElement, menu: HTMLElement) {
  area.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.showPopover()
    positionAt(menu, e.clientX, e.clientY)
  })

  /* 触る画面には右クリックが無い。長押しで開く（500ms、指が動いたら取り消し） */
  let timer: number | undefined
  let sx = 0
  let sy = 0
  area.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType === 'mouse') return
      sx = e.clientX
      sy = e.clientY
      timer = window.setTimeout(() => {
        menu.showPopover()
        positionAt(menu, sx, sy)
        navigator.vibrate?.(12) // medium 相当。開いたことを指に返す
      }, 500)
    },
    { passive: true },
  )
  const cancel = (e: PointerEvent) => {
    if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
      clearTimeout(timer)
      timer = undefined
    }
  }
  area.addEventListener('pointermove', cancel, { passive: true })
  for (const t of ['pointerup', 'pointercancel'] as const) {
    area.addEventListener(t, () => clearTimeout(timer), { passive: true })
  }
}

/* ---------------------------------------------------------- ↑↓ で辿る

   コンボボックス・コマンドパレット・メニュー共通。
   ★hover ではなく aria-selected で「いま辿っている場所」を示す★
   キーボードで下に動かしたときに、マウスの位置に引きずられないため。 */
export function keyboardList(
  input: HTMLElement,
  list: HTMLElement,
  itemSelector: string,
  onPick: (el: HTMLElement) => void,
) {
  const items = () => [...list.querySelectorAll<HTMLElement>(itemSelector)]

  const select = (next: HTMLElement | undefined) => {
    for (const el of items()) el.setAttribute('aria-selected', String(el === next))
    next?.scrollIntoView({ block: 'nearest' })
  }

  input.addEventListener('keydown', (e) => {
    const all = items()
    if (!all.length) return
    const i = all.findIndex((el) => el.getAttribute('aria-selected') === 'true')

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      select(all[(i + 1) % all.length])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      select(all[(i - 1 + all.length) % all.length])
    } else if (e.key === 'Home') {
      e.preventDefault()
      select(all[0])
    } else if (e.key === 'End') {
      e.preventDefault()
      select(all[all.length - 1])
    } else if (e.key === 'Enter' && i >= 0) {
      e.preventDefault()
      onPick(all[i])
    }
  })

  /* マウスを乗せたらそこへ移す。キーボードとマウスで印が2つ出ないように */
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const el = (e.target as Element | null)?.closest?.(itemSelector) as HTMLElement | null
    if (el) select(el)
  })

  return { select, first: () => select(items()[0]) }
}

/* ---------------------------------------------------------- ツールチップ

   ★触る画面には出さない★ 指には hover が無いので、タップで出すと
   「押した」のか「説明が出た」のか分からなくなる。 */
export function bindTooltip(trigger: HTMLElement, tip: HTMLElement, delay = 400) {
  if (window.matchMedia('(pointer: coarse)').matches) return

  let timer: number | undefined
  const show = () => {
    timer = window.setTimeout(() => {
      tip.showPopover()
      anchorTo(tip, trigger, { placement: 'top', gap: 8 })
    }, delay)
  }
  const hide = () => {
    clearTimeout(timer)
    tip.hidePopover()
  }

  trigger.addEventListener('pointerenter', show)
  trigger.addEventListener('pointerleave', hide)
  /* キーボードでも出す。マウスだけの情報にしない */
  trigger.addEventListener('focus', show)
  trigger.addEventListener('blur', hide)
}
