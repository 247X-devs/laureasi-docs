# Screenshot pannello admin

Carica qui screenshot **reali** del pannello su `http://localhost:3000`.

## Come catturarli

1. Avvia l'admin (`make up` o `yarn dev` in `laureasi-admin`)
2. Accedi con un utente admin
3. Naviga alla schermata indicata
4. Screenshot a 1440px di larghezza (o finestra browser standard)
5. Salva con il **nome file esatto** indicato sotto
6. Commit e push su `laureasi-docs`

## Checklist file

| File | URL / percorso admin | Guida |
| --- | --- | --- |
| `sidebar-menu.png` | `/admin` (menu laterale visibile) | Tutte |
| `leads-lista.png` | `/admin/collections/leads` | [Leads](/admin/leads) |
| `leads-dettaglio.png` | Dettaglio di un lead aperto | [Leads](/admin/leads) |
| `leads-metadati.png` | Tab/scheda con campo Metadati JSON | [Metadati leads](/admin/leads-metadati) |
| `tracking-utm.png` | Dettaglio lead con UTM Source/Medium/Campaign | [Tracking](/admin/tracking) |
| `webhook-n8n.png` | `/admin/globals/lead-integration-settings` | [Webhook n8n](/admin/webhook-n8n) |
| `percorsi-lista.png` | `/admin/collections/degrees` (o masters/courses) | [Percorsi](/admin/percorsi) |
| `percorso-modifica.png` | Scheda laurea/master/corso in modifica | [Percorsi](/admin/percorsi) |
| `in-evidenza-checkbox.png` | Campo "In evidenza" visibile in una scheda | [In evidenza](/admin/in-evidenza) |
| `master-moduli.png` | Modifica master → tab “Moduli” | [Moduli master](/admin/master-moduli) |
| `agevolazioni-lista.png` | Lista agevolazioni (tax-breaks) | [Agevolazioni](/admin/agevolazioni) |
| `universita-scheda.png` | Scheda università con tab Dati principali | [Università](/admin/universita) |
| `aree-lista.png` | `/admin/collections/areas` | [Aree](/admin/aree) |
| `recensioni-lista.png` | `/admin/collections/testimonials` | [Recensioni](/admin/recensioni) |
| `blog-lista.png` | `/admin/collections/blog` | [Blog](/admin/blog) |
| `blog-editor.png` | Articolo blog in modifica | [Blog](/admin/blog) |
| `faq-gruppi.png` | `/admin/collections/faq-groups` con drag handle | [FAQ](/admin/faq) |
| `sorgenti-dati.png` | `/admin/collections/data_sources` | [Sorgenti dati](/admin/sorgenti-dati) |
| `utenti-lista.png` | `/admin/collections/users` | [Utenti](/admin/utenti) |
| `utenti-ruolo.png` | Campo Ruolo in modifica utente | [Ruoli](/admin/ruoli) |
| `sconti-campagne.png` | Campagne sconto (opzionale) | [Sconti](/admin/sconti-e-campagne) |

## Privacy

Oscura o usa dati di test per email, telefoni e nomi reali nei lead prima di pubblicare.
