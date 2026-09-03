/* アイコンのスプライトを作る。
 *
 *   npm run gen:icons
 *
 * 元は Lucide（ISC / https://lucide.dev）。M3 の作法と最初から一致している:
 *   fill: none / stroke: currentColor / 丸い端点 / 24 の格子
 * 違うのは太さ（Lucide は 2、M3 は 1.8）だけで、それは `.icon` の CSS が
 * 上書きする（CSS は presentation attribute に勝つ）。
 *
 * ★2,050 個を全部配らない★ 下の NAMES に書いたものだけを焼く。
 *   使うアイコンは設計時に決まるものなので、配色と同じくビルド前に静的化する。
 *   足したいときは NAMES に lucide の名前を足してこれを回す。
 *
 * 出力（どちらも生成物。手で編集しない）:
 *   starter/icons/sprite.svg  … <symbol id="i-*"> を並べたもの
 *   starter/lib/icons.ts      … 同じものを文字列で持つ + 名前の型
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'node_modules', 'lucide-static', 'icons')
const OUT = join(process.cwd(), process.env.M3E_OUT ?? 'src')

/** 焼くアイコン。左が Lucide の名前、右がこのキットでの id（`i-` が付く）。
 *  ★名前は用途で付ける★ 見た目で付けると（`i-house`）、後で別の絵に
 *  差し替えたときに名前が嘘になる */
const NAMES = {
  // 行き先・移動
  house: 'home',
  search: 'search',
  settings: 'gear',
  menu: 'menu',
  'chevron-right': 'chevron',
  'chevron-left': 'back',
  'chevron-down': 'down',
  'chevron-up': 'up',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'external-link': 'external',
  'panel-left': 'panel',
  'log-out': 'logout',

  // 操作
  x: 'close',
  plus: 'plus',
  minus: 'minus',
  check: 'check',
  'ellipsis-vertical': 'more',
  ellipsis: 'more-h',
  pencil: 'edit',
  copy: 'copy',
  'share-2': 'share',
  'trash-2': 'trash',
  save: 'save',
  download: 'download',
  upload: 'upload',
  paperclip: 'attach',
  link: 'link',
  printer: 'print',
  'refresh-cw': 'refresh',
  'undo-2': 'undo',
  'redo-2': 'redo',
  filter: 'filter',
  'arrow-up-down': 'sort',

  // もの
  file: 'file',
  'file-text': 'doc',
  folder: 'folder',
  image: 'image',
  video: 'video',
  music: 'music',
  camera: 'camera',
  tag: 'tag',
  wallet: 'wallet',
  'credit-card': 'card',
  'map-pin': 'pin',
  globe: 'globe',
  'qr-code': 'qr',

  // 人
  user: 'user',
  users: 'users',
  heart: 'heart',
  star: 'star',
  bookmark: 'bookmark',
  'message-circle': 'message',
  send: 'send',
  bell: 'bell',
  'bell-off': 'bell-off',
  mail: 'mail',
  phone: 'phone',

  // 状態
  info: 'info',
  'circle-alert': 'alert',
  'triangle-alert': 'warn',
  'circle-check': 'ok',
  'circle-x': 'ng',
  eye: 'eye',
  'eye-off': 'eye-off',
  lock: 'lock',
  'lock-open': 'unlock',
  shield: 'shield',
  wifi: 'wifi',
  'wifi-off': 'offline',
  cloud: 'cloud',
  'cloud-off': 'cloud-off',

  // 見せ方
  calendar: 'calendar',
  clock: 'clock',
  list: 'list',
  'layout-grid': 'grid',
  table: 'table',
  'chart-column': 'chart',
  'chart-line': 'chart-line',
  layers: 'layers',
  'sliders-horizontal': 'sliders',
  sun: 'sun',
  moon: 'moon',
  palette: 'palette',
  'zoom-in': 'zoom-in',
  'zoom-out': 'zoom-out',
  play: 'play',
  pause: 'pause',

  // これから使うもの（チャット・メディア・並べ替え）
  'square-stack': 'stack',
  images: 'gallery',
  'grip-vertical': 'grip',
  'calendar-days': 'agenda',
  maximize: 'expand',
  minimize: 'collapse',
  'rotate-cw': 'rotate',
  mic: 'mic',
  'circle-stop': 'stop',
  sparkles: 'ai',

  // 文字を書く
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  'list-ordered': 'list-ordered',
  code: 'code',
  quote: 'quote',
}

if (!existsSync(SRC)) {
  console.error('lucide-static が見つからない。npm i -D lucide-static を先に走らせる')
  process.exit(1)
}

const parts = []
const missing = []

for (const [lucide, id] of Object.entries(NAMES)) {
  const file = join(SRC, `${lucide}.svg`)
  if (!existsSync(file)) {
    missing.push(lucide)
    continue
  }
  const raw = readFileSync(file, 'utf8')
  /* 外側の <svg> を捨てて中身だけ取る。stroke / fill / 太さは
     `.icon` の CSS が持つので、ここには一切残さない */
  const inner = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('')
  parts.push(`  <symbol id="i-${id}" viewBox="0 0 24 24">${inner}</symbol>`)
}

if (missing.length) {
  console.error('Lucide に無い名前:', missing.join(', '))
  console.error('（名前は https://lucide.dev/icons で確認する。改名されていることがある）')
  process.exit(1)
}

const ids = Object.values(NAMES).sort()
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
${parts.join('\n')}
</svg>
`

mkdirSync(join(OUT, 'icons'), { recursive: true })
writeFileSync(join(OUT, 'icons', 'sprite.svg'), sprite)

const ts = `/* 生成物 — 手で編集しない。scripts/gen-icons.mjs を回す。
   元は Lucide（ISC / https://lucide.dev）。

   使い方: 起動時に1回だけ SPRITE を DOM に差し込む。

     document.body.insertAdjacentHTML('afterbegin', SPRITE)

   あとはどこでも:

     <svg class="icon"><use href="#i-search" /></svg>

   ★太さ・色・大きさは .icon の CSS が持つ★ ここには一切入っていない。 */

export type IconName =
${ids.map((n) => `  | '${n}'`).join('\n')}

export const ICONS: IconName[] = [
${ids.map((n) => `  '${n}',`).join('\n')}
]

export const SPRITE = ${JSON.stringify(sprite)}
`
writeFileSync(join(OUT, 'lib', 'icons.ts'), ts)

console.log(`${ids.length} 個を焼いた →`, join(OUT, 'icons', 'sprite.svg'))
console.log('id:', ids.join(' '))
