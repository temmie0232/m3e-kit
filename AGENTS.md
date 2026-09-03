# このリポジトリの使い方（AI コーディングエージェント向け）

あなたは Web アプリの UI を書こうとしている。このリポジトリは、その UI を
**Material 3 Expressive** に揃えるための仕様書と、そのままコピーできる実体一式。

Google は M3 Expressive の Web 向け公式実装を出していない（`@material/web` は
保守モードで Expressive 非対応）。だから **CSS で自前に起こす**。
ここに書いてあるのは「その起こし方」であって、ライブラリの API ではない。

---

## 0. 最初にやること（順番を守る）

1. `starter/` を対象プロジェクトにコピーする（§1）
2. `docs/01-principles.md` を読む。**ここに書いてある5つの原則に反する実装をしない**
3. これから作る画面に関係する章だけ読む。全部読む必要はない
4. カタログ（`docs/09-components.md`）に**無い**部品を作るときは、
   必ず `docs/10-new-component.md` の導出手順に従う。自分で値を発明しない
5. 書き終わったら `docs/13-checklist.md` で自己検証し、結果を報告する

---

## 1. 対象プロジェクトへの入れ方

```
starter/styles/   →  <project>/src/styles/
starter/lib/      →  <project>/src/lib/
starter/scripts/  →  <project>/scripts/
```

エントリで CSS を1本読み、起動時に2つ呼ぶだけ:

```ts
import './styles/components.css'   // base.css → tokens.css → m3-scheme.css まで芋づるで入る
import { initTheme } from './lib/theme'
import { watchPress } from './lib/press'
import { watchMotionPrefs } from './lib/motion'

initTheme()        // 明暗とシードを復元し、アドレスバーの色も合わせる
watchPress()       // pointerdown で .is-pressed を付ける（押下の即時反応）
watchMotionPrefs() // 本物のバネ曲線を --ease-* / --d-* に焼く
```

CSS だけでも成立する。`lib/` を入れないと失われるのは
「押した瞬間の反応」「本物のバネ」「形が変わる読み込みの印」の3つで、
配色・形・字・間隔は CSS だけで全部効く。

配色を変えたいときは `starter/scripts/gen-m3-scheme.mjs` の `SEEDS` を直して
`npm run gen:scheme`（詳細は `starter/README.md`）。**hex を手で書かない。**

React でもプレーンな HTML でも Vue でも同じ。`docs/09-components.md` の実装例は
素の HTML + CSS で書いてあり、JS が要る部分だけ注記がある。

---

## 2. 絶対規則（違反したらレビューで落とす）

| | |
|---|---|
| ❌ | `backdrop-filter`（ぼかし）を書く。層は明度と影で作る |
| ❌ | 押下で `scale` / `opacity` を変える。**形**（border-radius）と状態レイヤーで返す |
| ❌ | 手書きの hex 色。写真・動画の上に置くものだけが例外 |
| ❌ | `linear` イージング（無限に回るものだけ例外）、300ms 超の `ease-in-out` |
| ❌ | 0.5px の hairline。区切りは `--outline-variant` 1px か余白 |
| ❌ | `primary-container` の上に `primary` の文字（同系でコントラスト不足） |
| ❌ | 和文に負の `letter-spacing`、`text-transform: uppercase` |
| ❌ | 全画面スピナー、「エラーが発生しました」だけのメッセージ |
| ❌ | トークンに無い数値の直書き。必要なら理由をコメントに書く |
| ✅ | 色は `--primary` / `--surface-mid` … の**役割名**でだけ書く |
| ✅ | 兄弟の間隔は `gap`。個別の `margin` を足さない |
| ✅ | 札（ボタン・チップ・タブ・区画）は `white-space: nowrap` |
| ✅ | タップ要素は 48×48 以上。見た目が小さいものは `::after` で判定だけ広げる |

---

## 3. 章の地図（必要なところだけ読む）

| 章 | いつ読むか |
|---|---|
| [01-principles](docs/01-principles.md) | **必ず。** 5つの原則とやらないことリスト |
| [02-color](docs/02-color.md) | 色を選ぶとき。役割 → 使い場所の対応表 |
| [03-shape](docs/03-shape.md) | 角丸を決めるとき。shape morph の作法 |
| [04-type](docs/04-type.md) | 文字の大きさを決めるとき。**和文の折り返しの罠** |
| [05-space](docs/05-space.md) | 余白を決めるとき。**gap と margin の足し算事故** |
| [06-elevation](docs/06-elevation.md) | 面を重ねるとき。影を敷いてよい条件 |
| [07-motion](docs/07-motion.md) | 動かすとき。バネ・共有要素・視差低減 |
| [08-layout](docs/08-layout.md) | 画面の外殻を組むとき。バー・z-index・スクロール |
| [09-components](docs/09-components.md) | **部品カタログ。** HTML + CSS の実装例 |
| [10-new-component](docs/10-new-component.md) | **カタログに無いものを作るとき。必ず読む** |
| [11-states](docs/11-states.md) | 読み込み中・空・エラー・楽観的更新 |
| [12-gestures](docs/12-gestures.md) | 指で触るものを作るとき。ハプティクス |
| [13-checklist](docs/13-checklist.md) | 書き終わったとき |
| [14-prompts](docs/14-prompts.md) | 人間があなたに渡す指示文の雛形 |

---

## 4. 判断に迷ったときの既定値

聞かれていないことを勝手に増やさない。ただし、以下は**聞かずにこれにしてよい**。

| 迷い | 既定 |
|---|---|
| ボタンの種類 | tonal（`.btn`）。画面の主要操作 1 つだけ filled（`.btn--filled`） |
| カードの地 | `--surface-mid`、角 16、**影なし** |
| 選択されている状態 | `--secondary-container` |
| 破壊的な操作 | tonal の error 版（`.btn--danger`）。文字色ではなく面で言う |
| 確認を出すか | 出さない。実行してスナックバーに「元に戻す」を置く。本当に戻せないときだけダイアログ |
| 一覧の読み込み | 骨（`.skel`）。スピナーは出さない |
| 画面の余白 | 話題の切れ目 24 / 同じ話題の中 16。**1画面で2種類まで** |
| 一覧 → 詳細 | 同じ画面内で開けるならボトムシート。階層が変わるなら画面遷移 |

---

## 5. 見た目を確認する

`demo/index.html` がこのリポジトリの全部品を1枚に並べた見本帳。
書いてある値と目に見えるものが必ず一致するように、`starter/` の CSS を
そのまま読んでいる（デモ用に色や寸法を書き直していない）。

```
npm run demo   →  http://localhost:8080/demo/
```

★リポジトリのルートから配ること★ デモは `../starter/styles/` を相対パスで読む。

新しく部品を足したら、**見本帳にも足す**。目で確かめられない部品は壊れる。
