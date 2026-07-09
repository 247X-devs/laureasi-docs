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

## Deploy (Mintlify via API)

Il deploy **non passa da Vercel**. GitHub Actions triggera Mintlify tramite Admin API dopo ogni push su `main`.

### Setup una tantum

1. **Crea il progetto su Mintlify** e collega `247X-devs/laureasi-docs` (branch `main`) nelle [Git Settings](https://app.mintlify.com)
2. Installa la **Mintlify GitHub App** sul repo (serve a Mintlify per leggere i file al deploy)
3. Genera una **Admin API key** su [API keys](https://app.mintlify.com/settings/organization/api-keys)
4. Aggiungi le credenziali su `247X-devs/laureasi-docs` → Settings → **Secrets and variables → Actions**:
   - `MINTLIFY_ADMIN_KEY` — chiave admin (`mint_...`) → **Secrets** (consigliato, mascherata nei log)
   - `MINTLIFY_PROJECT_ID` — ID progetto → **Secrets** o **Variables**

   > Il workflow legge prima i **Secrets** (`secrets.*`), poi le **Variables** (`vars.*`) come fallback. Se le hai messe solo in Variables, prima del fix non venivano trovate.
5. (Opzionale) Dominio custom `docs.laureasi.it` → CNAME su Mintlify

### Trigger manuale

```bash
# In locale (dopo export delle env)
MINTLIFY_ADMIN_KEY=mint_... MINTLIFY_PROJECT_ID=... node scripts/trigger-mintlify-deploy.mjs

# Oppure da GitHub Actions → Deploy Mintlify → Run workflow
```

### Flusso CI

```
push main → deploy-mintlify.yml → POST /v1/project/update/{id} → Mintlify rebuild
sync changelog (bot push su main) → stesso workflow
```

> Se Mintlify è già configurato per auto-deploy alla push via GitHub App, puoi disabilitarlo e usare solo il workflow GHA, oppure lasciare entrambi (deploy ridondante ma innocuo).

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
