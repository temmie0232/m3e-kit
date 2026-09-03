# 09. 部品カタログ

実体は `starter/styles/components.css`。ここには**使い方と契約**だけを書く。
実物は `demo/index.html`（見本帳）で見る。

ここに無い部品を作るときは → [10-new-component](10-new-component.md)

**HTML が正。** React / Vue / Svelte でも同じクラスを同じ構造で使う。
JS が要るところだけ「JS」と注記してある。

---

## 目次

[骨組み](#骨組み) ・ [トップアプリバー](#トップアプリバー) ・ [ナビゲーションバー](#ナビゲーションバー) ・
[アイコン](#アイコン) ・ [ボタン](#ボタン) ・ [アイコンボタン](#アイコンボタン) ・ [FAB](#fab) ・
[テキストフィールド](#テキストフィールド) ・ [検索欄](#検索欄) ・ [スイッチ](#スイッチ) ・
[チェックボックス・ラジオ](#チェックボックスラジオ) ・ [スライダー](#スライダー) ・
[チップ](#チップ) ・ [接続ボタン群](#接続ボタン群) ・ [タブ](#タブ) ・
[カード](#カード) ・ [リスト](#リスト) ・ [スワイプで削除](#スワイプで削除) ・
[バッジ](#バッジ) ・ [空状態](#空状態) ・ [通知カード](#通知カード) ・ [骨](#骨スケルトン) ・
[スナックバー](#スナックバー) ・ [進捗](#進捗) ・ [読み込みの印](#読み込みの印) ・
[ボトムシート](#ボトムシート) ・ [ダイアログ](#ダイアログ) ・ [浮くツールバー](#浮くツールバー)

---

## 骨組み

```html
<div class="app">
  <header class="appbar">…</header>
  <main class="main main--padded">…</main>
  <button class="fab">…</button>
  <nav class="navbar" style="--nav-n: 4">…</nav>
</div>
```

`.main--padded` は上下に `--inset-*` を足し込んだ padding と `gap: 24` の縦列。
→ [08-layout](08-layout.md)

---

## トップアプリバー

M3 center-aligned top app bar / 高さ 64 / 影なし

```html
<header class="appbar" id="appbar">
  <div class="appbar__side">
    <button class="iconbtn" aria-label="戻る">…</button>
  </div>
  <h1 class="appbar__title">タイトル</h1>
  <div class="appbar__side appbar__side--end">
    <button class="btn btn--text btn--sm">完了</button>
  </div>
</header>
```

- タイトルは title-l（22）/ 500 / `nowrap`
- 左揃えにしたいときは `.appbar--start`
- **JS**: `.main` の `scrollTop > 4` で `.appbar--solid` を付け外し（→ [08-layout](08-layout.md)）

---

## ナビゲーションバー

M3 navigation bar / 高さ 80 / `--surface-mid` / 下端に貼り付く

```html
<nav class="navbar" style="--nav-n: 4; --nav-i: 0">
  <div class="navbar__ind"></div>
  <button class="navbar__item" aria-current="page">
    <svg class="icon">…</svg>ホーム
  </button>
  …
</nav>
```

- `--nav-n` = 区画数、`--nav-i` = 選択位置（**JS** が書く）
- 選択中は `aria-current="page"`。太い線のアイコン + 太字ラベル
- ピルは 64×32 の `--secondary-container` が `spatial` のバネで滑る

---

## アイコン

**★全部ストローク設計に統一する★** `fill: none; stroke: currentColor`。
`fill: currentColor` に切り替えると、線で描いたアイコンはただの塊になる。

```html
<svg class="icon" viewBox="0 0 24 24"><path d="…" /></svg>
```

| クラス | 寸法 | 線幅 |
|---|---|---|
| `.icon` | 22 | 1.8 |
| `.icon--sm` | 16 | 2.2 |
| `.icon--lg` | 24 | 1.8 |

`<symbol>` + `<use>` でまとめると軽い（見本帳がその形）。

---

## ボタン

| 種類 | クラス | 地 / 文字 |
|---|---|---|
| Filled | `.btn .btn--filled` | primary / on-primary。**1画面に1つ** |
| Tonal（既定） | `.btn` | secondary-container |
| Outlined | `.btn .btn--outlined` | 枠 outline / primary |
| Text | `.btn .btn--text` | なし / primary |
| Elevated | `.btn .btn--elevated` | surface-low + elev-1 |
| Error tonal | `.btn .btn--danger` | error-container。**破壊的操作は面で言う** |

| 大きさ | クラス | 高さ |
|---|---|---|
| XS | `.btn--sm` | 32（当たり判定は `::after` で 48） |
| 既定 | — | 48 |
| M（幅いっぱい） | `.btn--full` | 56 / title-m |

```html
<button class="btn btn--filled">
  <svg class="icon icon--sm">…</svg>保存
</button>
<button class="btn btn--filled" disabled>使えない</button>
<button class="btn btn--filled">送信<span class="btn__busy"></span></button>
```

- 押下で形が変わる（→ [03-shape](03-shape.md)）
- **★札は `white-space: nowrap`★** `.btn--full` だけは折り返してよい
- 処理中は `.btn__busy` を**右に足す**（文字を消すとボタンの幅が動く）

---

## アイコンボタン

M3 icon button / 48 の円

```html
<button class="iconbtn" aria-label="検索"><svg class="icon">…</svg></button>
<button class="iconbtn iconbtn--tonal">…</button>
<button class="iconbtn iconbtn--filled">…</button>
<button class="iconbtn iconbtn--onmedia">…</button>   <!-- 写真の上 -->
```

`aria-label` を**必ず**付ける。`--onmedia` だけはテーマに追従せず黒 45% + 白。

---

## FAB

| クラス | 寸法 | 角 | 押下 |
|---|---|---|---|
| `.fab--sm` | 40 | md(12) | xl |
| `.fab` | 56 | lg(16) | xl(28) |
| `.fab--lg` | 96 | xl(28) | — |
| `.fab--ext` | 高さ 56・幅可変 | lg | xl |

```html
<button class="fab" aria-label="追加"><svg class="icon">…</svg></button>
<button class="fab fab--ext"><svg class="icon">…</svg>追加する</button>
```

`primary-container` / `elev-3`。位置は `bottom: calc(var(--inset-bottom) + var(--s-4))`
（→ [08-layout](08-layout.md)）。1画面に1つ。

---

## テキストフィールド

M3 filled text field / 高さ 56 / 上角 xs / 下線 1px → フォーカスで 2px primary

```html
<div class="field">
  <label class="label" for="f1">名前</label>
  <input class="input" id="f1" placeholder="山田" />
</div>

<div class="field">
  <input class="input input--error" />
  <p class="field__error">この名前は使われています</p>
</div>

<input class="input input--outlined" />   <!-- 地を持てない場所 -->
<textarea class="textarea"></textarea>
<select class="select"><option>…</option></select>
<input class="input input--num" value="12,340" />   <!-- 右寄せ・等幅 -->
```

- **★`font-size` は `--t-input`（16px）から下げない★**（→ [04-type](04-type.md)）
- `.select` はネイティブの ▾ を消して自前の山形に差し替えてある。
  **★`background-color` で書くこと★** 短縮形にすると背景の山形が
  フォーカスのたびに消える
- エラーは枠の色と**下に出す1文**の両方で言う。色だけにしない

---

## 検索欄

```html
<div class="search">
  <svg class="icon">…</svg>
  <input class="search__input" placeholder="検索" />
</div>
```

`--surface-highest` のピル（xl）。高さ 56。

---

## スイッチ

M3 switch / トラック 52×32 / ツマミ off 16・on 24・押下 28

```html
<div class="row">
  <div class="row__main"><span class="row__title">通知を受け取る</span></div>
  <input type="checkbox" class="switch" checked />
</div>
```

**★中心座標で位置を決めてある★** 大きさが変わっても中心が動かないので、
`transform` だけの transition で済む（レイアウトを触らない）。

「今すぐ効く設定」にはスイッチ、「決定を押して確定する設定」にはチェックボックス。

---

## チェックボックス・ラジオ

```html
<label class="check"><input type="checkbox" class="checkbox" checked />既読を含める</label>
<label class="check"><input type="radio" name="sort" class="radio" checked />新しい順</label>
```

**★`<label class="check">` で包む★** 見た目 20px のままで、ラベルごと 48px の
当たり判定になる。チェックだけを押させない。

---

## スライダー

M3 Expressive slider / トラック 16 / ツマミは**縦棒 4×44**

```html
<input type="range" class="slider" value="40" style="--p: 40%" />
```

```js
sl.oninput = () => sl.style.setProperty('--p', sl.value + '%')  // JS
```

埋まった割合は `--p` で渡す。`input` イベントで書き換える。

---

## チップ

M3 filter / assist chip / 高さ 32 / 角 sm(8) / 枠 outline-variant

```html
<div class="chips">
  <button class="chip" aria-pressed="true">食費</button>
  <button class="chip" aria-pressed="false">日用品</button>
  <span class="chips__sep"></span>
  <button class="chip"><svg class="icon">…</svg>お気に入り</button>
</div>
```

- 選択中は `aria-pressed="true"` → `--secondary-container` の塗り
- **★`.chips` は横スクロールする帯★** `padding-block: 8px` を持たせること。
  `overflow-x: auto` は `overflow-y` も auto に計算されるので、`.chip::after`
  （当たり判定）の上下がクリップされる
- 縦列の直下に置くときは `margin-block` で同量を戻す（→ [05-space](05-space.md)）

---

## 接続ボタン群

M3 Expressive connected button group（旧セグメンテッドコントロール）。
**並んだ中から必ず1つが選ばれる排他選択**に使う。

```html
<div class="seg" style="--seg-n: 3; --seg-i: 0">
  <div class="seg__ind"></div>
  <button class="seg__btn" aria-pressed="true">すべて</button>
  <button class="seg__btn" aria-pressed="false">写真</button>
  <button class="seg__btn" aria-pressed="false">動画</button>
</div>
```

- `--seg-n` = 区画数、`--seg-i` = 選択位置（**JS** が書く）
- 選択中のピルは `--primary` の塗り。`spatial` のバネで滑る
- **★`padding: 2px` と `width: calc((100% - 4px) / --seg-n)` は対★** 片方だけ変えない
- **★区画のラベルを絶対に折り返させない★** ピルは高さ 100%-4px の1行ぶんで
  描かれているので、1つでも2行になった瞬間に群れ全体が崩れる
- 選択肢が多くて1行に入らないときは `.seg--rows`（`--seg-rows` で行数）。
  **★`row-gap` を入れない★** ピルの高さ = 1行の高さ の等式が崩れる

---

## タブ

M3 primary tabs / 高さ 48 / 印は下の 3px

```html
<div class="tabs" style="--tab-n: 3; --tab-i: 0">
  <button class="tabs__item" aria-selected="true">今月</button>
  …
  <div class="tabs__ind"></div>
</div>
```

**タブは「場所」、接続ボタン群は「絞り込み」。** 混ぜると「戻る」の意味が壊れる。

---

## カード

| クラス | 地 | 影 |
|---|---|---|
| `.panel` | surface-mid | なし |
| `.panel--outlined` | surface-low + 枠 outline-variant | なし |
| `.panel--elevated` | surface-low | elev-1 |

```html
<div class="panel">
  <div class="panel__body">
    <strong>見出し</strong>
    <span class="muted">補助文</span>
  </div>
</div>
```

**既定は `.panel`（影なし）。** 影を敷きたくなったら [06-elevation](06-elevation.md) を読む。

---

## リスト

M3 list item / 1行 56 / 2行 72 / 区切りは outline-variant 1px を 16 インセット

```html
<div class="panel">
  <div class="rowlist">
    <button class="row row--link">
      <svg class="icon">…</svg>
      <div class="row__main">
        <span class="row__title">主文</span>
        <span class="row__sub">副題</span>
      </div>
      <span class="row__value">1,200</span>
      <svg class="row__chevron">…</svg>
    </button>
    <div class="row row--on">選択中</div>
    <button class="row row--link row--danger">履歴を消す</button>
  </div>
</div>
```

- **★区切りは `border` ではなく背景で描いてある★** `border` だと行の高さが増え、
  スワイプ削除のしきい値計算に効き、`overflow: hidden` で端が欠ける
- `.row__main` は `flex: 1; min-width: 0`。これが無いと長い文字列で行が横に溢れる
- `.row__title` は 1行 + `ellipsis`。折り返させない
- 単独の線が要るときは `<hr class="divider">`

---

## スワイプで削除

**行ごとに ✕ ボタンを置かない。**

```html
<div class="swiperow">
  <div class="swiperow__bg">離すと削除</div>
  <div class="swiperow__content"><div class="row">…</div></div>
</div>
```

- 指を左へ引いた分だけ `.swiperow__content` を `translateX`（**JS**、1:1 で追従）
- 幅の 40% を超えたら `.swiperow--armed` を付ける → 背景が
  `error-container → error` に変わって**離す前に予告する**
- 離したら `spatial` のバネで戻す。実行したらスナックバーに「元に戻す」
- **★`.swiperow__content` の地は親の面と必ず同じ色にする★** 片方だけ変えると
  下の `error-container` が透けて全行がうっすら赤くなる
- `will-change` は掴んでいる間だけ JS が付ける（→ [07-motion](07-motion.md)）

---

## バッジ

```html
<span class="badge">既定</span>
<span class="badge badge--on">有効</span>     <!-- primary-container -->
<span class="badge badge--off">停止中</span>   <!-- surface-highest -->
<span class="badge badge--alert">超過</span>   <!-- error-container -->
```

label-m（12）/ 500 / 角 sm。

---

## 空状態

**お詫びではなく招待状。**

```html
<div class="empty">
  <span class="empty__title">まだ何もありません</span>
  <span>最初のひとつを追加すると、ここに並びます</span>
  <button class="btn btn--filled">追加する</button>
</div>
```

「次にやる操作」のボタンを**必ず1つ**置く。→ [11-states](11-states.md)

---

## 通知カード

```html
<div class="notice">
  <strong>見出し</strong>
  <span class="muted">説明</span>
</div>

<div class="notice notice--alert">
  <strong>保存できませんでした</strong>
  <span class="muted">通信が切れています。つながってからもう一度試してください</span>
  <button class="btn btn--sm">もう一度試す</button>
</div>
```

画面上端から降りてくる札（オフライン等）は `.banner`。押せるものではないので
操作を持たせない。

---

## 骨（スケルトン）

```html
<div class="skel-group">
  <div class="skel" style="width: 60%; height: 14px"></div>
  <div class="skel" style="width: 90%; height: 14px"></div>
</div>
```

- 出てくるものと**同じ形・同じ位置**の面を先に置く
- 走査グラデーション（シマー）は使わない。息をするだけのパルス
- **★角丸は 4px から上げない★** 高さ 12〜14px の骨がカプセルになると
  「読み込み中の行」に見えなくなる
- 200ms 未満で終わるなら出さない（→ [11-states](11-states.md)）

---

## スナックバー

M3 snackbar / `--inverse-surface` / 角 sm / elev-3

```html
<div class="toasts">
  <div class="toast">
    <span class="toast__text">1件を削除しました</span>
    <button class="toast__action">元に戻す</button>
  </div>
</div>
```

- **★画面の上・トップアプリバーの下に出す★** M3 の既定は下端だが、下端は
  親指の通り道で、ナビゲーションバー・浮くツールバー・FAB と場所を取り合う。
  上に出せば「元に戻す」が必ず押せる
- 本文は**1行だけ**。溢れたら省略する（何行にも伸びるとブロックしているのと同じ）
- 上スワイプで即消せる（**JS**）
- **★装飾用の `@keyframes` を足さない★** `freezeInto()` が全 Animation を
  cancel するので、指が触れた瞬間に永久停止する

---

## 進捗

M3 linear progress / トラック secondary-container / 値 primary / 両端丸

```html
<div class="meter">
  <div class="meter__head"><span>今月の予算</span><span class="mono">62%</span></div>
  <div class="meter__track"><div class="meter__fill" style="width: 62%"></div></div>
</div>
```

100% を超えたら `.meter__fill--over`（error）。
**★見出しの隣のボタンは `flex: 0 0 auto`★**（→ [05-space](05-space.md)）

---

## 読み込みの印

```html
<div class="loader-chip">
  <svg class="loader loader--on" viewBox="0 0 100 100">
    <path class="loader__shape"></path>
  </svg>
</div>
```

```ts
import { attachLoader } from './lib/loader'
const l = attachLoader(pathEl)   // JS
l.play()
```

7つの多角形の間を形が変わりながら回る。`.loader-chip` は contained 版
（primary-container の円 48 に印 38）。全画面スピナーは禁止。

「引いて更新」では `.ptr` の中に置き、引いた量で `setProgress()` する。

---

## ボトムシート

M3 modal bottom sheet / `--surface-low` / 上角 xl(28) / 暗幕 32%

```html
<div class="scrim"></div>
<div class="sheet">
  <div class="sheet__grab">
    <div class="sheet__handle"></div>
    <h2 class="sheet__title">並べ替え</h2>
  </div>
  <div class="sheet__body">…</div>
</div>
```

- **★`bottom: 0` を死守★** JS が `offsetHeight` を移動距離と入場開始位置に使う
- `.sheet__grab`（つまみ + 表題）が掴む帯。`touch-action: none`
- 掴んで下ろせる（**JS**、1:1 追従 + 離した速度を引き継ぐ）
- **★`.sheet__body > *` に `flex-shrink: 0`★**（→ [05-space](05-space.md)）
- **★装飾用の `@keyframes` を足さない★**（スナックバーと同じ理由）
- 暗幕（`--scrim`）が「背後が触れない」ことを示す唯一の合図。省かない

---

## ダイアログ

```html
<div class="scrim"></div>
<div class="dialog">
  <h2 class="dialog__title">4件を完全に削除しますか</h2>
  <p class="muted">この操作は元に戻せません。</p>
  <div class="dialog__acts">
    <button class="btn btn--text">やめる</button>
    <button class="btn btn--danger">削除する</button>
  </div>
</div>
```

**★本当に戻せないものだけ★** 取り消せる操作はスナックバーの「元に戻す」で受ける。
確認ダイアログを多用すると、人は読まずに押すようになる。

---

## 浮くツールバー

M3 floating toolbar / `--surface-high` のピル / elev-3

```html
<div class="toolbar">
  <span class="mono">3件</span>
  <div style="flex:1"></div>
  <button class="iconbtn">…</button>
  <button class="btn btn--sm">やめる</button>
</div>
```

選択モードの一括操作など。ナビゲーションバーの上に浮く
（`bottom: calc(var(--inset-bottom) + var(--s-4))`）。

**★中身を詰め込みすぎない★** 操作が4つを超えると 390px 幅で溢れ、
`justify-content: flex-end` のせいで**左へ溢れて件数の上に重なる**。
当たり判定の 48px は動かせないので、減らすのは操作の数のほう。
