import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

export function extractLayer(base: PNG, dressed: PNG): PNG {
  if (base.width !== dressed.width || base.height !== dressed.height) {
    throw new Error(
      `Size mismatch: base is ${base.width} x ${base.height}, dressed is ${dressed.width} x ${dressed.height}`,
    );
  }
  const layer = new PNG({ width: base.width, height: base.height });
  for (let i = 0; i < base.data.length; i += 4) {
    if (!base.data.subarray(i, i + 4).equals(dressed.data.subarray(i, i + 4))) {
      dressed.data.copy(layer.data, i, i, i + 4);
    }
  }
  return layer;
}

function main(args: string[]): void {
  if (args.length !== 3) {
    console.error('Usage: npx tsx tools/extract-layer.ts <base.png> <dressed.png> <out.png>');
    process.exit(1);
  }
  const [basePath, dressedPath, outPath] = args;
  const base = PNG.sync.read(readFileSync(basePath));
  const dressed = PNG.sync.read(readFileSync(dressedPath));
  writeFileSync(outPath, PNG.sync.write(extractLayer(base, dressed)));
  console.log(`Wrote ${outPath}`);
}

if (import.meta.main) {
  main(process.argv.slice(2));
}
