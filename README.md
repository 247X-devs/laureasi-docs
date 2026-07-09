# laureasi-docs

Portale documentazione Laureasi, pubblicato su [Mintlify](https://mintlify.com).

## Struttura

- `admin/` — guide per redattori e content manager
- `algoritmi/` — documentazione algoritmi (ranking, orientamento)
- `piattaforma/` — documentazione tecnica admin, frontend, integrazioni
- `crawler/` — edge functions Supabase
- `changelog/` — changelog aggregati dai repo applicativi
- `sviluppo/` — setup ambiente di sviluppo

## Sviluppo locale

```bash
npx mintlify dev
```

## Deploy

Il deploy **non passa da Vercel**. Su ogni push a `main`, **Mintlify deploya automaticamente** tramite la [GitHub App](https://app.mintlify.com) collegata al repo.

### Setup una tantum

1. **Crea il progetto su Mintlify** e collega `247X-devs/laureasi-docs` (branch `main`) nelle [Git Settings](https://app.mintlify.com)
2. Installa la **Mintlify GitHub App** sul repo — è sufficiente per il deploy automatico
3. (Opzionale) Dominio custom `docs.laureasi.it` → CNAME su Mintlify

### Admin API (solo piano Pro+)

L'endpoint `POST /v1/project/update/{projectId}` richiede un **piano Mintlify superiore**. Sul piano gratuito risponde:

```json
{"error":"Please upgrade to access this route."}
```

Se fai upgrade, puoi usare il workflow manuale **Deploy Mintlify** o lo script locale:

1. Genera una **Admin API key** su [API keys](https://app.mintlify.com/settings/organization/api-keys)
2. Aggiungi su `247X-devs/laureasi-docs` → Settings → **Secrets and variables → Actions**:
   - `MINTLIFY_ADMIN_KEY` — chiave admin (`mint_...`) → **Secrets**
   - `MINTLIFY_PROJECT_ID` — ID progetto → **Secrets** o **Variables**
3. Esegui da Actions → **Deploy Mintlify** → Run workflow

```bash
# In locale (dopo export delle env)
MINTLIFY_ADMIN_KEY=mint_... MINTLIFY_PROJECT_ID=... node scripts/trigger-mintlify-deploy.mjs
```

### Flusso CI (piano attuale)

```
push main → Mintlify GitHub App → rebuild automatico
sync changelog (bot push su main) → stesso meccanismo
```

## Changelog automatici

I changelog vengono sincronizzati automaticamente quando i repo applicativi pubblicano una GitHub Release:

- `laureasi-admin`
- `laureasi-frontend`
- `laureasi-crawler`

## Convenzioni commit (repo applicativi)

Usare [Conventional Commits](https://www.conventionalcommits.org/) per alimentare `release-please`:

```
feat(admin): aggiungi filtro campagne
fix(ranking): correggi boost partner
docs(crawler): aggiorna README scrape-batch
```
