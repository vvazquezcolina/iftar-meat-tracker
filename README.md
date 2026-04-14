# Iftar Meat Tracker

> A QR-based meat sales tracker for a French kebab restaurant in Playa del Carmen during Ramadan. Each slice of meat gets a QR code, servers scan at the point of sale, and every scan pushes a row to Google Sheets for real-time iftar-window reporting.

**Live:** [iftar-meat-tracker.vercel.app](https://iftar-meat-tracker.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-000)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6)
![Deploy](https://img.shields.io/badge/deploy-Vercel-000)

---

## Why this exists

During Ramadan, the iftar rush compresses a whole day's service into a 90-minute window. The owner of a Halal French kebab restaurant in Playa del Carmen needed to know, in real time, how much meat had been sold, when, and by whom — without slowing service to a crawl.

This app replaces a paper clipboard with a QR scan. Everything flows through Google Sheets so the existing bookkeeping stays unchanged.

## Features

- **QR generation** — every portion of meat gets its own code via the `qrcode` library
- **QR scanning** — in-browser scanner using `html5-qrcode`, no native app required
- **Google Sheets sync** — each scan writes a timestamped row via `googleapis`, with retries on network hiccups
- **Bulk export** — a server route zips the daily sheet + QR images into a downloadable archive using `archiver` + `jszip`
- **Timezone-aware** — all timestamps are recorded in America/Cancún so iftar windows line up with local prayer times

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| QR in | `html5-qrcode` (camera-based scan) |
| QR out | `qrcode` (SVG/PNG generation) |
| Storage | Google Sheets via `googleapis` |
| Archives | `archiver` + `jszip` |
| Hosting | Vercel |

## Architecture

```
src/
├── app/
│   ├── page.tsx             # Scanner UI
│   ├── api/
│   │   ├── scan/            # POST: append row to Sheets
│   │   ├── generate/        # GET: create a batch of QR codes
│   │   └── export/          # GET: zip a day's data
│   └── layout.tsx
├── lib/
│   ├── sheets.ts            # Google Sheets adapter
│   └── qr.ts                # QR generation helpers
└── scripts/                 # One-off setup scripts
```

## Running locally

```bash
git clone https://github.com/vvazquezcolina/iftar-meat-tracker.git
cd iftar-meat-tracker
npm install
cp .env.example .env.local   # Google service account JSON + Sheet ID
npm run dev                  # http://localhost:3000
```

### Environment variables

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
SHEET_ID=...
TIMEZONE=America/Cancun
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Status

Seasonal tool — used during Ramadan 2026. Kept online in case the owner wants to run it again.

---

**Author:** [Victor Vazquez](https://github.com/vvazquezcolina) — Cancún MX. Built for a local restaurant in Playa del Carmen.
