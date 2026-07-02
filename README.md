# Open Source Omics Data Repository

A search interface for genomic, proteomic, and space biology datasets — pulling from NASA's Open Science Data Repository and NCBI GEO in one place.

![NASA OSDR](https://img.shields.io/badge/Data%20Source-NASA%20OSDR-0B1D33.svg)
![NCBI GEO](https://img.shields.io/badge/Data%20Source-NCBI%20GEO-2e7d32.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg?logo=typescript&logoColor=white)
![Node CLI](https://img.shields.io/badge/CLI-Node%2018%2B-339933.svg?logo=node.js&logoColor=white)

---

## What is this?

I got tired of jumping between the NASA OSDR portal and NCBI GEO every time I needed to find space biology datasets. This tool searches both at once, shows you the metadata that actually matters, and lets you grab the raw files without digging through nested pages.

It comes in two flavors:
- **Web app** — the full UI for exploring and browsing
- **CLI** — for when you're already in a terminal and just want results fast

---

## Features

- **Unified search** — one query hits NASA GeneLab/OSDR and NCBI GEO simultaneously
- **Metadata preview** — PI info, publication DOIs, study protocols, funding agencies, NASA centers
- **File browser + downloader** — see all raw files (RNA-Seq, Microarray, etc.) with direct download links
- **Auto-tagging** — picks up experimental context (Spaceflight, Microgravity, Transcriptomics) from titles and descriptions
- **Dynamic filters** — filter by organism and assay type without re-running the search
- **Grid or list view** — switch based on how many results you're dealing with
- **Dark mode** — actually dark, not just grey
- **CLI tool** — `search`, `info`, `files`, `download` commands, JSON output, organism filtering
- **Bookmarks** — save datasets to localStorage, filter to bookmarked-only
- **Pagination** — 15 results per page, works across both sources

---

## Tech stack

| Layer | What |
|---|---|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS (custom Material-You color tokens) |
| Animations | Framer Motion |
| Icons | Google Material Symbols |
| Data | NASA OSDR API + NCBI E-utilities |
| CLI | Node.js 18+ (zero extra deps) |
| Build | Vite |

---

## Quick start

You need Node.js 18 or newer. That's it.

```bash
git clone https://github.com/ciscoexplains/omics-de
cd omics-de
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## CLI

The CLI lives in `cli/omics-cli.js`. No install step, no extra packages — just Node's built-in fetch.

```bash
# Search datasets
node cli/omics-cli.js search "spaceflight muscle"
node cli/omics-cli.js search "microgravity" --source=nasa --limit=10
node cli/omics-cli.js search "RNA-seq" --filter=mus --json

# Get full metadata for a study
node cli/omics-cli.js info OSD-4

# List all downloadable files
node cli/omics-cli.js files OSD-4

# Download everything from a study
node cli/omics-cli.js download OSD-4 --dir=./data
```

### CLI options

| Flag | Default | Description |
|---|---|---|
| `--limit=N` | 20 | Max results per source |
| `--source=nasa\|ncbi\|all` | all | Which database to search |
| `--filter=<organism>` | — | Case-insensitive organism filter |
| `--dir=<path>` | ./omics-downloads | Where to put downloaded files |
| `--json` | — | Raw JSON output (pipe-friendly) |

If you want `omics` as a global command:

```bash
npm link
omics search "gene expression spaceflight"
```

---

## API notes

This uses two public APIs:

- **NASA OSDR** — `https://osdr.nasa.gov/osdr/data/search` — no auth required for basic search, but the project includes an API key for higher rate limits
- **NCBI E-utilities** — `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/` — same deal, API key included

The web app routes NASA requests through a Vite proxy (`/api/nasa -> https://osdr.nasa.gov`) to sidestep CORS in development. The CLI hits the APIs directly since there's no browser involved.

Proxy config is in `vite.config.ts` if you need to tweak it.

---

## Project structure

```
omics-de/
├── cli/
│   └── omics-cli.js        # CLI tool (Node 18+, zero deps)
├── src/
│   ├── components/
│   │   ├── Welcome.tsx      # Landing page
│   │   ├── Header.tsx       # App header with dark mode toggle
│   │   ├── DataExplorer.tsx # Search results + filters + bookmarks
│   │   └── DatasetDetails.tsx # Study detail view + file downloader
│   ├── App.tsx             # Root component, state, API logic
│   └── index.css           # Global styles + scrollbar
├── vite.config.ts          # Dev server + CORS proxy
└── tailwind.config.js      # Design tokens
```

---

## Known limitations

- NCBI GEO results don't have rich metadata on first load (the API returns summaries, not full records)
- File sizes for NCBI GEO entries show as unknown — the FTP paths are constructed from patterns, not a manifest
- CORS proxy (`corsproxy.io`) is a third-party service — if it's down, NASA searches in the browser will fail. The CLI doesn't need it.
- Results cap at 30 per source per query

---

## License

MIT. Use it, fork it, whatever.

---

*Built by [CiscoExplains](https://github.com/ciscoexplains) — contributions welcome*
