#!/usr/bin/env node
/**
 * omics-cli — Search NASA OSDR + NCBI GEO from your terminal
 *
 * Usage:
 *   node cli/omics-cli.js search <term> [--limit=20] [--source=nasa|ncbi|all]
 *   node cli/omics-cli.js info <OSD-accession>
 *   node cli/omics-cli.js files <OSD-accession>
 *   node cli/omics-cli.js download <OSD-accession> [--dir=./data]
 *
 * No extra dependencies. Node ≥18 required (native fetch).
 */

'use strict';

const NASA_KEY = 'PiK7jHqZq5L283WLXcLKOxB7JZe3MmjUNcqXvHC8';
const NCBI_KEY = '3125a6e4348714d6b42c892607a329da4b08';

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  blue:   '\x1b[34m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  mag:    '\x1b[35m',
  white:  '\x1b[97m',
};

const b  = s => `${C.bold}${s}${C.reset}`;
const cy = s => `${C.cyan}${s}${C.reset}`;
const gr = s => `${C.green}${s}${C.reset}`;
const yl = s => `${C.yellow}${s}${C.reset}`;
const rd = s => `${C.red}${s}${C.reset}`;
const dm = s => `${C.dim}${s}${C.reset}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function printBanner() {
  console.log(`
${C.bold}${C.cyan}  ██████  ███    ███ ██  ██████ ███████
 ██    ██ ████  ████ ██ ██      ██
 ██    ██ ██ ████ ██ ██ ██      ███████
 ██    ██ ██  ██  ██ ██ ██           ██
  ██████  ██      ██ ██  ██████ ███████${C.reset}
 ${dm('Omics Data Engine CLI')}  ${dm('·')}  ${dm('NASA OSDR + NCBI GEO')}
`);
}

function printHelp() {
  printBanner();
  console.log(`${b('USAGE')}
  ${cy('omics search')} <term> [options]          Search datasets
  ${cy('omics info')}   <accession>               Full metadata for a NASA OSD study
  ${cy('omics files')}  <accession>               List downloadable files
  ${cy('omics download')} <accession> [options]   Download all files

${b('OPTIONS')}
  --limit=N        Max results per source (default: 20)
  --source=nasa    Only NASA OSDR
  --source=ncbi    Only NCBI GEO
  --source=all     Both sources (default)
  --dir=<path>     Download directory (default: ./omics-downloads)
  --filter=<org>   Filter by organism name (case-insensitive)
  --json           Output raw JSON

${b('EXAMPLES')}
  ${dm('$ node cli/omics-cli.js search spaceflight --limit=5')}
  ${dm('$ node cli/omics-cli.js search "muscle atrophy" --source=nasa')}
  ${dm('$ node cli/omics-cli.js search "microgravity" --filter=mus')}
  ${dm('$ node cli/omics-cli.js info OSD-4')}
  ${dm('$ node cli/omics-cli.js files OSD-4')}
  ${dm('$ node cli/omics-cli.js download OSD-4 --dir=./data')}
`);
}

function fmtBytes(n) {
  if (!n || n === 0) return dm('—');
  const k = 1024;
  const sz = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(1)} ${sz[i]}`;
}

function truncate(str, len = 80) {
  if (!str) return '';
  const s = String(str);
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}

function padR(str, len) {
  const s = String(str || '');
  const raw = s.replace(/\x1b\[[0-9;]*m/g, '');
  return s + ' '.repeat(Math.max(0, len - raw.length));
}

function parseArgs(argv) {
  const cmd = argv[0];
  const args = argv.slice(1);
  const opts = { limit: 20, source: 'all', dir: './omics-downloads', json: false };
  const pos = [];

  for (const a of args) {
    if (a.startsWith('--limit='))       opts.limit  = parseInt(a.split('=')[1]) || 20;
    else if (a.startsWith('--source=')) opts.source = a.split('=')[1];
    else if (a.startsWith('--dir='))    opts.dir    = a.split('=')[1];
    else if (a.startsWith('--filter=')) opts.filter = a.split('=')[1].toLowerCase();
    else if (a === '--json')            opts.json   = true;
    else if (!a.startsWith('--'))       pos.push(a);
  }

  return { cmd, pos, opts };
}

// ── API calls ─────────────────────────────────────────────────────────────────
async function fetchNASA(term, limit) {
  const url = `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(term)}&size=${limit}&type=cgene&api_key=${NASA_KEY}`;
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) return [];

  const data = await res.json().catch(() => null);
  if (!data?.hits?.hits) return [];

  return data.hits.hits.map(h => ({
    id:          h._id,
    score:       h._score,
    source:      'NASA OSDR',
    accession:   h._source['Accession'] || h._id,
    title:       h._source['Study Title'] || h._source['Project Title'] || 'Untitled',
    organism:    Array.isArray(h._source['organism'])
                   ? h._source['organism'].join(', ')
                   : (h._source['organism'] || 'N/A'),
    assay:       h._source['Study Assay Measurement Type'] || 'N/A',
    released:    h._source['Study Public Release Date']
                   ? String(h._source['Study Public Release Date']).split('T')[0]
                   : 'N/A',
    description: h._source['Study Description'] || '',
    funding:     h._source['Study Funding Agency'] || '',
    center:      h._source['Managing NASA Center'] || '',
  }));
}

async function fetchNCBI(term, limit) {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gds&term=${encodeURIComponent(term)}&retmode=json&api_key=${NCBI_KEY}&retmax=${limit}`;
  const searchRes = await fetch(searchUrl).catch(() => null);
  if (!searchRes?.ok) return [];

  const searchData = await searchRes.json().catch(() => null);
  const ids = searchData?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const summUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gds&id=${ids.join(',')}&retmode=json&api_key=${NCBI_KEY}`;
  const summRes = await fetch(summUrl).catch(() => null);
  if (!summRes?.ok) return [];

  const summData = await summRes.json().catch(() => null);
  const result = summData?.result || {};
  const uids = result.uids || [];

  return uids.map(uid => {
    const item = result[uid];
    return {
      id:          `ncbi-${uid}`,
      score:       1,
      source:      'NCBI GEO',
      accession:   item.accession || uid,
      title:       item.title || 'Untitled',
      organism:    item.taxon || 'N/A',
      assay:       item.gdstype || 'N/A',
      released:    item.pdat ? item.pdat.replace(/\//g, '-') : 'N/A',
      description: item.summary || '',
      ftpLink:     item.ftplink || '',
      suppFile:    item.suppfile || '',
    };
  });
}

async function fetchOSDMeta(osdId) {
  const url = `https://osdr.nasa.gov/osdr/data/osd/meta/${osdId}`;
  const res = await fetch(url).catch(() => null);
  if (!res?.ok) return null;
  const data = await res.json().catch(() => null);
  const studyKey = Object.keys(data?.study || {})[0];
  return studyKey ? data.study[studyKey]?.studies?.[0] : null;
}

async function fetchOSDFiles(osdId) {
  const url = `https://osdr.nasa.gov/osdr/data/osd/files/${osdId}`;
  const res = await fetch(url).catch(() => null);
  if (!res?.ok) return [];
  const data = await res.json().catch(() => null);
  const studyKey = Object.keys(data?.studies || {})[0];
  return studyKey ? (data.studies[studyKey]?.study_files || []) : [];
}

// ── Commands ──────────────────────────────────────────────────────────────────
async function cmdSearch({ pos, opts }) {
  const term = pos.join(' ');
  if (!term) {
    console.error(rd('Error: search term required'));
    process.exit(1);
  }

  process.stdout.write(`\n${dm('Searching')} ${cy(term)} ${dm('...')}\n`);

  const [nasa, ncbi] = await Promise.all([
    opts.source !== 'ncbi' ? fetchNASA(term, opts.limit) : Promise.resolve([]),
    opts.source !== 'nasa' ? fetchNCBI(term, opts.limit) : Promise.resolve([]),
  ]);

  let results = [...nasa, ...ncbi];

  if (opts.filter) {
    results = results.filter(r => r.organism.toLowerCase().includes(opts.filter));
  }

  results = results.slice(0, opts.limit);

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (!results.length) {
    console.log(yl('\nNo results. Try a broader term or different --source.'));
    return;
  }

  const nasaCount = results.filter(r => r.source === 'NASA OSDR').length;
  const ncbiCount = results.filter(r => r.source === 'NCBI GEO').length;
  console.log(`\n${b('Results')} ${dm(`· ${results.length} datasets`)} ${dm(`(${nasaCount} NASA, ${ncbiCount} NCBI)`)}\n`);

  console.log(
    b(padR('Accession', 14)) +
    b(padR('Source', 12)) +
    b(padR('Released', 12)) +
    b(padR('Organism', 22)) +
    b('Title')
  );
  console.log('─'.repeat(120));

  for (const r of results) {
    const src = r.source === 'NASA OSDR'
      ? cy(padR(r.source, 12))
      : gr(padR(r.source, 12));
    console.log(
      yl(padR(r.accession, 14)) +
      src +
      dm(padR(r.released, 12)) +
      dm(padR(truncate(r.organism, 20), 22)) +
      truncate(r.title, 55)
    );
  }

  console.log(`\n${dm('→')} ${cy(`node cli/omics-cli.js info <accession>`)} ${dm('for full details')}\n`);
}

async function cmdInfo({ pos }) {
  const acc = pos[0];
  if (!acc) {
    console.error(rd('Error: accession required (e.g. OSD-4)'));
    process.exit(1);
  }

  const match = acc.match(/^OSD-(\d+)$/i);
  if (!match) {
    console.error(rd(`NASA OSD accession required (e.g. OSD-4). Got: ${acc}`));
    process.exit(1);
  }

  process.stdout.write(`\n${dm('Fetching metadata for')} ${cy(acc)} ${dm('...')}\n\n`);
  const [meta, files] = await Promise.all([
    fetchOSDMeta(match[1]),
    fetchOSDFiles(match[1]),
  ]);

  if (!meta) {
    console.error(rd('Could not retrieve metadata. Check accession or network.'));
    process.exit(1);
  }

  const section = (title) => console.log(`\n${b(C.cyan + '▌ ' + C.reset + C.bold + title + C.reset)}`);
  const row = (label, val) => {
    if (!val) return;
    console.log(`  ${dm(padR(label + ':', 18))} ${val}`);
  };

  section('Study Overview');
  row('Title',         meta.title || 'N/A');
  row('Accession',     acc);
  row('Released',      meta.publicReleaseDate || 'N/A');
  row('Organism',      meta.organism || 'N/A');
  row('Assay',         meta.measurementType || 'N/A');
  row('Files',         files.length ? `${files.length} files available` : 'None indexed');

  if (meta.description) {
    section('Description');
    const desc = String(meta.description);
    const words = desc.split(' ');
    let line = '  ';
    for (const w of words.slice(0, 200)) {
      if (line.length + w.length > 100) {
        console.log(dm(line));
        line = '  ';
      }
      line += w + ' ';
    }
    if (line.trim()) console.log(dm(line));
    if (words.length > 200) console.log(dm('  … (truncated)'));
  }

  if (meta.people?.length) {
    section('Investigators');
    meta.people.slice(0, 8).forEach(p => {
      const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const role = p.role ? dm(` — ${p.role}`) : '';
      console.log(`  ${cy('•')} ${name}${role}`);
    });
  }

  if (meta.publications?.length) {
    section('Publications');
    meta.publications.slice(0, 5).forEach(pub => {
      console.log(`  ${cy('•')} ${truncate(pub.title, 88)}`);
      if (pub.doi) console.log(`    ${dm('https://doi.org/' + pub.doi)}`);
    });
  }

  section('Links');
  console.log(`  ${dm('Repository:')} ${cy('https://osdr.nasa.gov/bio/repo/data/studies/' + acc)}`);
  console.log('');
}

async function cmdFiles({ pos, opts }) {
  const acc = pos[0];
  if (!acc) {
    console.error(rd('Error: accession required (e.g. OSD-4)'));
    process.exit(1);
  }

  const match = acc.match(/^OSD-(\d+)$/i);
  if (!match) {
    console.error(rd(`NASA OSD accession required. Got: ${acc}`));
    process.exit(1);
  }

  process.stdout.write(`\n${dm('Fetching file list for')} ${cy(acc)} ${dm('...')}\n\n`);
  const files = await fetchOSDFiles(match[1]);

  if (!files.length) {
    console.log(yl('No files found for this dataset.'));
    return;
  }

  if (opts.json) {
    console.log(JSON.stringify(files, null, 2));
    return;
  }

  console.log(
    b(padR('#', 5)) +
    b(padR('File Name', 52)) +
    b(padR('Category', 20)) +
    b('Size')
  );
  console.log('─'.repeat(95));

  files.forEach((f, i) => {
    console.log(
      dm(padR(String(i + 1), 5)) +
      padR(truncate(f.file_name, 50), 52) +
      dm(padR(f.category || 'Data', 20)) +
      cy(fmtBytes(f.file_size))
    );
  });

  const total = files.reduce((s, f) => s + (f.file_size || 0), 0);
  console.log(`\n  ${files.length} files · ${dm('Total:')} ${cy(fmtBytes(total))}`);
  console.log(`  ${dm('→')} ${cy(`node cli/omics-cli.js download ${acc} --dir=./data`)}\n`);
}

async function cmdDownload({ pos, opts }) {
  const acc = pos[0];
  if (!acc) {
    console.error(rd('Error: accession required (e.g. OSD-4)'));
    process.exit(1);
  }

  const match = acc.match(/^OSD-(\d+)$/i);
  if (!match) {
    console.error(rd(`NASA OSD accession required. Got: ${acc}`));
    process.exit(1);
  }

  const { createWriteStream, mkdirSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const dir = opts.dir;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  process.stdout.write(`\n${dm('Fetching file list for')} ${cy(acc)} ${dm('...')}\n`);
  const files = await fetchOSDFiles(match[1]);

  if (!files.length) {
    console.log(yl('No files found for this dataset.'));
    return;
  }

  console.log(`${gr('↓')} Downloading ${b(String(files.length))} files to ${cy(dir)}\n`);

  let ok = 0, fail = 0;

  for (const [i, f] of files.entries()) {
    const remoteUrl = f.remote_url?.startsWith('http')
      ? f.remote_url
      : `https://osdr.nasa.gov${f.remote_url}`;

    const destPath = join(dir, f.file_name);
    const prefix = dm(`  [${String(i + 1).padStart(String(files.length).length)}/${files.length}]`);
    process.stdout.write(`${prefix} ${truncate(f.file_name, 52)} … `);

    try {
      const res = await fetch(remoteUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const dest = createWriteStream(destPath);
      const reader = res.body.getReader();
      await new Promise((resolve, reject) => {
        async function pump() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) { dest.end(); resolve(); break; }
              if (!dest.write(value)) await new Promise(r => dest.once('drain', r));
            }
          } catch (e) { reject(e); }
        }
        pump();
        dest.on('error', reject);
      });

      console.log(gr('✓ ' + fmtBytes(f.file_size)));
      ok++;
    } catch (e) {
      console.log(rd(`✗ ${e.message}`));
      fail++;
    }
  }

  console.log(`\n${gr('Done.')} ${ok} downloaded${fail ? ', ' + rd(fail + ' failed') : ''}\n`);
}

// ── Entry ─────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2);

  if (!argv.length || argv[0] === '--help' || argv[0] === 'help' || argv[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  const { cmd, pos, opts } = parseArgs(argv);

  switch (cmd) {
    case 'search':   await cmdSearch({ pos, opts }); break;
    case 'info':     await cmdInfo({ pos, opts }); break;
    case 'files':    await cmdFiles({ pos, opts }); break;
    case 'download': await cmdDownload({ pos, opts }); break;
    default:
      console.error(rd(`Unknown command: ${cmd}`));
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error(rd('\nFatal: ') + err.message);
  process.exit(1);
});
