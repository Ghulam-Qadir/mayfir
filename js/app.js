(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = matchMedia('(pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  const pre = $('.preloader');
  const dismissPreloader = () => {
    if (!pre) return;
    if (window.gsap && !reduced) {
      gsap.to('.preloader i', { scaleX: 0, duration: .55, ease: 'power2.in' });
      gsap.to(pre, { autoAlpha: 0, duration: .65, delay: .25, ease: 'power2.out', onComplete: () => pre.remove() });
    } else {
      pre.remove();
    }
  };
  if (pre) {
    if (document.readyState === 'complete') dismissPreloader();
    else window.addEventListener('load', dismissPreloader, { once: true });
    setTimeout(dismissPreloader, 4000); // hard failsafe
  }

  /* ---------- Header state + scroll progress ---------- */
  const header   = $('.site-header');
  const progress = $('.scroll-progress');
  let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    header?.classList.toggle('scrolled', y > 50);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const menu   = $('#mobile-menu');
  const toggle = $('.menu-toggle');

  const setMenu = (open) => {
    if (!menu || !toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.style.display = open ? 'flex' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      $$('a', menu).forEach((link, i) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(18px)';
        requestAnimationFrame(() => setTimeout(() => {
          link.style.transition = 'opacity .45s ease, transform .45s ease, color .25s ease';
          link.style.opacity = '1';
          link.style.transform = 'translateY(0)';
        }, reduced ? 0 : i * 55));
      });
      menu.querySelector('a')?.focus({ preventScroll: true });
    }
  };

  const menuIsOpen = () => toggle?.getAttribute('aria-expanded') === 'true';

  toggle?.addEventListener('click', () => setMenu(!menuIsOpen()));
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Escape closes the mobile navigation.
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuIsOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close if the viewport grows past the mobile breakpoint while open.
  matchMedia('(min-width: 901px)').addEventListener('change', e => {
    if (e.matches && menuIsOpen()) setMenu(false);
  });

  /* ---------- Custom cursor ---------- */
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (fine && dot && ring) {
    let cx = 0, cy = 0, tx = 0, ty = 0, raf = null;

    const follow = () => {
      cx += (tx - cx) * .22;
      cy += (ty - cy) * .22;
      ring.style.left = cx + 'px';
      ring.style.top  = cy + 'px';
      if (Math.abs(tx - cx) > .4 || Math.abs(ty - cy) > .4) raf = requestAnimationFrame(follow);
      else raf = null;
    };

    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px';
      dot.style.top  = ty + 'px';
      if (raf === null) raf = requestAnimationFrame(follow);
    }, { passive: true });

    const grow   = () => { ring.style.width = '54px'; ring.style.height = '54px'; ring.style.borderColor = '#f0e4c8'; };
    const shrink = () => { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.borderColor = 'rgba(216,194,154,.55)'; };
    $$('a,button,.inventory-card,summary').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * .08}px,${y * .08}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- GSAP animation layer ---------- */
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero h1 span', { y: 90, opacity: 0, duration: 1.05, delay: .5 })
      .from('.hero h1 em',   { y: 90, opacity: 0, duration: 1.05 }, '-=.8')
      .from('.hero-copy',    { y: 25, opacity: 0, duration: .7 }, '-=.5')
      .from('.hero-actions', { y: 18, opacity: 0, duration: .6 }, '-=.35')
      .from('.hero-bottom span', { opacity: 0, y: 10, stagger: .08, duration: .4 }, '-=.25');

    // No scale on images — keeps the full frame visible (V5 requirement).
    $$('.reveal').forEach(el =>
      gsap.from(el, { y: 55, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
    );
    $$('.reveal-image').forEach(el =>
      gsap.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
    );
    // Parallax carries a 4% bleed so no edge gap opens while scrubbing.
    gsap.utils.toArray('.image-break img,.feature-photo img').forEach(img =>
      gsap.fromTo(img,
        { yPercent: -2, scale: 1.04 },
        { yPercent: 2, scale: 1.04, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    );
    gsap.utils.toArray('.inventory-card').forEach((c, i) =>
      gsap.from(c, { y: 40, opacity: 0, duration: .6, delay: i * .08, scrollTrigger: { trigger: c, start: 'top 90%', once: true } })
    );
  } else if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Collection grid: prefill + image preloading ---------- */
  // The grid is authored in HTML (crawlable, works without JS); JS only
  // enhances it by pre-selecting the vehicle the visitor enquired about.
  $$('.vehicle-card-cta[data-vehicle]').forEach(link => {
    link.addEventListener('click', () => {
      const wanted = link.dataset.vehicle;
      const select = $('[name="vehicle"]');
      if (!select || !wanted) return;
      const match = [...select.options].find(o => o.value === wanted || o.textContent.trim() === wanted);
      if (match) select.value = match.value;
    });
  });

  // Warm the collection imagery so the first scroll feels instant.
  $$('.vehicle-card-media img').forEach(im => { const p = new Image(); p.src = im.currentSrc || im.src; });

  /* ---------- Enquiry form (single handler) ---------- */
  const form   = $('#enquiryForm');
  const status = $('.form-status');

  form?.addEventListener('submit', e => {
    e.preventDefault();

    $$('.field-error-message', form).forEach(x => x.remove());
    $$('.field-error', form).forEach(x => x.classList.remove('field-error'));
    if (status) { status.textContent = ''; status.className = 'form-status'; }

    let ok = true;
    let firstBad = null;

    ['name', 'email'].forEach(field => {
      const el = $(`[name="${field}"]`, form);
      if (!el) return;
      const invalid = field === 'email'
        ? !el.validity.valid || !el.value.trim()
        : !el.value.trim();
      if (!invalid) return;

      ok = false;
      firstBad ??= el;
      const label = el.closest('label');
      label?.classList.add('field-error');
      el.setAttribute('aria-invalid', 'true');

      const msg = document.createElement('span');
      msg.className = 'field-error-message';
      msg.id = `${field}-error`;
      msg.textContent = field === 'email' ? 'Enter a valid email address.' : 'This field is required.';
      label?.appendChild(msg);
      el.setAttribute('aria-describedby', msg.id);
    });

    if (!ok) {
      if (status) { status.textContent = 'Please correct the highlighted fields.'; status.classList.add('error'); }
      firstBad?.focus();
      return;
    }

    const btn = $('button[type="submit"]', form);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.dataset.label = btn.innerHTML;
      btn.textContent = 'Sending…';
    }

    // TODO: replace with the approved CRM / email endpoint.
    setTimeout(() => {
      form.reset();
      if (status) {
        status.textContent = 'Thank you. Your enquiry has been received and we will be in touch shortly.';
        status.classList.add('success');
      }
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
        btn.innerHTML = btn.dataset.label || 'Send enquiry <span>↗</span>';
      }
    }, reduced ? 0 : 650);
  });

  // Clear the error state as soon as the user starts fixing a field.
  form?.addEventListener('input', e => {
    const el = e.target;
    if (!el.name) return;
    el.removeAttribute('aria-invalid');
    const label = el.closest('label');
    label?.classList.remove('field-error');
    $(`#${el.name}-error`, label || form)?.remove();
  });

  /* ---------- Scroll-spy: mark the active nav link ---------- */
  const navLinks = $$('.desktop-nav a[href^="#"], #mobile-menu a[href^="#"]');
  const sections = navLinks
    .map(a => ({ link: a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(s => s.el);

  if (sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const active = sections.find(s => s.el === entry.target);
        if (!active) return;
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        active.link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s.el));
  }

  /* ---------- Lazy-load below-the-fold imagery ---------- */
  if ('IntersectionObserver' in window) {
    const lazy = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const im = entry.target;
        if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
        im.loading = 'lazy';
        obs.unobserve(im);
      });
    }, { rootMargin: '300px' });
    $$('img[data-src]').forEach(im => lazy.observe(im));
  }
})();
