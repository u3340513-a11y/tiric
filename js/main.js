/**
 * Tiriç Berber — main.js
 * Handles: custom cursor, sticky nav, scroll reveal, gallery,
 *          working hours highlight, appointment form → WhatsApp redirect.
 */

'use strict';

/* ── Constants ─────────────────────────────────────────── */
const WHATSAPP_NUMBER = '905076630067';
const NAV_SCROLL_THRESHOLD = 60;

/* ── DOM Ready ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initStickyNav();
  initMobileMenu();
  initScrollReveal();
  initHeroLoad();
  initGalleryDuplicate();
  initWorkingHoursHighlight();
  initAppointmentForm();
  initSmoothScroll();
  initActiveNavLinks();
  initCounterAnimation();
});

/* ── 1. Custom Cursor ───────────────────────────────────── */
function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  // Hide on touch devices
  if (window.matchMedia('(hover: none)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower via rAF
  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  })();

  // Scale on interactive elements
  const interactives = document.querySelectorAll('a, button, .service-card, .team-card, .gallery-item');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width    = '6px';
      cursor.style.height   = '6px';
      follower.style.width  = '54px';
      follower.style.height = '54px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width    = '12px';
      cursor.style.height   = '12px';
      follower.style.width  = '36px';
      follower.style.height = '36px';
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });
}

/* ── 2. Sticky Nav ──────────────────────────────────────── */
function initStickyNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handler = () => {
    navbar.classList.toggle('scrolled', window.scrollY > NAV_SCROLL_THRESHOLD);
  };

  window.addEventListener('scroll', handler, { passive: true });
  handler();
}

/* ── 3. Mobile Menu ─────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const mobileLinks = mobileMenu?.querySelectorAll('a');
  if (!hamburger || !mobileMenu) return;

  const toggle = () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const close = () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', toggle);
  mobileLinks?.forEach((link) => link.addEventListener('click', close));

  // Close on overlay click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ── 4. Scroll Reveal ───────────────────────────────────── */
function initScrollReveal() {
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right'];
  const elements = document.querySelectorAll(revealClasses.join(','));
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ── 5. Hero Image Load Animation ──────────────────────── */
function initHeroLoad() {
  const hero = document.getElementById('hero');
  const heroImg = hero?.querySelector('.hero-bg img');
  if (!hero || !heroImg) return;

  if (heroImg.complete) {
    hero.classList.add('loaded');
  } else {
    heroImg.addEventListener('load', () => hero.classList.add('loaded'));
  }
}

/* ── 6. Gallery Marquee Duplicate ──────────────────────── */
function initGalleryDuplicate() {
  const tracks = document.querySelectorAll('.gallery-track, .testimonials-track');
  tracks.forEach((track) => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
  });
}

/* ── 7. Working Hours Highlight ─────────────────────────── */
function initWorkingHoursHighlight() {
  const dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const today = new Date().getDay();
  const todaySlug = dayMap[today];

  const el = document.querySelector(`.hours-item[data-day="${todaySlug}"]`);
  if (el) el.classList.add('today');
}

/* ── 8. Appointment Form → WhatsApp ─────────────────────── */
function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const message = buildWhatsAppMessage(form);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

/**
 * Validates required form fields.
 * Marks invalid fields with .error class and shows error messages.
 * @param {HTMLFormElement} form
 * @returns {boolean} Whether all required fields pass validation
 */
function validateForm(form) {
  let valid = true;

  // Clear previous errors
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.form-group.has-error').forEach((el) =>
    el.classList.remove('has-error')
  );

  const required = form.querySelectorAll('[required]');
  required.forEach((field) => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      field.classList.add('error');
      group?.classList.add('has-error');
      valid = false;
    }
  });

  // Phone validation (TR format)
  const phone = form.querySelector('#phone');
  if (phone && phone.value.trim()) {
    const cleaned = phone.value.replace(/\s+/g, '').replace(/^(\+90|0)/, '');
    if (!/^\d{10}$/.test(cleaned)) {
      phone.classList.add('error');
      phone.closest('.form-group')?.classList.add('has-error');
      valid = false;
    }
  }

  return valid;
}

/**
 * Builds a formatted WhatsApp message from form data.
 * @param {HTMLFormElement} form
 * @returns {string} Plain text message to send
 */
function buildWhatsAppMessage(form) {
  const getValue = (id) => form.querySelector(`#${id}`)?.value.trim() ?? '';

  const name    = getValue('fullname');
  const phone   = getValue('phone');
  const service = getValue('service');
  const date    = getValue('date');
  const time    = getValue('time');
  const note    = getValue('note');

  const dateFormatted = date
    ? new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
    : '';

  const lines = [
    '✂️ *Tiriç Berber — Randevu Talebi*',
    '───────────────────────',
    `👤 *Ad Soyad:* ${name}`,
    `📱 *Telefon:* ${phone}`,
    `💈 *Hizmet:* ${service}`,
    `📅 *Tarih:* ${dateFormatted}`,
    `🕐 *Saat:* ${time}`,
  ];

  if (note) {
    lines.push(`📝 *Not:* ${note}`);
  }

  lines.push('───────────────────────');
  lines.push('Bu mesaj tiricberber.com sitesi üzerinden gönderilmiştir.');

  return lines.join('\n');
}

/* ── 9. Smooth Scroll ───────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── 10. Active Nav Links on Scroll ─────────────────────── */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── 11. Counter Animation ──────────────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix ?? '';
        const duration = 1800;
        const startTime = performance.now();

        const update = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}
