/* ============================================================
   引いて更新（pull to refresh）

   ★動かすのは印だけ。一覧は動かさない★
   一覧ごと下げると、指を離した瞬間に中身が跳ねて「どこを読んでいたか」が
   消える。印がトップアプリバーの下から降りてくるだけにする。

   ★しきい値までは 1:1 で追従する★ ラバーバンドは「限界を越えた分」に
   掛けるもので、最初から掛けるものではない（docs/12-gestures.md）。
   全体に掛けると、指を目一杯下げてもしきい値に届かない。

   引いている間は、読み込みの印の**形の再生位置を指で進める**
   （lib/loader.ts の setProgress）。だから「引くほど印が育つ」が
   時間ではなく指の量で決まる = docs/12-gestures.md の 1:1 の原則。

   ★touchmove だけ passive: false で止める★
   Pointer Events では preventDefault でスクロールを止められない
   （止めるのは touch-action）。かといって .main に touch-action: none を
   書くとスクロールごと死ぬ。だから「引いている最中の touchmove」だけを
   非 passive で止める。

   ★寸法は components-core.css と対★ .ptr .loader-chip の
   margin-top: -56px が「隠れている位置」。ここの HIDDEN と揃えること。
   ============================================================ */

import { attachLoader } from './loader'
import { haptic, prefersReducedMotion, rubber, springSettle } from './motion'

/** 印が隠れている量。★.ptr .loader-chip の margin-top と対★ */
const HIDDEN = 56
/** 更新中に印が留まる位置（バーの下 16px） */
const REST = 72
/** 引ける上限。これ以上は指を動かしても印が進まない */
const MAX = 112
/** しきい値を越えた先の抵抗の効き。画面の高さではなく「引ける残り」で決める */
const RUBBER_D = 240

export type PullToRefreshOpts = {
  /** 引ける状態か。既定は「一覧が最上部にある」 */
  canPull?: () => boolean
  /** 離せば更新する位置。既定 = 印が完全に出きる位置 */
  trigger?: number
}

/**
 * 一覧に「引いて更新」を付ける。
 *
 * @param scroller 縦にスクロールする要素（ふつう `.main`）
 * @param ptr      `.ptr`。中に `.loader-chip > .loader > .loader__shape`
 * @param onRefresh 更新の中身。Promise を返すと、解決するまで印が回り続ける
 * @returns 取り外す関数
 */
export function attachPullToRefresh(
  scroller: HTMLElement,
  ptr: HTMLElement,
  onRefresh: () => unknown,
  opts: PullToRefreshOpts = {},
): () => void {
  const chip = ptr.querySelector<HTMLElement>('.loader-chip')
  const svg = ptr.querySelector<SVGElement>('.loader')
  const shape = ptr.querySelector<SVGPathElement>('.loader__shape')
  /* 器が無いなら何もしない。★例外を投げない★ 一覧そのものは動くべき */
  if (!chip || !svg || !shape) return () => {}

  const trigger = opts.trigger ?? REST
  const canPull = opts.canPull ?? (() => scroller.scrollTop <= 0)
  const loader = attachLoader(shape)

  let startY = 0
  let travel = 0
  let pulling = false
  let armed = false
  let busy = false

  const paint = (y: number) => {
    chip.style.transform = `translateY(${y.toFixed(1)}px)`
    chip.style.opacity = String(Math.min(1, y / HIDDEN))
  }
  /* インラインを消して CSS の既定（隠れている位置）に戻す */
  const clear = () => {
    chip.style.transform = ''
    chip.style.opacity = ''
    chip.style.transition = ''
  }

  const settle = (from: number, to: number, opacity: string) =>
    springSettle(
      chip,
      { transform: `translateY(${from}px)`, opacity: String(Math.min(1, from / HIDDEN)) },
      { transform: `translateY(${to}px)`, opacity },
      'spatial',
      { distance: Math.abs(to - from) },
    ).finished

  const down = (e: PointerEvent) => {
    if (busy || pulling || e.button !== 0 || !canPull()) return
    startY = e.clientY
    travel = 0
    armed = false
    pulling = true
  }

  const move = (e: PointerEvent) => {
    if (!pulling) return
    const dy = e.clientY - startY
    /* 上へ動いた = これはスクロール。手を引いて、ブラウザに返す */
    if (dy <= 0) {
      if (travel > 0) {
        paint(0)
        clear()
      }
      travel = 0
      pulling = false
      return
    }
    /* ★しきい値までは 1:1★ 抵抗を掛けるのは「越えた先」だけ。
       全体に掛けると、指を目一杯下げてもしきい値に届かない（実測で踏んだ）*/
    travel = dy <= trigger ? dy : trigger + rubber(dy - trigger, RUBBER_D)
    travel = Math.min(MAX, travel)
    paint(travel)
    loader.setProgress(travel / trigger)
    const next = travel >= trigger
    if (next !== armed) {
      armed = next
      /* ★しきい値に到達した瞬間だけ鳴らす★ 引いている間は鳴らさない */
      if (armed) haptic('light')
    }
  }

  const up = () => {
    if (!pulling) return
    pulling = false
    const from = travel
    travel = 0
    if (!armed) {
      /* 届かなかった。仕舞って終わり */
      if (from > 0) void settle(from, 0, '0').then(clear, clear)
      return
    }
    armed = false
    busy = true
    haptic('medium')
    svg.classList.add('loader--on')
    loader.play()
    void settle(from, REST, '1')

    const done = () => {
      svg.classList.remove('loader--on')
      loader.stop()
      busy = false
      void settle(REST, 0, '0').then(clear, clear)
    }
    /* 同期で返しても Promise を返しても同じ道を通す */
    Promise.resolve(onRefresh()).then(done, done)
  }

  /* ★引いている最中だけ、ブラウザのスクロールを止める★
     常に止めると一覧がスクロールできなくなる */
  const block = (e: TouchEvent) => {
    if (pulling && travel > 0 && e.cancelable) e.preventDefault()
  }

  scroller.addEventListener('pointerdown', down, { passive: true })
  scroller.addEventListener('pointermove', move, { passive: true })
  scroller.addEventListener('touchmove', block, { passive: false })
  for (const t of ['pointerup', 'pointercancel', 'pointerleave'] as const)
    scroller.addEventListener(t, up, { passive: true })

  /* 視差低減では形を変えない。回転も CSS 側（.loader--on）で止まる。
     引く量に印が付いてくるところだけは残す（位置は情報なので消せない） */
  if (prefersReducedMotion()) loader.setProgress(0)

  return () => {
    scroller.removeEventListener('pointerdown', down)
    scroller.removeEventListener('pointermove', move)
    scroller.removeEventListener('touchmove', block)
    for (const t of ['pointerup', 'pointercancel', 'pointerleave'] as const)
      scroller.removeEventListener(t, up)
    loader.cancel()
    clear()
  }
}
