/* ============================================================
   動きの基盤 — Material 3 Expressive motion scheme

   方針は3つ。
   1. 等速(linear)を使わない。等速はカクついて見える
   2. 指由来の動きは全部バネで戻す。時間指定の ease では
      「投げた強さ」が画面に伝わらない
   3. バネは CSS の `linear()` イージングとして焼き込む。
      こうすると Web Animations API に渡せて、合成スレッドで回る。
      JS で毎フレーム計算すると、Pi 経由の通信で JS が詰まったときに
      アニメーションまで一緒に固まる

   M3 Expressive の motion scheme は「時間+曲線」ではなく「バネ」で
   定義されている（Compose の MotionScheme.expressive() と同じ値）:
     spatial（位置・大きさ・形。行き過ぎてよい）
       fast 800/ζ0.6   default 380/ζ0.8   slow 200/ζ0.8
     effects（色・不透明度。行き過ぎない＝臨界減衰）
       fast 3800/ζ1    default 1600/ζ1    slow 800/ζ1
   旧名（snappy/standard/gentle）はこれらの別名として残してある。

   `linear()` の名前に反して、中身は不等間隔のバネ曲線。
   仕様書が禁じている「等速の linear」とは別物なので注意。
   ============================================================ */

export type SpringName =
  | 'spatial-fast'
  | 'spatial'
  | 'spatial-slow'
  | 'effects-fast'
  | 'effects'
  | 'effects-slow'
  | 'page'
  | 'snappy'
  | 'standard'
  | 'gentle'
  | 'bouncy'
  | 'pop'
  | 'glass'

type SpringDef = { stiffness: number; damping: number; mass: number }

/** 減衰比 ζ で定義する（M3 の表記）。damping = ζ · 2√(k·m) */
function byRatio(stiffness: number, zeta: number, mass = 1): SpringDef {
  return { stiffness, damping: zeta * 2 * Math.sqrt(stiffness * mass), mass }
}

const M3 = {
  spatialFast: byRatio(800, 0.6),
  spatial: byRatio(380, 0.8),
  spatialSlow: byRatio(200, 0.8),
  effectsFast: byRatio(3800, 1),
  effects: byRatio(1600, 1),
  effectsSlow: byRatio(800, 1),
}

const SPRING: Record<SpringName, SpringDef> = {
  'spatial-fast': M3.spatialFast,
  spatial: M3.spatial,
  'spatial-slow': M3.spatialSlow,
  'effects-fast': M3.effectsFast,
  effects: M3.effects,
  'effects-slow': M3.effectsSlow,
  /* 写真の横送り専用。M3 に無い1本だが、理由がある:
     ページャは1枚めくるたびに走るので、spatial の 380/ζ0.8 では
     連続でめくったときにテンポが落ちる。加えて減衰比を 1 の近くまで上げて
     行き過ぎを消してある（行き過ぎると3枚目が数px覗いて事故に見える） */
  page: { stiffness: 700, damping: 50, mass: 1 },
  /* 旧名。押下・トグル・選択 → spatial fast、シート・タブ → spatial、
     共有要素・大きな面 → spatial slow */
  snappy: M3.spatialFast,
  standard: M3.spatial,
  gentle: M3.spatialSlow,
  bouncy: byRatio(300, 0.45),
  /* 記号が一瞬だけ跳ねる（タブのアイコン・送信ボタンの復帰）。ζ=0.482 */
  pop: { stiffness: 520, damping: 22, mass: 1 },
  /* シートの開閉。ζ=0.866。spatial(ζ=0.8) はわずかに行き過ぎるので、
     シートだけこちらに寄せると終端の跳ねが消える */
  glass: byRatio(300, 0.866),
}

/** 見た目上ここまで来たら止まったとみなす（残り変位が距離の 1%）。
 *
 * この閾値がそのままアニメーションの長さになる。Reanimated の既定
 * (restDisplacementThreshold = 0.01) に合わせてある。
 * 0.004 まで詰めると、目に見えない最後の数pxのために
 * standard で 462ms・gentle で 557ms かかり、もっさりする。
 * 実測値: snappy 318ms / standard 390ms / gentle 352ms。
 * いずれも仕様書 §2.3 の目安の中に収まる */
const REST = 0.01
const MAX_MS = 900
const MIN_MS = 120

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** `linear()` が使えるか。Chrome 113+ / Safari 17.2+。
    使えない古い環境では cubic-bezier の近似に落ちる */
let linearOk: boolean | null = null
function supportsLinear(): boolean {
  if (linearOk === null) {
    try {
      linearOk = CSS.supports('transition-timing-function', 'linear(0, 1)')
    } catch {
      linearOk = false
    }
  }
  return linearOk
}

const FALLBACK: Record<SpringName, { easing: string; duration: number }> = {
  'spatial-fast': { easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)', duration: 350 },
  spatial: { easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)', duration: 500 },
  'spatial-slow': { easing: 'cubic-bezier(0.2, 1, 0.3, 1)', duration: 650 },
  'effects-fast': { easing: 'cubic-bezier(0.2, 0, 0, 1)', duration: 150 },
  effects: { easing: 'cubic-bezier(0.2, 0, 0, 1)', duration: 200 },
  'effects-slow': { easing: 'cubic-bezier(0.2, 0, 0, 1)', duration: 300 },
  page: { easing: 'cubic-bezier(0.25, 0.9, 0.25, 1)', duration: 220 },
  snappy: { easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)', duration: 350 },
  standard: { easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)', duration: 500 },
  gentle: { easing: 'cubic-bezier(0.2, 1, 0.3, 1)', duration: 650 },
  bouncy: { easing: 'cubic-bezier(0.2, 1.4, 0.4, 1)', duration: 420 },
  pop: { easing: 'cubic-bezier(0.2, 1.2, 0.4, 1)', duration: 300 },
  glass: { easing: 'cubic-bezier(0.2, 0, 0, 1)', duration: 340 },
}

/** 残っている変位 x(t)。目標を 0、開始を 1 とした正規化座標。
 *
 * v0 は「変位の変化率」。目標へ向かっているとき負になる。
 * 減衰比 zeta で場合分けする（不足/臨界/過減衰）。 */
const CRITICAL_EPS = 1e-3

function displacement(zeta: number, w0: number, v0: number, t: number): number {
  /* ★ zeta === 1 の厳密比較は使えない ★
     damping = 2*sqrt(k*m) をきっちり指定しても浮動小数では 0.9999997 になり、
     不足減衰の枝に落ちる。そこでは wd = w0*sqrt(1-zeta^2) がほぼ 0 になり、
     (v0 + zeta*w0)/wd が発散して曲線が壊れる。幅を持たせて臨界式に寄せる */
  if (Math.abs(zeta - 1) < CRITICAL_EPS) {
    return Math.exp(-w0 * t) * (1 + (v0 + w0) * t)
  }
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    return (
      Math.exp(-zeta * w0 * t) *
      (Math.cos(wd * t) + ((v0 + zeta * w0) / wd) * Math.sin(wd * t))
    )
  }
  // 過減衰。2つの実根の重ね合わせ
  const r = w0 * Math.sqrt(zeta * zeta - 1)
  const a = -zeta * w0 + r
  const b = -zeta * w0 - r
  const c2 = (v0 - a) / (b - a)
  const c1 = 1 - c2
  return c1 * Math.exp(a * t) + c2 * Math.exp(b * t)
}

/* 初速ゼロのプリセットは毎回まったく同じ曲線になる。
   画面を開くたびに 900 回の探索をやり直す意味がないので覚えておく */
const restCache = new Map<SpringName, { easing: string; duration: number }>()

/** バネを CSS のイージング文字列に焼く。
 *
 * `velocity` は指を離した瞬間の速度(px/s)、`distance` はそこから
 * 目標までの残り距離(px)。両方渡すと「投げた勢い」が引き継がれる。
 * 距離が分からない場面では省略してよい（初速0のバネになる）。 */
export function spring(
  name: SpringName,
  opts: { velocity?: number; distance?: number } = {},
): { easing: string; duration: number } {
  if (prefersReducedMotion()) return { easing: 'ease-out', duration: 150 }
  if (!supportsLinear()) return FALLBACK[name]

  const atRest = !opts.velocity
  if (atRest) {
    const hit = restCache.get(name)
    if (hit) return hit
  }

  const { stiffness, damping, mass } = SPRING[name]
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))

  // 変位は 1 → 0。目標へ近づく向きの速度は変位を減らすので符号が反転する。
  // 距離が極端に小さいと初速が発散するため上限で抑える
  const d = Math.abs(opts.distance ?? 0)
  const v0 = d > 1 ? clamp(-(opts.velocity ?? 0) / d, -24, 24) : 0

  // 収まるまでの時間を探す。1ms 刻みで見て、静止条件を満たしたところで打ち切る
  let ms = MAX_MS
  for (let t = 1; t <= MAX_MS; t++) {
    if (Math.abs(displacement(zeta, w0, v0, t / 1000)) < REST) {
      // 一度静止域に入っても跳ね返ることがあるので、少し先まで確かめる
      let settled = true
      for (let k = t; k < Math.min(t + 80, MAX_MS); k += 8) {
        if (Math.abs(displacement(zeta, w0, v0, k / 1000)) >= REST) {
          settled = false
          break
        }
      }
      if (settled) {
        ms = t
        break
      }
    }
  }
  ms = clamp(Math.round(ms), MIN_MS, MAX_MS)

  // 60fps 相当で標本化する。点を増やしても見た目は変わらないので上限を切る
  const steps = clamp(Math.round(ms / 16), 8, 60)
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (ms / 1000)
    const p = i === steps ? 1 : 1 - displacement(zeta, w0, v0, t)
    pts.push(p.toFixed(4))
  }
  const out = { easing: `linear(${pts.join(', ')})`, duration: ms }
  if (atRest) restCache.set(name, out)
  return out
}

/* ---------------------------------------------------------- CSS への配線 */

/** CSS 側に焼き込むバネ。ここに載せた名前だけが --ease-… と --d-… を持つ。
    旧名（--ease-snappy 等）は tokens.css が var() の別名にしているので、
    ここで焼くのは M3 の6本だけでよい */
const CSS_SPRINGS: SpringName[] = [
  'spatial-fast',
  'spatial',
  'spatial-slow',
  'effects-fast',
  'effects',
  'effects-slow',
]

/** 本物のバネ曲線を CSS 変数へ流し込む。
 *
 * これが無いと、CSS 側は cubic-bezier の近似・JS 側は本物のバネ、という
 * 二重生活になる。同じ「標準」でも曲線が違うので、シートは本物のバネで
 * 動くのにその中のボタンは近似で動く、という食い違いが起きる。
 *
 * ★変数名を変えないこと★ ui.tsx / Toast.tsx が
 * 'transform var(--d-spatial) var(--ease-spatial)' を文字列リテラルで
 * 埋めている。名前を変えると無言で transition が消える。
 *
 * ★--d-tap は焼かない★「指より遅れたら負け」の 90ms 固定であって、
 * 収まるまでの時間を計算する対象ではない。 */
export function publishSprings() {
  const st = document.documentElement.style
  for (const name of CSS_SPRINGS) {
    // reduced-motion なら spring() 自身が ease-out/150ms を返す
    const s = spring(name)
    st.setProperty(`--ease-${name}`, s.easing)
    st.setProperty(`--d-${name}`, `${s.duration}ms`)
  }
}

/** 起動時に1回呼ぶ。視差低減の設定が変わったら焼き直す。
 *
 * ★注意★ publishSprings() は documentElement.style（インライン）へ書くので、
 * tokens.css の @media (prefers-reduced-motion) ブロックに**勝ってしまう**。
 * つまり視差低減は「spring() 自身が reduce を見て短絡している」ことだけで
 * 成立している。その短絡を消さないこと、change で必ず焼き直すこと。
 * どちらか一方でも欠けると視差低減が片肺になる。 */
export function watchMotionPrefs() {
  publishSprings()
  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      restCache.clear()
      publishSprings()
    })
  } catch {
    /* 古い WebView では addEventListener が無い。焼き直せないだけで害はない */
  }
}

/** バネで要素を動かす薄い包み。返り値の Animation は cancel できるので、
    再生中に指で触られたら掴み直せる（仕様書 2.1「中断可能」）。
 *
 * ★fill について★
 * 終わったあとも最終状態を保つ `forwards` は、「動かしたあと消す/畳む」
 * ものにだけ使う。入場アニメに付けると、終了後の element.style への
 * 書き込みが Web Animations 側の値に負けて効かなくなる
 * （＝指で掴んでも動かない）。入場は enterFrom を使うこと。 */
export function springTo(
  el: Element,
  frames: Keyframe[],
  name: SpringName,
  opts: { velocity?: number; distance?: number } = {},
): Animation {
  const { easing, duration } = spring(name, opts)
  return el.animate(frames, { duration, easing, fill: 'forwards' })
}

/** 入場。終わったら CSS の値に戻す（＝そのあと指で掴める）。
    最後のキーフレームは必ず CSS の既定値と一致させること */
export function enterFrom(el: Element, frames: Keyframe[], name: SpringName = 'standard'): Animation {
  const { easing, duration } = spring(name)
  return el.animate(frames, { duration, easing, fill: 'backwards' })
}

/** 指を離した位置から目標へバネで収める。
 *
 * ★fill: 'forwards' を使わない★
 * forwards で終えると、そのあと element.style へ書いても
 * Web Animations 側の値に負けて動かなくなる（＝次に掴めない）。
 * 代わりに「先に最終値をインラインへ確定させ、開始値からそこへ流す」。
 * 2枚目のキーフレームを空にすると、その時点の実際の値（＝いま書いた最終値）
 * が終端として使われる。 */
export function springSettle(
  el: HTMLElement,
  from: Keyframe,
  to: Record<string, string>,
  name: SpringName,
  opts: { velocity?: number; distance?: number } = {},
): Animation {
  el.style.transition = 'none'
  for (const [k, v] of Object.entries(to)) el.style.setProperty(k, v)
  const { easing, duration } = spring(name, opts)
  return el.animate([from, {}], { duration, easing, fill: 'backwards' })
}

/** 走行中のアニメーションを「いまの見た目のまま」凍結して、指に明け渡す。
 *
 * CSS Cascading L4 では Animation origin が Author origin（インライン含む）より
 * 上にあるため、再生中の WAAPI / CSS transition が持っているプロパティは
 * element.style に書いても無視される。掴んでも1pxも動かない、の正体がこれ。
 *
 * ★手順は read → cancel → write の順を厳守★
 * 先に cancel すると一瞬だけ開始状態へ戻ってから固まる（＝チラつく）。
 *
 * `extra` には、別の要素で連動して走っているアニメーション（地の不透明度など）を
 * 渡す。消し忘れると、その要素だけ指に付いてこない。 */
export function freezeInto(
  el: HTMLElement,
  props: string[],
  extra: (Animation | null | undefined)[] = [],
) {
  const cs = getComputedStyle(el)
  const vals = props.map((p) => cs.getPropertyValue(p))
  for (const a of el.getAnimations()) {
    try {
      a.cancel()
    } catch {
      /* 既に終わっていれば何もしなくてよい */
    }
  }
  for (const a of extra) {
    try {
      a?.cancel()
    } catch {
      /* noop */
    }
  }
  // transition を先に殺してから書く。残っていると書いた値がまた動き出す
  el.style.transition = 'none'
  props.forEach((p, i) => el.style.setProperty(p, vals[i]))
}

/* ---------------------------------------------------------- ラバーバンド */

/** 限界を超えた分に抵抗を掛ける（仕様書 §3.3）。
 *
 *   offset = (x * d * c) / (d + c * x)
 *
 * ピタッと止めると安っぽく、素通しだと壊れて見える。この式が中庸。
 * `dimension` は対象の寸法（横なら幅、縦なら高さ）。 */
export function rubber(x: number, dimension: number, c = 0.55): number {
  const a = Math.abs(x)
  if (a === 0 || dimension <= 0) return 0
  return Math.sign(x) * ((a * dimension * c) / (dimension + c * a))
}

/* ---------------------------------------------------------- 速度の計測 */

/** 指の速度(px/s)。フリックの勢いをアニメーションの初速に渡すために使う。
 *
 * touchend の1点だけで測ると、離す瞬間に指が止まりがちなせいで
 * 速度が 0 に化ける。だから少し前まで遡る。
 * ただし単純に窓の両端を結ぶと、今度は逆の問題が出る:
 *
 *   - 弾いた直後の減速ぶんまで平均に入り、ピーク速度が半分以下に潰れる
 *     → 思い切り投げても写真がのそのそ動く
 *   - 指を止めて数百ms置いてから離しても「止まる直前の速度」が返る
 *     → 位置を合わせて静かに離したのに、勝手にめくれる／閉じる
 *
 * 後者のほうが不快度が高い（狙って止めたのに言うことを聞かない）。
 * 対策は2つ:
 *   1. 最後のサンプルから STILL_MS 以上経っていたら 0 を返す（本当に静止）
 *   2. 隣接サンプル間の瞬間速度を、新しいものほど重く加重平均する
 */
const VEL_WINDOW_MS = 80
/** 最後に指が動いてからこれ以上経っていたら「止まっている」とみなす。
    30ms 程度まで詰めると 60Hz の揺らぎで誤検出し、上のコメントにある
    「離す瞬間に 0 に化ける」を再発させる。50〜70ms を守ること */
const VEL_STILL_MS = 50
/** 加重平均に入れる範囲。ここより古いサンプルは捨てる */
const VEL_RECENT_MS = 60

export class VelocityTracker {
  private s: { t: number; x: number; y: number }[] = []

  reset() {
    this.s = []
  }

  add(t: number, x: number, y: number) {
    this.s.push({ t, x, y })
    while (this.s.length > 2 && t - this.s[0].t > VEL_WINDOW_MS) this.s.shift()
  }

  /** `now` には touchend の timeStamp を渡す。省略すると静止判定が効かない。
      touchmove の timeStamp と同じ時間基準（DOMHighResTimeStamp）なので比較できる */
  get(now?: number): { vx: number; vy: number } {
    const n = this.s.length
    if (n < 2) return { vx: 0, vy: 0 }
    const last = this.s[n - 1]
    if ((now ?? last.t) - last.t > VEL_STILL_MS) return { vx: 0, vy: 0 }

    let w = 0
    let vx = 0
    let vy = 0
    for (let i = n - 1; i > 0; i--) {
      const b = this.s[i]
      const a = this.s[i - 1]
      const age = last.t - b.t
      if (age > VEL_RECENT_MS) break
      const dt = (b.t - a.t) / 1000
      if (dt <= 0) continue
      const k = 1 - age / VEL_RECENT_MS // 新しいサンプルほど重い
      w += k
      vx += (k * (b.x - a.x)) / dt
      vy += (k * (b.y - a.y)) / dt
    }
    if (w === 0) return { vx: 0, vy: 0 }
    return { vx: vx / w, vy: vy / w }
  }
}

/* ---------------------------------------------------------- ハプティクス */

export type HapticKind = 'selection' | 'light' | 'medium' | 'success' | 'error'

/* 鳴らしすぎない。しきい値に到達した瞬間・確定した瞬間だけに絞る。
   スクロール中に鳴り続けるのは不快なので、連続する場面では使わない */
const PATTERN: Record<HapticKind, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 18,
  success: [12, 40, 20],
  error: [24, 36, 24],
}

/** Android(Chrome) は vibrate が効く。iOS Safari には無いので黙って何もしない。
    このアプリの最終形は Android の APK なので、これで足りる */
export function haptic(kind: HapticKind) {
  try {
    navigator.vibrate?.(PATTERN[kind])
  } catch {
    /* 端末が対応していないだけ。失敗しても操作は続く */
  }
}
