# 19. shadcn/ui からの対応表

「shadcn/ui の ◯◯ に当たるものは？」を引くための表。
AI に既存の設計（shadcn 前提のワイヤーフレームや指示）を渡すときに使う。

**★1対1に置き換えない★** M3 では「携帯ではシート、PC ではメニュー」のように
画面幅で別の部品になるものがある。備考を読むこと。

| shadcn/ui | このキット | 備考 |
|---|---|---|
| Accordion | `.accordion`（`<details>`） | 排他は `<details name>` |
| Alert | `.notice` / `.notice--alert` | 画面上端から降りるものは `.banner` |
| Alert Dialog | `.dialog--alert` | **本当に戻せないものだけ**。ふつうはスナックバーの「元に戻す」 |
| Aspect Ratio | `.ratio` | `--ratio` で比を渡す |
| Avatar | `.avatar` / `.avatars` | |
| Badge | `.badge` | |
| Breadcrumb | `.crumbs` | **携帯では出さない** |
| Button | `.btn`（6種 × 3寸法） | 既定は tonal。filled は1画面に1つ |
| Calendar | `.cal` | |
| Card | `.panel`（3種） | 既定は影なし |
| Carousel | `.carousel` + `.dots` | |
| Chart | `.chart` + `--series-*` | → [18-data](18-data.md) |
| Checkbox | `.checkbox`（`.check` で包む） | |
| Collapsible | `.accordion__item` 単体 | |
| Combobox | `.combo` | `<select>` で足りるなら `<select>` |
| Command | `.command` | 携帯では `.searchview` |
| Context Menu | `.menu` + `bindContextMenu()` | 長押しでも開く |
| Data Table | `.table` + `.table-wrap` | **携帯では `.rowlist` に畳む** |
| Date Picker | `.cal` を `.popover` / `.sheet` に入れる | まず相対のチップを出す |
| Dialog | `.dialog` | 携帯の既定は `.sheet` |
| Drawer（Vaul） | `.sheet` | 掴んで下ろせる |
| Dropdown Menu | `.menu` + `bindMenu()` | **携帯では `.sheet`** |
| Form | `.field` / `.field-row` | → [17-forms](17-forms.md) |
| Hover Card | `.popover` | 触る画面には hover が無い |
| Input | `.input` | 16px を下回らせない |
| Input OTP | `.otp` | 1マス1 input にしない |
| Label | `.label` | |
| Menubar | （無い） | 画面上端の横並びメニューは M3 に無い。`.appbar` + `.menu` にする |
| Navigation Menu | `.drawer` / `.rail` / `.navbar` | 画面幅で切り替える → [15-adaptive](15-adaptive.md) |
| Pagination | `.pager` | **一覧では使わない**（無限スクロール） |
| Popover | `.popover` | |
| Progress | `.meter`（線）/ `.ring`（環） | |
| Radio Group | `.radio`（`.check` で包む） | 3つ以下で短い札なら `.seg` |
| Resizable | （無い） | 分割の掴みは M3 に無い。固定幅の pane にする |
| Scroll Area | `.scroller` | 触る画面ではつまみを出さない |
| Select | `.select`（ネイティブ） | 10個超なら `.combo` |
| Separator | `.divider` / `.divider--label` | |
| Sheet（横から） | `.sidesheet` | 下からは `.sheet` |
| Sidebar | `.drawer--standard` / `.rail` | |
| Skeleton | `.skel` | 角丸を 4px から上げない |
| Slider | `.slider` | ツマミは縦棒（M3 Expressive） |
| Sonner / Toast | `.toast` / `.toasts` | **画面の上**に出す |
| Switch | `.switch` | |
| Table | `.table` | |
| Tabs | `.tabs`（3種） | 絞り込みは `.seg` |
| Textarea | `.textarea` | |
| Toggle | `.togglebtn` | |
| Toggle Group | `.togglegroup`（複数）/ `.seg`（排他） | |
| Tooltip | `.tip` / `.tip--rich` | **触る画面には出さない** |
| Typography | `.prose` + type scale | → [04-type](04-type.md) |

## shadcn に無くてこちらにあるもの

M3 の作法として要るもの。指示に出てこなくても、必要なら足してよい。

| 部品 | クラス | 何のため |
|---|---|---|
| トップアプリバー | `.appbar` | 潜ると色が変わる（影は付けない） |
| ナビゲーションバー | `.navbar` | 携帯の行き先。ピルが滑る |
| ナビゲーションレール | `.rail` | medium 幅の行き先 |
| ボトムアプリバー | `.bottombar` | その画面の操作を下端に |
| FAB / FAB メニュー | `.fab` / `.fabmenu` | 画面の主要な追加 |
| 分割ボタン | `.splitbtn` | 主な操作 + ほかの選択肢 |
| 接続ボタン群 | `.seg` | 排他選択。ピルが滑る |
| チップ | `.chip` | 絞り込み・タグ |
| 浮くツールバー | `.toolbar` | 選択モードの一括操作 |
| スワイプで削除 | `.swiperow` | 行ごとの ✕ を置かない |
| 引いて更新 | `.ptr` + `.loader` | shadcn に無い。`lib/ptr.ts` が要る |
| 読み込みの印 | `.loader` | 形が変わりながら回る |
| ドロップ領域 | `.dropzone` | |
| 評価 | `.rating` | |
| 手順・年表 | `.steps` / `.timeline` | |
| 木 | `.tree` | |
| 色見本 | `.swatch` | テーマのシードを選ばせる |
| 全画面の検索 | `.searchview` | 携帯のコマンドパレット |
| チャット | `.chat` / `.msg` / `.composer` | 会話は一覧ではない |
| 写真グリッド・全画面ビューア | `.gallery` / `.viewer` | 共有要素で飛ぶ |
| 動画の操作 | `.player` | ネイティブの controls を出さない |
| ログイン画面 | `.login` | |
| ドラッグ並べ替え | `.sortable` | HTML5 の DnD は使わない |
| 予定表 | `.agenda`（携帯） / `.week`（600〜） | 月のマス目は携帯で読めない |
| 印刷 | `print.css` | 紙は「触れない画面」 |
| アイコン | Lucide 焼き込み | shadcn も Lucide。**そのまま同じものが使える** |

## 考え方の違い

| | shadcn/ui | このキット |
|---|---|---|
| 形 | Radix + Tailwind のクラス | **素の CSS クラス**。どの枠組みでも同じ |
| 中身 | React コンポーネントをコピーする | **CSS をコピーし、HTML は自分で書く** |
| 前提 | PC 優先 | **携帯優先**。PC は `.app--adaptive` で足す |
| 押下 | `scale` / `opacity` | **形が変わる**（shape morph） |
| 層 | 影・半透明・ぼかし | **明度の5段**。ぼかしは1箇所も使わない |
| 動き | duration + easing | **バネ**（M3 motion scheme） |
| 色 | CSS 変数を手で決める | **シード1色から生成**。hex を手で書かない |
| 開閉 | Radix の JS | **Popover API / `<details>`**。ブラウザに任せる |

**★shadcn の指示をそのまま実装しない★**
「Dialog を出す」と書かれていても、携帯なら `.sheet` が正しいことが多い。
[01-principles](01-principles.md) の5原則が上位にある。
