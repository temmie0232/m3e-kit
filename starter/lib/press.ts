/* ============================================================
   押下の即時反応

   :active だけに頼らない。Chromium はタッチ由来の :active を
   GestureShowPress（体感150ms前後）まで待ってから当てる。つまり素の CSS
   だけだと「押した瞬間に何も起きない」時間が生まれ、そこで安っぽくなる。

   pointerdown で .is-pressed を即座に付け、pointerup / pointercancel /
   スクロール開始で外す。document に1つ付けるだけで全部品に効く（委譲）。
   ============================================================ */

/** .is-pressed を付ける対象。ここに無いクラスは押下の反応を持たない */
const PRESSABLE =
  '.btn, .iconbtn, .fab, .chip, .row--link, .seg__btn, .navbar__item, .toast__action, .switch'

let current: Element | null = null

function release() {
  if (current) {
    current.classList.remove('is-pressed')
    current = null
  }
}

export function watchPress(root: Document | HTMLElement = document) {
  root.addEventListener(
    'pointerdown',
    (e) => {
      const t = (e.target as Element | null)?.closest?.(PRESSABLE)
      if (!t || (t as HTMLButtonElement).disabled) return
      release()
      current = t
      t.classList.add('is-pressed')
    },
    { passive: true },
  )

  /* ★pointercancel も拾うこと★ 指を置いたままスクロールを始めると
     pointerup は来ない。これが無いと押しっぱなしの見た目で固まる */
  for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'scroll'] as const) {
    root.addEventListener(type, release, { passive: true, capture: true })
  }
}
