# 09. 部品カタログ

実体は `starter/styles/components*.css`。ここには**使い方と契約**だけを書く。
**実物は部品図鑑（`demo/`）で見る** — 全部品が実際に動き、HTML をコピーできる。

- ここに無い部品を作るときは → [10-new-component](10-new-component.md)
- shadcn/ui の名前から引きたいときは → [19-shadcn-map](19-shadcn-map.md)

**HTML が正。** React / Vue / Svelte でも同じクラスを同じ構造で使う。
JS が要るところだけ「**JS**」と注記してある。

---

## 一覧（82 部品）

| 分類 | 部品 | クラス | ファイル |
|---|---|---|---|
| 骨組み | アプリの外殻 | `.app` `.main` | core |
| | トップアプリバー | `.appbar` | core |
| | ナビゲーションバー（下端） | `.navbar` | core |
| | ナビゲーションレール（左端） | `.rail` | nav |
| | ナビゲーションドロワー | `.drawer` | nav |
| | 適応レイアウト | `.app--adaptive` | nav |
| | ボトムアプリバー | `.bottombar` | nav |
| | 浮くツールバー | `.toolbar` | core |
| | パンくず | `.crumbs` | nav |
| | ページ送り | `.pager` | nav |
| 押すもの | ボタン（6種 × 3寸法） | `.btn` | core |
| | アイコンボタン | `.iconbtn` | core |
| | トグルボタン | `.togglebtn` `.togglegroup` | form |
| | 分割ボタン | `.splitbtn` | form |
| | FAB（4寸法） | `.fab` | core |
| | FAB メニュー | `.fabmenu` | form |
| 選択 | チップ | `.chip` `.chips` | core |
| | 接続ボタン群 | `.seg` | core |
| | タブ（3種） | `.tabs` | core / nav |
| | スイッチ | `.switch` | core |
| | チェックボックス | `.checkbox` | core |
| | ラジオ | `.radio` | core |
| | 評価（星） | `.rating` | form |
| | 色見本 | `.swatch` | form |
| 入力 | テキストフィールド（filled / outlined） | `.input` | core |
| | 複数行 | `.textarea` | core |
| | 選択（ネイティブ） | `.select` | core |
| | 検索欄 | `.search` | core |
| | 全画面の検索 | `.searchview` | overlay |
| | コンボボックス | `.combo` | form |
| | スライダー | `.slider` | core |
| | 日付（カレンダー） | `.cal` | form |
| | 時刻（数字 / ダイヤル） | `.timefields` `.dial` | form |
| | 使い捨てコード | `.otp` | form |
| | ドロップ領域 | `.dropzone` | form |
| | 入力の体系 | `.field` `.field-row` | core / form |
| 面と行 | カード（3種） | `.panel` | core |
| | リスト | `.rowlist` `.row` | core |
| | 木 | `.tree` | data |
| | 表 | `.table` | data |
| | カルーセル | `.carousel` `.dots` | data |
| | 縦横比の器 | `.ratio` | data |
| | スクロール域 | `.scroller` | data |
| | 区切り | `.divider` | core / data |
| | スワイプで削除 | `.swiperow` | core |
| 重ねる | ボトムシート | `.sheet` | core |
| | サイドシート | `.sidesheet` | nav |
| | ダイアログ（3種） | `.dialog` | core / overlay |
| | メニュー | `.menu` | overlay |
| | コンテキストメニュー | `.menu` + **JS** | overlay |
| | ポップオーバー | `.popover` | overlay |
| | ツールチップ（2種） | `.tip` | overlay |
| | 開閉（アコーディオン） | `.accordion` | overlay |
| | コマンドパレット | `.command` | overlay |
| 知らせ | バッジ | `.badge` | core |
| | 空状態 | `.empty` | core |
| | 通知カード | `.notice` | core |
| | 上から降りる札 | `.banner` | core |
| | 骨（スケルトン） | `.skel` | core |
| | スナックバー | `.toast` | core |
| 進み具合 | 線の進捗 | `.meter` | core |
| | 環の進捗 | `.ring` | data |
| | 読み込みの印 | `.loader` | core |
| | 引いて更新 | `.ptr` + **JS** | core |
| | 手順 | `.steps` | data |
| | 年表 | `.timeline` | data |
| 会話 | チャット（吹き出し） | `.chat` `.msg` | chat |
| | 入力帯 | `.composer` | chat |
| 写真と動画 | 写真グリッド | `.gallery` `.tile` | media |
| | 全画面ビューア | `.viewer` | media |
| | 動画の操作 | `.player` | media |
| 残りもの | ログイン画面 | `.login` | extra |
| | ドラッグ並べ替え | `.sortable` | extra |
| | 予定表（日） | `.agenda` | extra |
| | 予定表（週） | `.week` | extra |
| | 印刷 | `@media print` | print |
| 文字 | アイコン | `.icon` + Lucide | icons |
| | アバター | `.avatar` | data |
| | 数値 | `.stat` | core |
| | 本文（markdown） | `.prose` | data |
| | コード欄・キー | `.code` `.kbd` | data |
| | 図 | `.chart` `.legend` | data |

---

# 骨組み

```html
<div class="app app--adaptive">
  <header class="appbar">…</header>
  <nav class="rail">…</nav>          <!-- medium 幅で出る -->
  <aside class="drawer drawer--standard">…</aside>  <!-- expanded 幅で出る -->
  <main class="main main--padded">…</main>
  <button class="fab">…</button>
  <nav class="navbar" style="--nav-n: 4">…</nav>    <!-- compact 幅で出る -->
</div>
```

`.app--adaptive` を付けると、画面幅でナビゲーションが切り替わる。
携帯だけのアプリなら付けない（`.navbar` だけになる）。
→ [15-adaptive](15-adaptive.md)

---

# トップアプリバー

M3 center-aligned top app bar / 高さ 64 / 影なし

```html
<header class="appbar" id="appbar">
  <div class="appbar__side"><button class="iconbtn" aria-label="戻る">…</button></div>
  <h1 class="appbar__title">タイトル</h1>
  <div class="appbar__side appbar__side--end"><button class="btn btn--text btn--sm">完了</button></div>
</header>
```

- タイトルは title-l（22）/ 500 / `nowrap`。左揃えは `.appbar--start`
- **JS**: `.main` の `scrollTop > 4` で `.appbar--solid` を付け外し（→ [08-layout](08-layout.md)）

# ナビゲーションバー

M3 navigation bar / 高さ 80 / `--surface-mid` / 下端に貼り付く

```html
<nav class="navbar" style="--nav-n: 4; --nav-i: 0">
  <div class="navbar__ind"></div>
  <button class="navbar__item" aria-current="page"><svg class="icon">…</svg>ホーム</button>
</nav>
```

`--nav-n` = 区画数、`--nav-i` = 選択位置（**JS**）。選択中は太い線のアイコン + 太字。

# ナビゲーションレール / ドロワー / ボトムアプリバー / サイドシート / パンくず / ページ送り

→ [15-adaptive](15-adaptive.md) に用途と HTML がまとまっている。

---

# アイコン

**★全部ストローク設計に統一する★** `fill: none; stroke: currentColor`。
`fill: currentColor` に切り替えると、線で描いたアイコンはただの塊になる。

| クラス | 寸法 | 線幅 |
|---|---|---|
| `.icon` | 22 | 1.8 |
| `.icon--sm` | 16 | 2.2 |
| `.icon--lg` | 24 | 1.8 |

`<symbol>` + `<use>` でまとめると軽い（見本帳がその形）。

---

# ボタン

| 種類 | クラス | 地 / 文字 |
|---|---|---|
| Filled | `.btn--filled` | primary。**1画面に1つ** |
| Tonal（既定） | `.btn` | secondary-container |
| Outlined | `.btn--outlined` | 枠 outline / primary |
| Text | `.btn--text` | なし / primary |
| Elevated | `.btn--elevated` | surface-low + elev-1 |
| Error tonal | `.btn--danger` | error-container。**破壊的操作は面で言う** |

| 大きさ | クラス | 高さ |
|---|---|---|
| XS | `.btn--sm` | 32（判定は `::after` で 48） |
| 既定 | — | 48 |
| M | `.btn--full` | 56 / title-m / 幅いっぱい |

```html
<button class="btn btn--filled"><svg class="icon icon--sm">…</svg>保存</button>
<button class="btn btn--filled">送信<span class="btn__busy"></span></button>
```

押下で形が変わる（→ [03-shape](03-shape.md)）。**札は `nowrap`**（`.btn--full` を除く）。
処理中の印は**右に足す**（文字を消すと幅が動く）。

# アイコンボタン

```html
<button class="iconbtn" aria-label="検索"><svg class="icon">…</svg></button>
<button class="iconbtn iconbtn--tonal">…</button>
<button class="iconbtn iconbtn--filled">…</button>
<button class="iconbtn iconbtn--onmedia">…</button>   <!-- 写真の上。黒45%+白 -->
```

`aria-label` を**必ず**付ける。

# トグルボタン

押しっぱなしにできるボタン。選択中は primary で塗る。

```html
<div class="togglegroup">
  <button class="togglebtn" aria-pressed="true" aria-label="太字">…</button>
  <button class="togglebtn" aria-pressed="false" aria-label="斜体">…</button>
</div>
```

**★1つしか選べないなら `.seg` を使う★** `.togglegroup` は複数選べるとき。

# 分割ボタン

M3 Expressive split button。主な操作 + 「ほかの選択肢」。

```html
<div class="splitbtn">
  <button class="btn btn--filled">保存</button>
  <button class="btn btn--filled" popovertarget="m1" aria-expanded="false" aria-label="ほかの保存">
    <svg class="icon icon--sm">…</svg>
  </button>
</div>
```

向き合う側の角だけ角ばる。開いている間は矢印が返る。

# FAB

| クラス | 寸法 | 角 | 押下 |
|---|---|---|---|
| `.fab--sm` | 40 | md(12) | xl |
| `.fab` | 56 | lg(16) | xl(28) |
| `.fab--lg` | 96 | xl(28) | — |
| `.fab--ext` | 高さ 56・幅可変 | lg | xl |

`primary-container` / `elev-3`。位置は `bottom: calc(var(--inset-bottom) + var(--s-4))`。
1画面に1つ。

# FAB メニュー

M3 Expressive FAB menu。押すと上にラベル付きの行き先が並ぶ。

```html
<div class="fabmenu">
  <button class="fabmenu__item"><svg class="icon">…</svg>写真から</button>
  <button class="fabmenu__item"><svg class="icon">…</svg>手で入力</button>
  <button class="fab" aria-expanded="true"><svg class="icon">…</svg></button>
</div>
```

**★3〜5個まで★** それ以上ならボトムシートにする。開いている間は FAB の印が ✕ に回る。

---

# テキストフィールド

M3 filled text field / 高さ 56 / 上角 xs / 下線 1px → フォーカスで 2px primary

```html
<div class="field">
  <label class="label" for="f1">名前</label>
  <input class="input" id="f1" placeholder="山田" />
  <p class="field__help">本名でなくてかまいません</p>
</div>

<div class="field">
  <input class="input input--error" aria-invalid="true" />
  <p class="field__error">この名前は使われています</p>
</div>

<input class="input input--outlined" />   <!-- 地を持てない場所 -->
<textarea class="textarea"></textarea>
<select class="select"><option>…</option></select>
<input class="input input--num" value="12,340" />   <!-- 右寄せ・等幅 -->
```

**★`font-size` は `--t-input`（16px）から下げない★**（→ [04-type](04-type.md)）
ラベル → 入力 → 説明 → エラー の順を動かさない。→ [17-forms](17-forms.md)

# 検索欄

```html
<div class="search"><svg class="icon">…</svg><input class="search__input" placeholder="検索" /></div>
```

`--surface-highest` のピル（xl）、高さ 56。押したら全画面の検索（`.searchview`）を開く
のがモバイルの作法。

# コンボボックス

入力しながら絞る選択。**★`<select>` で足りるなら `<select>` を使う★**
選択肢が 10 個を超えて、探すのに文字を打ちたくなるときだけ。

```html
<div class="combo">
  <input class="input" role="combobox" aria-expanded="false" aria-controls="c1" popovertarget="c1" />
  <div popover id="c1" class="menu combo__list">
    <button class="menu__item" aria-selected="true"><b class="combo__hit">とう</b>きょう</button>
  </div>
</div>
```

**JS**: `bindMenu(input, list, { matchWidth: true })` + `keyboardList(...)`
（`lib/overlay.ts`）。一致した部分は**色ではなく太さ**で示す。

# スイッチ / チェックボックス / ラジオ

```html
<input type="checkbox" class="switch" checked />
<label class="check"><input type="checkbox" class="checkbox" checked />既読を含める</label>
<label class="check"><input type="radio" name="sort" class="radio" checked />新しい順</label>
```

**★`<label class="check">` で包む★** 見た目 20px のままでラベルごと 48px の判定になる。
「今すぐ効く設定」はスイッチ、「決定を押して確定する設定」はチェックボックス。

# スライダー

M3 Expressive slider / トラック 16 / ツマミは**縦棒 4×44**

```html
<input type="range" class="slider" value="40" style="--p: 40%" />
```

```js
sl.oninput = () => sl.style.setProperty('--p', sl.value + '%')   // JS
```

# 日付（カレンダー）

M3 date picker（docked）/ 幅 328 / 日セル 40 の円

```html
<div class="cal">
  <div class="cal__head">
    <button class="cal__month">2026年9月<svg class="icon icon--sm">…</svg></button>
    <button class="iconbtn" aria-label="前の月">…</button>
    <button class="iconbtn" aria-label="次の月">…</button>
  </div>
  <div class="cal__grid">
    <div class="cal__dow">日</div>…
    <button class="cal__day cal__day--other">31</button>
    <button class="cal__day cal__day--today">3</button>
    <button class="cal__day" aria-selected="true">12</button>
  </div>
</div>
```

- 今日 = **枠だけ**、選択中 = **primary の塗り**（M3）
- 期間は `--start` / `--in` / `--end` で角丸を落として帯にする
- 前後の月は `opacity` ではなく文字色を弱める（押せることは変わらない）
- 導出の手順 → [10-new-component](10-new-component.md)

# 時刻

```html
<div class="timefields">
  <input class="timefields__n" value="09" /><span class="timefields__sep">:</span>
  <input class="timefields__n" value="30" />
  <div class="seg" style="--seg-n:2">…AM / PM…</div>
</div>

<div class="dial" style="--deg: 90deg"><div class="dial__hand"></div>…</div>
```

ダイヤルの角度は `--deg`、数字の位置は `--x` / `--y`（**JS**）。
`touch-action: none` が要る。

# 使い捨てコード（OTP）

**★1マス1文字の `<input>` を並べない★** 貼り付け・自動入力・読み上げが全部おかしくなる。
1つの `<input>` を透明にしてマスの上に敷く。

```html
<div class="otp">
  <input class="otp__ghost" inputmode="numeric" autocomplete="one-time-code" maxlength="6" />
  <div class="otp__box">1</div><div class="otp__box otp__box--now"></div>…
</div>
```

# ドロップ領域

```html
<div class="dropzone"><svg class="icon icon--lg">…</svg><span>ここに置く、または選ぶ</span></div>
```

持ってきている間は `.is-over`。**★破線は M3 に無いがここだけ例外★**
実線で描くと「置ける場所」ではなく「空のカード」に見える。

# 評価（星）

```html
<div class="rating">
  <button class="rating__star rating__star--on"><svg class="icon">…</svg></button>…
</div>
<div class="rating rating--sm">…</div>   <!-- 表示だけの小さい版 -->
```

---

# チップ

M3 filter / assist / input chip / 高さ 32 / 角 sm(8)

```html
<div class="chips">
  <button class="chip" aria-pressed="true">食費</button>
  <span class="chips__sep"></span>
  <span class="chip">東京<button class="chip__x" aria-label="外す">…</button></span>
</div>
```

- **★`.chips` に `padding-block: 8px`★** `overflow-x: auto` が `::after` をクリップする
- 縦列の直下では `margin-block` で同量を戻す（→ [05-space](05-space.md)）

# 接続ボタン群

M3 Expressive connected button group。**並んだ中から必ず1つ**の排他選択。

```html
<div class="seg" style="--seg-n: 3; --seg-i: 0">
  <div class="seg__ind"></div>
  <button class="seg__btn" aria-pressed="true">すべて</button>…
</div>
```

- **★`padding: 2px` と `width: calc((100% - 4px) / --seg-n)` は対★**
- **★区画のラベルを絶対に折り返させない★** ピルは1行ぶんの高さで描かれている
- 1行に入らないときは `.seg--rows`（`--seg-rows`）。**`row-gap` を入れない**

# タブ

| 種類 | クラス | 印 |
|---|---|---|
| primary | `.tabs` | 下の 3px（primary、左右 16 インセット） |
| secondary | `.tabs--secondary` | 幅いっぱい（on-surface）。入れ子のとき |
| 横スクロール | `.tabs--scroll` | 幅・位置を **JS** が `--tab-w` / `--tab-x` で渡す |

```html
<div class="tabs" style="--tab-n: 3; --tab-i: 0">
  <button class="tabs__item" aria-selected="true">今月</button>…
  <div class="tabs__ind"></div>
</div>
```

**タブは「場所」、接続ボタン群は「絞り込み」。** 混ぜると「戻る」の意味が壊れる。

---

# カード

| クラス | 地 | 影 |
|---|---|---|
| `.panel` | surface-mid | なし |
| `.panel--outlined` | surface-low + 枠 | なし |
| `.panel--elevated` | surface-low | elev-1 |

```html
<div class="panel"><div class="panel__body"><strong>見出し</strong><span class="muted">補助文</span></div></div>
```

# リスト

M3 list item / 1行 56 / 2行 72 / 区切りは outline-variant 1px を 16 インセット

```html
<div class="panel">
  <div class="rowlist">
    <button class="row row--link">
      <svg class="icon">…</svg>
      <div class="row__main"><span class="row__title">主文</span><span class="row__sub">副題</span></div>
      <span class="row__value">1,200</span>
      <svg class="row__chevron">…</svg>
    </button>
    <div class="row row--on">選択中</div>
  </div>
</div>
```

- **★区切りは `border` ではなく背景で描いてある★** 行の高さを変えないため
- `.row__main` は `flex: 1; min-width: 0`。無いと長い文字列で行が溢れる

# 木

```html
<div class="rowlist tree">
  <button class="row row--link tree__item" style="--depth: 0" aria-expanded="true">
    <span class="tree__toggle"><svg class="icon icon--sm">…</svg></span>
    <div class="row__main"><span class="row__title">書類</span></div>
  </button>
  <button class="row row--link tree__item" style="--depth: 1">
    <span class="tree__leaf"></span>…
  </button>
</div>
```

# 表

**★モバイルでは表を使わない★** 360px に列は2つしか入らない。
携帯では `.rowlist` に畳み、expanded 幅から表にする。→ [18-data](18-data.md)

```html
<div class="table-wrap scroller">
  <table class="table">
    <thead><tr>
      <th class="table__stick">名前</th>
      <th><button class="table__sort" aria-sort="descending">金額<svg class="icon icon--sm">…</svg></button></th>
    </tr></thead>
    <tbody><tr aria-selected="false">
      <td class="table__stick">家賃</td><td class="table__num">72,000</td>
    </tr></tbody>
  </table>
</div>
```

見出しは `sticky`。数値の列は `.table__num`（右寄せ・等幅）。詰めたいときは `.table--dense`。

# カルーセル

```html
<div class="carousel">
  <div class="carousel__item"><div class="ratio">…</div></div>…
</div>
<div class="dots"><span class="dots__d" aria-current="true"></span>…</div>
```

`scroll-snap` で吸着。**M3 Expressive の multi-browse（端が押し潰れる）は真似ない。**

# 縦横比の器 / スクロール域

```html
<div class="ratio" style="--ratio: 4/3"><img src="…" /></div>
<div class="scroller scroller--fade" style="max-height: 240px">…</div>
```

`.ratio` が無いと、画像が届いた瞬間に下の内容が飛ぶ。

# スワイプで削除

```html
<div class="swiperow">
  <div class="swiperow__bg">離すと削除</div>
  <div class="swiperow__content"><div class="row">…</div></div>
</div>
```

**JS**: 指の量だけ `translateX`、幅の 40% で `.swiperow--armed`。
→ [12-gestures](12-gestures.md)

---

# メニュー / ポップオーバー / ツールチップ / 開閉 / コマンドパレット

→ [16-overlays](16-overlays.md) に用途・HTML・キーボード操作がまとまっている。

```html
<button class="iconbtn" popovertarget="m1" aria-expanded="false">…</button>
<div popover id="m1" class="menu">
  <button class="menu__item">複製<span class="menu__trailing">⌘D</span></button>
  <div class="menu__sep"></div>
  <button class="menu__item menu__item--danger">削除</button>
</div>
```

出し入れは **Popover API** に任せる。位置決めだけ `lib/overlay.ts`。

---

# ボトムシート / サイドシート / ダイアログ

```html
<div class="scrim"></div>
<div class="sheet">
  <div class="sheet__grab"><div class="sheet__handle"></div><h2 class="sheet__title">並べ替え</h2></div>
  <div class="sheet__body">…</div>
</div>
```

| | いつ |
|---|---|
| `.sheet`（下から） | 選択肢を出す・値を入れる。**モバイルの既定** |
| `.sidesheet`（右から） | 本文を見ながら触りたいもの（絞り込み・詳細）。expanded 幅では横に並べる |
| `.dialog` | **本当に戻せないものだけ**。取り消せる操作はスナックバーの「元に戻す」 |
| `.dialog--alert` | 印付き。中央揃え |
| `.dialog--scroll` | 中身が長いとき。頭と足を固定して中だけ流す |

- **★`.sheet` は `bottom: 0` を死守★** JS が `offsetHeight` を移動距離に使う
- **★掴める要素に CSS の `@keyframes` を足さない★** `freezeInto()` が全部 cancel する

---

# バッジ / 空状態 / 通知 / 骨 / スナックバー

```html
<span class="badge badge--alert">超過</span>

<div class="empty">
  <span class="empty__title">まだ何もありません</span>
  <span>最初のひとつを追加すると、ここに並びます</span>
  <button class="btn btn--filled">追加する</button>
</div>

<div class="notice notice--alert">
  <strong>保存できませんでした</strong>
  <span class="muted">通信が切れています</span>
  <button class="btn btn--sm">もう一度試す</button>
</div>

<div class="skel-group"><div class="skel" style="width:60%;height:14px"></div></div>

<div class="toasts">
  <div class="toast"><span class="toast__text">1件を削除しました</span>
    <button class="toast__action">元に戻す</button></div>
</div>
```

→ [11-states](11-states.md)。スナックバーは**画面の上**に出す（下端は親指の通り道）。

---

# 進み具合

```html
<div class="meter">
  <div class="meter__head"><span>今月の予算</span><span class="mono">62%</span></div>
  <div class="meter__track"><div class="meter__fill" style="width: 62%"></div></div>
</div>

<div class="ring-wrap"><div class="ring" style="--p: 62"></div><span class="ring__label">62</span></div>

<div class="loader-chip"><svg class="loader loader--on" viewBox="0 0 100 100"><path class="loader__shape"></path></svg></div>

<div class="steps">
  <div class="steps__item steps__item--done"><span class="steps__dot">✓</span>入力</div>
  <div class="steps__line steps__line--done"></div>
  <div class="steps__item steps__item--now"><span class="steps__dot">2</span>確認</div>
</div>

<div class="timeline">
  <div class="timeline__item"><div class="timeline__dot"></div>
    <div class="timeline__body"><span class="timeline__when">09:30</span><span>受け取った</span></div></div>
</div>
```

`.ring` / `.meter__fill--over` は 100% 超えで error。読み込みの印は
`attachLoader(pathEl)`（**JS**）。全画面スピナーは禁止。

---

# 引いて更新


**`.app` の直下に置く**（`.main` の中ではない）。`position: absolute` で
バーの真下に構え、印だけがバーの下から降りてくる。

```html
<div class="ptr">
  <div class="loader-chip">
    <svg class="loader" viewBox="0 0 100 100"><path class="loader__shape"></path></svg>
  </div>
</div>
```

```ts
import { attachPullToRefresh } from './lib/ptr'

attachPullToRefresh(document.querySelector('.main'), document.querySelector('.ptr'), async () => {
  await reload()   // Promise が解決するまで印が回り続ける
})
```

- **★一覧ごと下げない★** 離した瞬間に中身が跳ねて「どこを読んでいたか」が消える。
  動くのは印だけ
- **★`.loader--on` は回り始めてから付ける★** 引いている間は回さない。
  形の進み具合だけが指に付いてくる（`loader.setProgress()`）
- 印が隠れている位置は `.ptr .loader-chip` の `margin-top: -56px`。
  `lib/ptr.ts` の `HIDDEN` と**対**なので、片方だけ変えない
- しきい値に到達した**瞬間だけ** `haptic('light')`。引いている間は鳴らさない
- → [12-gestures](12-gestures.md#引いて更新)

---

# 会話 / 写真と動画 / 残りもの

→ [20-chat](20-chat.md)（吹き出し・入力帯・ストリーミング）
→ [21-media](21-media.md)（グリッド・全画面ビューア・共有要素・動画）
→ [22-icons](22-icons.md)（Lucide の焼き込み方と規約）

ログイン画面（`.login`）・ドラッグ並べ替え（`.sortable` + `lib/sortable.ts`）・
予定表・印刷（`print.css`）は `components-extra.css` と `print.css`。
図鑑で見るのがいちばん早い。

**予定表は幅で使い分ける。** 携帯（〜599）は日ごとの一覧 `.agenda`、
600 以上は週の時間割 `.week`。月のマス目は作らない（携帯で読めない）。

- `.week` は `48px repeat(7, minmax(0,1fr))` の格子。1行 = 1時間（44px）
- 予定の箱 `.week__ev` の上端と高さは **JS が `--top` / `--h`（px）で渡す**。
  CSS に時刻の知識を持たせない
- **★いまの時刻の線 `.week__now` は、今日の列の `.week__cell` の中に置く★**
  `.week` 自身は `position` を持たないので、外に置くと基準が `.app` になって
  画面ごと突き抜ける
- 種類の色は `--accent`（既定 `--primary`）。`.agenda__item` と同じ作法

---

# アバター / 数値 / 本文 / コード / 図

```html
<span class="avatar">山</span>
<span class="avatar avatar--lg"><img src="…" /></span>
<div class="avatars"><span class="avatar avatar--sm">A</span><span class="avatar avatar--sm">B</span></div>

<div class="stat"><span class="muted">今月</span><span class="stat__hero mono">128,400</span></div>

<article class="prose">…markdown を描いたもの…</article>
<pre class="code">npm run gen:scheme</pre>
<span class="kbd">⌘</span><span class="kbd">K</span>

<svg class="chart" viewBox="0 0 320 160">
  <path class="chart__line" data-series="1" d="…" />
  <path class="chart__line" data-series="2" d="…" />
</svg>
<div class="legend"><span class="legend__item"><span class="legend__key"></span>支出</span></div>
```

- `.prose` の中**だけ**は要素セレクタで書く（生成された HTML にクラスを付けられないため）
- **コピーさせたい文字には `.selectable`。** `base.css` が画面全体の選択を切って
  あるので、住所・注文番号・エラーの詳細などは付けないと長押しても選べない
  （`.mono` / `.code` / `.prose` / 吹き出しの中は戻してあるので不要）
  → [04-type](04-type.md#文字を選ばせるselectable)
- 図の色は `--series-1`〜`5`。**★4系列を超えたら色で分けるのを諦める★** → [18-data](18-data.md)
