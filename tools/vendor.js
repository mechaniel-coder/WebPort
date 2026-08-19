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

  // Type. One variable file per family covers every weight the sites use.
  //
  // Six brands, six typographic voices, and no family shared between two
  // client brands — they are separate businesses. The hub and the lab do share
  // a pair, because they are the same studio speaking.

  // Aurelia. Newsreader carries an optical-size axis, which is what lets one
  // serif be a 7rem headline and a 13px caption without either looking like a
  // scaled copy of the other. Familjen Grotesk sets everything read at length:
  // a grotesk with enough irregularity to sit beside a serif without going
  // invisible. Aurelia carries no monospace at all — a hotel has no reason to
  // dress its rates as terminal output.
  [
    from('@fontsource-variable', 'newsreader', 'files', 'newsreader-latin-standard-normal.woff2'),
    to('fonts', 'newsreader-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'familjen-grotesk', 'files', 'familjen-grotesk-latin-wght-normal.woff2'),
    to('fonts', 'familjen-var.woff2'),
  ],

  // Northwind. Red Hat Display, Text and Mono are one superfamily drawn on a
  // shared skeleton for an operating-system company's documentation, which is
  // the register this product actually lives in: the mono is a real terminal
  // face rather than a costume, and code on the page belongs to the page.
  [
    from('@fontsource-variable', 'red-hat-display', 'files', 'red-hat-display-latin-wght-normal.woff2'),
    to('fonts', 'redhat-display-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'red-hat-text', 'files', 'red-hat-text-latin-wght-normal.woff2'),
    to('fonts', 'redhat-text-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'red-hat-mono', 'files', 'red-hat-mono-latin-wght-normal.woff2'),
    to('fonts', 'redhat-mono-var.woff2'),
  ],

  // Forma. Chivo and Chivo Mono, again one superfamily. Forma's artwork is
  // generated vector geometry, so the site is built as a drawing rather than a
  // gallery: the mono carries dimensions, part codes and prices, the sans
  // carries everything else, and the two agree because they were drawn to.
  [
    from('@fontsource-variable', 'chivo', 'files', 'chivo-latin-wght-normal.woff2'),
    to('fonts', 'chivo-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'chivo-mono', 'files', 'chivo-mono-latin-wght-normal.woff2'),
    to('fonts', 'chivo-mono-var.woff2'),
  ],

  // Vestra. One family across the whole site, set at two extremes: Epilogue
  // very large and tight for display, small and light for reading. The fashion
  // default is a didone, and a house whose entire argument is published
  // measurements should not be speaking in the most decorative face available.
  // Spline Sans Mono exists here only for the size grades, where a column of
  // centimetres has to line up.
  [
    from('@fontsource-variable', 'epilogue', 'files', 'epilogue-latin-wght-normal.woff2'),
    to('fonts', 'epilogue-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'spline-sans-mono', 'files', 'spline-sans-mono-latin-wght-normal.woff2'),
    to('fonts', 'spline-mono-var.woff2'),
  ],

  // The studio's own pair, used by the hub and the lab and by nothing else.
  [
    from('@fontsource-variable', 'schibsted-grotesk', 'files', 'schibsted-grotesk-latin-wght-normal.woff2'),
    to('fonts', 'schibsted-var.woff2'),
  ],
  [
    from('@fontsource-variable', 'jetbrains-mono', 'files', 'jetbrains-mono-latin-wght-normal.woff2'),
    to('fonts', 'jetbrains-var.woff2'),
  ],

  // Licence texts travel with the files they cover.
  [from('@fontsource-variable', 'newsreader', 'LICENSE'), to('licences', 'OFL-Newsreader.txt')],
  [
    from('@fontsource-variable', 'familjen-grotesk', 'LICENSE'),
    to('licences', 'OFL-FamiljenGrotesk.txt'),
  ],
  [
    from('@fontsource-variable', 'red-hat-display', 'LICENSE'),
    to('licences', 'OFL-RedHatDisplay.txt'),
  ],
  [from('@fontsource-variable', 'red-hat-text', 'LICENSE'), to('licences', 'OFL-RedHatText.txt')],
  [from('@fontsource-variable', 'red-hat-mono', 'LICENSE'), to('licences', 'OFL-RedHatMono.txt')],
  [from('@fontsource-variable', 'chivo', 'LICENSE'), to('licences', 'OFL-Chivo.txt')],
  [from('@fontsource-variable', 'chivo-mono', 'LICENSE'), to('licences', 'OFL-ChivoMono.txt')],
  [from('@fontsource-variable', 'epilogue', 'LICENSE'), to('licences', 'OFL-Epilogue.txt')],
  [
    from('@fontsource-variable', 'spline-sans-mono', 'LICENSE'),
    to('licences', 'OFL-SplineSansMono.txt'),
  ],
  [
    from('@fontsource-variable', 'schibsted-grotesk', 'LICENSE'),
    to('licences', 'OFL-SchibstedGrotesk.txt'),
  ],
  [
    from('@fontsource-variable', 'jetbrains-mono', 'LICENSE'),
    to('licences', 'OFL-JetBrainsMono.txt'),
  ],
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
