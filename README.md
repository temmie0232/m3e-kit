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
docs/              説明書（14章）
starter/           そのままコピーして使う実体
  styles/
    m3-scheme.css    生成物。--md-sys-color-*（7シード × ライト/ダーク）
    tokens.css       短い別名 + 形・字・間隔・動き・外殻の幾何
    base.css         reset と「Webページの顔」を消す設定
    components.css   部品の実体（約 1,500 行）
  lib/
    motion.ts        M3 のバネを linear() に焼く / 速度追跡 / 中断可能な動き
    loader.ts        形が変わる読み込みの印
    press.ts         pointerdown で .is-pressed（押下の即時反応）
    theme.ts         明暗とシードの適用・保存
    seeds.ts         生成物。シードの一覧
  scripts/
    gen-m3-scheme.mjs  シード色から配色を算出して CSS に静的化する
demo/index.html    見本帳。全部品を1枚に並べたもの（依存なし）
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
| [09 部品カタログ](docs/09-components.md) | 29 部品の HTML + 契約 |
| [10 新しい部品の作り方](docs/10-new-component.md) | **カタログに無いものを導出する9問** |
| [11 状態](docs/11-states.md) | 読み込み中・空・エラー・楽観的更新 |
| [12 ジェスチャー](docs/12-gestures.md) | 1:1 追従、ラバーバンド、ハプティクス |
| [13 チェックリスト](docs/13-checklist.md) | 実装後の自己検証 |
| [14 指示文の雛形](docs/14-prompts.md) | AI に渡す文面 |

---

## 見本帳を開く

```sh
npm run demo    # → http://localhost:8080/demo/
```

★リポジトリのルートから配ること★ デモは `../starter/styles/` を相対パスで読む。
書いてある値と目に見えるものが必ず一致するように、デモ用に色や寸法を
書き直していない。

見本帳では、シードを7色から選べて、明暗も切り替えられる。

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
