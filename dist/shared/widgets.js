/**
 * Shared browser widgets — the interaction primitives all three sites need.
 *
 * Copied to /shared/widgets.js at build time and imported by each site's own
 * ui.js. The sites look nothing alike, but a disclosure is a disclosure: the
 * keyboard model, ARIA wiring and focus behaviour should not be reimplemented
 * (and subtly broken) three times.
 *
 * Every widget is an upgrade, not a construction. Without JavaScript the nav is
 * visible, accordion panels are open and forms fall back to native validation.
 */

/* ── Disclosure navigation ─────────────────────────────────────────────────── */

/**
 * Collapsible primary navigation.
 * The breakpoint comes from `data-nav-breakpoint` on the nav element so each
 * site can match its own layout without forking this file.
 */
export function initNav({ toggle = '[data-nav-toggle]', nav = '[data-nav]' } = {}) {
  const button = document.querySelector(toggle);
  const panel = document.querySelector(nav);
  if (!button || !panel) return;

  const breakpoint = panel.dataset.navBreakpoint || '62em';
  const mobile = window.matchMedia(`(max-width: calc(${breakpoint} - 0.02px))`);

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    panel.dataset.open = String(open);
  };

  // Collapsed is the scripted default; without JS the nav stays on screen.
  setOpen(false);
  mobile.addEventListener('change', () => setOpen(false));

  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!mobile.matches || button.getAttribute('aria-expanded') !== 'true') return;
    if (!panel.contains(event.target) && !button.contains(event.target)) setOpen(false);
  });
}

/* ── Accordion ─────────────────────────────────────────────────────────────── */

export function initAccordions() {
  for (const accordion of document.querySelectorAll('[data-accordion]')) {
    const triggers = [...accordion.querySelectorAll('[data-accordion-trigger]')];

    for (const [index, trigger] of triggers.entries()) {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) continue;

      panel.hidden = trigger.getAttribute('aria-expanded') !== 'true';

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });

      trigger.addEventListener('keydown', (event) => {
        const moves = { ArrowDown: 1, ArrowUp: -1 };
        if (event.key in moves) {
          event.preventDefault();
          triggers[(index + moves[event.key] + triggers.length) % triggers.length].focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          triggers[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          triggers[triggers.length - 1].focus();
        }
      });
    }
  }
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */

export function initTabs() {
  for (const tablist of document.querySelectorAll('[role="tablist"]')) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    if (!tabs.length) continue;

    const select = (tab, { focus = true } = {}) => {
      for (const other of tabs) {
        const active = other === tab;
        other.setAttribute('aria-selected', String(active));
        other.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      }
      if (focus) tab.focus();
    };

    select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0], {
      focus: false,
    });

    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener('click', () => select(tab, { focus: false }));
      tab.addEventListener('keydown', (event) => {
        const moves = { ArrowRight: 1, ArrowLeft: -1 };
        if (event.key in moves) {
          event.preventDefault();
          select(tabs[(index + moves[event.key] + tabs.length) % tabs.length]);
        } else if (event.key === 'Home') {
          event.preventDefault();
          select(tabs[0]);
        } else if (event.key === 'End') {
          event.preventDefault();
          select(tabs[tabs.length - 1]);
        }
      });
    }
  }
}

/* ── Forms ─────────────────────────────────────────────────────────────────── */

/**
 * Accessible client-side validation.
 *
 * Errors are announced through a per-field live region and the first invalid
 * control receives focus, so the failure is never silent for a keyboard or
 * screen-reader user.
 *
 * @param {object} options
 * @param {string} options.successMessage shown after a valid submission
 */
export function initForms({ successMessage } = {}) {
  for (const form of document.querySelectorAll('[data-validate]')) {
    const status = form.querySelector('[data-form-status]');

    const setError = (input, message) => {
      const field = input.closest('.field');
      const error = field?.querySelector('.field__error');
      field?.setAttribute('data-invalid', String(Boolean(message)));
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message || '';
    };

    for (const input of form.querySelectorAll('input, textarea, select')) {
      input.addEventListener('blur', () => {
        if (input.value) setError(input, input.checkValidity() ? '' : messageFor(input));
      });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true' && input.checkValidity()) {
          setError(input, '');
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let firstInvalid = null;

      for (const input of form.querySelectorAll('input, textarea, select')) {
        const valid = input.checkValidity();
        setError(input, valid ? '' : messageFor(input));
        if (!valid && !firstInvalid) firstInvalid = input;
      }

      if (firstInvalid) {
        if (status) {
          status.dataset.tone = 'error';
          status.textContent = 'Please correct the highlighted fields and try again.';
        }
        firstInvalid.focus();
        return;
      }

      // ── SUBMIT ENDPOINT ─────────────────────────────────────────────────────
      // Replace this block with a real POST to wire the form up:
      //
      //   await fetch('https://your-endpoint', {
      //     method: 'POST',
      //     headers: { 'content-type': 'application/json' },
      //     body: JSON.stringify(Object.fromEntries(new FormData(form))),
      //   });
      //
      // Nothing is transmitted as shipped.
      // ────────────────────────────────────────────────────────────────────────
      if (status) {
        status.dataset.tone = 'success';
        status.textContent = successMessage || 'Thank you — this demonstration does not send mail.';
      }
      form.reset();
    });
  }
}

/** Turn a failed constraint into language a person would actually understand. */
function messageFor(input) {
  const label = input.dataset.label || input.name || 'This field';
  if (input.validity.valueMissing) return `${label} is required.`;
  if (input.validity.typeMismatch && input.type === 'email') {
    return 'Enter an email address in the form name@example.com.';
  }
  if (input.validity.typeMismatch && input.type === 'url') {
    return 'Enter a full URL, including https://';
  }
  if (input.validity.tooShort) return `${label} needs at least ${input.minLength} characters.`;
  if (input.validity.rangeUnderflow) return `${label} must be ${input.min} or more.`;
  if (input.validity.rangeOverflow) return `${label} must be ${input.max} or less.`;
  if (input.validity.patternMismatch) return `${label} is not in the expected format.`;
  return `${label} is not valid.`;
}

/** Boot every widget with one call. */
export function initAll(options = {}) {
  initNav(options.nav);
  initAccordions();
  initTabs();
  initForms(options.forms);
}
