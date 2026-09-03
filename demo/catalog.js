/* ============================================================
   部品図鑑のデータ

   ★html は1箇所にしか書かない★ 同じ文字列を
     (1) iframe に流し込んでプレビューにする
     (2) そのままコード欄に出す
   の両方に使う。こうしておかないと「見本と貼り付けたコードが違う」が
   必ず起きる（このリポジトリ全体の方針と同じ）。

   entry:
     id        URL のハッシュになる。変えると共有したリンクが切れる
     name/m3   日本語名 / M3 での呼び方
     group     左の索引での束ね方
     file      実体がある CSS（core / nav / overlay / form / data）
     doc       もっと詳しい説明のある章
     tags      検索に引っかける語（英語名・別名・shadcn の名前）
     note      1〜2文の説明
     contracts ★付きの約束事。守らないと壊れるもの
     frame     'plain'（既定）… body 直下に置く
               'app'          … <div class="app"> で包む（外殻の部品）
     w         プレビューの既定の幅（'auto' | 数値 px）
     h         プレビューの高さ
     html      本体
     init(d,u) 動きが要るときだけ。d = iframe の document、u = 道具箱
   ============================================================ */

export const CATALOG = [
  /* ============================================================ 骨組み */
  {
    id: 'shell',
    name: 'アプリの外殻',
    m3: 'App layout',
    group: '骨組み',
    file: 'core',
    doc: '08-layout',
    tags: 'app main shell layout レイアウト 骨組み scaffold',
    note: '.main が全高を占め、その上にバーを絶対配置で重ねる。中身は padding で避けて下を流れる。位置決めの基準が1つで済む。',
    contracts: [
      '.app に transform / filter を載せない（fixed の基準が .app になり、body 直下へ足した要素の座標がズレる）',
      '上下の占有量は --inset-top / --inset-bottom の2本に集約する',
    ],
    frame: 'app',
    w: 360,
    h: 420,
    html: `<header class="appbar">
  <div class="appbar__side">
    <button class="iconbtn" aria-label="戻る"><svg class="icon"><use href="#i-back"/></svg></button>
  </div>
  <h1 class="appbar__title">タイトル</h1>
  <div class="appbar__side appbar__side--end">
    <button class="iconbtn" aria-label="設定"><svg class="icon"><use href="#i-gear"/></svg></button>
  </div>
</header>

<main class="main main--padded">
  <section class="section">
    <h2 class="label">セクション</h2>
    <div class="panel"><div class="panel__body">
      <strong>中身はバーの下を流れる</strong>
      <span class="muted">スクロールするとバーの色が変わる</span>
    </div></div>
  </section>
  <div class="panel"><div class="panel__body" style="height:260px">下まで伸ばした面</div></div>
</main>

<button class="fab" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>

<nav class="navbar" style="--nav-n:3">
  <div class="navbar__ind"></div>
  <button class="navbar__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg>ホーム</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-search"/></svg>さがす</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-gear"/></svg>設定</button>
</nav>`,
    init(d, u) {
      u.scrollBar(d)
      u.exclusive(u.$('.navbar', d), '.navbar__item', '--nav-i', 'aria-current')
    },
  },

  {
    id: 'appbar',
    name: 'トップアプリバー',
    m3: 'Top app bar (center-aligned)',
    group: '骨組み',
    file: 'core',
    doc: '08-layout',
    tags: 'appbar header navbar toolbar タイトル ヘッダ',
    note: '高さ 64。最上部は地と同じ色で、中身が下に潜ると surface-container に変わる。影は付けない — M3 は色の変化だけで潜りを表す。',
    contracts: [
      'しきい値をまたいだときだけ class を触る（毎フレーム toggle するとスタイル再計算が走り続ける）',
      '両端を 1fr の3列 grid にして、中身の有無に関わらずタイトルを中央に固定する',
    ],
    frame: 'app',
    w: 360,
    h: 300,
    html: `<header class="appbar">
  <div class="appbar__side">
    <button class="iconbtn" aria-label="戻る"><svg class="icon"><use href="#i-back"/></svg></button>
  </div>
  <h1 class="appbar__title">見出し</h1>
  <div class="appbar__side appbar__side--end">
    <button class="btn btn--text btn--sm">完了</button>
  </div>
</header>

<main class="main main--padded">
  <p class="muted">↓ スクロールすると、バーが surface-container に変わる</p>
  <div class="panel"><div class="panel__body" style="height:400px"></div></div>
</main>`,
    init: (d, u) => u.scrollBar(d),
  },

  {
    id: 'navbar',
    name: 'ナビゲーションバー',
    m3: 'Navigation bar',
    group: '骨組み',
    file: 'core',
    doc: '15-adaptive',
    tags: 'navbar bottom navigation tab bar タブバー 下端',
    note: '高さ 80、画面下端に貼り付く（浮かせない）。選択中は 64×32 のピルがバネで横に滑る。選択は色だけでなく「太い線のアイコン + 太字」でも示す。',
    contracts: [
      '--nav-n（区画数）と --nav-i（選択位置）の2本に集約する',
      'ラベルは nowrap。6区画だと 1区画 60px を切る端末があり、2行に折れるとアイコンごと持ち上がる',
    ],
    frame: 'app',
    w: 360,
    h: 200,
    html: `<nav class="navbar" style="--nav-n:5; --nav-i:0">
  <div class="navbar__ind"></div>
  <button class="navbar__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg>ホーム</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-search"/></svg>さがす</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-star"/></svg>お気に入り</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-bell"/></svg>お知らせ</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-gear"/></svg>設定</button>
</nav>`,
    init: (d, u) => u.exclusive(u.$('.navbar', d), '.navbar__item', '--nav-i', 'aria-current'),
  },

  {
    id: 'rail',
    name: 'ナビゲーションレール',
    m3: 'Navigation rail',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'rail sidebar side navigation レール 600 medium',
    note: '幅 80。medium 幅（600〜839）で下端のバーの代わりに出す。上に「メニュー」と FAB、下に行き先。',
    contracts: [
      '選択ピルは滑らせない。縦の移動は「上下の階層」に見えてしまうので、出入りだけさせる',
      'レールの中の FAB は影を落とさない（レール自体が板なので、板の上に浮かせない）',
      'ラベルは1行。幅 56px は和文3文字で埋まる',
    ],
    frame: 'app',
    w: 360,
    h: 400,
    html: `<nav class="rail" style="display:flex">
  <button class="iconbtn" aria-label="メニュー"><svg class="icon"><use href="#i-layers"/></svg></button>
  <button class="fab" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
  <button class="rail__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg><span class="rail__label">ホーム</span></button>
  <button class="rail__item"><svg class="icon"><use href="#i-search"/></svg><span class="rail__label">さがす</span></button>
  <button class="rail__item"><svg class="icon"><use href="#i-star"/></svg><span class="rail__label">保存</span></button>
  <div class="rail__spacer"></div>
  <button class="rail__item"><svg class="icon"><use href="#i-gear"/></svg><span class="rail__label">設定</span></button>
</nav>`,
    init: (d, u) => u.exclusive(u.$('.rail', d), '.rail__item', null, 'aria-current'),
  },

  {
    id: 'drawer',
    name: 'ナビゲーションドロワー',
    m3: 'Navigation drawer',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'drawer sidebar sheet 引き出し 840 expanded',
    note: '幅 360。--standard は expanded 幅（840〜）で常設、--modal は狭い画面で覆いをかけて開く。行き先は高さ 56 / 角 full。',
    contracts: [
      '--standard は地と同じ色にして「板」に見せない。--modal は surface-low + 右角 xl',
      'modal は translateX(-100%) からバネ（spatial）で入れる',
    ],
    frame: 'app',
    w: 420,
    h: 420,
    html: `<aside class="drawer drawer--standard" style="display:flex; position:relative; height:100%">
  <h2 class="drawer__head">アプリ名</h2>
  <button class="drawer__item" aria-current="page">
    <svg class="icon"><use href="#i-home"/></svg>ホーム<span class="drawer__n">12</span>
  </button>
  <button class="drawer__item"><svg class="icon"><use href="#i-star"/></svg>お気に入り</button>
  <div class="drawer__label">フォルダ</div>
  <button class="drawer__item"><svg class="icon"><use href="#i-folder"/></svg>書類</button>
  <button class="drawer__item"><svg class="icon"><use href="#i-folder"/></svg>領収書<span class="drawer__n">42</span></button>
</aside>`,
    init: (d, u) => u.exclusive(u.$('.drawer', d), '.drawer__item', null, 'aria-current'),
  },

  {
    id: 'adaptive',
    name: '適応レイアウト',
    m3: 'Window size class',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'adaptive responsive breakpoint window size class レスポンシブ 画面幅',
    note: '★上の幅の切り替えで確かめる★ 〜599 はナビゲーションバー、600〜839 はレール、840〜 は常設ドロワー。3つとも DOM に置いて CSS が1つだけ見せる。',
    contracts: [
      'JS で幅を測って出し分けない。リサイズのたびに再マウントされて入力中の値やスクロール位置が飛ぶ',
      '左の占有量は --inset-start 1本。:root:has(.app--adaptive) に書く（.app に書くと body 直下の portal に届かない）',
    ],
    frame: 'app',
    appClass: 'app--adaptive',
    w: 360,
    h: 420,
    html: `<header class="appbar"><div class="appbar__side"></div>
  <h1 class="appbar__title">適応</h1><div class="appbar__side"></div></header>

<nav class="rail">
  <button class="rail__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg><span class="rail__label">ホーム</span></button>
  <button class="rail__item"><svg class="icon"><use href="#i-search"/></svg><span class="rail__label">さがす</span></button>
</nav>

<aside class="drawer drawer--standard">
  <h2 class="drawer__head">アプリ名</h2>
  <button class="drawer__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg>ホーム</button>
  <button class="drawer__item"><svg class="icon"><use href="#i-search"/></svg>さがす</button>
</aside>

<main class="main main--padded">
  <div class="notice"><strong>幅を変えてみる</strong>
    <span class="muted">360 → バー / 720 → レール / 1100 → ドロワー</span></div>
</main>

<nav class="navbar" style="--nav-n:2">
  <div class="navbar__ind"></div>
  <button class="navbar__item" aria-current="page"><svg class="icon"><use href="#i-home"/></svg>ホーム</button>
  <button class="navbar__item"><svg class="icon"><use href="#i-search"/></svg>さがす</button>
</nav>`,
  },

  {
    id: 'bottombar',
    name: 'ボトムアプリバー',
    m3: 'Bottom app bar',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'bottom app bar action bar 下端 操作',
    note: '高さ 80。行き先ではなく「その画面の操作」を下端に並べる。右端に FAB を置く。',
    contracts: ['行き先とは混ぜない。両方が要るなら、それは画面を分ける合図'],
    frame: 'app',
    w: 360,
    h: 180,
    html: `<div class="bottombar">
  <button class="iconbtn" aria-label="共有"><svg class="icon"><use href="#i-share"/></svg></button>
  <button class="iconbtn" aria-label="複製"><svg class="icon"><use href="#i-copy"/></svg></button>
  <button class="iconbtn" aria-label="削除"><svg class="icon"><use href="#i-trash"/></svg></button>
  <button class="fab" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
</div>`,
  },

  {
    id: 'toolbar',
    name: '浮くツールバー',
    m3: 'Floating toolbar',
    group: '骨組み',
    file: 'core',
    doc: '09-components',
    tags: 'toolbar floating bulk 一括 選択モード',
    note: '選択モードの一括操作。surface-high のピルが、ナビゲーションバーの上に浮く。',
    contracts: [
      '中身を詰め込みすぎない。操作が4つを超えると 390px 幅で溢れ、左へ溢れて件数の上に重なる',
      '位置は必ず --inset-bottom から calc する',
    ],
    frame: 'app',
    w: 360,
    h: 200,
    html: `<div class="toolbar" style="bottom:16px">
  <span class="mono">3件</span>
  <div style="flex:1"></div>
  <button class="iconbtn" aria-label="保存"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="iconbtn" aria-label="削除"><svg class="icon"><use href="#i-trash"/></svg></button>
  <button class="btn btn--sm">やめる</button>
</div>`,
  },

  {
    id: 'crumbs',
    name: 'パンくず',
    m3: '（M3 に無い）',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'breadcrumb crumbs 階層 パンくず',
    note: '階層のあるアプリ向け。いま居る階層は押せないので span で書く。',
    contracts: ['携帯では出さない。幅が足りず横スクロールになり、「戻る」より使いにくくなる'],
    h: 120,
    html: `<nav class="crumbs">
  <a class="crumbs__item">ホーム</a><span class="crumbs__sep">/</span>
  <a class="crumbs__item">2026年</a><span class="crumbs__sep">/</span>
  <a class="crumbs__item">9月</a><span class="crumbs__sep">/</span>
  <span class="crumbs__item" aria-current="page">食費</span>
</nav>`,
  },

  {
    id: 'pager',
    name: 'ページ送り',
    m3: '（M3 に無い）',
    group: '骨組み',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'pagination pager ページネーション ページ送り',
    note: '件数と位置が意味を持つ「表」と「検索結果」だけに使う。',
    contracts: ['一覧では使わない。一覧は無限スクロール + 引いて更新'],
    h: 140,
    html: `<nav class="pager">
  <button class="pager__item" disabled aria-label="前へ">‹</button>
  <button class="pager__item" aria-current="page">1</button>
  <button class="pager__item" aria-current="false">2</button>
  <button class="pager__item" aria-current="false">3</button>
  <span class="pager__gap">…</span>
  <button class="pager__item" aria-current="false">9</button>
  <button class="pager__item" aria-label="次へ">›</button>
</nav>`,
    init: (d, u) => u.exclusive(u.$('.pager', d), '.pager__item[aria-current]', null, 'aria-current'),
  },

  /* ============================================================ 押すもの */
  {
    id: 'btn',
    name: 'ボタン',
    m3: 'Button (filled / tonal / outlined / text / elevated)',
    group: '押すもの',
    file: 'core',
    doc: '09-components',
    tags: 'button btn ボタン filled tonal outlined text elevated danger',
    note: '既定は tonal（.btn）。画面の主要操作 1つだけ filled。**押している間だけ角丸が変わる**（shape morph）— 縮めない・透けさせない。',
    contracts: [
      ':active と .is-pressed の両方に当てる（Chromium はタッチの :active を 150ms 待つ）',
      '札は white-space: nowrap。.btn--full だけは折り返してよい',
      '処理中の印は文字を消さず右に足す（消すとボタンの幅が動く）',
    ],
    h: 300,
    html: `<div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center">
  <button class="btn btn--filled">filled</button>
  <button class="btn">tonal（既定）</button>
  <button class="btn btn--outlined">outlined</button>
  <button class="btn btn--text">text</button>
  <button class="btn btn--elevated">elevated</button>
  <button class="btn btn--danger">削除</button>
  <button class="btn" disabled>使えない</button>
</div>

<div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:12px">
  <button class="btn btn--sm">XS 32</button>
  <button class="btn"><svg class="icon icon--sm"><use href="#i-check"/></svg>既定 48</button>
  <button class="btn btn--filled">送信<span class="btn__busy"></span></button>
</div>

<button class="btn btn--filled btn--full" style="margin-top:12px">M サイズ 56 — 画面の主要操作</button>`,
  },

  {
    id: 'iconbtn',
    name: 'アイコンボタン',
    m3: 'Icon button (standard / filled / tonal)',
    group: '押すもの',
    file: 'core',
    doc: '09-components',
    tags: 'icon button iconbtn アイコンボタン',
    note: '48 の円。標準は地を持たず、押下の状態レイヤーだけ返す。--onmedia だけはテーマに追従せず黒45%+白（背後が必ず写真だから）。',
    contracts: ['aria-label を必ず付ける'],
    h: 140,
    html: `<div style="display:flex; gap:8px; align-items:center">
  <button class="iconbtn" aria-label="検索"><svg class="icon"><use href="#i-search"/></svg></button>
  <button class="iconbtn iconbtn--tonal" aria-label="保存"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="iconbtn iconbtn--filled" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
  <span style="background:#3a3f4a; border-radius:12px; padding:4px">
    <button class="iconbtn iconbtn--onmedia" aria-label="閉じる"><svg class="icon"><use href="#i-close"/></svg></button>
  </span>
</div>`,
  },

  {
    id: 'togglebtn',
    name: 'トグルボタン',
    m3: 'Icon toggle button / button group',
    group: '押すもの',
    file: 'form',
    doc: '09-components',
    tags: 'toggle group 切り替え 押しっぱなし bold italic',
    note: '押しっぱなしにできるボタン。選択中は primary で塗る。.togglegroup は複数選べるとき。',
    contracts: ['1つしか選べないなら .seg（接続ボタン群）を使う'],
    h: 150,
    html: `<div class="togglegroup">
  <button class="togglebtn" aria-pressed="true" aria-label="太字"><svg class="icon"><use href="#i-bold"/></svg></button>
  <button class="togglebtn" aria-pressed="false" aria-label="斜体"><svg class="icon"><use href="#i-italic"/></svg></button>
  <button class="togglebtn" aria-pressed="false" aria-label="下線"><svg class="icon"><use href="#i-underline"/></svg></button>
</div>

<div style="display:flex; gap:8px; margin-top:12px">
  <button class="togglebtn togglebtn--outlined" aria-pressed="false" aria-label="お気に入り"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="togglebtn togglebtn--outlined" aria-pressed="true" aria-label="通知"><svg class="icon"><use href="#i-bell"/></svg></button>
</div>`,
    init(d, u) {
      for (const b of u.$$('.togglebtn', d))
        b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')
    },
  },

  {
    id: 'splitbtn',
    name: '分割ボタン',
    m3: 'Split button (Expressive)',
    group: '押すもの',
    file: 'form',
    doc: '09-components',
    tags: 'split button dropdown 分割 保存 その他',
    note: '主な操作 +「ほかの選択肢」。向き合う側の角だけ角ばる。開いている間は矢印が返る。',
    contracts: ['右側の相手は必ずメニュー。ここに3つ目のボタンを足さない'],
    h: 260,
    html: `<div class="splitbtn">
  <button class="btn btn--filled">保存</button>
  <button class="btn btn--filled" popovertarget="sm" aria-expanded="false" aria-label="ほかの保存">
    <svg class="icon icon--sm"><use href="#i-down"/></svg>
  </button>
</div>

<div popover id="sm" class="menu">
  <button class="menu__item">名前を付けて保存</button>
  <button class="menu__item">複製して保存</button>
</div>`,
    init(d, u) {
      u.bindMenu(d, u.$('[popovertarget="sm"]', d), u.$('#sm', d), { placement: 'bottom-end' })
    },
  },

  {
    id: 'fab',
    name: 'FAB',
    m3: 'FAB (small / medium / large / extended)',
    group: '押すもの',
    file: 'core',
    doc: '09-components',
    tags: 'fab floating action button 追加 拡張',
    note: 'primary-container / elev-3。1画面に1つ。押下で角 16 → 28 に morph。',
    contracts: ['位置は bottom: calc(var(--inset-bottom) + 16px)。個別に env() を書かない'],
    h: 180,
    html: `<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
  <button class="fab fab--sm" style="position:static" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
  <button class="fab" style="position:static" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
  <button class="fab fab--ext" style="position:static"><svg class="icon"><use href="#i-plus"/></svg>追加する</button>
  <button class="fab fab--lg" style="position:static" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
</div>`,
  },

  {
    id: 'fabmenu',
    name: 'FAB メニュー',
    m3: 'FAB menu (Expressive)',
    group: '押すもの',
    file: 'form',
    doc: '09-components',
    tags: 'fab menu speed dial 追加 メニュー',
    note: 'FAB を押すと、上にラベル付きの行き先が並ぶ。開いている間は FAB の印が ✕ に回る。',
    contracts: ['3〜5個まで。それ以上ならボトムシートにする'],
    frame: 'app',
    w: 360,
    h: 300,
    html: `<div class="fabmenu" style="bottom:16px">
  <button class="fabmenu__item" hidden><svg class="icon"><use href="#i-image"/></svg>写真から</button>
  <button class="fabmenu__item" hidden><svg class="icon"><use href="#i-file"/></svg>ファイルから</button>
  <button class="fabmenu__item" hidden><svg class="icon"><use href="#i-edit"/></svg>手で入力</button>
  <button class="fab" aria-expanded="false" aria-label="追加"><svg class="icon"><use href="#i-plus"/></svg></button>
</div>`,
    init(d, u) {
      const fab = u.$('.fabmenu .fab', d)
      fab.onclick = () => {
        const open = fab.getAttribute('aria-expanded') !== 'true'
        fab.setAttribute('aria-expanded', String(open))
        for (const it of u.$$('.fabmenu__item', d)) {
          it.hidden = !open
          if (open)
            it.animate([{ opacity: 0, transform: 'translateY(12px)' }, {}], {
              duration: 400,
              easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
            })
        }
      }
    },
  },

  /* ============================================================ 選択 */
  {
    id: 'chip',
    name: 'チップ',
    m3: 'Filter / assist / input chip',
    group: '選択',
    file: 'core',
    doc: '09-components',
    tags: 'chip chips tag filter タグ 絞り込み badge',
    note: '高さ 32 / 角 sm。選択中は secondary-container の塗り。✕ 付き（input chip）はタグ入力に使う。',
    contracts: [
      '.chips に padding-block: 8px を持たせる（overflow-x: auto が ::after の当たり判定をクリップする）',
      '縦列の直下に置くときは margin-block で同量を戻す（padding を削ると判定まで減る）',
      '.chip__x は position: relative + z-index（.chip::after が覆って押せなくなる）',
    ],
    h: 160,
    html: `<div class="chips">
  <button class="chip" aria-pressed="true">食費</button>
  <button class="chip" aria-pressed="false">日用品</button>
  <button class="chip" aria-pressed="false">交通</button>
  <span class="chips__sep"></span>
  <button class="chip" aria-pressed="false"><svg class="icon"><use href="#i-star"/></svg>お気に入り</button>
  <span class="chip">東京<button class="chip__x" aria-label="外す"><svg class="icon icon--sm"><use href="#i-close"/></svg></button></span>
  <button class="chip" disabled>使えない</button>
</div>`,
    init(d, u) {
      for (const c of u.$$('.chip[aria-pressed]', d))
        c.onclick = () => c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true')
      for (const x of u.$$('.chip__x', d)) x.onclick = () => x.closest('.chip').remove()
    },
  },

  {
    id: 'seg',
    name: '接続ボタン群',
    m3: 'Connected button group (Expressive)',
    group: '選択',
    file: 'core',
    doc: '09-components',
    tags: 'segmented control seg toggle group 排他 セグメント',
    note: '並んだ中から必ず1つが選ばれる排他選択。選択中は primary の塗りのピルが滑って来る。',
    contracts: [
      'padding: 2px と width: calc((100% - 4px) / --seg-n) は対。片方だけ変えない',
      '区画のラベルを絶対に折り返させない。ピルは1行ぶんの高さなので、1つでも2行になると群れ全体が崩れる',
      '列は minmax(0, 1fr)。素の 1fr は和文に対して保険にならない',
      '.seg--rows に row-gap を入れない（ピルの高さの等式が崩れる）',
    ],
    h: 220,
    html: `<div class="seg" style="--seg-n:3; --seg-i:0">
  <div class="seg__ind"></div>
  <button class="seg__btn" aria-pressed="true">すべて</button>
  <button class="seg__btn" aria-pressed="false">写真</button>
  <button class="seg__btn" aria-pressed="false">動画</button>
</div>

<div class="seg seg--rows" style="--seg-n:2; --seg-rows:2; --seg-i:0; margin-top:16px">
  <div class="seg__ind"></div>
  <button class="seg__btn" aria-pressed="true">0.5倍</button>
  <button class="seg__btn" aria-pressed="false">1倍</button>
  <button class="seg__btn" aria-pressed="false">2倍</button>
  <button class="seg__btn" aria-pressed="false">4倍</button>
</div>`,
    init(d, u) {
      u.exclusive(u.$('.seg', d), '.seg__btn', '--seg-i', 'aria-pressed')
      const rows = u.$$('.seg', d)[1]
      u.$$('.seg__btn', rows).forEach((b, i) => {
        b.onclick = () => {
          rows.style.setProperty('--seg-i', i % 2)
          rows.querySelector('.seg__ind').style.transform =
            `translate(${(i % 2) * 100}%, ${Math.floor(i / 2) * 100}%)`
          u.$$('.seg__btn', rows).forEach((o, j) => o.setAttribute('aria-pressed', String(i === j)))
        }
      })
    },
  },

  {
    id: 'tabs',
    name: 'タブ',
    m3: 'Primary / secondary / scrollable tabs',
    group: '選択',
    file: 'core / nav',
    doc: '09-components',
    tags: 'tabs tab 切り替え 場所',
    note: '画面の中の「並列の場所」を切り替える。印は下の 3px。secondary は入れ子のとき、scrollable は区画が多くて等分できないとき。',
    contracts: [
      'タブは「場所」、接続ボタン群は「絞り込み」。混ぜると戻る操作の意味が壊れる',
      '横スクロール版はインジケータの幅と位置を JS が --tab-w / --tab-x で渡す（等分でないので calc できない）',
    ],
    h: 240,
    html: `<div class="tabs" style="--tab-n:3; --tab-i:0">
  <button class="tabs__item" aria-selected="true">今月</button>
  <button class="tabs__item" aria-selected="false">先月</button>
  <button class="tabs__item" aria-selected="false">年間</button>
  <div class="tabs__ind"></div>
</div>

<div class="tabs tabs--secondary" style="--tab-n:2; --tab-i:0; margin-top:16px">
  <button class="tabs__item" aria-selected="true">支出</button>
  <button class="tabs__item" aria-selected="false">収入</button>
  <div class="tabs__ind"></div>
</div>

<div class="tabs tabs--scroll" style="margin-top:16px">
  <button class="tabs__item" aria-selected="true">すべて</button>
  <button class="tabs__item" aria-selected="false">食費</button>
  <button class="tabs__item" aria-selected="false">日用品</button>
  <button class="tabs__item" aria-selected="false">交通</button>
  <button class="tabs__item" aria-selected="false">通信</button>
  <button class="tabs__item" aria-selected="false">交際</button>
  <div class="tabs__ind"></div>
</div>`,
    init(d, u) {
      const [a, b, c] = u.$$('.tabs', d)
      u.exclusive(a, '.tabs__item', '--tab-i', 'aria-selected')
      u.exclusive(b, '.tabs__item', '--tab-i', 'aria-selected')
      /* 横スクロール版は幅がばらばらなので、実測して渡す */
      const items = u.$$('.tabs__item', c)
      const paint = (el) => {
        c.style.setProperty('--tab-w', `${el.offsetWidth}px`)
        c.style.setProperty('--tab-x', `${el.offsetLeft}px`)
      }
      items.forEach((el) => {
        el.onclick = () => {
          items.forEach((o) => o.setAttribute('aria-selected', String(o === el)))
          paint(el)
          el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
        }
      })
      paint(items[0])
    },
  },

  {
    id: 'switch',
    name: 'スイッチ',
    m3: 'Switch',
    group: '選択',
    file: 'core',
    doc: '09-components',
    tags: 'switch toggle スイッチ 設定',
    note: 'トラック 52×32。ツマミは off で 16、on で 24、押している間だけ 28。「今すぐ効く設定」に使う。',
    contracts: [
      'ツマミは中心座標で置いてある。大きさが変わっても中心が動かないので transform だけで済む',
      '「決定を押して確定する設定」にはチェックボックスを使う',
    ],
    h: 200,
    html: `<div class="panel"><div class="rowlist">
  <div class="row">
    <div class="row__main"><span class="row__title">通知を受け取る</span></div>
    <input type="checkbox" class="switch" checked />
  </div>
  <div class="row">
    <div class="row__main">
      <span class="row__title">位置情報を使う</span>
      <span class="row__sub">近くの店を出すのに使います</span>
    </div>
    <input type="checkbox" class="switch" />
  </div>
</div></div>`,
  },

  {
    id: 'checkbox',
    name: 'チェックボックス',
    m3: 'Checkbox',
    group: '選択',
    file: 'core',
    doc: '09-components',
    tags: 'checkbox check チェック 複数選択',
    note: '20px。鉤は border 2辺を回して描いてある。',
    contracts: ['<label class="check"> で包む。見た目 20px のまま、ラベルごと 48px の当たり判定になる'],
    h: 180,
    html: `<label class="check"><input type="checkbox" class="checkbox" checked />既読を含める</label>
<label class="check"><input type="checkbox" class="checkbox" />下書きを含める</label>
<label class="check"><input type="checkbox" class="checkbox" disabled />使えない</label>`,
  },

  {
    id: 'radio',
    name: 'ラジオ',
    m3: 'Radio button',
    group: '選択',
    file: 'core',
    doc: '09-components',
    tags: 'radio group 単一選択 ラジオ',
    note: '20px の円。3つ以下で札が短いなら .seg（接続ボタン群）のほうが速く選べる。',
    contracts: ['<label class="check"> で包む', 'グループは <fieldset> + <legend> で括る（隠すなら .sr-only）'],
    h: 180,
    html: `<label class="check"><input type="radio" name="sort" class="radio" checked />新しい順</label>
<label class="check"><input type="radio" name="sort" class="radio" />古い順</label>
<label class="check"><input type="radio" name="sort" class="radio" />名前順</label>`,
  },

  {
    id: 'rating',
    name: '評価',
    m3: '（M3 に無い）',
    group: '選択',
    file: 'form',
    doc: '09-components',
    tags: 'rating star 星 評価',
    note: '入力にも表示にも同じ形を使う。表示だけのときは button を span にして .rating--sm。',
    contracts: ['当たり判定を横に広げない。隣の星と重なって「1つ隣が点く」ことがある'],
    h: 160,
    html: `<div class="rating">
  <button class="rating__star rating__star--on" aria-label="1"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="rating__star rating__star--on" aria-label="2"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="rating__star rating__star--on" aria-label="3"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="rating__star" aria-label="4"><svg class="icon"><use href="#i-star"/></svg></button>
  <button class="rating__star" aria-label="5"><svg class="icon"><use href="#i-star"/></svg></button>
</div>

<div class="rating rating--sm" style="margin-top:12px">
  <span class="rating__star rating__star--on"><svg class="icon"><use href="#i-star"/></svg></span>
  <span class="rating__star rating__star--on"><svg class="icon"><use href="#i-star"/></svg></span>
  <span class="rating__star rating__star--on"><svg class="icon"><use href="#i-star"/></svg></span>
  <span class="rating__star rating__star--on"><svg class="icon"><use href="#i-star"/></svg></span>
  <span class="rating__star"><svg class="icon"><use href="#i-star"/></svg></span>
</div>`,
    init(d, u) {
      const stars = u.$$('.rating:not(.rating--sm) .rating__star', d)
      stars.forEach((s, i) =>
        (s.onclick = () => stars.forEach((o, j) => o.classList.toggle('rating__star--on', j <= i))),
      )
    },
  },

  {
    id: 'swatch',
    name: '色見本',
    m3: '（Material You の「自分の色」）',
    group: '選択',
    file: 'form',
    doc: '02-color',
    tags: 'swatch color seed theme テーマ シード 配色',
    note: 'テーマのシードを選ばせる。★上の「色」で切り替えると図鑑全体の配色が変わる★',
    contracts: ['形で選択を示す。色そのものが中身なので、色で選択を示せない'],
    h: 140,
    html: `<div class="swatches">
  <button class="swatch" aria-pressed="true"  style="background:#575b8c" aria-label="インディゴ"></button>
  <button class="swatch" aria-pressed="false" style="background:#206a5f" aria-label="ティール"></button>
  <button class="swatch" aria-pressed="false" style="background:#496738" aria-label="グリーン"></button>
  <button class="swatch" aria-pressed="false" style="background:#88522d" aria-label="アンバー"></button>
  <button class="swatch" aria-pressed="false" style="background:#894d5b" aria-label="ローズ"></button>
</div>`,
    init: (d, u) => u.exclusive(u.$('.swatches', d), '.swatch', null, 'aria-pressed'),
  },

  /* ============================================================ 入力 */
  {
    id: 'input',
    name: 'テキストフィールド',
    m3: 'Filled / outlined text field',
    group: '入力',
    file: 'core',
    doc: '17-forms',
    tags: 'input text field textfield 入力欄 form',
    note: '高さ 56 / 上角 xs / 下線 1px → フォーカスで 2px primary。outlined は地を持てない場所で使う。',
    contracts: [
      'font-size を --t-input（16px）から下げない。下回ると iOS がフォーカスで画面を拡大して戻さなくなる',
      'ラベル → 入力 → 説明 → エラー の順から動かさない（読み上げがこの順に読む）',
    ],
    h: 400,
    html: `<div class="field">
  <label class="label" for="a1">名前</label>
  <input class="input" id="a1" placeholder="山田" />
  <p class="field__help">本名でなくてかまいません</p>
</div>

<div class="field" style="margin-top:16px">
  <label class="label" for="a2">メモ（outlined）</label>
  <input class="input input--outlined" id="a2" placeholder="任意" />
</div>

<div class="field" style="margin-top:16px">
  <label class="label" for="a3">表示名</label>
  <input class="input input--error" id="a3" value="ずんだもん" aria-invalid="true" />
  <p class="field__error">この名前は使われています</p>
</div>

<div class="field" style="margin-top:16px">
  <label class="label" for="a4">金額</label>
  <div class="field__wrap field__wrap--start">
    <span class="field__affix field__affix--start">¥</span>
    <input class="input input--num" id="a4" inputmode="numeric" value="12,340" />
  </div>
</div>`,
  },

  {
    id: 'textarea',
    name: '複数行の入力',
    m3: 'Text field (multiline)',
    group: '入力',
    file: 'core',
    doc: '17-forms',
    tags: 'textarea multiline 複数行 長文',
    note: '最小 96、縦だけリサイズできる。文字数は等幅で出す（打つたびに桁が変わって数字が踊らないように）。',
    contracts: ['文字数を超えても打てなくはしない — 消す作業をさせない。色で伝える'],
    h: 260,
    html: `<div class="field">
  <label class="label" for="b1">ひとこと</label>
  <textarea class="textarea" id="b1" placeholder="長い文"></textarea>
  <p class="field__count"><span class="mono">28</span> / 140</p>
</div>`,
  },

  {
    id: 'select',
    name: '選択（ネイティブ）',
    m3: 'Select',
    group: '入力',
    file: 'core',
    doc: '17-forms',
    tags: 'select dropdown option プルダウン 選択',
    note: 'ネイティブの ▾ を消して自前の山形に差し替えてある。OS 既定の矢印は「Webページ」の顔を作る最後の一手。',
    contracts: [
      'background-color で書く（短縮形にすると、自前の山形がフォーカスのたびに消える）',
      '選択肢が 10 個を超えて探したくなるなら .combo に切り替える',
    ],
    h: 300,
    html: `<div class="field">
  <label class="label" for="c1">費目</label>
  <select class="select" id="c1">
    <option>選んでください</option>
    <option>食費</option>
    <option>日用品</option>
  </select>
</div>`,
  },

  {
    id: 'search',
    name: '検索欄',
    m3: 'Search bar',
    group: '入力',
    file: 'core',
    doc: '16-overlays',
    tags: 'search searchbar 検索',
    note: '高さ 56 のピル（角 xl）。押したら全画面の検索（.searchview）を開くのがモバイルの作法。',
    contracts: [],
    h: 140,
    html: `<div class="search">
  <svg class="icon"><use href="#i-search"/></svg>
  <input class="search__input" placeholder="検索" />
  <button class="iconbtn" aria-label="消す"><svg class="icon"><use href="#i-close"/></svg></button>
</div>`,
  },

  {
    id: 'searchview',
    name: '全画面の検索',
    m3: 'Search view',
    group: '入力',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'search view fullscreen 全画面 検索 候補',
    note: '.search（ピル）を押したときに開く。入場は「ピルが広がって画面になる」。携帯でのコマンドパレットの代わり。',
    contracts: [],
    w: 360,
    h: 420,
    html: `<div class="searchview" style="position:absolute">
  <div class="searchview__head">
    <button class="iconbtn" aria-label="戻る"><svg class="icon"><use href="#i-back"/></svg></button>
    <input class="searchview__input" placeholder="検索" />
    <button class="iconbtn" aria-label="消す"><svg class="icon"><use href="#i-close"/></svg></button>
  </div>
  <div class="searchview__body">
    <div class="rowlist">
      <button class="row row--link"><svg class="icon"><use href="#i-clock"/></svg>
        <div class="row__main"><span class="row__title">先週の食費</span></div></button>
      <button class="row row--link"><svg class="icon"><use href="#i-clock"/></svg>
        <div class="row__main"><span class="row__title">定期の支払い</span></div></button>
      <button class="row row--link"><svg class="icon"><use href="#i-folder"/></svg>
        <div class="row__main"><span class="row__title">領収書</span><span class="row__sub">42件</span></div></button>
    </div>
  </div>
</div>`,
  },

  {
    id: 'combo',
    name: 'コンボボックス',
    m3: '（M3 に無い / Autocomplete）',
    group: '入力',
    file: 'form',
    doc: '17-forms',
    tags: 'combobox autocomplete typeahead 候補 絞り込み',
    note: '打ちながら絞る選択。↑↓ で辿れる。候補は .menu をそのまま使い、幅だけ入力に合わせる。',
    contracts: [
      '<select> で足りるなら <select> を使う',
      '一致した部分は色ではなく太さで示す（一覧の中で色が散らばると読めない）',
      'popovertarget は <button> 系にしか効かない。文字入力では自分で showPopover() を呼ぶ',
    ],
    h: 260,
    html: `<div class="combo">
  <input class="input" id="cb" role="combobox" aria-expanded="false" aria-controls="cbl" placeholder="都市を選ぶ" />
  <div popover id="cbl" class="menu combo__list"></div>
</div>`,
    init(d, u) {
      const CITIES = ['東京', '大阪', '名古屋', '札幌', '福岡', '仙台', '広島', '那覇']
      const inp = u.$('#cb', d)
      const list = u.$('#cbl', d)
      const paint = () => {
        const q = inp.value.trim()
        const hits = CITIES.filter((c) => !q || c.includes(q))
        list.innerHTML = hits.length
          ? hits
              .map(
                (c, i) =>
                  `<button class="menu__item" aria-selected="${i === 0}">${
                    q ? c.replace(q, `<b class="combo__hit">${q}</b>`) : c
                  }</button>`,
              )
              .join('')
          : '<div class="menu__label">見つかりません</div>'
      }
      const open = () => {
        paint()
        if (!list.matches(':popover-open')) list.showPopover()
        u.anchorTo(d, list, inp, { matchWidth: true })
      }
      inp.addEventListener('focus', open)
      inp.addEventListener('input', open)
      inp.addEventListener('keydown', (e) => {
        const items = u.$$('.menu__item', list)
        if (!items.length) return
        const i = items.findIndex((el) => el.getAttribute('aria-selected') === 'true')
        const move = (n) => items.forEach((el, j) => el.setAttribute('aria-selected', String(j === n)))
        if (e.key === 'ArrowDown') (e.preventDefault(), move((i + 1) % items.length))
        else if (e.key === 'ArrowUp') (e.preventDefault(), move((i - 1 + items.length) % items.length))
        else if (e.key === 'Enter' && i >= 0) {
          e.preventDefault()
          inp.value = items[i].textContent
          list.hidePopover()
        }
      })
      list.addEventListener('click', (e) => {
        const it = e.target.closest('.menu__item')
        if (!it) return
        inp.value = it.textContent
        list.hidePopover()
      })
    },
  },

  {
    id: 'slider',
    name: 'スライダー',
    m3: 'Slider (Expressive)',
    group: '入力',
    file: 'core',
    doc: '09-components',
    tags: 'slider range 目盛り つまみ',
    note: 'トラックは太く（16）、ツマミは縦棒（4×44）。これが Expressive の顔。',
    contracts: ['埋まった割合は --p（%）で渡す。input イベントで JS が書き換える'],
    h: 160,
    html: `<input type="range" class="slider" value="40" style="--p:40%" aria-label="音量" />`,
    init(d, u) {
      const s = u.$('.slider', d)
      s.oninput = () => s.style.setProperty('--p', s.value + '%')
    },
  },

  {
    id: 'cal',
    name: 'カレンダー',
    m3: 'Date picker (docked)',
    group: '入力',
    file: 'form',
    doc: '17-forms',
    tags: 'calendar date picker 日付 カレンダー 期間',
    note: '幅 328 / 日セル 40 の円。今日は**枠だけ**、選択中は**primary の塗り**。期間は角丸を落として帯にする。',
    contracts: [
      '今日を塗らない。塗ると選択中と同じ「塗られた丸」になって区別できなくなる',
      '前後の月は opacity ではなく文字色を弱める（押せることは変わらない）',
      'まず「今日/明日/来週」のチップを出す。いきなりカレンダーは1手多い',
    ],
    h: 460,
    html: `<div class="chips">
  <button class="chip">今日</button><button class="chip">明日</button><button class="chip">来週</button>
</div>

<div class="cal" style="margin-top:8px">
  <div class="cal__head">
    <button class="cal__month">2026年9月<svg class="icon icon--sm"><use href="#i-down"/></svg></button>
    <button class="iconbtn" aria-label="前の月"><svg class="icon"><use href="#i-back"/></svg></button>
    <button class="iconbtn" aria-label="次の月"><svg class="icon"><use href="#i-chevron"/></svg></button>
  </div>
  <div class="cal__grid"></div>
</div>`,
    init(d, u) {
      const grid = u.$('.cal__grid', d)
      for (const w of ['日', '月', '火', '水', '木', '金', '土']) {
        const el = d.createElement('div')
        el.className = 'cal__dow'
        el.textContent = w
        grid.appendChild(el)
      }
      for (let i = 0; i < 32; i++) {
        const day = i - 1
        const b = d.createElement('button')
        b.className =
          'cal__day' + (day < 1 ? ' cal__day--other' : day === 3 ? ' cal__day--today' : '')
        b.textContent = day < 1 ? 30 + day : day
        b.setAttribute('aria-selected', String(day === 12))
        b.setAttribute('aria-label', `9月${day}日`)
        if (day === 8) b.insertAdjacentHTML('beforeend', '<span class="cal__dot"></span>')
        b.onclick = () => {
          for (const o of u.$$('.cal__day', grid)) o.setAttribute('aria-selected', 'false')
          b.setAttribute('aria-selected', 'true')
        }
        grid.appendChild(b)
      }
    },
  },

  {
    id: 'time',
    name: '時刻',
    m3: 'Time picker (input / dial)',
    group: '入力',
    file: 'form',
    doc: '17-forms',
    tags: 'time picker clock dial 時刻 時計',
    note: '分かっている値を打つなら数字の入力、触る画面で選ぶならダイヤル。針の角度は --deg、数字の位置は --x / --y。',
    contracts: ['ダイヤルは touch-action: none（ブラウザのスクロールに取られないように）'],
    h: 440,
    html: `<div class="timefields">
  <input class="timefields__n" value="09" inputmode="numeric" aria-label="時" />
  <span class="timefields__sep">:</span>
  <input class="timefields__n" value="30" inputmode="numeric" aria-label="分" />
</div>

<div class="dial" style="--deg:270deg; margin:16px auto 0">
  <div class="dial__hand"></div>
</div>`,
    init(d, u) {
      const dial = u.$('.dial', d)
      for (let h = 1; h <= 12; h++) {
        const a = ((h - 3) / 12) * Math.PI * 2
        const el = d.createElement('button')
        el.className = 'dial__n'
        el.textContent = h
        el.style.setProperty('--x', `${50 + 38 * Math.cos(a)}%`)
        el.style.setProperty('--y', `${50 + 38 * Math.sin(a)}%`)
        el.setAttribute('aria-selected', String(h === 9))
        el.onclick = () => {
          for (const o of u.$$('.dial__n', dial)) o.setAttribute('aria-selected', 'false')
          el.setAttribute('aria-selected', 'true')
          dial.style.setProperty('--deg', `${h * 30}deg`)
        }
        dial.appendChild(el)
      }
    },
  },

  {
    id: 'otp',
    name: '使い捨てコード',
    m3: '（M3 に無い）',
    group: '入力',
    file: 'form',
    doc: '17-forms',
    tags: 'otp one-time code pin 認証 コード',
    note: '1つの透明な <input> をマスの上に敷いてある。マスは表示専用の <div>。',
    contracts: [
      '1マス1文字の <input> を並べない。貼り付けが1マスにしか入らず、iOS の自動入力が効かず、読み上げが「編集テキスト」を6回読む',
      'autocomplete="one-time-code" を必ず書く',
    ],
    h: 200,
    html: `<div class="otp">
  <input class="otp__ghost" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="確認コード" />
  <div class="otp__box"></div><div class="otp__box"></div><div class="otp__box"></div>
  <div class="otp__box"></div><div class="otp__box"></div><div class="otp__box"></div>
</div>`,
    init(d, u) {
      const g = u.$('.otp__ghost', d)
      const boxes = u.$$('.otp__box', d)
      const paint = () => {
        const v = g.value
        boxes.forEach((b, i) => {
          b.textContent = v[i] ?? ''
          b.classList.toggle('otp__box--now', i === Math.min(v.length, boxes.length - 1))
        })
      }
      g.oninput = paint
      g.onfocus = paint
      paint()
    },
  },

  {
    id: 'dropzone',
    name: 'ドロップ領域',
    m3: '（M3 に無い）',
    group: '入力',
    file: 'form',
    doc: '17-forms',
    tags: 'dropzone file upload drag drop ファイル アップロード',
    note: '持ってきている間は .is-over（色と枠の両方を変える）。制限は蹴った後ではなく置く前に見せる。',
    contracts: [
      '破線は M3 に無いがここだけ例外。実線だと「置ける場所」ではなく「空のカード」に見える',
      '失敗した1件で全部を捨てない。成功したものは残し、失敗だけ再試行させる',
    ],
    h: 280,
    html: `<label class="dropzone">
  <input type="file" class="sr-only" multiple />
  <svg class="icon icon--lg"><use href="#i-upload"/></svg>
  <span>ここに置く、または選ぶ</span>
  <span class="muted">PNG / JPEG、20MB まで</span>
</label>`,
    init(d, u) {
      const dz = u.$('.dropzone', d)
      for (const t of ['dragenter', 'dragover'])
        dz.addEventListener(t, (e) => (e.preventDefault(), dz.classList.add('is-over')))
      for (const t of ['dragleave', 'drop'])
        dz.addEventListener(t, (e) => (e.preventDefault(), dz.classList.remove('is-over')))
    },
  },

  {
    id: 'field',
    name: '入力の体系',
    m3: 'Form',
    group: '入力',
    file: 'core / form',
    doc: '17-forms',
    tags: 'form field label help error validation フォーム 検証',
    note: 'ラベル → 入力 → 説明 → エラー。横に並べるのは 2つまで（420px 未満で自動的に縦に落ちる）。',
    contracts: [
      '必須の印を付けない。任意のほうに「（任意）」と書く',
      'エラーは blur で出し、打ち直している間はリアルタイムで消す。出すのは遅く、消すのは早く',
      '送信ボタンは押せるままにする。押せなくすると理由がどこにも書かれない画面になる',
    ],
    h: 380,
    html: `<div class="field-row" style="--field-n:2">
  <div class="field">
    <label class="label" for="d1">姓</label>
    <input class="input" id="d1" />
  </div>
  <div class="field">
    <label class="label" for="d2">名（任意）</label>
    <input class="input" id="d2" />
  </div>
</div>

<div class="field" style="margin-top:16px">
  <label class="label" for="d3">メールアドレス</label>
  <input class="input" id="d3" type="email" autocomplete="email" />
  <p class="field__help">請求書の送り先になります</p>
</div>

<button class="btn btn--filled btn--full" style="margin-top:16px">登録する</button>`,
  },

  /* ============================================================ 面と行 */
  {
    id: 'panel',
    name: 'カード',
    m3: 'Filled / outlined / elevated card',
    group: '面と行',
    file: 'core',
    doc: '06-elevation',
    tags: 'card panel surface カード 面',
    note: '既定は filled（surface-mid / 角 16 / **影なし**）。影を敷くのは本当に浮いているものだけ。',
    contracts: ['一覧に何百枚あっても、明度差なら合成コストは実質ゼロ。影を敷くと全部を描き直す'],
    h: 320,
    html: `<div class="panel"><div class="panel__body">
  <strong>filled（既定）</strong>
  <span class="muted">surface-mid、角 16、影なし</span>
</div></div>

<div class="panel panel--outlined" style="margin-top:12px"><div class="panel__body">
  <strong>outlined</strong>
  <span class="muted">地を持てない場所、または並べて区別したいとき</span>
</div></div>

<div class="panel panel--elevated" style="margin-top:12px"><div class="panel__body">
  <strong>elevated</strong>
  <span class="muted">本当に浮いているときだけ</span>
</div></div>`,
  },

  {
    id: 'rowlist',
    name: 'リスト',
    m3: 'List item',
    group: '面と行',
    file: 'core',
    doc: '09-components',
    tags: 'list row listitem 一覧 行',
    note: '1行 56 / 2行 72。区切りは outline-variant 1px を左右 16 インセット。',
    contracts: [
      '区切りは border ではなく背景で描く（border だと行の高さが増え、スワイプのしきい値計算に効く）',
      '.row__main は flex: 1 + min-width: 0。無いと長い文字列で行が横に溢れる',
      '.row__title は1行 + ellipsis。折り返させない',
    ],
    h: 340,
    html: `<div class="panel"><div class="rowlist">
  <button class="row row--link">
    <div class="row__main"><span class="row__title">1行の行は 56px</span></div>
    <span class="row__value">1,200</span>
    <svg class="row__chevron"><use href="#i-chevron"/></svg>
  </button>
  <button class="row row--link">
    <span class="avatar avatar--sm">山</span>
    <div class="row__main">
      <span class="row__title">2行の行は 72px</span>
      <span class="row__sub">副題は body-m / on-surface-variant</span>
    </div>
    <svg class="row__chevron"><use href="#i-chevron"/></svg>
  </button>
  <div class="row row--on">
    <div class="row__main"><span class="row__title">選択中は secondary-container</span></div>
    <svg class="icon icon--sm"><use href="#i-check"/></svg>
  </div>
  <button class="row row--link row--danger">
    <svg class="icon"><use href="#i-trash"/></svg>
    <div class="row__main"><span class="row__title">履歴を消す</span></div>
  </button>
</div></div>`,
  },

  {
    id: 'tree',
    name: '木',
    m3: '（M3 に無い）',
    group: '面と行',
    file: 'data',
    doc: '09-components',
    tags: 'tree nested folder 階層 ツリー',
    note: '.row の派生。深さは --depth（数）で渡す。葉でも矢印の場所は空けたまま — 揃わないと読みにくい。',
    contracts: [],
    h: 300,
    html: `<div class="panel"><div class="rowlist tree">
  <button class="row row--link tree__item" style="--depth:0" aria-expanded="true">
    <span class="tree__toggle"><svg class="icon icon--sm"><use href="#i-chevron"/></svg></span>
    <svg class="icon"><use href="#i-folder"/></svg>
    <div class="row__main"><span class="row__title">書類</span></div>
  </button>
  <button class="row row--link tree__item" style="--depth:1">
    <span class="tree__leaf"></span>
    <svg class="icon"><use href="#i-file"/></svg>
    <div class="row__main"><span class="row__title">契約.pdf</span></div>
  </button>
  <button class="row row--link tree__item" style="--depth:1" aria-expanded="false">
    <span class="tree__toggle"><svg class="icon icon--sm"><use href="#i-chevron"/></svg></span>
    <svg class="icon"><use href="#i-folder"/></svg>
    <div class="row__main"><span class="row__title">2025年</span></div>
  </button>
</div></div>`,
    init(d, u) {
      for (const it of u.$$('.tree__item[aria-expanded]', d))
        it.onclick = () =>
          it.setAttribute('aria-expanded', it.getAttribute('aria-expanded') !== 'true')
    },
  },

  {
    id: 'table',
    name: '表',
    m3: 'Data table',
    group: '面と行',
    file: 'data',
    doc: '18-data',
    tags: 'table data table 表 テーブル sort ソート',
    note: '見出しは sticky、名前の列は左端に固定。数値は右寄せ + 等幅。★幅を 360 にすると、携帯で表がどう破綻するか分かる★',
    contracts: [
      '携帯では表を使わず .rowlist に畳む。360px には列が2つしか入らない',
      '区切りは border ではなく inset の影（border-collapse と sticky を併用すると見出しの下線だけ流れる）',
      '固定した列は地を必ず塗る。透けると下の行が見える',
      'aria-sort は <th> に付ける（中のボタンではない）',
    ],
    h: 360,
    html: `<div class="table-wrap scroller">
  <table class="table">
    <thead><tr>
      <th class="table__stick">費目</th>
      <th aria-sort="descending"><button class="table__sort">金額<svg class="icon icon--sm"><use href="#i-down"/></svg></button></th>
      <th><button class="table__sort">件数<svg class="icon icon--sm"><use href="#i-down"/></svg></button></th>
      <th>更新</th>
    </tr></thead>
    <tbody>
      <tr aria-selected="false"><td class="table__stick">家賃</td><td class="table__num">72,000</td><td class="table__num">1</td><td class="mono">09/01</td></tr>
      <tr aria-selected="true"><td class="table__stick">食費</td><td class="table__num">38,420</td><td class="table__num">24</td><td class="mono">09/03</td></tr>
      <tr aria-selected="false"><td class="table__stick">交通</td><td class="table__num">9,860</td><td class="table__num">12</td><td class="mono">09/02</td></tr>
      <tr aria-selected="false"><td class="table__stick">通信</td><td class="table__num">4,378</td><td class="table__num">2</td><td class="mono">09/01</td></tr>
    </tbody>
  </table>
</div>`,
    init(d, u) {
      const t = u.$('.table', d)
      for (const btn of u.$$('.table__sort', t)) {
        const th = btn.closest('th')
        btn.onclick = () => {
          const now = th.getAttribute('aria-sort')
          for (const o of u.$$('th[aria-sort]', t)) o.removeAttribute('aria-sort')
          th.setAttribute('aria-sort', now === 'ascending' ? 'descending' : 'ascending')
        }
      }
      for (const tr of u.$$('tbody tr', t))
        tr.onclick = () =>
          tr.setAttribute('aria-selected', tr.getAttribute('aria-selected') !== 'true')
    },
  },

  {
    id: 'carousel',
    name: 'カルーセル',
    m3: 'Carousel',
    group: '面と行',
    file: 'data',
    doc: '09-components',
    tags: 'carousel slider swiper 横スクロール',
    note: 'scroll-snap で吸着する等幅の並び。位置の印（.dots）は、いま居る点が横に伸びる。',
    contracts: [
      'M3 Expressive の multi-browse（端が押し潰れる）は真似ない。CSS だけだと項目幅が動いて snap が暴れる',
      '端の項目を画面端に貼り付けない。前後があることを見せる',
    ],
    h: 260,
    html: `<div class="carousel">
  <div class="carousel__item"><div class="ratio" style="--ratio:4/3; background:var(--primary-container)"></div></div>
  <div class="carousel__item"><div class="ratio" style="--ratio:4/3; background:var(--tertiary-container)"></div></div>
  <div class="carousel__item"><div class="ratio" style="--ratio:4/3; background:var(--secondary-container)"></div></div>
</div>

<div class="dots" style="margin-top:12px">
  <span class="dots__d" aria-current="true"></span>
  <span class="dots__d" aria-current="false"></span>
  <span class="dots__d" aria-current="false"></span>
</div>`,
    init(d, u) {
      const c = u.$('.carousel', d)
      const dots = u.$$('.dots__d', d)
      c.addEventListener(
        'scroll',
        () => {
          const i = Math.round(c.scrollLeft / (c.scrollWidth / dots.length))
          dots.forEach((el, j) => el.setAttribute('aria-current', String(j === i)))
        },
        { passive: true },
      )
    },
  },

  {
    id: 'ratio',
    name: '縦横比の器',
    m3: '（Aspect ratio）',
    group: '面と行',
    file: 'data',
    doc: '09-components',
    tags: 'aspect ratio image video 画像 動画 比率',
    note: '画像・動画・地図を「読み込む前から同じ高さ」で置く。--ratio で比を渡す。',
    contracts: ['これが無いと、画像が届いた瞬間に下の内容が飛ぶ'],
    h: 300,
    html: `<div class="ratio" style="--ratio:16/9; background:var(--primary-container)"></div>
<div class="ratio" style="--ratio:1; width:120px; margin-top:12px; background:var(--tertiary-container)"></div>`,
  },

  {
    id: 'scroller',
    name: 'スクロール域',
    m3: '（Scroll area）',
    group: '面と行',
    file: 'data',
    doc: '09-components',
    tags: 'scroll area scrollbar overflow スクロール',
    note: '細いつまみを出すのは PC だけ（触る画面では出さない）。--fade を付けると端がぼけて「続きがある」と伝わる。',
    contracts: ['端のぼかしは影ではなく mask。影だと中身の色に応じて見え方が変わる'],
    h: 280,
    html: `<div class="panel"><div class="scroller scroller--fade" style="max-height:200px; padding:16px">
  <p>1 — 上下の端がぼけて、続きがあることを示す。</p>
  <p>2 — 触る画面ではつまみを出さない（指で掴めない幅のものを見せると、掴もうとして失敗する）。</p>
  <p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>
</div></div>`,
  },

  {
    id: 'divider',
    name: '区切り',
    m3: 'Divider',
    group: '面と行',
    file: 'core / data',
    doc: '05-space',
    tags: 'divider separator hr 区切り 線',
    note: 'outline-variant の 1px。0.5px の hairline は使わない。文字を入れたいときは --label。',
    contracts: ['線ではなく距離で分けるのが先。区切り線は距離では足りないときの最後の手段'],
    h: 180,
    html: `<p class="muted">上</p>
<hr class="divider" />
<p class="muted">下</p>
<div class="divider--label" style="margin-top:16px">ここまで</div>`,
  },

  {
    id: 'swiperow',
    name: 'スワイプで削除',
    m3: '（M3 に無い）',
    group: '面と行',
    file: 'core',
    doc: '12-gestures',
    tags: 'swipe delete row スワイプ 削除',
    note: '★指で左へ引いてみる★ 引いた分だけ行が動き、幅の 40% を超えたら背景が error に変わって予告する。',
    contracts: [
      '.swiperow__content の地は親の面と必ず同じ色にする（片方だけ変えると下の error-container が透けて全行が赤くなる）',
      'will-change は掴んでいる間だけ JS が付ける。何百行あっても全部が合成レイヤにならないように',
      '行ごとに ✕ ボタンを置かない',
    ],
    h: 220,
    html: `<div class="panel">
  <div class="swiperow">
    <div class="swiperow__bg">離すと削除</div>
    <div class="swiperow__content">
      <div class="row">
        <div class="row__main"><span class="row__title">指で左へ引いてみる</span></div>
        <span class="row__value">2,480</span>
      </div>
    </div>
  </div>
</div>`,
    init(d, u) {
      const sw = u.$('.swiperow', d)
      const c = u.$('.swiperow__content', d)
      /** いま出ている translateX（px）。走行中のアニメの値も拾える */
      const nowX = () => new DOMMatrix(getComputedStyle(c).transform).m41
      let x0 = null
      let base = 0
      sw.addEventListener('pointerdown', (e) => {
        /* 主ポインタの左ボタンだけ。右ドラッグで行が動くと事故になる */
        if (!e.isPrimary || e.button !== 0) return
        /* ★掴んだポインタを捕まえる★ 指と違ってマウスは行の外へ簡単に出る。
           捕まえないと外で離した pointerup を取り逃し、行が開いたまま固まる */
        sw.setPointerCapture(e.pointerId)
        /* 戻っている途中でも、いまの見た目のまま掴み直せるようにする
           （走行中のアニメを畳んで、その位置を起点にする） */
        base = nowX()
        for (const a of c.getAnimations()) a.cancel()
        c.style.transform = `translateX(${base}px)`
        x0 = e.clientX
        c.style.willChange = 'transform'
        sw.classList.add('is-dragging')
      })
      sw.addEventListener('pointermove', (e) => {
        if (x0 === null) return
        const dx = Math.min(0, base + e.clientX - x0)
        c.style.transform = `translateX(${dx}px)`
        sw.classList.toggle('swiperow--armed', -dx > sw.offsetWidth * 0.4)
      })
      const end = (e) => {
        if (x0 === null) return
        x0 = null
        base = 0
        if (e && sw.hasPointerCapture(e.pointerId)) sw.releasePointerCapture(e.pointerId)
        c.style.willChange = ''
        sw.classList.remove('is-dragging')
        const armed = sw.classList.contains('swiperow--armed')
        /* ★戻りの起点を明示する★ 空のキーフレーム [{}, …] は「そのときの
           下地の値」を読むので、先に transform を消すと none → 0 になり、
           500ms 走っているのに1pxも動かず瞬間移動して見える */
        const from = c.style.transform || 'translateX(0px)'
        c.style.transform = ''
        c.animate([{ transform: from }, { transform: 'translateX(0px)' }], {
          duration: 500,
          easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
        })
        sw.classList.remove('swiperow--armed')
        if (armed) u.toast(d, '1件を削除しました', '元に戻す')
      }
      sw.addEventListener('pointerup', end)
      sw.addEventListener('pointercancel', end)
    },
  },

  /* ============================================================ 重ねる */
  {
    id: 'sheet',
    name: 'ボトムシート',
    m3: 'Modal bottom sheet',
    group: '重ねる',
    file: 'core',
    doc: '16-overlays',
    tags: 'sheet bottom sheet drawer modal シート',
    note: 'surface-low / 上角 xl / 暗幕 32%。**モバイルの既定**。選択肢を出す・値を入れるのはこれ。',
    contracts: [
      'bottom: 0 を死守（JS が offsetHeight を移動距離と入場開始位置に使う）',
      '掴める要素に CSS の @keyframes を足さない。freezeInto() が全 Animation を cancel するので永久停止する',
      '.sheet__body > * に flex-shrink: 0',
    ],
    frame: 'app',
    w: 360,
    h: 400,
    html: `<main class="main main--padded">
  <button class="btn btn--filled" data-open>ボトムシートを開く</button>
</main>`,
    init(d, u) {
      u.$('[data-open]', d).onclick = () => {
        const close = u.overlay(d, () => {
          const el = d.createElement('div')
          el.className = 'sheet'
          el.innerHTML = `
            <div class="sheet__grab">
              <div class="sheet__handle"></div>
              <h2 class="sheet__title">並べ替え</h2>
            </div>
            <div class="sheet__body">
              <label class="check"><input type="radio" name="s" class="radio" checked />新しい順</label>
              <label class="check"><input type="radio" name="s" class="radio" />古い順</label>
              <label class="check"><input type="radio" name="s" class="radio" />名前順</label>
              <button class="btn btn--filled btn--full">決定</button>
            </div>`
          el.querySelector('.btn').onclick = () => close()
          el.animate([{ transform: 'translateY(100%)' }, {}], {
            duration: 500,
            easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
          })
          return el
        })
      }
    },
  },

  {
    id: 'sidesheet',
    name: 'サイドシート',
    m3: 'Side sheet',
    group: '重ねる',
    file: 'nav',
    doc: '15-adaptive',
    tags: 'side sheet drawer right panel サイド 絞り込み',
    note: '右から出る補助の面。ボトムシートは本文を隠すので、**本文を見ながら触りたいもの**（絞り込み・詳細）はこちら。',
    contracts: ['--standard を付けると expanded 幅では覆いを掛けず、本文の横に並ぶ'],
    frame: 'app',
    w: 420,
    h: 400,
    html: `<main class="main main--padded">
  <button class="btn btn--filled" data-open>サイドシートを開く</button>
</main>`,
    init(d, u) {
      u.$('[data-open]', d).onclick = () => {
        const close = u.overlay(d, () => {
          const el = d.createElement('aside')
          el.className = 'sidesheet'
          el.innerHTML = `
            <div class="sidesheet__head">
              <h2 class="sidesheet__title">絞り込み</h2>
              <button class="iconbtn" aria-label="閉じる"><svg class="icon"><use href="#i-close"/></svg></button>
            </div>
            <div class="sidesheet__body">
              <div class="section">
                <h3 class="label">費目</h3>
                <label class="check"><input type="checkbox" class="checkbox" checked />食費</label>
                <label class="check"><input type="checkbox" class="checkbox" />日用品</label>
              </div>
              <button class="btn btn--filled btn--full">適用する</button>
            </div>`
          for (const b of el.querySelectorAll('.iconbtn, .btn')) b.onclick = () => close()
          el.animate([{ transform: 'translateX(100%)' }, {}], {
            duration: 500,
            easing: 'cubic-bezier(0.25, 1.05, 0.35, 1)',
          })
          return el
        })
      }
    },
  },

  {
    id: 'dialog',
    name: 'ダイアログ',
    m3: 'Basic / alert dialog',
    group: '重ねる',
    file: 'core / overlay',
    doc: '16-overlays',
    tags: 'dialog modal alert confirm 確認 モーダル',
    note: '**本当に戻せないものだけ**。取り消せる操作はスナックバーの「元に戻す」で受ける。',
    contracts: [
      '確認ダイアログを多用すると、人は読まずに押すようになる',
      '破壊的な選択肢を既定のフォーカスにしない',
    ],
    frame: 'app',
    w: 360,
    h: 360,
    html: `<main class="main main--padded">
  <button class="btn btn--danger" data-open>4件を完全に削除</button>
</main>`,
    init(d, u) {
      u.$('[data-open]', d).onclick = () => {
        const close = u.overlay(d, () => {
          const el = d.createElement('div')
          el.className = 'dialog dialog--alert'
          el.innerHTML = `
            <svg class="dialog__icon"><use href="#i-trash"/></svg>
            <h2 class="dialog__title">4件を完全に削除しますか</h2>
            <p class="muted">この操作は元に戻せません。ゴミ箱にも残りません。</p>
            <div class="dialog__acts">
              <button class="btn btn--text" data-x>やめる</button>
              <button class="btn btn--danger" data-x>削除する</button>
            </div>`
          for (const b of el.querySelectorAll('[data-x]')) b.onclick = () => close()
          el.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(0.92)' }, {}], {
            duration: 350,
            easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)',
          })
          return el
        })
      }
    },
  },

  {
    id: 'menu',
    name: 'メニュー',
    m3: 'Menu',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'menu dropdown popup コンテキスト メニュー',
    note: '角 xs(4) / surface-mid / elev-2 / 項目 48。出し入れは Popover API に任せ、位置決めだけ JS がやる。',
    contracts: [
      '携帯ではメニューを使わず、ボトムシートで出す。小さい画面では出た瞬間に指で隠れる',
      '自前の「外側クリック検出」を書かない。必ずスクロール中や iframe で漏れる',
      '入れ子のメニューを作らない。触る画面で辿れない',
      '破壊的な項目は一番下に置き、区切りで離す',
    ],
    h: 200,
    html: `<button class="iconbtn" popovertarget="m1" aria-expanded="false" aria-label="その他">
  <svg class="icon"><use href="#i-more"/></svg>
</button>

<div popover id="m1" class="menu">
  <div class="menu__label">この項目</div>
  <button class="menu__item"><svg class="icon"><use href="#i-copy"/></svg>複製<span class="menu__trailing">⌘D</span></button>
  <button class="menu__item"><svg class="icon"><use href="#i-share"/></svg>共有<span class="menu__trailing">⌘S</span></button>
  <button class="menu__item" aria-disabled="true"><svg class="icon"><use href="#i-star"/></svg>お気に入り（準備中）</button>
  <div class="menu__sep"></div>
  <button class="menu__item menu__item--danger"><svg class="icon"><use href="#i-trash"/></svg>削除</button>
</div>`,
    init: (d, u) => u.bindMenu(d, u.$('[popovertarget="m1"]', d), u.$('#m1', d)),
  },

  {
    id: 'ctxmenu',
    name: 'コンテキストメニュー',
    m3: 'Menu（右クリック / 長押し）',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'context menu right click long press 右クリック 長押し',
    note: '★面の上で右クリック、または長押し★ 同じ .menu を指した座標に置く。長押しで開いたときは短い振動を返す。',
    contracts: ['長押しは 500ms。指が 8px 以上動いたら取り消す（スクロールと取り合わない）'],
    h: 260,
    html: `<div class="panel" data-ctx><div class="panel__body">
  <strong>右クリック / 長押し</strong>
  <span class="muted">この面でコンテキストメニューが開きます</span>
</div></div>

<div popover id="m2" class="menu">
  <button class="menu__item"><svg class="icon"><use href="#i-copy"/></svg>コピー</button>
  <button class="menu__item"><svg class="icon"><use href="#i-share"/></svg>共有</button>
  <div class="menu__sep"></div>
  <button class="menu__item menu__item--danger"><svg class="icon"><use href="#i-trash"/></svg>削除</button>
</div>`,
    init: (d, u) => u.bindContextMenu(d, u.$('[data-ctx]', d), u.$('#m2', d)),
  },

  {
    id: 'popover',
    name: 'ポップオーバー',
    m3: '（M3 に無い）',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'popover hover card tooltip rich 補足',
    note: 'メニューとの違いは「行が並ぶ」か「自由な中身か」だけ。surface-high / 角 lg / 最大 320。',
    contracts: [],
    h: 200,
    html: `<button class="btn" popovertarget="p1">詳しく</button>

<div popover id="p1" class="popover">
  <strong>予算とは</strong>
  <span class="muted">その費目に月いくらまで使うかの目安です。超えても記録は続きます。</span>
  <button class="btn btn--sm">設定する</button>
</div>`,
    init: (d, u) => u.bindMenu(d, u.$('[popovertarget="p1"]', d), u.$('#p1', d)),
  },

  {
    id: 'tip',
    name: 'ツールチップ',
    m3: 'Plain / rich tooltip',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'tooltip tip hint 説明 ヒント',
    note: '★マウスを乗せる（PC のみ）★ plain は inverse-surface で押せない。rich は表題・操作を持てて押せる。',
    contracts: [
      '触る画面には出さない。指には hover が無いので「押した」のか「説明が出た」のか分からなくなる',
      'キーボードのフォーカスでも出す。マウスだけの情報にしない',
    ],
    h: 200,
    html: `<button class="iconbtn" id="tb" aria-describedby="t1" aria-label="元に戻す">
  <svg class="icon"><use href="#i-back"/></svg>
</button>

<div popover id="t1" class="tip">元に戻す（⌘Z）</div>`,
    init: (d, u) => u.bindTooltip(d, u.$('#tb', d), u.$('#t1', d)),
  },

  {
    id: 'accordion',
    name: '開閉（アコーディオン）',
    m3: '（M3 に無い）',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'accordion collapsible details disclosure 開閉 折りたたみ FAQ',
    note: '<details> / <summary> で作る。同じ name を付けると排他（1つだけ開く）になる。',
    contracts: [
      'div と JS で作り直さない。開閉の状態・キーボード操作・読み上げ・ページ内検索をブラウザが持っている',
      'list-style: none と ::-webkit-details-marker の両方を消す',
      'FAQ 以外で使う前に考える。「畳んでおきたい」はたいてい「情報が多すぎる」の言い換え',
    ],
    h: 300,
    html: `<div class="accordion">
  <details class="accordion__item" name="faq" open>
    <summary class="accordion__head">
      <span>なぜ &lt;details&gt; を使うのか</span>
      <svg class="accordion__chevron"><use href="#i-chevron"/></svg>
    </summary>
    <div class="accordion__body">
      開閉の状態・キーボード操作・読み上げ・ページ内検索をブラウザが持つから。
    </div>
  </details>
  <details class="accordion__item" name="faq">
    <summary class="accordion__head">
      <span>高さのアニメーションは？</span>
      <svg class="accordion__chevron"><use href="#i-chevron"/></svg>
    </summary>
    <div class="accordion__body">
      interpolate-size と ::details-content が入った環境では滑らかに開く。
      入っていない環境では瞬間的に開くだけで、壊れない。
    </div>
  </details>
</div>`,
  },

  {
    id: 'command',
    name: 'コマンドパレット',
    m3: '（M3 に無い）',
    group: '重ねる',
    file: 'overlay',
    doc: '16-overlays',
    tags: 'command palette cmdk spotlight quick open コマンド',
    note: '★↑↓ と Enter で辿れる★ 検索欄 + 束ねた候補。携帯では .searchview（全画面）にする。',
    contracts: [
      'hover ではなく aria-selected で「いま辿っている場所」を示す。マウスの位置に印が引きずられない',
      '入力の font-size は 16px 以上',
    ],
    frame: 'app',
    w: 420,
    h: 420,
    html: `<main class="main main--padded">
  <button class="btn btn--filled" data-open>コマンドパレットを開く</button>
  <p class="muted" style="margin-top:8px"><span class="kbd">⌘</span> <span class="kbd">K</span> でも開きます</p>
</main>`,
    init(d, u) {
      const open = () => {
        const close = u.overlay(d, () => {
          const el = d.createElement('div')
          el.className = 'command'
          el.innerHTML = `
            <div class="command__head">
              <svg class="icon"><use href="#i-search"/></svg>
              <input class="command__input" placeholder="何をしますか" />
              <span class="kbd">esc</span>
            </div>
            <div class="command__list">
              <div class="menu__label">よく使うもの</div>
              <button class="command__item" aria-selected="true"><svg class="icon"><use href="#i-plus"/></svg>新しい記録<span class="command__sub">⌘N</span></button>
              <button class="command__item"><svg class="icon"><use href="#i-table"/></svg>今月を見る</button>
              <button class="command__item"><svg class="icon"><use href="#i-gear"/></svg>設定<span class="command__sub">⌘,</span></button>
              <div class="menu__label">最近</div>
              <button class="command__item"><svg class="icon"><use href="#i-clock"/></svg>9月の食費</button>
            </div>`
          const items = [...el.querySelectorAll('.command__item')]
          const inp = el.querySelector('.command__input')
          inp.onkeydown = (e) => {
            const i = items.findIndex((x) => x.getAttribute('aria-selected') === 'true')
            const move = (n) =>
              items.forEach((x, j) => x.setAttribute('aria-selected', String(j === n)))
            if (e.key === 'ArrowDown') (e.preventDefault(), move((i + 1) % items.length))
            else if (e.key === 'ArrowUp')
              (e.preventDefault(), move((i - 1 + items.length) % items.length))
            else if (e.key === 'Enter' || e.key === 'Escape') (e.preventDefault(), close())
          }
          for (const it of items) it.onclick = () => close()
          el.animate([{ opacity: 0, transform: 'translateX(-50%) scale(0.96)' }, {}], {
            duration: 350,
            easing: 'cubic-bezier(0.3, 1.2, 0.4, 1)',
          })
          setTimeout(() => inp.focus(), 0)
          return el
        })
      }
      u.$('[data-open]', d).onclick = open
      d.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') (e.preventDefault(), open())
      })
    },
  },

  /* ============================================================ 知らせ */
  {
    id: 'badge',
    name: 'バッジ',
    m3: 'Badge',
    group: '知らせ',
    file: 'core',
    doc: '09-components',
    tags: 'badge label status tag 状態 札',
    note: 'label-m（12/500）/ 角 sm。--on は primary-container、--alert は error-container。',
    contracts: [],
    h: 130,
    html: `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
  <span class="badge">既定</span>
  <span class="badge badge--on">有効</span>
  <span class="badge badge--off">停止中</span>
  <span class="badge badge--alert">超過</span>
</div>`,
  },

  {
    id: 'empty',
    name: '空状態',
    m3: '（M3 に無い）',
    group: '知らせ',
    file: 'core',
    doc: '11-states',
    tags: 'empty state placeholder 空 なし',
    note: 'お詫びではなく招待状。「次にやる操作」のボタンを必ず1つ置く。',
    contracts: [
      '「データがありません」で終わらせない',
      '絞り込みの結果が空のときは、ボタンは「絞り込みを外す」',
    ],
    h: 280,
    html: `<div class="empty">
  <span class="empty__title">まだ何もありません</span>
  <span>最初のひとつを追加すると、ここに並びます</span>
  <button class="btn btn--filled">追加する</button>
</div>`,
  },

  {
    id: 'notice',
    name: '通知カード',
    m3: '（Alert）',
    group: '知らせ',
    file: 'core',
    doc: '11-states',
    tags: 'alert notice callout error エラー 通知',
    note: '地から一段上の面（surface-high）。エラーは「何が起きたか」「どうすれば直るか」「再試行ボタン」の3つを揃える。',
    contracts: ['「エラーが発生しました」だけにしない', '中のボタンを横幅いっぱいに伸ばさない'],
    h: 300,
    html: `<div class="notice">
  <strong>通知カード</strong>
  <span class="muted">地から一段上の面（surface-container-high）に置く</span>
</div>

<div class="notice notice--alert" style="margin-top:12px">
  <strong>保存できませんでした</strong>
  <span class="muted">通信が切れています。つながってからもう一度試してください</span>
  <button class="btn btn--sm">もう一度試す</button>
</div>`,
  },

  {
    id: 'banner',
    name: '上から降りる札',
    m3: '（Banner）',
    group: '知らせ',
    file: 'core',
    doc: '11-states',
    tags: 'banner offline 通知 オフライン 帯',
    note: 'トップアプリバーの下に降りてくる。オフラインなど「いまの状態」を伝える。押せるものではないので操作を持たせない。',
    contracts: ['位置は --inset-top から calc する'],
    frame: 'app',
    w: 360,
    h: 240,
    html: `<header class="appbar"><div class="appbar__side"></div>
  <h1 class="appbar__title">一覧</h1><div class="appbar__side"></div></header>
<div class="banner">オフラインです。つながると自動で同期します</div>
<main class="main main--padded"></main>`,
  },

  {
    id: 'skel',
    name: '骨（スケルトン）',
    m3: '（Skeleton）',
    group: '知らせ',
    file: 'core',
    doc: '11-states',
    tags: 'skeleton loading placeholder 読み込み 骨',
    note: '出てくるものと同じ形・同じ位置の面を先に置く。走査グラデーション（シマー）は使わず、息をするだけのパルス。',
    contracts: [
      '角丸を 4px から上げない。高さ 12〜14px の骨がカプセルになると「読み込み中の行」に見えなくなる',
      '200ms 未満で終わるなら出さない（一瞬出て消えるのは、何も出ないより遅く感じる）',
    ],
    h: 220,
    html: `<div class="panel"><div class="panel__body skel-group">
  <div class="skel" style="width:60%; height:14px"></div>
  <div class="skel" style="width:90%; height:14px"></div>
  <div class="skel" style="width:40%; height:14px"></div>
</div></div>`,
  },

  {
    id: 'toast',
    name: 'スナックバー',
    m3: 'Snackbar',
    group: '知らせ',
    file: 'core',
    doc: '11-states',
    tags: 'snackbar toast sonner undo 元に戻す 通知',
    note: '★押すと出る★ inverse-surface の帯、操作は inverse-primary。**画面の上**に出す — 下端は親指の通り道で、バーや FAB と場所を取り合う。',
    contracts: [
      '本文は1行だけ。溢れたら省略する（何行にも伸びるとブロックしているのと同じ）',
      '装飾用の @keyframes を足さない。freezeInto() が全 Animation を cancel するので永久停止する',
      'これがあるから確認ダイアログが要らなくなる',
    ],
    frame: 'app',
    w: 360,
    h: 320,
    html: `<div class="toasts"></div>
<main class="main main--padded">
  <button class="btn btn--danger" data-open>1件を削除する</button>
</main>`,
    init(d, u) {
      u.$('[data-open]', d).onclick = () => u.toast(d, '1件を削除しました', '元に戻す')
    },
  },

  /* ============================================================ 進み具合 */
  {
    id: 'meter',
    name: '線の進捗',
    m3: 'Linear progress',
    group: '進み具合',
    file: 'core',
    doc: '18-data',
    tags: 'progress meter bar linear 進捗 予算',
    note: 'トラックは secondary-container、値は primary、両端丸。100% を超えたら --over（error）。',
    contracts: ['見出しの隣に置くボタンは flex: 0 0 auto（左の文が長いとボタンが縦書きになる）'],
    h: 220,
    html: `<div class="meter">
  <div class="meter__head"><span>今月の予算</span><span class="mono">62%</span></div>
  <div class="meter__track"><div class="meter__fill" style="width:62%"></div></div>
</div>

<div class="meter" style="margin-top:16px">
  <div class="meter__head"><span>先月の予算</span><span class="mono">118%</span></div>
  <div class="meter__track"><div class="meter__fill meter__fill--over" style="width:100%"></div></div>
</div>`,
  },

  {
    id: 'ring',
    name: '環の進捗',
    m3: 'Circular progress (determinate)',
    group: '進み具合',
    file: 'data',
    doc: '18-data',
    tags: 'circular progress ring donut 環 円 進捗',
    note: '★スライダーで動かせる★ conic-gradient + mask で描いてあるので SVG が要らない。割合は --p（0〜100 の数）。',
    contracts: ['mask が掛かった要素の中には文字を置けない。.ring-wrap で外から重ねる'],
    h: 220,
    html: `<div style="display:flex; gap:16px; align-items:center">
  <div class="ring-wrap">
    <div class="ring" style="--p:62"></div>
    <span class="ring__label">62</span>
  </div>
  <input type="range" class="slider" value="62" style="--p:62%; flex:1" aria-label="進捗" />
</div>`,
    init(d, u) {
      const s = u.$('.slider', d)
      s.oninput = () => {
        s.style.setProperty('--p', s.value + '%')
        u.$('.ring', d).style.setProperty('--p', s.value)
        u.$('.ring__label', d).textContent = s.value
      }
    },
  },

  {
    id: 'loader',
    name: '読み込みの印',
    m3: 'Loading indicator (Expressive)',
    group: '進み具合',
    file: 'core',
    doc: '07-motion',
    tags: 'loading indicator spinner loader 読み込み スピナー',
    note: '7つの多角形（burst → cookie → 五角形 → pill → sunny → 四つ葉 → 楕円）の間を、形が変わりながら回る。path の d を WAAPI で補間している。',
    contracts: [
      '回転だけは linear で正しい（無限に回るものが加減速すると脈打って見える）',
      '全画面スピナーは禁止。一覧の読み込みは骨',
    ],
    h: 200,
    html: `<div style="display:flex; gap:16px; align-items:center">
  <div class="loader-chip">
    <svg class="loader loader--on" viewBox="0 0 100 100"><path class="loader__shape"></path></svg>
  </div>
  <svg class="loader loader--on" viewBox="0 0 100 100" style="color:var(--primary)">
    <path class="loader__shape"></path>
  </svg>
</div>`,
    init: (d, u) => u.loader(d),
  },

  {
    id: 'ptr',
    name: '引いて更新',
    m3: 'Pull to refresh',
    group: '進み具合',
    file: 'core',
    doc: '12-gestures',
    tags: 'ptr pull to refresh swipe refresh reload 引いて更新 更新 リロード 下に引く',
    note: '★一覧を掴んで下へ引く（マウスでもできる）★ 動くのは印だけで、一覧は動かない。引いた量で印の形が進み、しきい値を越えて離すと回り始める。',
    contracts: [
      '一覧ごと下げない。離した瞬間に中身が跳ねて「どこを読んでいたか」が消える',
      '印は z-index をバーより下（--z-float）にして、バーの下から出てくるように見せる',
      '.loader-chip の margin-top: -56px が「隠れている位置」。JS の HIDDEN と対',
      'しきい値に到達した瞬間だけ haptic を鳴らす。引いている間は鳴らさない',
    ],
    frame: 'app',
    w: 360,
    h: 420,
    html: `<header class="appbar">
  <div class="appbar__side"></div>
  <h1 class="appbar__title">受信箱</h1>
  <div class="appbar__side"></div>
</header>

<div class="ptr">
  <div class="loader-chip">
    <svg class="loader" viewBox="0 0 100 100"><path class="loader__shape"></path></svg>
  </div>
</div>

<main class="main main--padded">
  <div class="rowlist">
    <div class="row"><div class="row__main"><span class="row__title">請求の確認</span>
      <span class="row__sub">10:24</span></div></div>
    <div class="row"><div class="row__main"><span class="row__title">配送のお知らせ</span>
      <span class="row__sub">09:41</span></div></div>
    <div class="row"><div class="row__main"><span class="row__title">週次のまとめ</span>
      <span class="row__sub">昨日</span></div></div>
    <div class="row"><div class="row__main"><span class="row__title">パスワードの変更</span>
      <span class="row__sub">昨日</span></div></div>
    <div class="row"><div class="row__main"><span class="row__title">領収書</span>
      <span class="row__sub">9月1日</span></div></div>
    <div class="row"><div class="row__main"><span class="row__title">ようこそ</span>
      <span class="row__sub">8月30日</span></div></div>
  </div>
</main>`,
    init(d, u) {
      let n = 0
      u.ptr(d, u.$('.main', d), u.$('.ptr', d), () => {
        /* 実際のアプリではここが fetch。Promise が解決するまで印が回る */
        return new Promise((ok) =>
          d.defaultView.setTimeout(() => {
            const list = u.$('.rowlist', d)
            const row = d.createElement('div')
            row.className = 'row'
            row.innerHTML =
              `<div class="row__main"><span class="row__title">新しい知らせ ${++n}</span>` +
              `<span class="row__sub">たった今</span></div>`
            list.prepend(row)
            ok()
          }, 1200),
        )
      })
    },
  },

  {
    id: 'steps',
    name: '手順',
    m3: '（M3 に無い / Stepper）',
    group: '進み具合',
    file: 'data',
    doc: '18-data',
    tags: 'stepper steps wizard 手順 ステップ',
    note: '「いま何番目か」だけを言う。各段に説明を足すと、本文より手順の帯のほうが大きくなる。',
    contracts: [],
    h: 160,
    html: `<div class="steps">
  <div class="steps__item steps__item--done"><span class="steps__dot">✓</span>入力</div>
  <div class="steps__line steps__line--done"></div>
  <div class="steps__item steps__item--now"><span class="steps__dot">2</span>確認</div>
  <div class="steps__line"></div>
  <div class="steps__item"><span class="steps__dot">3</span>完了</div>
</div>`,
  },

  {
    id: 'timeline',
    name: '年表',
    m3: '（M3 に無い）',
    group: '進み具合',
    file: 'data',
    doc: '18-data',
    tags: 'timeline history activity 履歴 年表 経過',
    note: '起きたことの並び。時刻は等幅。まだ起きていないものは --muted。',
    contracts: [],
    h: 260,
    html: `<div class="timeline">
  <div class="timeline__item"><div class="timeline__dot"></div>
    <div class="timeline__body"><span class="timeline__when">09:30</span><span>注文を受け取りました</span></div></div>
  <div class="timeline__item"><div class="timeline__dot"></div>
    <div class="timeline__body"><span class="timeline__when">11:05</span><span>発送しました</span></div></div>
  <div class="timeline__item"><div class="timeline__dot timeline__dot--muted"></div>
    <div class="timeline__body"><span class="timeline__when">明日</span><span class="muted">お届け予定</span></div></div>
</div>`,
  },

  /* ============================================================ 会話 */
  {
    id: 'chat',
    name: '会話（チャット）',
    m3: '（M3 に無い）',
    group: '会話',
    file: 'chat',
    doc: '20-chat',
    tags: 'chat message bubble conversation ai 会話 チャット 吹き出し',
    note: 'チャットは「一覧」ではなく「会話」。区切り線を引かず、自分と相手を**左右**で分ける（色だけで分けない）。新しいものが下。',
    contracts: [
      '吹き出しは中身なりの幅。1文字の返事が画面幅いっぱいにならないようにする',
      '時刻・既読は吹き出しの外に出す。中に入れると短い返事で時刻が幅を決めてしまう',
      '発話に付ける操作は常に出す。hover でしか出ないと触る画面では永久に見つからない',
      '吹き出しの中は user-select: text に戻す（コピーされるためにある）',
    ],
    frame: 'app',
    w: 360,
    h: 460,
    html: `<div class="chat">
  <div class="chat__log">
    <span class="chat__mark">今日</span>

    <div class="msg">
      <div class="msg__bubble">先月の食費、いくらだった？</div>
      <div class="msg__meta">09:12</div>
    </div>

    <div class="msg msg--me">
      <div class="msg__bubble">38,420円でした。先月より 12% 増えています。</div>
      <div class="msg__meta">09:12 · 既読</div>
    </div>

    <div class="msg">
      <div class="msg__bubble">内訳を出して</div>
    </div>

    <div class="msg msg--me">
      <div class="msg__bubble">
        <div class="prose">
          <ul><li>外食 18,200</li><li>食料品 14,900</li><li>飲み物 5,320</li></ul>
        </div><span class="msg__caret"></span>
      </div>
      <div class="msg__acts">
        <button class="iconbtn" aria-label="コピー"><svg class="icon"><use href="#i-copy"/></svg></button>
        <button class="iconbtn" aria-label="やり直す"><svg class="icon"><use href="#i-refresh"/></svg></button>
      </div>
    </div>
  </div>

  <div class="composer">
    <button class="composer__act" aria-label="添付"><svg class="icon"><use href="#i-attach"/></svg></button>
    <textarea class="composer__input" rows="1" placeholder="メッセージ"></textarea>
    <button class="composer__send" aria-label="送信"><svg class="icon"><use href="#i-send"/></svg></button>
  </div>
</div>`,
    init(d, u) {
      const log = u.$('.chat__log', d)
      const ta = u.$('.composer__input', d)
      const send = u.$('.composer__send', d)
      log.scrollTop = log.scrollHeight
      /* 入力は中身で伸ばす。最大は CSS の max-height が抑える */
      const grow = () => {
        ta.style.height = 'auto'
        ta.style.height = `${ta.scrollHeight}px`
        send.disabled = !ta.value.trim()
      }
      ta.addEventListener('input', grow)
      grow()
      send.onclick = () => {
        const text = ta.value.trim()
        if (!text) return
        const el = d.createElement('div')
        el.className = 'msg'
        el.innerHTML = '<div class="msg__bubble"></div><div class="msg__meta">いま</div>'
        el.querySelector('.msg__bubble').textContent = text
        log.appendChild(el)
        ta.value = ''
        grow()
        log.scrollTop = log.scrollHeight
      }
    },
  },

  {
    id: 'composer',
    name: '入力帯',
    m3: '（Search bar の派生）',
    group: '会話',
    file: 'chat',
    doc: '20-chat',
    tags: 'composer input bar send textarea 入力帯 送信',
    note: '下端に貼り付く。1行のときは 48、伸びても最大 5行ぶん。空のときは送信を押せなくするが、**消さない**（消えると「送るところが無い」画面になる）。',
    contracts: [
      'font-size は 16px を下回らせない（iOS がフォーカスで拡大して戻さなくなる）',
      '無制限に伸ばさない。画面が入力欄で埋まる',
    ],
    h: 200,
    html: `<div class="composer" style="border-radius:16px">
  <button class="composer__act" aria-label="添付"><svg class="icon"><use href="#i-attach"/></svg></button>
  <textarea class="composer__input" rows="1" placeholder="メッセージ"></textarea>
  <button class="composer__send" aria-label="送信" disabled><svg class="icon"><use href="#i-send"/></svg></button>
</div>`,
    init(d, u) {
      const ta = u.$('.composer__input', d)
      const send = u.$('.composer__send', d)
      const grow = () => {
        ta.style.height = 'auto'
        ta.style.height = `${ta.scrollHeight}px`
        send.disabled = !ta.value.trim()
      }
      ta.addEventListener('input', grow)
      grow()
    },
  },

  /* ============================================================ 写真と動画 */
  {
    id: 'gallery',
    name: '写真グリッド',
    m3: '（M3 に無い）',
    group: '写真と動画',
    file: 'media',
    doc: '21-media',
    tags: 'gallery grid photo image tile 写真 一覧 グリッド',
    note: '★タイルを押すと全画面へ飛ぶ★ 隙間は 3px 固定（写真が主役で、隙間は無いほうがよい）。列数は画面幅で 3 → 4 → 6。',
    contracts: [
      'タイルの角丸を押下で変えない。並んだ矩形が一斉に動くとちらつく',
      'バッジ・チェックは黒帯 + 白の固定色。背後が写真なのでテーマに追従させない',
      '選択中の縮小はここだけ scale を使ってよい（押下ではなく「選択」なので形では表せない）',
    ],
    w: 360,
    h: 400,
    html: `<div class="gallery">
  <button class="tile" style="background:var(--primary-container)"></button>
  <button class="tile" style="background:var(--tertiary-container)">
    <span class="tile__badge">1:24</span>
  </button>
  <button class="tile" style="background:var(--secondary-container)"></button>
  <button class="tile" style="background:var(--primary-fixed-dim)"></button>
  <button class="tile" style="background:var(--tertiary-fixed-dim)"></button>
  <button class="tile tile--skel"></button>
</div>`,
    init(d, u) {
      for (const t of u.$$('.tile', d))
        t.onclick = () => u.toast(d, 'ここから全画面ビューアへ飛ばす（共有要素）')
    },
  },

  {
    id: 'viewer',
    name: '全画面ビューア',
    m3: '（M3 に無い）',
    group: '写真と動画',
    file: 'media',
    doc: '21-media',
    tags: 'viewer lightbox fullscreen photo 全画面 ビューア 拡大',
    note: '地は**必ず黒**。上下のバーは帯ではなくグラデーションで沈める（明るい写真でもボタンが読める）。一度触ると隠れる。',
    contracts: [
      'ここだけ手書きの hex を許す。背後が必ず写真なので、テーマの色では消える',
      '下スワイプで閉じるときは、地だけ独立して薄くする（写真は薄くしない）',
      'ズーム中は横スワイプを無効にする',
    ],
    w: 360,
    h: 420,
    html: `<div class="viewer" style="position:absolute">
  <div class="viewer__slide">
    <div style="width:80%; aspect-ratio:3/4; background:var(--primary-container); border-radius:4px"></div>
  </div>

  <div class="viewer__bar viewer__bar--top">
    <button class="iconbtn iconbtn--onmedia" aria-label="閉じる"><svg class="icon"><use href="#i-close"/></svg></button>
    <span class="viewer__count">3 / 24</span>
    <div class="viewer__spacer"></div>
    <button class="iconbtn iconbtn--onmedia" aria-label="その他"><svg class="icon"><use href="#i-more"/></svg></button>
  </div>

  <div class="viewer__bar viewer__bar--bottom">
    <button class="iconbtn iconbtn--onmedia" aria-label="共有"><svg class="icon"><use href="#i-share"/></svg></button>
    <button class="iconbtn iconbtn--onmedia" aria-label="保存"><svg class="icon"><use href="#i-download"/></svg></button>
    <button class="iconbtn iconbtn--onmedia" aria-label="削除"><svg class="icon"><use href="#i-trash"/></svg></button>
  </div>
</div>`,
    init(d, u) {
      const v = u.$('.viewer', d)
      u.$('.viewer__slide', d).onclick = () => v.classList.toggle('viewer--bare')
    },
  },

  {
    id: 'player',
    name: '動画の操作',
    m3: '（M3 に無い）',
    group: '写真と動画',
    file: 'media',
    doc: '21-media',
    tags: 'video player controls 動画 再生 プレイヤー',
    note: 'ネイティブの `controls` を出さない。OS ごとに顔が違い、そこだけ「Webページ」に見える。',
    contracts: [
      'トラックは白30%、値は白。テーマの primary は写真の上で消える',
      'トラックの当たり判定は ::after で縦に ±16px 広げる（4px は掴めない）',
    ],
    w: 360,
    h: 260,
    html: `<div class="player">
  <div style="aspect-ratio:16/9; background:var(--primary-container)"></div>
  <div class="player__bar">
    <button class="iconbtn iconbtn--onmedia" aria-label="再生"><svg class="icon"><use href="#i-play"/></svg></button>
    <span class="player__time">0:34</span>
    <div class="player__track"><div class="player__fill" style="--p:40%"></div></div>
    <span class="player__time">1:24</span>
    <button class="iconbtn iconbtn--onmedia" aria-label="全画面"><svg class="icon"><use href="#i-expand"/></svg></button>
  </div>
</div>`,
  },

  /* ============================================================ 残りもの */
  {
    id: 'login',
    name: 'ログイン画面',
    m3: '（M3 に無い）',
    group: '残りもの',
    file: 'extra',
    doc: '09-components',
    tags: 'login signin auth ログイン 認証 サインイン',
    note: 'バーを持たない画面。body に .no-bars を付けて上下の占有量を 0 にする。中身は中央揃えだが、**入力だけ左寄せに戻す**。',
    contracts: [
      'body.no-bars を忘れない。忘れるとバーのぶんの余白が空いたまま中身が下にずれる',
      '入力を中央揃えのままにしない。打った文字が中央から左右に伸びて読みにくい',
    ],
    w: 360,
    h: 440,
    html: `<div class="login">
  <div class="login__brand">
    <svg class="icon icon--lg" style="width:40px;height:40px;color:var(--primary)"><use href="#i-layers"/></svg>
    <h1 class="login__title">アプリ名</h1>
    <p class="muted">続けるにはログインしてください</p>
  </div>

  <div class="login__form">
    <div class="field">
      <label class="label" for="lg1">メールアドレス</label>
      <input class="input" id="lg1" type="email" autocomplete="email" />
    </div>
    <div class="field">
      <label class="label" for="lg2">パスワード</label>
      <input class="input" id="lg2" type="password" autocomplete="current-password" />
    </div>
    <button class="btn btn--filled btn--full">ログイン</button>
    <button class="btn btn--text login__alt">別の方法で入る</button>
  </div>
</div>`,
  },

  {
    id: 'sortable',
    name: 'ドラッグ並べ替え',
    m3: '（M3 に無い）',
    group: '残りもの',
    file: 'extra',
    doc: '12-gestures',
    tags: 'sortable drag drop reorder dnd 並べ替え ドラッグ',
    note: '★左の掴み手（⋮⋮）を引いてみる★ 指の量に 1:1 で追従し、他の行がバネで滑って場所を空ける。',
    contracts: [
      'HTML5 の drag & drop を使わない。触る画面で動かず、ゴーストの見た目も制御できない',
      '掴んでいる間は transition を持たせない（指に付いてこなくなる）',
      'will-change は掴んでいる間だけ。常設すると一覧の全行が合成レイヤになる',
      '掴み手が無いときは長押し 400ms。無いとスクロールと取り合う',
    ],
    h: 300,
    html: `<div class="panel"><div class="rowlist sortable">
  <div class="row">
    <span class="sortable__grip"><svg class="icon"><use href="#i-grip"/></svg></span>
    <div class="row__main"><span class="row__title">食費</span></div>
    <span class="row__value">38,420</span>
  </div>
  <div class="row">
    <span class="sortable__grip"><svg class="icon"><use href="#i-grip"/></svg></span>
    <div class="row__main"><span class="row__title">家賃</span></div>
    <span class="row__value">72,000</span>
  </div>
  <div class="row">
    <span class="sortable__grip"><svg class="icon"><use href="#i-grip"/></svg></span>
    <div class="row__main"><span class="row__title">交通</span></div>
    <span class="row__value">9,860</span>
  </div>
</div></div>`,
    init: (d, u) => u.sortable(d, u.$('.sortable', d), '.row', '.sortable__grip'),
  },

  {
    id: 'agenda',
    name: '予定表（日）',
    m3: '（M3 に無い）',
    group: '残りもの',
    file: 'extra',
    doc: '09-components',
    tags: 'agenda schedule calendar event week 予定 日程 週',
    note: '日付を**選ぶ**のは `.cal`、予定を**見る**のはこちら。携帯はこの日ごとの一覧、広い画面では週の時間割（→ `.week`）。',
    contracts: [
      '月のマス目に予定を詰め込まない。携帯では読めない',
      '予定が無い日も行ごと消さない。消すと日付が飛んで「その日が存在しない」ように見える',
    ],
    h: 380,
    html: `<div class="agenda">
  <div class="agenda__day agenda__day--today">
    <div class="agenda__date"><span class="agenda__n">3</span><span class="agenda__dow">木</span></div>
    <div class="agenda__items">
      <button class="agenda__item">
        <div class="row__main"><span class="row__title">歯医者</span></div>
        <span class="agenda__when">10:00</span>
      </button>
      <button class="agenda__item" style="--accent:var(--tertiary)">
        <div class="row__main"><span class="row__title">買い出し</span></div>
        <span class="agenda__when">終日</span>
      </button>
    </div>
  </div>

  <div class="agenda__day">
    <div class="agenda__date"><span class="agenda__n">4</span><span class="agenda__dow">金</span></div>
    <div class="agenda__items"><div class="agenda__none">予定なし</div></div>
  </div>

  <div class="agenda__day">
    <div class="agenda__date"><span class="agenda__n">5</span><span class="agenda__dow">土</span></div>
    <div class="agenda__items">
      <button class="agenda__item" style="--accent:var(--error)">
        <div class="row__main"><span class="row__title">家賃の引き落とし</span></div>
        <span class="agenda__when">終日</span>
      </button>
    </div>
  </div>
</div>`,
  },

  {
    id: 'week',
    name: '予定表（週）',
    m3: '（M3 に無い）',
    group: '残りもの',
    file: 'extra',
    doc: '09-components',
    tags: 'week timetable calendar schedule grid 週 時間割 予定表 カレンダー',
    note: '★720 以上で使う部品★ 左の時刻の列 + 7日の格子。携帯（〜599）では列が細すぎて読めないので `.agenda` に切り替える。',
    contracts: [
      '携帯で出さない。日ごとの一覧（.agenda）に切り替える',
      '.week__ev の上端と高さは JS が --top / --h（px）で渡す。CSS に時刻の知識を持たせない',
      'いまの時刻の線（.week__now）は今日の列の .week__cell の中に置く（.week 自身は position を持たないので、外に置くと画面ごと突き抜ける）',
      '左端の時刻は「行の頭」ではなく「線」。translateY(-0.5em) で境目に合わせてある',
    ],
    w: 720,
    h: 340,
    html: `<div class="week">
  <div class="week__head"></div>
  <div class="week__head">月</div>
  <div class="week__head">火</div>
  <div class="week__head week__head--today">水</div>
  <div class="week__head">木</div>
  <div class="week__head">金</div>
  <div class="week__head">土</div>
  <div class="week__head">日</div>

  <div class="week__hour">8</div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"><div class="week__ev" style="--top:0px; --h:88px">資料づくり</div></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>

  <div class="week__hour">9</div>
  <div class="week__cell"></div>
  <div class="week__cell"><div class="week__ev" style="--top:0px; --h:66px">定例</div></div>
  <div class="week__cell">
    <div class="week__ev" style="--top:22px; --h:44px; --accent:var(--tertiary)">1on1</div>
  </div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>

  <div class="week__hour">10</div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"><div class="week__now" style="--top:26px"></div></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>

  <div class="week__hour">11</div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell">
    <div class="week__ev" style="--top:0px; --h:44px; --accent:var(--error)">歯医者</div>
  </div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>

  <div class="week__hour">12</div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"><div class="week__ev" style="--top:0px; --h:44px">昼</div></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
  <div class="week__cell"></div>
</div>`,
  },

  {
    id: 'print',
    name: '印刷',
    m3: '（M3 に無い）',
    group: '残りもの',
    file: 'print',
    doc: '09-components',
    tags: 'print pdf paper 印刷 紙 領収書',
    note: '★プレビューの中で ⌘P すると効きが見える★ 紙は「触れない画面」。操作を全部消して、中身だけを黒で置く。',
    contracts: [
      'ダークテーマのまま刷らせない。トナーを食い潰し、しかも読めない',
      '影は紙の上でただの灰色の帯になる。層は罫線で表す',
      '畳んである <details> は開いて刷る（紙には「押して開く」が無い）',
      '外部リンクは URL を後ろに出す（紙では押せないので行き先が分からない）',
    ],
    h: 340,
    html: `<div class="panel"><div class="panel__body">
  <h2 class="label">領収書</h2>
  <div class="rowlist">
    <div class="row"><div class="row__main"><span class="row__title">品名</span></div>
      <span class="row__value">12,340</span></div>
    <div class="row"><div class="row__main"><span class="row__title">消費税</span></div>
      <span class="row__value">1,234</span></div>
  </div>
  <button class="btn"><svg class="icon icon--sm"><use href="#i-print"/></svg>印刷する（このボタンは紙には出ない）</button>
</div></div>`,
    init(d, u) {
      u.$('.btn', d).onclick = () => d.defaultView.print()
    },
  },

  /* ============================================================ 文字 */
  {
    id: 'avatar',
    name: 'アバター',
    m3: '（M3 に無い）',
    group: '文字',
    file: 'data',
    doc: '09-components',
    tags: 'avatar profile picture user アイコン 人',
    note: '円の secondary-container + 頭文字、または画像。重ねて並べるときは負の margin（gap は「離す」もので負にできない）。',
    contracts: ['状態の点を色だけで意味付けしない。隣にラベルか読み上げテキストを置く'],
    h: 200,
    html: `<div style="display:flex; gap:12px; align-items:center">
  <span class="avatar avatar--sm">山</span>
  <span class="avatar">田中</span>
  <span class="avatar avatar--lg"><svg class="icon icon--lg"><use href="#i-user"/></svg></span>
  <span class="avatar-wrap">
    <span class="avatar">A</span>
    <span class="avatar__dot"></span><span class="sr-only">オンライン</span>
  </span>
</div>

<div class="avatars" style="margin-top:16px">
  <span class="avatar avatar--sm">A</span>
  <span class="avatar avatar--sm">B</span>
  <span class="avatar avatar--sm">C</span>
  <span class="avatar avatar--sm">+3</span>
</div>`,
  },

  {
    id: 'stat',
    name: '数値',
    m3: '（M3 に無い）',
    group: '文字',
    file: 'core',
    doc: '04-type',
    tags: 'stat metric number kpi 数値 合計',
    note: '主役の数値は display-m（45）。**1画面に1つだけ**。tabular-nums で、桁が変わっても数字が横に踊らない。',
    contracts: [],
    h: 220,
    html: `<div class="stat">
  <span class="muted">今月の支出</span>
  <span class="stat__hero mono">128,400</span>
</div>

<div class="stat" style="margin-top:16px">
  <span class="muted">先月</span>
  <span class="stat__value mono">142,860</span>
</div>`,
  },

  {
    id: 'prose',
    name: '本文（markdown）',
    m3: '（Typography）',
    group: '文字',
    file: 'data',
    doc: '04-type',
    tags: 'prose typography markdown article selectable 本文 記事 コピー 選択',
    note: 'AI の返答・README・記事など、こちらが構造を決められない HTML 用。長押しでコピーできる（base.css の user-select: none を戻してある）。この外側の文字を選ばせたいときは `.selectable` を付ける。',
    contracts: [
      '.prose の中だけは要素セレクタで書く。生成された HTML にクラスを付けられないので、ここだけ例外',
      '引用は左の線1本だけ。地を塗るとカードに見えて、引用か自分の言葉か分からなくなる',
    ],
    h: 400,
    html: `<article class="prose">
  <h2>本文（.prose）</h2>
  <p>生成された HTML にクラスを付けられないので、<strong>ここだけは要素セレクタで書く</strong>。</p>
  <ul><li>箇条書き</li><li><code>インラインのコード</code></li></ul>
  <blockquote>引用は左の線だけ。地を塗るとカードに見える。</blockquote>
  <pre><code>npm run gen:scheme</code></pre>
</article>`,
  },

  {
    id: 'code',
    name: 'コード欄・キー',
    m3: '（M3 に無い）',
    group: '文字',
    file: 'data',
    doc: '09-components',
    tags: 'code pre kbd keyboard shortcut コード キー ショートカット',
    note: 'コード欄は surface-lowest（地より沈める）。キーは 22px の小さな札。',
    contracts: [],
    h: 200,
    html: `<pre class="code">npm run gen:scheme</pre>

<p style="margin-top:12px">
  <span class="kbd">⌘</span> <span class="kbd">K</span>
  <span class="muted">でコマンドパレット</span>
</p>`,
  },

  {
    id: 'chart',
    name: '図',
    m3: '（M3 に定義なし）',
    group: '文字',
    file: 'data',
    doc: '18-data',
    tags: 'chart graph plot series legend グラフ 図 系列',
    note: '描くのは SVG。ここで決まるのは色と目盛りの作法だけ。系列は --series-1〜5。',
    contracts: [
      '4系列を超えたら色で分けるのを諦める。M3 の配色は役割の体系で、categorical palette ではない',
      'error を系列色に使わない（赤は「超過・失敗」の意味を持っている）',
      '系列が3つ以下なら凡例を置かず、線の横に直接ラベルを書く',
      '点をタップさせない。縦の帯（列全体）を当たり判定にする',
    ],
    h: 300,
    html: `<div class="panel"><div class="panel__body">
  <svg class="chart" viewBox="0 0 320 140" preserveAspectRatio="none" style="height:140px">
    <path class="chart__grid" d="M0 35H320M0 70H320M0 105H320" />
    <path class="chart__area" data-series="1" d="M0 110 60 84 120 96 180 52 240 66 300 30 320 34V140H0Z" />
    <path class="chart__line" data-series="1" d="M0 110 60 84 120 96 180 52 240 66 300 30 320 34" />
    <path class="chart__line" data-series="2" d="M0 124 60 118 120 104 180 108 240 88 300 92 320 86" />
  </svg>
  <div class="legend">
    <span class="legend__item"><span class="legend__key"></span>支出</span>
    <span class="legend__item"><span class="legend__key" style="background:var(--series-2)"></span>収入</span>
  </div>
</div></div>`,
  },
  {
    id: 'icons',
    name: 'アイコン',
    m3: 'Lucide（ISC）',
    group: '文字',
    file: '—（starter/icons/sprite.svg）',
    doc: '22-icons',
    tags: 'icon icons lucide symbol svg アイコン 記号',
    note: 'Lucide を使う。M3 の作法（線で描く・currentColor・丸い端点・24 格子）と最初から一致していて、違うのは太さだけ（`.icon` の CSS が上書きする）。★下は実際に焼いてある 106 個★ 押すと id をコピーする。',
    contracts: [
      '2,050 個を全部配らない。scripts/gen-icons.mjs の NAMES に書いたものだけ焼く',
      '名前は用途で付ける（i-house ではなく i-home）。見た目で付けると絵を差し替えたとき名前が嘘になる',
      'fill: currentColor に切り替えない。線で描いたアイコンは塗りにするとただの塊になる',
      'アイコンだけのボタンには aria-label を必ず付ける',
    ],
    h: 480,
    html: `<!-- 起動時に1回だけ: document.body.insertAdjacentHTML('afterbegin', SPRITE) -->
<svg class="icon icon--sm"><use href="#i-check" /></svg>
<svg class="icon"><use href="#i-search" /></svg>
<svg class="icon icon--lg"><use href="#i-upload" /></svg>

<div class="iconlist"></div>`,
    init(d, u) {
      const box = u.$('.iconlist', d)
      box.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;margin-top:16px'
      const ids = [...d.querySelectorAll('symbol')].map((s) => s.id).sort()
      box.innerHTML = ids
        .map(
          (id) =>
            `<button class="btn btn--text" style="flex-direction:column;gap:4px;min-height:64px;padding:4px" data-id="${id}">` +
            `<svg class="icon"><use href="#${id}"/></svg>` +
            `<span style="font-family:var(--font-num);font-size:var(--t-label-s);color:var(--on-surface-variant);max-width:80px;overflow:hidden;text-overflow:ellipsis">${id.slice(2)}</span>` +
            `</button>`,
        )
        .join('')
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-id]')
        if (!b) return
        const code = `<svg class="icon"><use href="#${b.dataset.id}" /></svg>`
        d.defaultView.navigator.clipboard?.writeText(code)
        u.toast(d, `${b.dataset.id} をコピーしました`)
      })
    },
  },

]

export const GROUPS = [...new Set(CATALOG.map((e) => e.group))]
