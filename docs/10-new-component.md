# 10. カタログに無い部品の作り方

カタログ（[09-components](09-components.md)）は「よく出るもの」しか載せていない。
実際のアプリにはカレンダー・カルーセル・ツリー・時刻ピッカー・タイムライン・
アバター・ステッパー・データ表など、いくらでも別の部品が要る。

**そのとき値を発明しない。** M3 Expressive は「部品の一覧」ではなく
**体系**なので、下の9問に順番に答えれば、載っていない部品も必ず導出できる。

---

## 導出の9問

### Q1. これは既存の部品の言い換えではないか

まずここを疑う。新しい部品だと思ったものの大半は、既にあるものの別名。

| 作りたいもの | 実は |
|---|---|
| アコーディオン | `.row`（押せる行）+ 開閉する `.panel__body` |
| ドロップダウンメニュー | `.menu`（PC）/ `.sheet`（携帯） |
| ツールチップ | `.tip`。触る画面には**出さない** |
| ステッパー（数量の増減） | `.iconbtn` 2つ + `.mono` の数字 |
| アバター | `.avatar` |
| トースト以外の通知 | `.notice` または `.banner` |
| タグ入力 | `.chip` + `.chip__x` |
| ページネーション | 一覧なら要らない（無限スクロール + 引いて更新）。表なら `.pager` |
| モーダル | `.sheet`（携帯）/ `.dialog`（戻せない確認だけ） |
| ラジオのグループ | `.check` の並び、または `.seg`（3つ以下・短い札のとき） |
| サイドバー | `.drawer--standard` / `.rail`（→ [15-adaptive](15-adaptive.md)） |
| データテーブル | `.table`（携帯では `.rowlist` に畳む） |
| 空きスペースの読み込み中 | `.skel` |
| 進捗のリング | `.ring`（`--p` を渡す） |

**言い換えだったら、既存のクラスを組み合わせて終わり。** 新しい CSS を書かない。

### Q2. これは「何」か — 役割を1語で決める

| 役割 | 意味 |
|---|---|
| **面**（container） | 中身を載せる器。カード・シート・パネル |
| **行**（list item） | 並ぶもの。一覧の1件 |
| **札**（label / chip / button） | 押せる小さいもの |
| **入力**（field） | 値を受け取るもの |
| **知らせ**（feedback） | 状態を伝えるもの。バッジ・通知・スナックバー |
| **外殻**（chrome） | バー・ナビ・ツールバー |

1つに決まらないなら、それは**2つの部品**。分ける。

### Q3. どの面に載るか → 地の色が決まる

```
画面の地に直接        → --surface-mid（1段上げる）
カードの中            → 地を持たない（透明）。それでも分けたいなら --surface-highest
シートの中            → 地を持たない
選択されている        → --secondary-container
超過・失敗・破壊的     → --error-container
浮いている（影が要る） → --surface-high
入力を受ける          → --surface-highest
```

**文字色は必ず対の `on-` を使う。** `--secondary-container` の上は
`--on-secondary-container`。ここを外すとコントラストが落ちる。

### Q4. 大きさ → 高さと角丸が決まる

高さから角丸を引く。**大きいものほど角丸も大きい。**

| 高さ | 角丸 | 例 |
|---|---|---|
| 〜24 | `--shape-xs`(4) | バッジ、骨、印 |
| 32 | `--shape-sm`(8) | チップ、小さな札 |
| 40〜48 | `--shape-md`(12) または `full` | 小ボタン、アイコンボタン |
| 56〜72 | `--shape-lg`(16) | カード、行、FAB |
| 面全体 | `--shape-xl`(28) | シート・ダイアログの上端 |

押せるものは丸（`--shape-full`）から始めて、押下で1〜2段落とす（→ Q7）。

**器と中身の角丸を同じにしない。** 16 の器の中には 12。

### Q5. 字 → 役割から選ぶ

| 何 | 役割 |
|---|---|
| 押せる札の文字 | label-l（14/500）。タブ・バッジは label-m（12/500） |
| 行の主文 | body-l（16） |
| 補助文・副題 | body-m（14）+ `--on-surface-variant` |
| 見出し | title-s（14/500）+ `--on-surface-variant` |
| 数字 | `--font-num` + `tabular-nums` |

**札なら `white-space: nowrap` + `text-overflow: ellipsis`**（→ [04-type](04-type.md)）。

### Q6. 間隔 → 4px 基準、gap だけ

- 中の余白（padding）: 小さい札は 8/12、行は 12/16、カードは 16
- 兄弟の間隔: `gap`。**個別 `margin` を書かない**
- 1画面の間隔は2種類まで（→ [05-space](05-space.md)）

### Q7. 状態 — 4つ全部を決める

**ここを飛ばした部品は必ず後で壊れる。**

| 状態 | 作り方 |
|---|---|
| 通常 | Q3〜Q6 |
| 押下 | 形が1〜2段変わる + 状態レイヤー（`--pressed-on-surface` を `box-shadow: inset 0 0 0 999px` で）。**縮めない・透けさせない** |
| 選択中 | `--secondary-container`。**色だけにしない** — 太字・太い線のアイコン・形のどれかを併用 |
| 使えない | 地 `rgb(var(--on-surface-rgb) / 0.12)` / 文字 `/ 0.38` |

押せないものに押下を作らない。押せるものには必ず作る。

### Q8. 動き — 何が変わるか

| 変わるもの | transition |
|---|---|
| 位置・大きさ・形 | `var(--d-spatial) var(--ease-spatial)` |
| 押下の形 | `var(--d-spatial-fast) var(--ease-spatial-fast)` |
| 色・不透明度 | `var(--d-effects) var(--ease-effects)` |
| 押し込みの色 | `var(--d-tap) var(--ease-effects)`（90ms 固定） |

動かすのは `transform` / `opacity` / `border-radius` / 色だけ。
指で動かすものはバネで戻す（→ [07-motion](07-motion.md)）。

### Q9. 触れるか — 48px と読み上げ

- 押せるなら 48×48 以上。見た目が小さければ `::after` で判定だけ広げる
  （`position: relative` を忘れない）
- `<button>` で作る。`<div onclick>` にしない
- アイコンだけなら `aria-label`
- 選択状態は `aria-pressed` / `aria-selected` / `aria-current` のどれかで表す
  （CSS もその属性セレクタで書く。独自の `.is-active` を作らない）

---

## 決まったら3つやる

1. `starter/styles/components.css` に**節を作って**書く（1クラス1責務、コメントで意図を残す）
2. `docs/09-components.md` のカタログに追記する
3. **`demo/index.html` の見本帳に足す。** 目で確かめられない部品は壊れる

---

## 例1: カレンダーの日セル

> この導出の結果が `components-form.css` の `.cal__day`。
> 実物はそちらを使う。ここは**答えの出し方**を見せるために残してある。

| 問 | 答え |
|---|---|
| Q1 | 言い換えではない。新規 |
| Q2 | 札（押せる小さいもの） |
| Q3 | 通常は地を持たない（器の中）。今日 = **枠だけ**（`--primary` の 1px）、選択中 = `--primary` の塗り、期間の途中 = `--secondary-container` |
| Q4 | 40×40 → `--shape-full`（丸）。押下で `--shape-md` |
| Q5 | label-l（14/500）。`--font-num` + `tabular-nums`（桁で踊らせない） |
| Q6 | grid の `gap: 2px`。7列 `repeat(7, minmax(0, 1fr))` |
| Q7 | 押下=形+状態レイヤー / 選択中=primary の塗り / 他の月の日=`opacity` ではなく `--outline` の文字色（押せることは変わらない） |
| Q8 | 選択の色を `--d-effects`、押下の形を `--d-spatial-fast`。月送りは横スライドではなくフェード（並列の移動だから） |
| Q9 | 見た目 40 → `::after` で `inset: -4px` にして 48。`aria-selected`、`aria-label="9月3日"` |

```css
.cal__day {
  position: relative;
  min-height: 40px;
  border-radius: var(--shape-full);
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  font-size: var(--t-label-l);
  font-weight: var(--w-medium);
  color: var(--on-surface);
  --day-layer: transparent;
  box-shadow: inset 0 0 0 999px var(--day-layer);
  transition:
    border-radius var(--d-spatial-fast) var(--ease-spatial-fast),
    background-color var(--d-effects) var(--ease-effects),
    color var(--d-effects) var(--ease-effects),
    box-shadow var(--d-tap) var(--ease-effects);
}
/* 見た目 40 → 当たり判定 48 */
.cal__day::after { content: ''; position: absolute; inset: -4px; }
.cal__day:active, .cal__day.is-pressed {
  border-radius: var(--shape-md);
  --day-layer: var(--pressed-on-surface);
}
/* 今日 = 枠だけ。選択中（塗り）と見分けが付くように塗らない */
.cal__day--today {
  box-shadow: inset 0 0 0 1px var(--primary), inset 0 0 0 999px var(--day-layer);
  color: var(--primary);
}
.cal__day[aria-selected='true'] {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: inset 0 0 0 999px var(--day-layer);
}
.cal__day--other { color: var(--outline); }
```

**Q3 で迷ったところ:** 最初は「今日 = primary-container の塗り」と考えたが、
それだと選択中（primary の塗り）と**同じ「塗られた丸」**になって区別できない。
M3 の date picker も今日は枠だけ。**塗りは1画面に1つの意味しか持てない。**

---

## 例2: 横に流れるカルーセル（M3 Expressive carousel）

> こちらも `components-data.css` の `.carousel` として入っている。

| 問 | 答え |
|---|---|
| Q1 | 言い換えではない |
| Q2 | 面の並び |
| Q3 | 各項目は `--surface-mid`。画像を載せるなら地は見えない |
| Q4 | 高さ 160、角 `--shape-lg`(16)。押下では変えない（並んだ矩形が一斉に動くとちらつく） |
| Q5 | 中のラベルは label-l。写真の上なら黒帯 + 白 |
| Q6 | `gap: var(--s-2)`、左右の padding は画面と同じ 16 |
| Q7 | 押下=状態レイヤーのみ |
| Q8 | `scroll-snap-type: x mandatory` で吸着。バネは不要（ブラウザの慣性に任せる） |
| Q9 | 各項目が `<button>`。項目自体が 48 以上なので `::after` は不要 |

```css
.carousel {
  display: flex;
  gap: var(--s-2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  /* ★端の項目を画面端に貼り付けない★ 前後があることを見せる */
  padding-inline: var(--s-4);
  scroll-padding-inline: var(--s-4);
}
.carousel::-webkit-scrollbar { display: none; }
.carousel__item {
  flex: 0 0 auto;
  width: 72%;
  height: 160px;
  scroll-snap-align: start;
  border-radius: var(--shape-lg);
  background: var(--surface-mid);
  overflow: hidden;
}
```

> M3 Expressive の carousel は「端の項目が押し潰れて見える」multi-browse 型が
> 本来の姿だが、CSS だけで作ると項目幅が動いて `scroll-snap` が暴れる。
> **無理に真似ない。** 吸着する等幅の並びで十分に M3 に見える。

---

## 例3: 数値のステッパー（Q1 で終わる例）

「− 3 +」の増減。新しい CSS は**1行も書かない**。

```html
<div class="row">
  <div class="row__main"><span class="row__title">人数</span></div>
  <button class="iconbtn" aria-label="減らす"><svg class="icon">…</svg></button>
  <span class="mono" style="min-width: 2ch; text-align: center">3</span>
  <button class="iconbtn" aria-label="増やす"><svg class="icon">…</svg></button>
</div>
```

`min-width: 2ch` + `tabular-nums` で、桁が変わってもボタンが動かない。

---

## 迷ったときの原則

- **M3 に無い形を発明しない。** M3 に対応するものが本当に無いなら、
  それは「この画面に置くべきでないもの」であることが多い
- **Compose / Flutter の実装を仕様の一次情報にする。** Web に公式実装は無いが、
  仕様（寸法・トーン・バネの値）はそちらに書いてある
- **1つ減らせないか先に考える。** 新しい部品は、たいてい情報を詰め込みすぎた徴候
