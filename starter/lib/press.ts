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

/** `:open`（開いているプルダウン）を書けるか。書けない環境では <select> の
 *  一覧は OS 描画のモーダルなので、下の細工そのものが要らない */
const canMatchOpen = typeof CSS !== 'undefined' && (CSS.supports?.('selector(:open)') ?? false)

export function watchPress(root: Document | HTMLElement = document) {
  /* ★開いているプルダウンは、本体をもう一度押したら閉じる★
   *
   * `appearance: base-select` を当てた <select>（components-core.css）は、
   * **指では何度押しても閉じない**。マウスでは閉じるので気づきにくい。
   * 一覧はポップオーバーなので指が触れた時点で light-dismiss が閉じるのだが、
   * 同じ操作の既定の動作が直後に開き直してしまう。
   * 既定だけ止めれば light-dismiss が残って、開く→閉じる→開くになる。
   *
   * 実測（chromium 151・指の tap を3回）:
   *   何もしない        → 開く / 開く / 開く
   *   ここで既定を止める → 開く / 閉じる / 開く
   *
   * ★blur() を足さないこと★ 閉じはするがフォーカスまで飛ぶ（キーボード操作が切れる）
   * ★このリスナだけ passive にしない★ passive では preventDefault が効かない */
  root.addEventListener('pointerdown', (e) => {
    const target = e.target as Element | null
    const sel = target?.closest?.('select')
    /* ★選択肢の上では止めないこと★ base-select では <option> も <select> の
       子のままなので、closest('select') だけで判定すると**選ぶ操作まで止まる**
       （タップしても値が変わらない。実際に踏んだ） */
    if (sel && canMatchOpen && sel.matches(':open') && !target?.closest?.('option, optgroup')) {
      e.preventDefault()
    }
  })

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
