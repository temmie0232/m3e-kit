/* ============================================================
   共有要素トランジション

   一覧 → 詳細を地続きに見せる、いちばん効くやつ（docs/07-motion.md）。
   サムネイルそのものが拡大して移動し、戻るときは元のタイルに**正確に着地**する。

   考え方:
     1. 開く前に、元の要素の矩形を取る
     2. body 直下にクローンを position: fixed で置き、元の矩形に重ねる
     3. transform と clip-path **だけ**を目標矩形へ動かす
     4. 着いたら本体を出してクローンを消す

   ★transform と clip-path しか動かさない★ width/height を動かすと
   毎フレーム レイアウトが走って、写真1枚で 60fps を割る。

   ★.app に transform / filter を載せない★ 載せた瞬間に position: fixed の
   containing block が .app になり、ここで書くビューポート座標と食い違って
   着地位置がズレる。
   ============================================================ */

import { prefersReducedMotion, spring } from './motion'

type Rect = { left: number; top: number; width: number; height: number }

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

/** 角丸を px で読む。飛んでいる間、拡大率で割って見た目を保つのに使う */
function radiusOf(el: Element): number {
  const v = getComputedStyle(el).borderTopLeftRadius
  return Number.parseFloat(v) || 0
}

export type FlightOpts = {
  /** 飛ばす画像の URL。省略すると from の中の <img> を探す */
  src?: string
  /** 目標に着いたあとの見せ方。contain = 全体が入る（ビューア） */
  fit?: 'cover' | 'contain'
  /** バネの名前。既定は spatial-slow（大きい面はゆっくり） */
  spring?: Parameters<typeof spring>[0]
}

/**
 * `from` の矩形から `to` の矩形へ、クローンを飛ばす。
 * 返る Promise は着地したときに解決する。
 *
 *   const done = fly(tileEl, viewerImgEl, { fit: 'contain' })
 *   await done            // 着いてから本体を出す
 */
export function fly(from: Element, to: Element, opts: FlightOpts = {}): Promise<void> {
  const a = rectOf(from)
  const b = rectOf(to)

  /* 視差低減では飛ばさない。150ms のクロスフェードに落とす
     （docs/07-motion.md「移動・拡大はクロスフェードに置換」） */
  if (prefersReducedMotion() || !a.width || !b.width) return Promise.resolve()

  const src = opts.src ?? (from.querySelector('img') as HTMLImageElement | null)?.currentSrc
  const clone = document.createElement('img')
  clone.className = 'flight'
  if (src) clone.src = src
  clone.style.left = '0px'
  clone.style.top = '0px'
  clone.style.width = `${a.width}px`
  clone.style.height = `${a.height}px`
  clone.style.objectFit = opts.fit ?? 'cover'

  const ra = radiusOf(from)
  const rb = radiusOf(to)
  const sx = b.width / a.width
  const sy = b.height / a.height

  /* ★角丸は拡大率で割る★ 割らないと、飛んでいる間だけ角が太る */
  const clip = (r: number, s: number) => `inset(0 round ${r / s}px)`

  const anim = clone.animate(
    [
      {
        transform: `translate(${a.left}px, ${a.top}px) scale(1, 1)`,
        clipPath: clip(ra, 1),
      },
      {
        transform: `translate(${b.left}px, ${b.top}px) scale(${sx}, ${sy})`,
        clipPath: clip(rb, Math.max(sx, sy)),
      },
    ],
    /* ★fill: 'forwards'★ 無いと、消す直前の1フレームだけクローンが
       出発点に戻って見える */
    { ...spring(opts.spring ?? 'spatial-slow'), fill: 'forwards' },
  )

  document.body.appendChild(clone)

  return anim.finished
    .catch(() => {
      /* 途中で cancel されただけ。着いたことにして先へ進む */
    })
    .then(() => {
      clone.remove()
    })
}

/**
 * 一覧 → 詳細 → 一覧 の往復をまとめた薄い包み。
 * `openTo` が返す要素へ飛び、戻るときは元のタイルへ着地する。
 *
 *   const back = await openWithFlight(tile, () => showViewer(i))
 *   // 閉じるとき
 *   await back()
 */
export async function openWithFlight(
  from: Element,
  openTo: () => Element | Promise<Element>,
  opts: FlightOpts = {},
): Promise<() => Promise<void>> {
  const to = await openTo()
  /* ★目標を一旦隠す★ クローンと本体が二重に見えるのを防ぐ */
  const el = to as HTMLElement
  el.style.visibility = 'hidden'
  await fly(from, to, opts)
  el.style.visibility = ''

  return async () => {
    el.style.visibility = 'hidden'
    await fly(to, from, { ...opts, fit: 'cover' })
    el.style.visibility = ''
  }
}
