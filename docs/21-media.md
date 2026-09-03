# 21. 写真と動画

実体は `starter/styles/components-media.css` と `starter/lib/flight.ts`。

---

## ★ここだけ色の規約から外れる★

背後が**必ず写真**なので、テーマの色を使うと明るい写真の上で消える。

| | |
|---|---|
| 地 | `--behind`（必ず黒） |
| 上に置くボタン | `.iconbtn--onmedia`（黒 45% の円に白） |
| バッジ・時間 | 黒 55% の帯に白 |
| バー | **帯ではなくグラデーション**で沈める |

**手書きの hex を許すのはここだけ**（→ [02-color](02-color.md)）。

---

## グリッド

```html
<div class="gallery">
  <button class="tile"><img src="…" /></button>
  <button class="tile"><img src="…" /><span class="tile__badge">1:24</span></button>
</div>
```

- 隙間は **3px 固定**。トークンに従わせない。ここだけは
  「写真が主役で、隙間は無いほうがよい」が勝つ
- 列数は `--cols`。600px で 4、900px で 6
- **★タイルの角丸を押下で変えない★** 並んだ矩形が一斉に動くとちらつく
  （shape morph の例外。→ [03-shape](03-shape.md)）
- 一覧は**仮想化**する。サムネと原寸は必ず分ける

### 選択モード

```html
<div class="gallery gallery--selecting">
  <button class="tile" aria-selected="true">…<span class="tile__check">…</span></button>
</div>
```

選択中は写真が `scale(0.88)` に縮む。
**★ここだけ `scale` を使ってよい★** 押下ではなく「選択」なので、
形の変化では表しきれない。枠だけだと写真の内容によっては見えない。

一括操作は**浮くツールバー**（`.toolbar`）。行ごとにボタンを置かない。

---

## 全画面ビューア

```html
<div class="viewer">
  <div class="viewer__scrim"></div>
  <div class="viewer__slide"><img class="viewer__img" src="…" /></div>

  <div class="viewer__bar viewer__bar--top">
    <button class="iconbtn iconbtn--onmedia" aria-label="閉じる">…</button>
    <span class="viewer__count">3 / 24</span>
    <div class="viewer__spacer"></div>
  </div>
</div>
```

- 一度触ると `.viewer--bare` でバーが消える（写真を見せるのが目的）
- `touch-action: none`。拡大・横送りを全部自前で拾う

### ジェスチャー（→ [12-gestures](12-gestures.md)）

| | |
|---|---|
| 下スワイプ | 指に 1:1 追従（位置・縮小・角丸・**地の不透明度**）。`dy > H×0.22` または `v > 800px/s` で閉じ、元のタイルへ吸い込まれる |
| 横スワイプ | 前後へ。吸着。専用のバネ（剛性 700 / 減衰 50） |
| ピンチ / ダブルタップ | 拡大縮小 / 等倍トグル。**ズーム中は横スワイプを無効にする** |

**★地だけ独立して薄くする★** 写真は薄くしない（`.viewer__scrim` が別要素なのはこのため）。
写真まで透けると「消えかけている」に見えて、閉じる操作なのか分からなくなる。

> **ここは CSS と契約だけを配っている。** 1:1 追従のジェスチャーは
> 掴む対象がアプリごとに違いすぎて、部品として固めると必ず邪魔になる。
> `lib/motion.ts` の `rubber()` / `VelocityTracker` / `freezeInto()` を使って
> アプリ側で書く。

---

## 共有要素で飛ぶ

一覧 → 詳細を地続きに見せる、いちばん効くやつ。

```ts
import { fly, openWithFlight } from './lib/flight'

const back = await openWithFlight(tileEl, () => showViewer(i), { fit: 'contain' })
// 閉じるとき
await back()
```

やっていること:

1. 開く前に元の要素の矩形を取る
2. `body` 直下にクローンを `position: fixed` で置き、元の矩形に重ねる
3. **`transform` と `clip-path` だけ**を目標矩形へ動かす（`spatial-slow`）
4. 着いたら本体を出してクローンを消す

**★`width` / `height` を動かさない★** 毎フレーム レイアウトが走って、
写真1枚で 60fps を割る。

**★`.app` に `transform` / `filter` を載せない★** 載せた瞬間に
`position: fixed` の containing block が `.app` になり、
ビューポート座標で書いた `left/top` と食い違って**着地位置がズレる**。

**★角丸は拡大率で割る★** `clip-path: inset(0 round calc(R / scale))`。
割らないと、飛んでいる間だけ角が太る。

視差低減の設定では飛ばさない（150ms のクロスフェードに落ちる）。
`fly()` が自分で見て短絡している。

---

## 動画

```html
<div class="player">
  <video src="…"></video>
  <div class="player__bar">
    <button class="iconbtn iconbtn--onmedia">…</button>
    <span class="player__time">1:24</span>
    <div class="player__track"><div class="player__fill" style="--p: 40%"></div></div>
  </div>
</div>
```

- **★ネイティブの `controls` を出さない★** OS ごとに顔が違い、
  そこだけ「Web ページ」に見える
- トラックは白 30%、値は白。**テーマの primary は写真の上で消える**
- トラックの当たり判定は `::after` で縦に ±16px 広げる（4px は掴めない）
- 時刻は等幅（`--font-num` + `tabular-nums`）

---

## 読み込み

| | |
|---|---|
| タイル | `.tile--skel`（骨と同じパルス）。**`.ratio` で高さを先に決める** |
| 原寸 | 低解像度 → 原寸をクロスフェード。灰色の四角を見せない |
| 失敗 | タイルの中に小さく `i-image` を置く。行ごと消さない |

高さを先に決めておかないと、画像が届いた瞬間に下の内容が飛ぶ
（→ [09-components](09-components.md) の `.ratio`）。
