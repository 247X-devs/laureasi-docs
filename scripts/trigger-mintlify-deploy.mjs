#!/usr/bin/env node
/**
 * Triggera un deploy Mintlify via Admin API e attende il completamento.
 *
 * Env richieste:
 *   MINTLIFY_ADMIN_KEY  — API key admin (prefisso mint_)
 *   MINTLIFY_PROJECT_ID — ID progetto Mintlify
 *
 * Usage:
 *   node scripts/trigger-mintlify-deploy.mjs
 *   node scripts/trigger-mintlify-deploy.mjs --no-wait
 */
const API_BASE = 'https://api.mintlify.com/v1'
const POLL_INTERVAL_MS = 10_000
const MAX_WAIT_MS = 15 * 60 * 1000 // 15 min

const adminKey = process.env.MINTLIFY_ADMIN_KEY
const projectId = process.env.MINTLIFY_PROJECT_ID
const noWait = process.argv.includes('--no-wait')

if (!adminKey || !projectId) {
  console.error('Missing MINTLIFY_ADMIN_KEY or MINTLIFY_PROJECT_ID')
  process.exit(1)
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${adminKey}`,
      Accept: 'application/json',
      ...options.headers,
    },
  })

  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    throw new Error(`Mintlify API ${res.status} ${path}: ${text}`)
  }

  return body
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function triggerDeploy() {
  console.log(`Triggering Mintlify deploy for project ${projectId}...`)
  const { statusId } = await api(`/project/update/${projectId}`, { method: 'POST' })
  if (!statusId) {
    throw new Error('No statusId returned from Mintlify API')
  }
  console.log(`Deploy queued. statusId=${statusId}`)
  return statusId
}

async function waitForDeploy(statusId) {
  const started = Date.now()

  while (Date.now() - started < MAX_WAIT_MS) {
    const status = await api(`/project/update-status/${statusId}`)
    console.log(`Status: ${status.status}${status.summary ? ` — ${status.summary}` : ''}`)

    if (status.status === 'success') {
      if (status.subdomain) {
        console.log(`Live at: https://${status.subdomain}.mintlify.app`)
      }
      return status
    }

    if (status.status === 'failure') {
      const logs = (status.logs || []).join('\n')
      throw new Error(`Mintlify deploy failed.\n${status.summary || ''}\n${logs}`)
    }

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error(`Mintlify deploy timed out after ${MAX_WAIT_MS / 1000}s (statusId=${statusId})`)
}

try {
  const statusId = await triggerDeploy()
  if (!noWait) {
    await waitForDeploy(statusId)
    console.log('Mintlify deploy completed successfully.')
  }
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
