/*
  Migra automaticamente ícones referenciados no código a partir de contents/figma/icons
  para public/assets/images/icons, copiando apenas os arquivos encontrados.

  Uso:
    node scripts/migrate-icons.js [--dry]
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const ICONS_SRC_DIR = path.join(ROOT, 'contents', 'figma', 'icons');
const ICONS_DST_DIR = path.join(ROOT, 'public', 'assets', 'images', 'icons');

const DRY_RUN = process.argv.includes('--dry');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    if (DRY_RUN) {
      console.log(`[dry] mkdir -p ${path.relative(ROOT, dir)}`);
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function walk(dir, exts = new Set(['.ts', '.tsx', '.js', '.jsx'])) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(p, exts));
    } else if (exts.has(path.extname(entry.name))) {
      out.push(p);
    }
  }
  return out;
}

function collectIconRefs(files) {
  const refs = new Set();
  const regex = /contents\/(?:figma)\/icons\/([^'"\)\]]+)/g; // captura o caminho relativo a partir de icons/
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Normaliza separadores e mantém apenas o nome do arquivo (e subpastas se houver)
      const rel = match[1].replace(/\\/g, '/');
      refs.add(rel);
    }
  }
  return [...refs];
}

function copyIfNeeded(relPath) {
  const src = path.join(ICONS_SRC_DIR, relPath);
  const dst = path.join(ICONS_DST_DIR, path.basename(relPath));
  if (!fs.existsSync(src)) {
    console.warn(`warn: não encontrado em contents/figma/icons -> ${relPath}`);
    return { relPath, copied: false, reason: 'missing_source' };
  }
  if (fs.existsSync(dst)) {
    return { relPath, copied: false, reason: 'already_exists' };
  }
  if (DRY_RUN) {
    console.log(`[dry] copy ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dst)}`);
    return { relPath, copied: true, reason: 'dry_run' };
  }
  fs.copyFileSync(src, dst);
  return { relPath, copied: true };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('erro: pasta src não encontrada');
    process.exit(1);
  }
  ensureDir(ICONS_DST_DIR);

  const files = walk(SRC_DIR);
  const refs = collectIconRefs(files);

  if (refs.length === 0) {
    console.log('Nenhuma referência a contents/figma/icons encontrada no código.');
    console.log('Nada para copiar.');
    return;
  }

  console.log(`Encontradas ${refs.length} referência(s) a contents/figma/icons:`);
  for (const r of refs) console.log(` - ${r}`);

  const results = refs.map(copyIfNeeded);
  const copied = results.filter(r => r.copied);
  const skipped = results.filter(r => !r.copied);

  console.log(`\nCopiados: ${copied.length}`);
  copied.forEach(r => console.log(` + ${r.relPath}`));
  if (skipped.length) {
    console.log(`Ignorados: ${skipped.length}`);
    skipped.forEach(r => console.log(` - ${r.relPath} (${r.reason})`));
  }
}

main();

