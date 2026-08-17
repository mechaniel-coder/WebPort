/**
 * Copy third-party assets out of node_modules and into src/_lib/vendor/.
 *
 * The vendored copies are committed, so neither the build nor hosting needs
 * node_modules present. This script exists only to make updating them a single
 * reproducible command rather than a sequence of remembered `cp` calls.
 *
 *   node tools/vendor.js
 */
import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = (...parts) => join(root, 'node_modules', ...parts);
const to = (...parts) => join(root, 'src', '_lib', 'vendor', ...parts);

const ASSETS = [
  // Motion.
  [from('gsap', 'dist', 'gsap.min.js'), to('js', 'gsap.min.js')],
  [from('gsap', 'dist', 'ScrollTrigger.min.js'), to('js', 'ScrollTrigger.min.js')],
  [from('gsap', 'dist', 'SplitText.min.js'), to('js', 'SplitText.min.js')],
  [from('lenis', 'dist', 'lenis.min.js'), to('js', 'lenis.min.js')],

  // Type. The Latin subsets, and for Fraunces the `standard` axis cut
  // (opsz + wght) rather than `full` — see vendor/README.md.
  [
    from('@fontsource-variable', 'fraunces', 'files', 'fraunces-latin-standard-normal.woff2'),
    to('fonts', 'fraunces-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'schibsted-grotesk', 'files', 'schibsted-grotesk-latin-wght-normal.woff2'),
    to('fonts', 'schibsted-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'jetbrains-mono', 'files', 'jetbrains-mono-latin-wght-normal.woff2'),
    to('fonts', 'jetbrains-var.woff2'),
  ],

  // Northwind's pair. A serif would be wrong for a developer tool, so this site
  // runs on a neutral grotesk with its own matched monospace.
  [
    from('@fontsource-variable', 'geist', 'files', 'geist-latin-wght-normal.woff2'),
    to('fonts', 'geist-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'geist-mono', 'files', 'geist-mono-latin-wght-normal.woff2'),
    to('fonts', 'geist-mono-var.woff2'),
  ],

  // Forma's pair. Bricolage carries a width axis as well as weight, which is
  // what lets one display face be both a wide poster headline and a narrow
  // product name without a second file. The `wdth` cut rather than `full`:
  // optical sizing costs another 38KB and Forma's display sizes vary less than
  // Aurelia's do.
  [
    from('@fontsource-variable', 'bricolage-grotesque', 'files', 'bricolage-grotesque-latin-wdth-normal.woff2'),
    to('fonts', 'bricolage-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'instrument-sans', 'files', 'instrument-sans-latin-wght-normal.woff2'),
    to('fonts', 'instrument-var.woff2'),
  ],

  // Licence texts travel with the files they cover.
  [from('@fontsource-variable', 'fraunces', 'LICENSE'), to('licences', 'OFL-Fraunces.txt')],
  [
    from('@fontsource-variable', 'schibsted-grotesk', 'LICENSE'),
    to('licences', 'OFL-SchibstedGrotesk.txt'),
  ],
  [
    from('@fontsource-variable', 'jetbrains-mono', 'LICENSE'),
    to('licences', 'OFL-JetBrainsMono.txt'),
  ],
  [from('@fontsource-variable', 'geist', 'LICENSE'), to('licences', 'OFL-Geist.txt')],
  [from('@fontsource-variable', 'geist-mono', 'LICENSE'), to('licences', 'OFL-GeistMono.txt')],
  [from('@fontsource-variable', 'bricolage-grotesque', 'LICENSE'), to('licences', 'OFL-BricolageGrotesque.txt')],
  [from('@fontsource-variable', 'instrument-sans', 'LICENSE'), to('licences', 'OFL-InstrumentSans.txt')],
  [from('lenis', 'LICENSE'), to('licences', 'MIT-Lenis.txt')],
];

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(join(root, 'node_modules')))) {
  console.error('node_modules is missing — run `npm install` first.');
  console.error('(Hosting never needs this; the vendored copies are committed.)');
  process.exit(1);
}

let copied = 0;
for (const [source, target] of ASSETS) {
  if (!(await exists(source))) {
    console.error(`missing: ${source.replace(root, '.')}`);
    process.exit(1);
  }
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  copied += 1;
}

console.log(`Vendored ${copied} files into src/_lib/vendor/`);
