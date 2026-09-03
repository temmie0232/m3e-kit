/* ============================================================
   ドラッグで並べ替える

   ★HTML5 の drag & drop は使わない★
     - 触る画面で動かない（Android/iOS の Safari で dragstart が出ない）
     - ゴースト画像の見た目を制御できず、そこだけ OS の顔になる
   pointer イベントで自前に拾い、指の移動量に 1:1 で追従させる
   （docs/12-gestures.md の原則）。

   考え方:
     1. 掴んだ行を浮かせる（.is-dragging、elevation 3）
     2. 指の量だけ translateY。**掴んだ行だけ** transform を書く
     3. 他の行は「入れ替わる先」を空けるためにバネで滑る
     4. 離したら、置き場所へバネで収める → onSort を呼ぶ

   ★行の高さが揃っている前提★ 揃っていない一覧では、入れ替え先の
   計算に各行の実測が要る（そこまで要るなら、それは表かもしれない）。
   ============================================================ */

import { spring, haptic, prefersReducedMotion } from './motion'

export type SortableOpts = {
  /** 並べ替える行のセレクタ */
  item: string
  /** 掴む場所。省略すると行のどこでも掴める（長押しが要る） */
  handle?: string
  /** 掴めるようになるまでの長押し（handle があるときは 0） */
  holdMs?: number
  /** 離したとき。from → to へ動かす */
  onSort: (from: number, to: number) => void
}

export function sortable(list: HTMLElement, opts: SortableOpts) {
  const { item, handle, holdMs = handle ? 0 : 400, onSort } = opts

  let rows: HTMLElement[] = []
  let dragging: HTMLElement | null = null
  let fromIndex = 0
  let toIndex = 0
  let startY = 0
  let rowH = 0
  let holdTimer: number | undefined

  const reset = () => {
    for (const r of rows) {
      r.style.transform = ''
      r.style.transition = ''
      r.classList.remove('is-dragging')
      r.style.zIndex = ''
      r.style.willChange = ''
    }
    dragging = null
  }

  /** 掴んでいる行以外を、空ける向きへ滑らせる */
  const paint = () => {
    const { easing, duration } = spring('spatial')
    rows.forEach((r, i) => {
      if (r === dragging) return
      let shift = 0
      if (fromIndex < toIndex && i > fromIndex && i <= toIndex) shift = -rowH
      else if (fromIndex > toIndex && i < fromIndex && i >= toIndex) shift = rowH
      r.style.transition = prefersReducedMotion() ? 'transform 150ms ease-out' : `transform ${duration}ms ${easing}`
      r.style.transform = shift ? `translateY(${shift}px)` : ''
    })
  }

  list.addEventListener(
    'pointerdown',
    (e) => {
      const row = (e.target as Element | null)?.closest?.(item) as HTMLElement | null
      if (!row) return
      if (handle && !(e.target as Element).closest(handle)) return

      const begin = () => {
        rows = [...list.querySelectorAll<HTMLElement>(item)]
        fromIndex = toIndex = rows.indexOf(row)
        rowH = row.offsetHeight
        startY = e.clientY
        dragging = row
        row.classList.add('is-dragging')
        row.style.zIndex = '1'
        /* ★掴んでいる間だけ★ 常設すると一覧の全行が合成レイヤになる */
        row.style.willChange = 'transform'
        row.setPointerCapture?.(e.pointerId)
        haptic('medium')
      }

      if (holdMs > 0) {
        holdTimer = window.setTimeout(begin, holdMs)
      } else {
        begin()
      }
    },
    { passive: true },
  )

  list.addEventListener(
    'pointermove',
    (e) => {
      /* 掴む前に指が動いたら、それはスクロール。長押しを取り消す */
      if (!dragging) {
        if (holdTimer) {
          clearTimeout(holdTimer)
          holdTimer = undefined
        }
        return
      }
      e.preventDefault()
      const dy = e.clientY - startY
      dragging.style.transform = `translateY(${dy}px)`

      const next = Math.min(
        rows.length - 1,
        Math.max(0, fromIndex + Math.round(dy / rowH)),
      )
      if (next !== toIndex) {
        toIndex = next
        paint()
        haptic('selection')
      }
    },
    { passive: false },
  )

  const end = () => {
    clearTimeout(holdTimer)
    holdTimer = undefined
    if (!dragging) return

    const settleTo = (toIndex - fromIndex) * rowH
    const { easing, duration } = spring('spatial')
    const el = dragging
    const anim = el.animate(
      [{ transform: el.style.transform }, { transform: `translateY(${settleTo}px)` }],
      { duration, easing, fill: 'forwards' },
    )
    anim.finished
      .catch(() => {})
      .then(() => {
        anim.cancel()
        const [f, t] = [fromIndex, toIndex]
        reset()
        if (f !== t) onSort(f, t)
      })
    haptic('light')
    dragging = null
  }

  for (const t of ['pointerup', 'pointercancel'] as const) {
    list.addEventListener(t, end, { passive: true })
  }

  return { destroy: () => reset() }
}
