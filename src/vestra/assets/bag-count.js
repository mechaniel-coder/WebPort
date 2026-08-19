/**
 * Keep the bag count in the bar honest, including across tabs.
 *
 * Every page carries this, because a bag count that is stale after adding
 * something in another tab is the kind of small wrongness that makes a shop
 * feel untrustworthy.
 */
import { countItems, getBag, onBagChange } from './bag.js';

const badge = document.querySelector('[data-bag-count]');

if (badge) {
  const paint = (lines) => {
    const n = countItems(lines);
    badge.textContent = String(n);
    // The label has to say what the number means; "3" alone is not a bag count
    // to anyone listening rather than looking.
    const link = badge.closest('a');
    if (link) link.setAttribute('aria-label', `Bag, ${n} ${n === 1 ? 'item' : 'items'}`);
  };

  onBagChange(paint);
  paint(getBag());

  window.addEventListener('storage', (event) => {
    if (event.key === 'vestra.bag.v1') paint(getBag());
  });
}
