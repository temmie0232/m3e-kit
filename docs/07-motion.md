# 07. 動き

## 絶対ルール

- **`linear` を使わない**（無限に回るものだけ例外）
- **`ease-in-out` の 300ms 超を使わない**
- 画面遷移・ジェスチャー由来の動きは**すべてバネ**
- アニメーションは**中断可能**にする。再生中に指で触ったら、その位置から掴み直せる
- 動かすのは `transform` / `opacity` / `border-radius` / 色**だけ**。
  `width` / `top` / `margin` を transition しない（レイアウトが毎フレーム走る）

---

## バネ（M3 Expressive motion scheme）

M3 Expressive の motion は「duration + easing」ではなく**バネ**で定義されている
（Compose の `MotionScheme.expressive()` と同じ値）。

| 名前 | 剛性 / 減衰比 ζ | 用途 |
|---|---|---|
| `spatial-fast` | 800 / 0.6 | 押下の形、トグル、小さな出入り（少し行き過ぎる） |
| `spatial` | 380 / 0.8 | シート、タブ、選択ピルの移動、リスト項目の出現 |
| `spatial-slow` | 200 / 0.8 | 共有要素トランジション、大きな面 |
| `effects-fast` | 3800 / 1.0 | 素早い色の変化 |
| `effects` | 1600 / 1.0 | 色・不透明度（行き過ぎない＝臨界減衰） |
| `effects-slow` | 800 / 1.0 | ゆっくりしたフェード |

**spatial は位置・大きさ・形。effects は色・不透明度。** 色が行き過ぎると
「一瞬別の色になる」ので、effects は必ず臨界減衰（ζ=1）。

### CSS での書き方

```css
/* 位置・大きさ・形 */
transition: transform var(--d-spatial) var(--ease-spatial);
/* 色・不透明度 */
transition: background-color var(--d-effects) var(--ease-effects);
/* 押し込みの色だけ --d-tap（90ms 固定。指より遅れたら負け） */
transition: box-shadow var(--d-tap) var(--ease-effects);
```

`--ease-*` の実体は、起動時に `lib/motion.ts` の `publishSprings()` が
**減衰振動を解いて CSS の `linear()` に焼いたもの**。
`tokens.css` に書いてある `cubic-bezier` はその近似（`lib/` を入れないときの見た目）。

> `linear()` という名前に反して、中身は不等間隔のバネ曲線。
> 原則が禁じている「等速の `linear`」とは別物。

### なぜ `linear()` に焼くのか

CSS のイージングとして渡せば **Web Animations API に渡せて合成スレッドで回る**。
JS で毎フレーム計算すると、通信や再レンダで JS が詰まったときに
アニメーションまで一緒に固まる。

### JS から使う

```ts
import { springTo, springSettle, freezeInto, rubber, VelocityTracker } from './lib/motion'

springTo(el, [{ transform: 'translateY(0)' }], 'spatial')
```

`spring()` は視差低減を見て 150ms/ease-out に短絡する。**その短絡を消さないこと** —
`publishSprings()` は `documentElement.style`（インライン）に `--d-*` を書くので、
`tokens.css` の `@media (prefers-reduced-motion)` に勝ってしまう。短絡が最後の砦。

---

## 共有要素トランジション

一覧 → 詳細を地続きに見せる最重要テクニック（写真グリッド → ビューア、
カード → 詳細画面）。サムネイルそのものが拡大して移動し、戻るときは元の
タイル位置に**正確に着地**する。

作り方:
1. 開く前に、元の要素の `getBoundingClientRect()` を取る
2. `body` 直下にクローンを `position: fixed` で置き、元の矩形に重ねる
3. `transform` と `clip-path` **だけ**を目標矩形へ動かす（`spatial-slow`）
4. 着いたら本体を表示してクローンを消す

**★`.app` に `transform` / `filter` を載せない★** 載せた瞬間に `position: fixed` の
containing block が `.app` になり、`body` 直下へ appendChild したクローンが
ビューポート座標で書いた `left/top` と食い違って着地位置がズレる。

角丸も再現する: `clip-path: inset(0 round calc(R / scale))`。
拡大率で割らないと、飛んでいる間だけ角が太る。

---

## 読み込みの印（loading indicator）

M3 Expressive の loading indicator は「**7つの多角形の間を形が滑らかに変わりながら
回る**」もの（soft burst → 9-sided cookie → 五角形 → pill → sunny →
4-sided cookie → 楕円）。

`lib/loader.ts` が極座標 r(θ) から形を起こし、**同じ本数の3次ベジェ**で描いて、
WAAPI で `path` の `d` を補間する。同じコマンド列なら `d` は補間できる。

```ts
const loader = attachLoader(pathEl)
loader.setProgress(0.6)  // 引いた量で形が進む（指に形がついてくる）
loader.play()            // 離すと回り始める
```

回転だけは `linear` で正しい。**無限に回るものが加減速すると脈打って見える。**

- 全画面スピナーは**禁止**
- 一覧の読み込みは**骨**（`.skel`）
- 「引いて更新」ではこの印を使う。中身は動かさず、印だけがバーの下から降りてくる

---

## 視差効果を減らす設定

**「アニメーションを消す」のではなく「穏やかなものに差し替える」。**

- 移動・拡大 → **150ms のクロスフェード**
- 形の変化・回転 → 止める
- 押下だけは残す（0ms は瞬間移動で逆に不気味）

`tokens.css` の `@media (prefers-reduced-motion: reduce)` が `--d-*` / `--ease-*` を
まとめて差し替える。JS 側は `prefersReducedMotion()` を見て、共有要素の飛行や
バネをクロスフェードに置き換える。

---

## 押下の即時反応

タップから視覚的な反応まで **100ms 以内**。`:active` は Chromium で 150ms 前後
遅れるので、`lib/press.ts` が `pointerdown` で `.is-pressed` を付ける
（→ [03-shape](03-shape.md)）。

---

## `will-change` を常設しない

掴んでいる間だけ JS が付けて、離したら外す。

```ts
el.style.willChange = 'transform'   // pointerdown
el.style.willChange = ''            // pointerup
```

一覧に 300 行あるとき常設すると、全行が合成レイヤになってメモリを食い潰す。

---

## CSS アニメーションと WAAPI を混ぜない

`freezeInto()` は `el.getAnimations()` を**全部 cancel** して、いまの見た目のまま
指に明け渡す。だから、指で掴める要素（シート・スナックバー・スワイプする行）に
装飾用の `@keyframes` を足すと、**指が触れた瞬間に永久停止する**。

掴める要素のスタイルには `animation` を書かない。入退場も WAAPI（`el.animate()`）で。
