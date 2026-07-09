#!/usr/bin/env node
/**
 * Cattura screenshot REALI del pannello admin (Payload) in locale.
 *
 * Prerequisiti:
 * - Admin raggiungibile (es. http://localhost:3000)
 * - Credenziali in `.env.screenshots` (non committato)
 *
 * Esecuzione:
 *   cd laureasi-docs
 *   npx playwright install chromium
 *   node scripts/capture-admin-screenshots.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

function readEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const out = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    out[key] = value
  }
  return out
}

function mustGet(env, key) {
  const val = env[key] || process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function joinUrl(base, p) {
  const b = base.replace(/\/+$/, '')
  const pp = String(p || '').startsWith('/') ? p : `/${p}`
  return `${b}${pp}`
}

const ROOT = path.resolve(process.cwd())
const envPath = path.join(ROOT, '.env.screenshots')
if (!fs.existsSync(envPath)) {
  throw new Error(`Missing ${envPath}. Create it with ADMIN_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_LOGIN_PATH`)
}

const fileEnv = readEnvFile(envPath)
const ADMIN_BASE_URL = mustGet(fileEnv, 'ADMIN_BASE_URL')
const ADMIN_EMAIL = mustGet(fileEnv, 'ADMIN_EMAIL')
const ADMIN_PASSWORD = mustGet(fileEnv, 'ADMIN_PASSWORD')
const ADMIN_LOGIN_PATH = mustGet(fileEnv, 'ADMIN_LOGIN_PATH')

const OUT_DIR = path.join(ROOT, 'images', 'admin')
ensureDir(OUT_DIR)

function withAdminBase(adminBase, p) {
  const base = adminBase === '/' ? '' : adminBase.replace(/\/+$/, '')
  const pp = String(p || '').startsWith('/') ? p : `/${p}`
  return `${base}${pp}` || '/'
}

function buildTargets(adminBase) {
  return [
    { file: 'sidebar-menu.png', path: withAdminBase(adminBase, '/') },
    { file: 'leads-lista.png', path: withAdminBase(adminBase, '/collections/leads') },
    { file: 'webhook-n8n.png', path: withAdminBase(adminBase, '/globals/lead-integration-settings') },
    { file: 'percorsi-lista.png', path: withAdminBase(adminBase, '/collections/degrees') },
    { file: 'agevolazioni-lista.png', path: withAdminBase(adminBase, '/collections/tax-breaks') },
    // Nota: per la "scheda università" apriamo un record dal listing sotto (vedi needsDetail)
    { file: 'aree-lista.png', path: withAdminBase(adminBase, '/collections/areas') },
    { file: 'recensioni-lista.png', path: withAdminBase(adminBase, '/collections/testimonials') },
    { file: 'blog-lista.png', path: withAdminBase(adminBase, '/collections/blog') },
    { file: 'faq-gruppi.png', path: withAdminBase(adminBase, '/collections/faq-groups') },
    { file: 'sorgenti-dati.png', path: withAdminBase(adminBase, '/collections/data_sources') },
    { file: 'utenti-lista.png', path: withAdminBase(adminBase, '/collections/users') },
  ]
}

function buildNeedsDetail(adminBase) {
  return {
    'leads-dettaglio.png': { from: withAdminBase(adminBase, '/collections/leads') },
    'leads-metadati.png': { from: withAdminBase(adminBase, '/collections/leads') },
    'tracking-utm.png': { from: withAdminBase(adminBase, '/collections/leads') },
    'percorso-modifica.png': { from: withAdminBase(adminBase, '/collections/degrees') },
    'in-evidenza-checkbox.png': { from: withAdminBase(adminBase, '/collections/degrees') },
    'master-moduli.png': { from: withAdminBase(adminBase, '/collections/masters'), afterOpen: { clickText: 'Moduli' } },
    'blog-editor.png': { from: withAdminBase(adminBase, '/collections/blog') },
    'utenti-ruolo.png': { from: withAdminBase(adminBase, '/collections/users') },
    'universita-scheda.png': { from: withAdminBase(adminBase, '/collections/universities') },
    'sconti-campagne.png': { url: withAdminBase(adminBase, '/collections/discount-campaigns') },
  }
}

async function main() {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  // Smoke check server
  await page.goto(joinUrl(ADMIN_BASE_URL, ADMIN_LOGIN_PATH), { waitUntil: 'domcontentloaded' })

  // Login heuristic selectors (compatibile con form custom)
  await page.waitForSelector('input', { timeout: 15_000 })

  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input#email',
    'input[name="username"]',
    'input#username',
    'input[type="text"]',
  ]
  const passSelectors = ['input[type="password"]', 'input[name="password"]', 'input#password']
  const submitSelectors = ['button[type="submit"]', 'button:has-text("Login")', 'button:has-text("Accedi")', 'input[type="submit"]']

  let emailFilled = false
  // Prefer label-based lookup when available
  for (const label of ['Email', 'E-mail', 'Username', 'Utente']) {
    const el = page.getByLabel(label, { exact: false })
    if (await el.count()) {
      await el.first().fill(ADMIN_EMAIL)
      emailFilled = true
      break
    }
  }
  for (const sel of emailSelectors) {
    if (emailFilled) break
    const el = page.locator(sel)
    if (await el.count()) {
      await el.first().fill(ADMIN_EMAIL)
      emailFilled = true
      break
    }
  }
  if (!emailFilled) throw new Error('Could not find email input on /login')

  let passFilled = false
  for (const label of ['Password', 'Pass', 'Parola chiave']) {
    const el = page.getByLabel(label, { exact: false })
    if (await el.count()) {
      await el.first().fill(ADMIN_PASSWORD)
      passFilled = true
      break
    }
  }
  for (const sel of passSelectors) {
    if (passFilled) break
    const el = page.locator(sel)
    if (await el.count()) {
      await el.first().fill(ADMIN_PASSWORD)
      passFilled = true
      break
    }
  }
  if (!passFilled) throw new Error('Could not find password input on /login')

  // Submit + wait navigation to admin area
  let submitted = false
  for (const sel of submitSelectors) {
    const btn = page.locator(sel)
    if (await btn.count()) {
      await Promise.all([
        page.waitForLoadState('networkidle').catch(() => null),
        btn.first().click(),
      ])
      submitted = true
      break
    }
  }
  if (!submitted) throw new Error('Could not find submit button on /login')

  // After login, go to /admin to ensure session is ready
  // Determina dove vive l'admin (alcuni setup lo montano su /admin, altri su /)
  let adminBase = '/admin'
  await page.goto(joinUrl(ADMIN_BASE_URL, '/admin'), { waitUntil: 'networkidle' })
  if (await page.getByText('Nothing found', { exact: false }).count()) {
    adminBase = '/'
    await page.goto(joinUrl(ADMIN_BASE_URL, '/'), { waitUntil: 'networkidle' })
  }

  const targets = buildTargets(adminBase)
  const needsDetail = buildNeedsDetail(adminBase)

  const save = async (filename) => {
    const outPath = path.join(OUT_DIR, filename)
    await page.screenshot({ path: outPath, fullPage: true })
    // eslint-disable-next-line no-console
    console.log(`Saved ${outPath}`)
  }

  const openFirstRecord = async (fromPath) => {
    const fromUrl = joinUrl(ADMIN_BASE_URL, fromPath)
    await page.goto(fromUrl, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    // Try open first row link (Payload admin usually has a table with links)
    const rowLink = page.locator('table a').first()
    if ((await rowLink.count()) > 0) {
      await rowLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(800)
      return true
    }

    const firstRow = page.locator('table tbody tr').first()
    if ((await firstRow.count()) > 0) {
      await firstRow.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(800)
      return true
    }

    return false
  }

  // Base list pages
  for (const t of targets) {
    await page.goto(joinUrl(ADMIN_BASE_URL, t.path), { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await save(t.file)
  }

  // Pages that require opening a record detail
  for (const [file, cfg] of Object.entries(needsDetail)) {
    if (cfg.url) {
      await page.goto(joinUrl(ADMIN_BASE_URL, cfg.url), { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)
      await save(file)
      continue
    }

    const ok = await openFirstRecord(cfg.from)
    if (!ok) {
      // eslint-disable-next-line no-console
      console.warn(`Skipping ${file}: no rows found in ${cfg.from}`)
      continue
    }

    if (cfg.afterOpen?.clickText) {
      const tab = page.getByRole('tab', { name: cfg.afterOpen.clickText, exact: false })
      if ((await tab.count()) > 0) {
        await tab.first().click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(600)
      } else {
        // fallback: click text element (tabs sometimes are buttons/links)
        const any = page.getByText(cfg.afterOpen.clickText, { exact: false })
        if ((await any.count()) > 0) {
          await any.first().click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(600)
        }
      }
    }

    await save(file)
  }

  await browser.close()
}

await main()
