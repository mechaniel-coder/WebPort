/**
 * The one inline script on every motion-enabled page, and the CSP hash for it.
 *
 * ── Why it is inline at all ─────────────────────────────────────────────────
 *
 * It has to run before the first paint. An external script cannot: even with
 * no `defer`, it is a network round trip, and the browser may paint first. The
 * job is to decide, before anything is drawn, whether elements that are about
 * to be animated in should start hidden. Get that wrong and you get the flash
 * of un-animated content that the whole system exists to avoid.
 *
 * ── Why it is a hash and not 'unsafe-inline' ────────────────────────────────
 *
 * `script-src 'self'` is the policy for the whole portfolio. Adding
 * 'unsafe-inline' to allow one 180-byte snippet would disable inline-script
 * protection for every page, which is a real trade of security for convenience.
 * A SHA-256 hash of exactly this source permits this snippet and nothing else.
 *
 * The hash is derived from SNIPPET below rather than written by hand, so it
 * cannot drift from what ships; `verify.js` asserts that the hash quoted in the
 * host configs still matches, which is what catches an edit here that was not
 * carried into netlify.toml, vercel.json and the AWS response-headers policy.
 *
 * ── What it does ────────────────────────────────────────────────────────────
 *
 * If the user prefers reduced motion it does nothing at all — no class, so no
 * start-state rule in motion.css matches, so nothing is ever hidden from them.
 *
 * Otherwise it sets `has-motion` and arms a 2.5s timer to remove it again.
 * motion.js clears that timer as its first act. So the hidden state can only
 * persist if motion.js actually ran, and a CDN failure, a parse error or an
 * ad-blocker leaves the reader with a complete page rather than a blank one.
 */
import { createHash } from 'node:crypto';

export const SNIPPET =
  'var d=document.documentElement;' +
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){" +
  "d.classList.add('has-motion');" +
  'window.__motionFallback=setTimeout(function(){' +
  "d.classList.remove('has-motion');d.classList.add('motion-off')" +
  '},2500)}';

/** The `sha256-…` source expression for a CSP script-src directive. */
export const CSP_HASH = `sha256-${createHash('sha256').update(SNIPPET, 'utf8').digest('base64')}`;

/** The tag as it appears in the document. */
export const bootTag = () => `<script>${SNIPPET}</script>`;
