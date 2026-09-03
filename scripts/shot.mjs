/* 図鑑を実際に描いて撮る。
 *
 *   npm i -D playwright && npx playwright install chromium   # 初回だけ
 *   npm run shot                                             # → shots/
 *
 * ★これが無いと、レイアウトの崩れは誰も気づかない★
 * クラスの突合も、トークンの整合性も、型検査も、「箱が潰れている」を
 * 見つけられない。実際にこのリポジトリで、
 *   - 図鑑のプレビュー枠が潰れて中身が見えない
 *   - 携帯幅なのに常設ドロワーが出る（CSS の書き順で負けていた）
 * の2つが、目で見るまで通り抜けた。
 *
 * playwright は任意。入れていなければ何もせず終わる（CI を落とさない）。
 */
import { mkdirSync, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join, extname, normalize } from 'node:path'

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.log('playwright が無いので何もしない（npm i -D playwright で入る）')
  process.exit(0)
}

const ROOT = process.cwd()
const OUT = join(ROOT, 'shots')
const PORT = 8129
mkdirSync(OUT, { recursive: true })

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
}

/* ★ディレクトリは index.html を返す★ 返さないと /demo/ が 404 になり、
   site.js のトップレベル await が落ちて画面が真っ白になる（実際に踏んだ） */
const server = createServer(async (req, res) => {
  const p = decodeURIComponent((req.url ?? '/').split('?')[0])
  let file = join(ROOT, normalize(p))
  if (p.endsWith('/')) file = join(file, 'index.html')
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
})
await new Promise((r) => server.listen(PORT, r))

/* 撮る部品。引数で絞れる: npm run shot -- btn seg table */
const { CATALOG } = await import('../demo/catalog.js')
const want = process.argv.slice(2)
const targets = want.length ? CATALOG.filter((e) => want.includes(e.id)) : CATALOG

const browser = await chromium.launch()
const errors = []
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`${page.url()}: ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`))

for (const theme of ['light', 'dark']) {
  for (const e of targets) {
    await page.goto(`http://127.0.0.1:${PORT}/demo/#${e.id}`)
    await page.waitForTimeout(500)
    await page.evaluate((t) => {
      /* 図鑑の明るさボタンを押して合わせる（state は site.js が持っている） */
      const want = t === 'dark' ? 'dark' : 'light'
      for (let i = 0; i < 3; i++) {
        if (document.documentElement.getAttribute('data-theme') === want) break
        document.getElementById('theme').click()
      }
    }, theme)
    await page.waitForTimeout(600)
    await page.screenshot({ path: join(OUT, `${e.id}-${theme}.png`) })
  }
}

await browser.close()
server.close()

if (errors.length) {
  console.error('★ブラウザのエラー★')
  for (const e of [...new Set(errors)]) console.error('  ' + e)
  process.exitCode = 1
} else {
  console.log('ブラウザのエラー: なし')
}
console.log(`${targets.length * 2} 枚 →`, OUT)
