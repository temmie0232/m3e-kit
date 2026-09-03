/* ============================================================
   読み込みの印 — Material 3 Expressive の loading indicator

   M3 Expressive の loading indicator は「7つの多角形の間を形が滑らかに
   変わりながら回る」もの（Compose の LoadingIndicator。soft burst →
   9-sided cookie → 五角形 → pill → sunny → 4-sided cookie → 楕円）。
   Web には公式実装が無いので、ここで形を極座標関数から起こし、
   同じ本数の 3 次ベジェ（Catmull-Rom を変換）で描いて、
   WAAPI で path の `d` を補間する。同じコマンド列なら d は補間できる。

   ★JS で毎フレーム描かない★ animate() に渡せば合成スレッド…ではないが
   （d の補間はメインスレッド）、少なくとも React の再レンダとは無縁で、
   rAF ループも要らない。引いて更新では「引いた量」で再生位置を進めるので、
   指の動きに形がついてくる。
   ============================================================ */

import { prefersReducedMotion } from './motion'

/** 形の数と、1つの形から次へ移るのに掛ける時間 */
const STEP_MS = 650
/** 1周に打つ点の数。全部の形で同じ数にすること（d の補間条件） */
const N = 48
/** 基準の半径（viewBox 0 0 100 100 の中） */
const R = 33

type Polar = (theta: number) => number

/* 極座標 r(θ)。R を 1 とした倍率で返す */
const SHAPES: Polar[] = [
  (t) => 1 + 0.16 * Math.cos(10 * t), // soft burst
  (t) => 1 + 0.09 * Math.cos(9 * t), // 9-sided cookie
  (t) => 1 + 0.1 * Math.cos(5 * t), // 五角形
  (t) => ellipse(1.22, 0.7, t), // pill
  (t) => 1 + 0.18 * Math.cos(8 * t), // sunny
  (t) => 1 + 0.14 * Math.cos(4 * t), // 4-sided cookie
  (t) => ellipse(1.1, 0.86, t - Math.PI / 4), // 楕円（45°）
]

function ellipse(a: number, b: number, t: number): number {
  const c = b * Math.cos(t)
  const s = a * Math.sin(t)
  return (a * b) / Math.sqrt(c * c + s * s)
}

/** 極座標関数を、N 本の 3 次ベジェで閉じた path 文字列にする */
function toPath(r: Polar): string {
  const pts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const rr = R * r(t)
    pts.push([50 + rr * Math.cos(t), 50 + rr * Math.sin(t)])
  }
  const at = (i: number) => pts[((i % N) + N) % N]
  const f = (v: number) => v.toFixed(2)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < N; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    // Catmull-Rom → Bezier
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}

let cache: string[] | null = null

/** 7 つの形の path。一度作ったら使い回す */
export function loaderPaths(): string[] {
  if (!cache) cache = SHAPES.map(toPath)
  return cache
}

/** `d` を CSS プロパティとして補間できるか（Chromium / Firefox）。
    できない環境（古い Safari）は最初の形で止めて、回転だけで生きていることを示す */
let dOk: boolean | null = null
function supportsD(): boolean {
  if (dOk === null) {
    try {
      dOk = CSS.supports('d', 'path("M0 0L1 1Z")')
    } catch {
      dOk = false
    }
  }
  return dOk
}

export type Loader = {
  /** 引いた量（0〜1）で形を進める。止まっている間だけ効く */
  setProgress(p: number): void
  /** 回し始める（形の変化を再生する） */
  play(): void
  /** 止めて最初の形に戻す */
  stop(): void
  /** 後始末 */
  cancel(): void
}

/** path 要素に形の変化を取り付ける。呼び出し側は回転を CSS（.loader--on）で掛ける */
export function attachLoader(path: SVGPathElement): Loader {
  const paths = loaderPaths()
  path.setAttribute('d', paths[0])

  let anim: Animation | null = null
  if (supportsD() && typeof path.animate === 'function') {
    const frames: Keyframe[] = [...paths, paths[0]].map((d, i) => ({
      d: `path("${d}")`,
      offset: i / paths.length,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }))
    try {
      anim = path.animate(frames, { duration: STEP_MS * paths.length, iterations: Infinity })
      anim.pause()
    } catch {
      anim = null
    }
  }

  return {
    setProgress(p) {
      if (!anim || anim.playState === 'running') return
      // 引き切るまでに形が 2 つ進む。指の量に形がついてくる
      anim.currentTime = Math.max(0, Math.min(1, p)) * STEP_MS * 2
    },
    play() {
      // 視差低減では形を変えない（回転も CSS の .loader--on 側で止まる）
      if (prefersReducedMotion()) return
      anim?.play()
    },
    stop() {
      if (!anim) return
      anim.pause()
      anim.currentTime = 0
    },
    cancel() {
      try {
        anim?.cancel()
      } catch {
        /* 既に終わっていれば何もしなくてよい */
      }
      anim = null
    },
  }
}
