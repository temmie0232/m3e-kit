# m3e-kit

**Material 3 Expressive を Web に起こすための説明書とコピー元一式。**

新しい Web アプリを作るとき（特に AI に作らせるとき）に、これ一式を参照させれば
同じ見た目・同じ触り心地になる、というのが目的。

Google は M3 Expressive の Web 向け公式実装を出していない
（`@material/web` は保守モードで Expressive 非対応）。
だから CSS で自前に起こしてある。ここにあるのは**その起こし方**。

出どころは nas-app（自宅サーバのアプリ）の UI。実運用で踏んだ罠が
★付きのコメントとしてそのまま残してある。

---

## AI に使わせる

これだけ渡す:

```
UI は Material 3 Expressive で作る。仕様書とコピー元一式が
<path>/m3e-kit にあるので、まず <path>/m3e-kit/AGENTS.md を読むこと。
```

[AGENTS.md](AGENTS.md) がエージェント向けの入口で、そこから
必要な章だけを選んで読む作りになっている。
そのほかの指示文の雛形は [docs/14-prompts.md](docs/14-prompts.md)。

---

## 中身

```
AGENTS.md          ★AI の入口★ 読む順・絶対規則・既定値
docs/              説明書（22章）
starter/           そのままコピーして使う実体
  styles/
    m3-scheme.css      生成物。--md-sys-color-*（7シード × ライト/ダーク）
    tokens.css         短い別名 + 形・字・間隔・動き・外殻の幾何・画面幅
    base.css           reset と「Webページの顔」を消す設定
    components.css     ★入口★ base と下の9本を順に束ねる（★順番を変えない★）
    components-core    骨組み・バー・ボタン・入力・選択・面と行・知らせ
    components-nav     レール・ドロワー・サイドシート・パンくず・ページ送り
    components-overlay メニュー・ポップオーバー・ツールチップ・開閉・⌘K
    components-form    コンボボックス・日付/時刻・OTP・トグル・分割ボタン
    components-data    アバター・表・カルーセル・木・手順・年表・図・本文
    components-chat    会話（吹き出し・入力帯・ストリーミング）
    components-media   写真と動画（グリッド・ビューア・共有要素）
    components-extra   ログイン画面・ドラッグ並べ替え・予定表
    print.css          紙とPDF
  icons/sprite.svg   生成物。Lucide から焼いた 106 個
  lib/
    motion.ts        M3 のバネを linear() に焼く / 速度追跡 / 中断可能な動き
    loader.ts        形が変わる読み込みの印
    ptr.ts           引いて更新（印だけがバーの下から降りてくる）
    press.ts         pointerdown で .is-pressed（押下の即時反応）
    overlay.ts       メニュー・候補の位置決めと ↑↓ の操作
    flight.ts        共有要素で飛ぶ（一覧 → 全画面）
    sortable.ts      ドラッグで並べ替える（HTML5 の DnD は使わない）
    theme.ts         明暗とシードの適用・保存
    seeds.ts / icons.ts   生成物（シードの一覧 / アイコン）
  scripts/
    gen-m3-scheme.mjs  シード色から配色を算出して CSS に静的化する
    gen-icons.mjs      Lucide から使うアイコンだけ焼く
demo/              ★部品図鑑★ 全部品が実際に動き、HTML をコピーできる
  index.html         図鑑の枠組み
  catalog.js         82 部品のデータ（html はここに1度だけ書く）
  site.js            索引・検索・プレビュー（iframe）・コード表示
  site.css / icons.js
```

### 章

| | |
|---|---|
| [01 大原則](docs/01-principles.md) | 5つの原則・やらないことリスト |
| [02 色](docs/02-color.md) | 役割 → 使い場所、状態レイヤー、明暗の切替 |
| [03 形](docs/03-shape.md) | shape scale、shape morph |
| [04 字](docs/04-type.md) | type scale、**和文の折り返しの罠** |
| [05 間隔](docs/05-space.md) | 4px 基準、**gap と margin の足し算事故** |
| [06 高さ](docs/06-elevation.md) | 面の5段、影を敷いてよい条件 |
| [07 動き](docs/07-motion.md) | バネ、共有要素、読み込みの印、視差低減 |
| [08 外殻](docs/08-layout.md) | バー、z-index、Safe Area |
| [09 部品カタログ](docs/09-components.md) | **82 部品**の一覧表 + HTML + 契約 |
| [10 新しい部品の作り方](docs/10-new-component.md) | **カタログに無いものを導出する9問** |
| [11 状態](docs/11-states.md) | 読み込み中・空・エラー・楽観的更新 |
| [12 ジェスチャー](docs/12-gestures.md) | 1:1 追従、ラバーバンド、ハプティクス |
| [13 チェックリスト](docs/13-checklist.md) | 実装後の自己検証 |
| [14 指示文の雛形](docs/14-prompts.md) | AI に渡す文面 |
| [15 適応レイアウト](docs/15-adaptive.md) | 画面幅クラス、レール/ドロワーの切替、pane |
| [16 重ねるもの](docs/16-overlays.md) | メニュー・ポップオーバー・ツールチップ・⌘K |
| [17 入力の設計](docs/17-forms.md) | 並び・型・検証・保存・日付・OTP・ファイル |
| [18 一覧・表・図](docs/18-data.md) | 表を携帯で使わない理由、系列色、仮想化 |
| [19 shadcn 対応表](docs/19-shadcn-map.md) | shadcn/ui の名前から引く |
| [20 会話](docs/20-chat.md) | 吹き出し・入力帯・ストリーミング・AI の返答 |
| [21 写真と動画](docs/21-media.md) | グリッド・全画面ビューア・共有要素・動画 |
| [22 アイコン](docs/22-icons.md) | Lucide の焼き込み方と規約 |

---

## 部品図鑑を開く

```sh
npm run demo    # → http://localhost:8080/demo/
```

★リポジトリのルートから配ること★ 図鑑は `../starter/styles/` を相対パスで読む
（`demo/` を配信ルートにすると 404 になる）。

- 左の索引で 82 部品を探す。`⌘K` で検索へ。
  日本語名・英語名・**shadcn の名前**・別名のどれでも引ける
- プレビューは **iframe**。幅を **360 / 720 / 1100** に切り替えられるので、
  PC のブラウザのまま「携帯で崩れるか」と適応レイアウトを確認できる
  （`position: fixed` のシート・スナックバー・バー類も正しく出る）
- シード7色と明暗を上の帯で切り替えられる
- 各部品に「守ること（★）」と、**そのままコピーできる HTML**
- `#<id>` で直接開ける（例 `/demo/#seg`、`/demo/#table`）

**書いてある値と目に見えるものは必ず一致する。** 図鑑は `starter/` の CSS を
そのまま読み、html は `catalog.js` に1度だけ書いたものがプレビューと
コード欄の両方になる。

## shadcn/ui から来た人へ

部品の対応表がある → [docs/19-shadcn-map.md](docs/19-shadcn-map.md)

考え方の違いは3つ。**CSS クラスだけを配る**（React コンポーネントではない）、
**携帯優先**（PC は `.app--adaptive` で足す）、
**開閉はブラウザに任せる**（Popover API と `<details>`）。

---

## 配色を変える

```sh
npm i                 # 初回だけ
# starter/scripts/gen-m3-scheme.mjs の SEEDS を直す
npm run gen:scheme
```

→ [starter/README.md](starter/README.md)

---

## 方針

- **ぼかしを使わない。** 層は明度（surface の5段）と影で作る
- **押下は形で返す。** 縮めない・透けさせない
- **動きはバネ。** 時間 + 曲線ではない
- **色は生成する。** hex を手で書かない
- **フォントを同梱しない。** 端末の書体に落とす（等幅を除く）
- **配色を実行時に計算しない。** ビルド前に CSS へ静的化する
