/**
 * Aurelia interaction primitives.
 *
 * Three small widgets used across the site. Each is progressive: the markup is
 * usable with JavaScript disabled (panels open, nav visible), and these upgrade
 * it rather than create it.
 */

/* ── Mobile navigation ─────────────────────────────────────────────────────── */

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!toggle || !nav) return;

  const mobile = window.matchMedia('(max-width: 61.999em)');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  };

  // Collapsed is the JS-enabled default; without JS the nav stays visible.
  const sync = () => setOpen(false);
  sync();
  mobile.addEventListener('change', sync);

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes, and focus returns to the control that opened it.
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!mobile.matches || toggle.getAttribute('aria-expanded') !== 'true') return;
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
}

/* ── Accordion ─────────────────────────────────────────────────────────────── */

function initAccordions() {
  for (const accordion of document.querySelectorAll('[data-accordion]')) {
    const triggers = [...accordion.querySelectorAll('[data-accordion-trigger]')];

    for (const [index, trigger] of triggers.entries()) {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) continue;

      // Collapse by default only once scripting is confirmed available.
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      panel.hidden = !expanded;

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });

      trigger.addEventListener('keydown', (event) => {
        const moves = { ArrowDown: 1, ArrowUp: -1 };
        if (event.key in moves) {
          event.preventDefault();
          const next = (index + moves[event.key] + triggers.length) % triggers.length;
          triggers[next].focus();
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

function initTabs() {
  for (const tablist of document.querySelectorAll('[role="tablist"]')) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];

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

    const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    if (initial) select(initial, { focus: false });

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

/* ── Contact form ──────────────────────────────────────────────────────────── */

/**
 * Accessible client-side validation for the enquiry form.
 *
 * There is no backend by design. The single hand-off point is marked below.
 */
function initForms() {
  for (const form of document.querySelectorAll('[data-validate]')) {
    const status = form.querySelector('[data-form-status]');

    const showError = (input, message) => {
      const field = input.closest('.field');
      const error = field?.querySelector('.field__error');
      field?.setAttribute('data-invalid', String(Boolean(message)));
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message || '';
    };

    for (const input of form.querySelectorAll('input, textarea, select')) {
      input.addEventListener('blur', () => {
        if (input.value) showError(input, input.checkValidity() ? '' : messageFor(input));
      });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true' && input.checkValidity()) {
          showError(input, '');
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputs = [...form.querySelectorAll('input, textarea, select')];
      let firstInvalid = null;

      for (const input of inputs) {
        const valid = input.checkValidity();
        showError(input, valid ? '' : messageFor(input));
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

      // ── SUBMIT ENDPOINT ───────────────────────────────────────────────────
      // Replace this block with a real POST to wire the form up:
      //
      //   await fetch('https://your-endpoint', {
      //     method: 'POST',
      //     headers: { 'content-type': 'application/json' },
      //     body: JSON.stringify(Object.fromEntries(new FormData(form))),
      //   });
      //
      // Nothing is transmitted as shipped.
      // ──────────────────────────────────────────────────────────────────────
      if (status) {
        status.dataset.tone = 'success';
        status.textContent =
          'Thank you — your enquiry has been recorded. This demonstration site does not send mail.';
      }
      form.reset();
    });
  }
}

/** Turn a failed constraint into language a guest would actually understand. */
function messageFor(input) {
  const label = input.dataset.label || input.name || 'This field';
  if (input.validity.valueMissing) return `${label} is required.`;
  if (input.validity.typeMismatch && input.type === 'email') {
    return 'Enter an email address in the form name@example.com.';
  }
  if (input.validity.tooShort) return `${label} needs at least ${input.minLength} characters.`;
  if (input.validity.rangeUnderflow) return `${label} must be ${input.min} or more.`;
  if (input.validity.rangeOverflow) return `${label} must be ${input.max} or less.`;
  return `${label} is not valid.`;
}

/* ── Boot ──────────────────────────────────────────────────────────────────── */

initNav();
initAccordions();
initTabs();
initForms();
