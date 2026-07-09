#!/usr/bin/env node
/**
 * Aggiorna changelog/{repo}.mdx con una nuova sezione release.
 * Usage: node scripts/sync-changelog.mjs --repo admin --version 1.2.0 --body "..."
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const REPO_MAP = {
  admin: { file: 'changelog/admin.mdx', label: 'laureasi-admin' },
  frontend: { file: 'changelog/frontend.mdx', label: 'laureasi-frontend' },
  crawler: { file: 'changelog/crawler.mdx', label: 'laureasi-crawler' },
}

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag) => {
    const i = args.indexOf(flag)
    return i >= 0 ? args[i + 1] : undefined
  }
  return {
    repo: get('--repo'),
    version: get('--version'),
    body: get('--body') ?? '',
    date: get('--date') ?? new Date().toISOString().slice(0, 10),
  }
}

function buildSection({ version, date, body }) {
  const trimmed = body.trim()
  const content = trimmed || '_Nessuna nota di release._'
  return `## v${version} — ${date}\n\n${content}\n\n`
}

function updateChangelogPage(filePath, label, section) {
  const fullPath = join(ROOT, filePath)
  let content = readFileSync(fullPath, 'utf8')

  const marker = `\n# ${label}\n\n`
  const idx = content.indexOf(marker)
  if (idx === -1) {
    throw new Error(`Marker not found in ${filePath}`)
  }

  const insertAt = idx + marker.length
  const after = content.slice(insertAt)

  // Evita duplicati se la versione esiste già
  if (after.includes(`## v${section.match(/## v([^\s]+)/)?.[1]}`)) {
    console.log(`Version already present in ${filePath}, skipping.`)
    return
  }

  content = content.slice(0, insertAt) + section + after
  writeFileSync(fullPath, content)
  console.log(`Updated ${filePath}`)
}

function updateIndex({ repo, version, date, label }) {
  const indexPath = join(ROOT, 'changelog/index.mdx')
  let content = readFileSync(indexPath, 'utf8')

  const entry = `- **${label}** v${version} — ${date} ([dettagli](/changelog/${repo}))\n`
  const anchor = '## Ultime release\n\n'

  if (content.includes(entry.trim())) {
    return
  }

  if (content.includes(anchor)) {
    content = content.replace(anchor, `${anchor}${entry}`)
  } else {
    content += `\n${anchor}${entry}`
  }

  // Rimuovi placeholder iniziale
  content = content.replace(
    '_I changelog verranno popolati automaticamente alla prima release con release-please._\n\n',
    '',
  )

  writeFileSync(indexPath, content)
  console.log('Updated changelog/index.mdx')
}

const { repo, version: rawVersion, body, date } = parseArgs()

if (!repo || !rawVersion) {
  console.error('Usage: node scripts/sync-changelog.mjs --repo <admin|frontend|crawler> --version <x.y.z> [--body "..."]')
  process.exit(1)
}

// Normalizza tag release (es. v1.2.0 o laureasi-admin-v1.2.0 → 1.2.0)
const version = rawVersion.replace(/^.*-v/, '').replace(/^v/, '')

const config = REPO_MAP[repo]
if (!config) {
  console.error(`Unknown repo: ${repo}`)
  process.exit(1)
}

const section = buildSection({ version, date, body })
updateChangelogPage(config.file, config.label, section)
updateIndex({ repo, version, date, label: config.label })
