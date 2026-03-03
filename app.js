/* ═══════════════════════════════════════════════════════
   FLORNHUB – APPLICATION LOGIC
   No auth · Booking sends email · PHP Peso · Customizable products
═══════════════════════════════════════════════════════ */

'use strict';

// ╔══════════════════════════════════════════════════════╗
// ║  ★ CUSTOMIZABLE CONFIGURATION — Edit freely ★       ║
// ╚══════════════════════════════════════════════════════╝
const CONFIG = {
  // ── Contact & booking email recipient ──────────────
  BOOKING_EMAIL:  'reymancasio.5@gmail.com',
  CONTACT_EMAIL:  'reymancasio.5@gmail.com',

  // ── Contact details (shown in footer & contact page) ─
  PHONE:          '+63 9XX XXX XXXX',          // Change to your actual number
  MESSENGER:      'https://m.me/flornhub',     // Change to your Facebook page
  ADDRESS:        'Metro Manila, Philippines', // Change to your actual address

  // ── Currency ─────────────────────────────────────────
  CURRENCY_SYMBOL: '₱',
  CURRENCY_LOCALE: 'en-PH',

  // ── Company ──────────────────────────────────────────
  COMPANY_NAME:   'FlornHub Security Solutions',
  YEAR:           2025,
};

// ╔══════════════════════════════════════════════════════╗
// ║  ★ PRODUCT CATALOG — Add / edit / remove products ★ ║
// ║                                                      ║
// ║  Each product object:                                ║
// ║  {                                                   ║
// ║    id:          unique string (e.g. 'p001')          ║
// ║    name:        product name                         ║
// ║    price:       number in PHP (e.g. 8999)            ║
// ║    description: short description                    ║
// ║    category:    'cameras'|'recorders'|'access'|      ║
// ║                 'alarms'|'accessories'               ║
// ║    image:       URL string or null for placeholder   ║
// ║    stock:       'in'  → In Stock (green badge)       ║
// ║                 'low' → Low Stock (orange badge)     ║
// ║                 'out' → Out of Stock (red badge)     ║
// ║                 'soon'→ Coming Soon (purple badge)   ║
// ║  }                                                   ║
// ╚══════════════════════════════════════════════════════╝
const PRODUCTS = [
  {
    id: 'p001',
    name: '4K Dome Security Camera',
    price: 4499,
    description: 'Ultra HD 4K indoor/outdoor dome camera with night vision, IP67 weatherproofing, 120° wide-angle lens, and motion alerts.',
    category: 'cameras',
    image: null,
    stock: 'in',
  },
  {
    id: 'p002',
    name: '2MP Bullet Camera (1080p)',
    price: 1999,
    description: 'Weatherproof 1080p bullet camera with 30m IR night vision, suitable for driveways, gates, and outdoor perimeters.',
    category: 'cameras',
    image: null,
    stock: 'in',
  },
  {
    id: 'p003',
    name: 'PTZ Speed Dome Camera',
    price: 18999,
    description: '30× optical zoom PTZ camera with auto-tracking, 360° continuous rotation, and AI-powered intelligent motion detection.',
    category: 'cameras',
    image: null,
    stock: 'low',
  },
  {
    id: 'p004',
    name: '8-Channel NVR System',
    price: 24999,
    description: 'Professional 8-channel network video recorder with 2TB HDD, H.265+ compression, remote access app, and cloud backup support.',
    category: 'recorders',
    image: null,
    stock: 'in',
  },
  {
    id: 'p005',
    name: '16-Channel DVR System',
    price: 39999,
    description: 'Enterprise-grade 16-channel DVR with 4TB HDD, supports AHD/CVI/TVI cameras, web and mobile remote viewing.',
    category: 'recorders',
    image: null,
    stock: 'in',
  },
  {
    id: 'p006',
    name: 'Fingerprint Access Controller',
    price: 12499,
    description: 'Multi-factor biometric access control supporting fingerprint, RFID card, and PIN with 1,000-user capacity.',
    category: 'access',
    image: null,
    stock: 'in',
  },
  {
    id: 'p007',
    name: 'RFID Card Door Lock',
    price: 5999,
    description: 'Smart RFID card and PIN door lock with real-time access logs, suitable for offices, apartments, and commercial doors.',
    category: 'access',
    image: null,
    stock: 'low',
  },
  {
    id: 'p008',
    name: 'Wireless PIR Alarm Sensor',
    price: 2499,
    description: 'Pet-immune passive infrared motion sensor with 15m range, 110° detection coverage, and 2-year battery life.',
    category: 'alarms',
    image: null,
    stock: 'in',
  },
  {
    id: 'p009',
    name: 'GSM Smart Alarm Panel',
    price: 8999,
    description: 'All-in-one wireless alarm system with GSM SMS alerts, siren, 99-zone support, and smartphone app control.',
    category: 'alarms',
    image: null,
    stock: 'out',
  },
  {
    id: 'p010',
    name: '8-Port PoE Network Switch',
    price: 6499,
    description: '8-port gigabit PoE+ switch with 120W total budget. Plug-and-play for IP camera networks. No configuration needed.',
    category: 'accessories',
    image: null,
    stock: 'in',
  },
  {
    id: 'p011',
    name: 'UPS Battery Backup (1000VA)',
    price: 4999,
    description: 'Uninterruptible power supply for security systems. Keeps cameras and NVR running during power outages up to 4 hours.',
    category: 'accessories',
    image: null,
    stock: 'in',
  },
  {
    id: 'p012',
    name: 'AI Face Recognition Terminal',
    price: 34999,
    description: 'Advanced facial recognition access terminal with 8" touchscreen, mask detection, temperature screening, and cloud sync.',
    category: 'access',
    image: null,
    stock: 'soon',
  },
];

// ── CATEGORY LABELS ──────────────────────────────────
const CATEGORIES = {
  all:         'All Products',
  cameras:     'Cameras',
  recorders:   'Recorders / NVR',
  access:      'Access Control',
  alarms:      'Alarm Systems',
  accessories: 'Accessories',
};

// ── STOCK LABELS ─────────────────────────────────────
const STOCK_LABELS = {
  in:   'In Stock',
  low:  'Low Stock',
  out:  'Out of Stock',
  soon: 'Coming Soon',
};

// ════════════════════════════════════════════════════════
//  ROUTER
// ════════════════════════════════════════════════════════
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (!target) return;
  target.classList.add('active');

  // Close mobile nav
  document.getElementById('navLinks')?.classList.remove('open');

  // Update nav active states
  document.querySelectorAll('[data-page]').forEach(a =>
    a.classList.toggle('active', a.dataset.page === page)
  );

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific inits
  switch (page) {
    case 'home':     initCounters(); startMonitorClock(); break;
    case 'products': renderProducts('all'); break;
  }
}

// ════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════
let activeFilter = 'all';

function renderProducts(filter) {
  activeFilter = filter;

  // Render filter buttons
  const filterEl = document.getElementById('prodFilter');
  if (filterEl) {
    filterEl.innerHTML = Object.entries(CATEGORIES).map(([key, label]) => `
      <button class="filter-btn${key === filter ? ' active' : ''}"
              onclick="renderProducts('${key}')">
        ${label}
      </button>
    `).join('');
  }

  // Filter products
  const items = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filter);

  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('noProds');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  grid.innerHTML = items.map(p => {
    const formattedPrice = formatPrice(p.price);
    const isUnavailable  = p.stock === 'out' || p.stock === 'soon';

    return `
      <div class="glass-card prod-card scroll-hidden">
        <div class="prod-img-wrap">
          ${p.image
            ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"/>`
            : `<div class="prod-placeholder">
                 <i class="${getCatIcon(p.category)}"></i>
                 <span>${esc(CATEGORIES[p.category] || p.category)}</span>
               </div>`
          }
          <span class="stock-badge stock-${p.stock}">${STOCK_LABELS[p.stock] || p.stock}</span>
        </div>
        <div class="prod-body">
          <div class="prod-cat">${esc(CATEGORIES[p.category] || p.category)}</div>
          <div class="prod-name">${esc(p.name)}</div>
          <div class="prod-desc">${esc(p.description)}</div>
          <div class="prod-footer">
            <span class="prod-price${isUnavailable ? ' out-price' : ''}">
              ${isUnavailable ? STOCK_LABELS[p.stock] : formattedPrice}
            </span>
            ${isUnavailable
              ? `<button class="btn-primary sm" onclick="openBookingModal()" style="opacity:.6;" disabled>
                   <i class="fas fa-bell"></i> Notify Me
                 </button>`
              : `<button class="btn-primary sm" onclick="openBookingModal()">
                   <i class="fas fa-calendar-check"></i> Book Install
                 </button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Trigger scroll animations on new cards
  initScrollObserver();
}

function getCatIcon(cat) {
  const icons = {
    cameras:     'fas fa-camera',
    recorders:   'fas fa-server',
    access:      'fas fa-fingerprint',
    alarms:      'fas fa-bell',
    accessories: 'fas fa-tools',
  };
  return icons[cat] || 'fas fa-box';
}

function formatPrice(amount) {
  return CONFIG.CURRENCY_SYMBOL + amount.toLocaleString(CONFIG.CURRENCY_LOCALE);
}

// ════════════════════════════════════════════════════════
//  BOOKING MODAL
// ════════════════════════════════════════════════════════
function openBookingModal() {
  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = document.getElementById('bkDate');
  if (dateInput) dateInput.min = tomorrow.toISOString().split('T')[0];

  document.getElementById('bookModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Show step 1, hide step 2
  document.getElementById('modalStep1')?.classList.remove('hidden');
  document.getElementById('modalStep2')?.classList.add('hidden');
}

function closeBookingModal() {
  document.getElementById('bookModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target.id === 'bookModal') closeBookingModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBookingModal(); });

function submitBooking(e) {
  e.preventDefault();

  const errEl = document.getElementById('bkErr');
  errEl?.classList.add('hidden');

  const name     = document.getElementById('bkName').value.trim();
  const email    = document.getElementById('bkEmail').value.trim();
  const phone    = document.getElementById('bkPhone').value.trim();
  const date     = document.getElementById('bkDate').value;
  const service  = document.getElementById('bkService').value;
  const property = document.getElementById('bkProperty').value;
  const address  = document.getElementById('bkAddress').value.trim();
  const notes    = document.getElementById('bkNotes').value.trim();

  if (!service) {
    if (errEl) { errEl.textContent = 'Please select a service type.'; errEl.classList.remove('hidden'); }
    return;
  }

  // Generate reference number
  const refNum = 'FH-' + Date.now().toString(36).toUpperCase();

  // Build email body
  const emailSubject = encodeURIComponent(`[FlornHub Booking] ${service} – ${name}`);
  const emailBody = encodeURIComponent(
`New Booking Request
───────────────────────
Reference No: ${refNum}
───────────────────────

CLIENT INFORMATION
  Name    : ${name}
  Email   : ${email}
  Phone   : ${phone}

BOOKING DETAILS
  Service  : ${service}
  Property : ${property || 'Not specified'}
  Date     : ${date}
  Address  : ${address || 'Not provided'}

ADDITIONAL NOTES
${notes || '(None)'}

───────────────────────
Sent via FlornHub Website
`
  );

  // Open mailto — sends email via the user's default mail client
  // For production, replace with a backend endpoint (PHP/Node) or
  // a service like EmailJS, Formspree, or Netlify Forms
  window.location.href =
    `mailto:${CONFIG.BOOKING_EMAIL}?subject=${emailSubject}&body=${emailBody}`;

  // Show success screen
  document.getElementById('modalStep1')?.classList.add('hidden');
  document.getElementById('modalStep2')?.classList.remove('hidden');

  const refEl = document.getElementById('bookRef');
  if (refEl) refEl.textContent = `Reference: ${refNum}`;

  // Reset form
  document.getElementById('bookForm')?.reset();
}

// ════════════════════════════════════════════════════════
//  CONTACT FORM
// ════════════════════════════════════════════════════════
function submitContact(e) {
  e.preventDefault();

  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const subject = document.getElementById('cSubject').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  const mailSubject = encodeURIComponent(`[FlornHub] ${subject}`);
  const mailBody    = encodeURIComponent(
`Message from FlornHub website
───────────────────────
From    : ${name}
Email   : ${email}
Subject : ${subject}
───────────────────────

${message}
`
  );

  window.location.href =
    `mailto:${CONFIG.CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  e.target.reset();
  showToast('Message prepared! Your email client should have opened.', 'success');
}

// ════════════════════════════════════════════════════════
//  COUNTER ANIMATION (Hero stats)
// ════════════════════════════════════════════════════════
function initCounters() {
  document.querySelectorAll('.cnt').forEach(el => {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target   = +el.dataset.target;
    const duration = 2000;
    const step     = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ════════════════════════════════════════════════════════
//  MONITOR CLOCK
// ════════════════════════════════════════════════════════
let clockTimer = null;
function startMonitorClock() {
  const el = document.getElementById('mTime');
  if (!el) return;
  clearInterval(clockTimer);
  clockTimer = setInterval(() => {
    if (!document.getElementById('page-home').classList.contains('active')) return;
    el.textContent = new Date().toLocaleTimeString('en-PH', { hour12: false });
  }, 1000);
}

// ════════════════════════════════════════════════════════
//  FAQ ACCORDION
// ════════════════════════════════════════════════════════
function toggleFaq(btn) {
  const ans    = btn.parentElement.querySelector('.faq-a');
  const isOpen = btn.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    q.parentElement.querySelector('.faq-a')?.classList.remove('open');
  });

  if (!isOpen) {
    btn.classList.add('open');
    ans?.classList.add('open');
  }
}

// ════════════════════════════════════════════════════════
//  SCROLL REVEAL
// ════════════════════════════════════════════════════════
let scrollObs = null;

function initScrollObserver() {
  if (!scrollObs) {
    scrollObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
  }
  document.querySelectorAll('.scroll-hidden:not([data-observed])').forEach(el => {
    el.dataset.observed = '1';
    scrollObs.observe(el);
  });
}

// ════════════════════════════════════════════════════════
//  NAVBAR – scroll effect & hamburger
// ════════════════════════════════════════════════════════
window.addEventListener('scroll', () => {
  const inner = document.querySelector('.nav-inner');
  if (inner) inner.style.boxShadow = window.scrollY > 20
    ? '0 8px 40px rgba(0,70,180,0.15), 0 1px 0 rgba(255,255,255,1) inset'
    : '0 4px 24px rgba(0,70,180,0.10), 0 1px 0 rgba(255,255,255,1) inset';
}, { passive: true });

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});

// Close nav when clicking outside
document.addEventListener('click', e => {
  const nav = document.getElementById('navLinks');
  const ham = document.getElementById('hamburger');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !ham.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3800);
}

// ════════════════════════════════════════════════════════
//  UTILITY
// ════════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ════════════════════════════════════════════════════════
//  SCROLL REVEAL – general page elements
// ════════════════════════════════════════════════════════
function tagScrollItems() {
  const selectors = [
    '.svc-card', '.svc-full', '.testi-card', '.team-card',
    '.why-item', '.feat-pill', '.a-stat', '.c-item', '.faq-item',
  ];
  document.querySelectorAll(selectors.join(',')).forEach(el => {
    if (!el.classList.contains('scroll-hidden')) {
      el.classList.add('scroll-hidden');
    }
  });
  initScrollObserver();
}

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  tagScrollItems();

  // Run again after a tick to catch dynamically added elements
  setTimeout(tagScrollItems, 300);
});

/* ════════════════════════════════════════════════════════
   ★ HOW TO ADD A NEW PRODUCT ★
   ─────────────────────────────
   1. Open app.js
   2. Find the PRODUCTS array near the top
   3. Add a new object like:
   {
     id:          'p013',              ← unique ID
     name:        'My New Camera',
     price:        9999,               ← in Philippine Peso
     description: 'Short description',
     category:   'cameras',           ← cameras|recorders|access|alarms|accessories
     image:        null,              ← null for placeholder, or 'https://...' for image URL
     stock:       'in',               ← in|low|out|soon
   },
   4. Save the file. The product will appear automatically on the Products page.

   ★ TO MARK A PRODUCT OUT OF STOCK ★
   ─────────────────────────────────
   Change stock: 'in'  →  stock: 'out'
   The badge will update and the "Book Install" button will become "Notify Me".

   ★ TO CHANGE PRICES ★
   ─────────────────────
   Update the price number (in PHP pesos). No need to add ₱ symbol — it's automatic.

   ★ TO CHANGE BOOKING EMAIL ★
   ───────────────────────────
   Update CONFIG.BOOKING_EMAIL at the top of this file.
════════════════════════════════════════════════════════ */
