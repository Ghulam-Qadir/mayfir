/* ==========================================================
   SHARED · ENQUIRY MODAL
   Injects the popup markup, then wires open / close, focus
   trap, scroll lock, validation and the success state.
   Triggers: any [data-enq-open] element.
   ========================================================== */
(() => {
  if (document.getElementById('enqModal')) return;

  const markup = `
<div class="enq-modal" id="enqModal" role="dialog" aria-modal="true" aria-labelledby="enqTitle" hidden>
  <div class="enq-scrim" data-enq-close></div>
  <div class="enq-panel">
    <button class="enq-close" type="button" data-enq-close aria-label="Close enquiry form"><span aria-hidden="true">&#10005;</span></button>

    <aside class="enq-aside">
      <div class="enq-aside-copy">
        <p class="eyebrow">MAKE AN ENQUIRY</p>
        <h2 id="enqTitle">Tell us about<br><em>your journey.</em></h2>
        <p>Share a few essentials and our team will shape the right service and vehicle around your plans.</p>
      </div>
      <ul class="enq-points">
        <li><span>01</span>Chauffeur &amp; private hire</li>
        <li><span>02</span>Airport transfers, 24/7</li>
        <li><span>03</span>Corporate &amp; event travel</li>
        <li><span>04</span>Hourly &amp; long-term rental</li>
      </ul>
      <div class="enq-aside-foot">
        <a href="tel:+10000000000">+00 000 000 000</a>
        <a href="mailto:enquiries@example.com">enquiries@example.com</a>
      </div>
    </aside>

    <div class="enq-body">
      <form class="enq-form" id="enqForm" novalidate>
        <div class="enq-grid">
          <label>Full name<input name="name" type="text" autocomplete="name" required></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Service
            <select name="service" required>
              <option value="">Select a service</option>
              <option>Chauffeur Services</option>
              <option>Airport Transfers</option>
              <option>Corporate Travel</option>
              <option>Weddings &amp; Events</option>
              <option>Hourly Car Service</option>
              <option>Long-Term Rental</option>
            </select>
          </label>
          <label>Date<input name="date" type="date"></label>
          <label>Preferred time<input name="time" type="time"></label>
          <label class="full">Journey details<textarea name="message" rows="5" placeholder="Pickup, destination, passengers and anything else we should know..." required></textarea></label>
        </div>
        <div class="enq-actions">
          <p class="enq-status" role="status" aria-live="polite"></p>
          <button class="btn gold" type="submit">Send enquiry <span aria-hidden="true">&#8599;</span></button>
        </div>
      </form>

      <div class="enq-done" hidden>
        <span class="enq-done-mark" aria-hidden="true">&#10003;</span>
        <p class="eyebrow">ENQUIRY RECEIVED</p>
        <h3>Thank you &mdash;<br><em>we'll be in touch.</em></h3>
        <p>Our team reviews every enquiry personally and will respond with availability, vehicle options and a clear quote.</p>
        <div class="enq-done-actions">
          <button class="btn gold" type="button" data-enq-reset>Send another enquiry</button>
          <button class="btn line" type="button" data-enq-close>Close</button>
        </div>
      </div>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', markup);

  const modal = document.getElementById('enqModal');
  const panel = modal.querySelector('.enq-panel');
  const form = modal.querySelector('#enqForm');
  const status = modal.querySelector('.enq-status');
  const done = modal.querySelector('.enq-done');
  const openers = document.querySelectorAll('[data-enq-open]');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const focusables = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastFocus = null;
  let closeTimer = null;

  if (!openers.length) return;

  /* The header pages drive #mobile-menu differently (open class on
     about/services/contact, inline display + aria-expanded on home),
     so close it through its own toggle and fall back to force-close. */
  const menuIsOpen = () => (mobileMenu?.classList.contains('open') || menuToggle?.getAttribute('aria-expanded') === 'true') && !!mobileMenu;
  const closeMobileMenu = () => {
    if (!menuIsOpen()) return;
    menuToggle?.click();
    if (menuIsOpen()) {
      mobileMenu.classList.remove('open');
      mobileMenu.style.display = 'none';
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      document.body.style.overflow = '';
    }
  };

  const lockScroll = () => {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--enq-sb', gap > 0 ? gap + 'px' : '0px');
    document.documentElement.classList.add('enq-open');
  };

  const unlockScroll = () => {
    document.documentElement.classList.remove('enq-open');
    document.documentElement.style.removeProperty('--enq-sb');
  };

  const openModal = trigger => {
    clearTimeout(closeTimer);
    if (!modal.hidden) {
      form.querySelector('input')?.focus({ preventScroll: true });
      return;
    }
    lastFocus = trigger || document.activeElement;
    modal.hidden = false;
    lockScroll();
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.addEventListener('keydown', onKey);
    setTimeout(() => form.querySelector('input')?.focus({ preventScroll: true }), 260);
  };

  const closeModal = () => {
    if (modal.hidden) return;
    clearTimeout(closeTimer);
    modal.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    const finish = () => {
      modal.hidden = true;
      unlockScroll();
      const visible = el => el && el.isConnected && el.offsetParent !== null;
      const back = visible(lastFocus) ? lastFocus : (visible(menuToggle) ? menuToggle : null);
      back?.focus({ preventScroll: true });
    };
    if (reduceMotion.matches) finish();
    else closeTimer = setTimeout(finish, 320);
  };

  function onKey(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab' || !panel) return;
    const items = [...panel.querySelectorAll(focusables)].filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  openers.forEach(btn => btn.addEventListener('click', () => {
    closeMobileMenu();
    openModal(btn);
  }));

  modal.querySelectorAll('[data-enq-close]').forEach(el => el.addEventListener('click', closeModal));

  modal.querySelector('[data-enq-reset]')?.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.reset();
    status.textContent = '';
    status.className = 'enq-status';
    form.querySelector('input')?.focus();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = 'Please complete the required fields.';
      status.className = 'enq-status error';
      form.querySelector(':invalid')?.focus();
      return;
    }
    status.textContent = '';
    status.className = 'enq-status';
    form.hidden = true;
    done.hidden = false;
    done.querySelector('button')?.focus();
  });
})();