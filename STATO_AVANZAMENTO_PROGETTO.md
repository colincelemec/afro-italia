# AfroItalia Platform — Stato di Avanzamento

**Candidato:** Colince Mendji
**Data:** 10 Giugno 2026

---

## Cos'è il progetto

AfroItalia è una piattaforma web che permette di trovare le attività commerciali
della diaspora africana in Italia (ristoranti, parrucchieri, negozi, servizi, ecc.).

Gli utenti possono cercare attività per città e categoria, leggere recensioni e
salvare i propri preferiti. I proprietari di attività possono registrare la loro
impresa e gestire il profilo online. Un pannello amministratore permette di
moderare i contenuti e verificare le attività registrate.

---

## Tecnologie utilizzate

- **Frontend:** React (interfaccia utente)
- **Backend:** Node.js + Express (server e API)
- **Database:** PostgreSQL (dati) con supporto geolocalizzazione
- **Autenticazione:** JWT + Google OAuth
- **Pagamenti:** Stripe (abbonamenti)
- **Containerizzazione:** Docker (per il database in locale)

---

## Cosa è già fatto

### Backend (server)

- Struttura completa del server con Express
- Collegamento al database tramite Prisma ORM
- Sistema di autenticazione: registrazione, login, logout con token JWT
- Login con Google (OAuth 2.0)
- API per le attività: ricerca, creazione, modifica, eliminazione
- API per le recensioni: scrittura, modifica, eliminazione, risposta del proprietario
- API per il profilo utente e i preferiti
- Pannello admin: verifica attività, statistiche, moderazione
- Sicurezza: protezione delle route, limitazione delle richieste, validazione dati

### Database

- Schema completo con 7 tabelle: utenti, attività, città, categorie, recensioni, preferiti, pagamenti
- Supporto alla geolocalizzazione (coordinate GPS sulle attività)
- Dati di test per sviluppo locale

### Frontend (interfaccia)

- Pagina di presentazione (landing page) in 3 lingue: italiano, francese, inglese
- Pagina di registrazione e login
- Dashboard personale dell'utente
- Pagina profilo
- Lista attività con filtri per città e categoria
- Pagina dettaglio di una singola attività
- Sistema di preferiti
- Selettore della lingua
- Protezione delle pagine riservate (solo utenti autenticati)

---

## Completato a luglio 2026

- **Mappe interattive** — vista mappa nella pagina Attività e scheda mappa nel dettaglio (Leaflet/OpenStreetMap)
- **Pagamenti Stripe** — abbonamenti mensili BASIC (€9,99) e PREMIUM (€24,99) tramite Stripe Checkout, webhook per l'attivazione automatica, pagina `/subscription` con piani e storico pagamenti
- **Email automatiche** — benvenuto, reset password, attività approvata/rifiutata, conferma di pagamento (trilingue it/fr/en, fallback console in sviluppo)
- **Pannello Admin** — interfaccia completa con statistiche, moderazione attività, gestione utenti e recensioni segnalate
- **Chatbot di assistenza** — widget flottante trilingue con 9 domande/risposte predefinite e ricerca per parole chiave
- **Test automatici** — 24 test backend (Jest + Supertest) su auth, attività, recensioni e pagamenti, senza bisogno del database (`npm test` nella cartella server)

---

## Cosa manca ancora

| Cosa | Note |
|---|---|
| Pubblicazione online | Da fare su Vercel (frontend) e Railway (backend) |
| Chiavi Stripe reali | Configurare `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` in produzione |
| SMTP di produzione | Configurare `SMTP_*` nel `.env` per l'invio reale delle email |

---

## Prossimi passi

1. Pubblicare l'applicazione online (Vercel + Railway)
2. Configurare Stripe e SMTP in produzione

---

*AfroItalia Platform v2 — Documento di avanzamento, Luglio 2026*
