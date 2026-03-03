/* ═══════════════════════════════════════════════════════
   FLORNHUB – COMPLETE APPLICATION LOGIC
   SPA Router | Auth | Products | Bookings | Admin
═══════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ──────────────────────────────────────────
const CONFIG = {
  EMAIL:      'info@flornhub.com',
  PHONE:      '+1800FLORNHUB',
  MESSENGER:  'https://m.me/flornhub',
  ADMIN_EMAIL:'admin@flornhub.com',
  ADMIN_PASS: 'admin123',   // demo only — in prod use server-side auth
};

// ── "DATABASE" (localStorage) ────────────────────────
const DB = {
  get(key)       { try { return JSON.parse(localStorage.getItem('fh_' + key)) || []; } catch { return []; } },
  set(key, val)  { localStorage.setItem('fh_' + key, JSON.stringify(val)); },
  getObj(key)    { try { return JSON.parse(localStorage.getItem('fh_' + key)) || null; } catch { return null; } },
  setObj(key, v) { localStorage.setItem('fh_' + key, JSON.stringify(v)); },
  del(key)       { localStorage.removeItem('fh_' + key); },
};

// Collections: users, products, bookings, messages
function getUsers()    { return DB.get('users'); }
function getProducts() { return DB.get('products'); }
function getBookings() { return DB.get('bookings'); }
function getMessages() { return DB.get('messages'); }
function saveUsers(d)    { DB.set('users', d); }
function saveProducts(d) { DB.set('products', d); }
function saveBookings(d) { DB.set('bookings', d); }
function saveMessages(d) { DB.set('messages', d); }

// Session
function getSession() { return DB.getObj('session'); }
function setSession(u) { DB.setObj('session', u); }
function clearSession() { DB.del('session'); }

// ── SIMPLE PASSWORD HASH (sha256-like via subtle crypto) ──
async function hashPassword(pw) {
  const buf = new TextEncoder().encode(pw);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── SEED DEMO DATA ───────────────────────────────────
function seedData() {
  // Admin user
  if (!DB.getObj('admin_seeded')) {
    hashPassword(CONFIG.ADMIN_PASS).then(h => {
      // Admin stored separately, not in users collection
      DB.setObj('admin_hash', h);
      DB.setObj('admin_seeded', true);
    });
  }

  // Demo user
  if (getUsers().length === 0) {
    hashPassword('demo1234').then(h => {
      saveUsers([{
        id: 'u001',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@user.com',
        phone: '+1 555 000 0000',
        passwordHash: h,
        role: 'customer',
        createdAt: new Date().toISOString(),
      }]);
    });
  }

  // Seed products
  if (getProducts().length === 0) {
    const demo = [
      { id: 'p001', name: '4K Dome Camera', price: 149.99, description: 'Ultra HD 4K indoor/outdoor dome camera with night vision, IP67 weatherproofing, and 120° wide-angle lens.', category: 'cameras', image: null, createdAt: new Date().toISOString() },
      { id: 'p002', name: '8-Channel NVR System', price: 499.99, description: 'Professional 8-channel network video recorder with 2TB HDD, H.265+ compression, remote access app included.', category: 'recorders', image: null, createdAt: new Date().toISOString() },
      { id: 'p003', name: 'PTZ Speed Dome Camera', price: 399.99, description: '30× optical zoom PTZ camera with auto-tracking, 360° rotation, and intelligent motion detection algorithms.', category: 'cameras', image: null, createdAt: new Date().toISOString() },
      { id: 'p004', name: 'Fingerprint Access Controller', price: 229.99, description: 'Multi-factor biometric access control supporting fingerprint, RFID card, and PIN with 1000-user capacity.', category: 'access', image: null, createdAt: new Date().toISOString() },
      { id: 'p005', name: 'Wireless PIR Alarm Sensor', price: 49.99, description: 'Pet-immune passive infrared motion sensor with 15m range, 110° coverage, and 2-year battery life.', category: 'alarms', image: null, createdAt: new Date().toISOString() },
      { id: 'p006', name: 'PoE Network Switch 8-Port', price: 129.99, description: '8-port gigabit PoE+ network switch, 120W total power budget. Plug-and-play for IP camera networks.', category: 'accessories', image: null, createdAt: new Date().toISOString() },
    ];
    saveProducts(demo);
  }

  // Seed bookings
  if (getBookings().length === 0) {
    saveBookings([
      { id: 'b001', userId: 'u001', name: 'Demo User', email: 'demo@user.com', phone: '+1 555 000 0000', service: 'CCTV Installation', property: 'Residential – House', address: '10 Sample St, Demo City', date: '2025-03-15', notes: '4 cameras needed', status: 'completed', createdAt: new Date().toISOString() },
      { id: 'b002', userId: 'u001', name: 'Demo User', email: 'demo@user.com', phone: '+1 555 000 0000', service: 'NVR / DVR Setup', property: 'Commercial – Office', address: '10 Sample St, Demo City', date: '2025-04-20', notes: '', status: 'pending', createdAt: new Date().toISOString() },
    ]);
  }
}

// ── ROUTER ───────────────────────────────────────────
const noFooterPages = ['dashboard', 'admin-dashboard'];
const authRequired  = ['dashboard'];
const adminRequired = ['admin-dashboard'];

function showPage(page) {
  const session = getSession();

  // Auth guards
  if (authRequired.includes(page) && !session) { showPage('login'); return; }
  if (adminRequired.includes(page) && (!session || !session.isAdmin)) { showPage('admin-login'); return; }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (!target) { console.warn('Page not found:', page); return; }
  target.classList.add('active');

  // Footer visibility
  const footer = document.getElementById('footer');
  if (footer) footer.style.display = noFooterPages.includes(page) ? 'none' : '';

  // Close mobile nav
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.remove('open');

  // Update nav active states
  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific init
  switch (page) {
    case 'home':         initCounters(); updateMonitorTime(); break;
    case 'products':     renderProducts(); break;
    case 'dashboard':    initDashboard(); break;
    case 'admin-dashboard': initAdminDashboard(); break;
    case 'register':     if (session) { showPage(session.isAdmin ? 'admin-dashboard' : 'dashboard'); } break;
    case 'login':        if (session) { showPage(session.isAdmin ? 'admin-dashboard' : 'dashboard'); } break;
  }
}

// ── NAVBAR ────────────────────────────────────────────
function updateNav() {
  const session = getSession();
  const authEl  = document.getElementById('navAuth');
  const userEl  = document.getElementById('navUser');
  const nameEl  = document.getElementById('navUsername');
  if (!authEl || !userEl) return;
  if (session) {
    authEl.classList.add('hidden');
    userEl.classList.remove('hidden');
    nameEl.textContent = session.isAdmin ? '👤 Admin' : `👤 ${session.firstName}`;
  } else {
    authEl.classList.remove('hidden');
    userEl.classList.add('hidden');
  }
}

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});

// ── COUNTER ANIMATION ────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = +el.dataset.target;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ── MONITOR CLOCK ────────────────────────────────────
function updateMonitorTime() {
  const el = document.getElementById('monitorTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  setTimeout(updateMonitorTime, 1000);
}

// ── SCROLL ANIMATIONS ───────────────────────────────
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.1 });

function initScrollAnimations() {
  document.querySelectorAll('.card, .service-card-full, .testimonial-card, .team-card, .why-point, .feature-item').forEach(el => {
    el.classList.add('scroll-hidden');
    scrollObserver.observe(el);
  });
}

// ── AUTH ─────────────────────────────────────────────
async function registerUser(e) {
  e.preventDefault();
  const errEl = document.getElementById('regError');
  errEl.classList.add('hidden');

  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName  = document.getElementById('regLastName').value.trim();
  const email     = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone     = document.getElementById('regPhone').value.trim();
  const pw        = document.getElementById('regPassword').value;
  const conf      = document.getElementById('regConfirm').value;

  if (pw !== conf) { showError(errEl, 'Passwords do not match.'); return; }
  if (pw.length < 8) { showError(errEl, 'Password must be at least 8 characters.'); return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { showError(errEl, 'An account with this email already exists.'); return; }
  if (email === CONFIG.ADMIN_EMAIL) { showError(errEl, 'That email address is reserved.'); return; }

  const hash = await hashPassword(pw);
  const user = {
    id: 'u' + Date.now(),
    firstName, lastName, email, phone,
    passwordHash: hash,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  setSession({ ...user, passwordHash: undefined });
  updateNav();
  showToast('Account created! Welcome to FlornHub.', 'success');
  showPage('dashboard');
}

async function loginUser(e) {
  e.preventDefault();
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pw    = document.getElementById('loginPassword').value;

  // Check admin
  if (email === CONFIG.ADMIN_EMAIL) {
    const storedHash = DB.getObj('admin_hash');
    const inputHash  = await hashPassword(pw);
    if (inputHash === storedHash || pw === CONFIG.ADMIN_PASS) {
      setSession({ id: 'admin', firstName: 'Admin', lastName: '', email, isAdmin: true, role: 'admin' });
      updateNav();
      showToast('Welcome back, Admin!', 'success');
      showPage('admin-dashboard');
      return;
    }
    showError(errEl, 'Invalid email or password.');
    return;
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email);
  if (!user) { showError(errEl, 'No account found with that email.'); return; }

  const inputHash = await hashPassword(pw);
  if (inputHash !== user.passwordHash) { showError(errEl, 'Invalid email or password.'); return; }

  setSession({ ...user, passwordHash: undefined });
  updateNav();
  showToast(`Welcome back, ${user.firstName}!`, 'success');
  showPage('dashboard');
}

async function adminLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('adminLoginError');
  errEl.classList.add('hidden');

  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pw    = document.getElementById('adminPassword').value;

  if (email !== CONFIG.ADMIN_EMAIL) { showError(errEl, 'Access denied.'); return; }

  const storedHash = DB.getObj('admin_hash');
  const inputHash  = await hashPassword(pw);
  if (inputHash !== storedHash && pw !== CONFIG.ADMIN_PASS) { showError(errEl, 'Invalid credentials.'); return; }

  setSession({ id: 'admin', firstName: 'Admin', lastName: '', email, isAdmin: true, role: 'admin' });
  updateNav();
  showToast('Admin access granted.', 'success');
  showPage('admin-dashboard');
}

function logout() {
  clearSession();
  updateNav();
  showToast('Signed out successfully.', 'success');
  showPage('home');
}

function updateProfile(e) {
  e.preventDefault();
  const session = getSession();
  if (!session) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === session.id);
  if (idx === -1) return;
  users[idx].firstName = document.getElementById('profileFirst').value.trim();
  users[idx].lastName  = document.getElementById('profileLast').value.trim();
  users[idx].phone     = document.getElementById('profilePhone').value.trim();
  saveUsers(users);
  setSession({ ...session, ...users[idx], passwordHash: undefined });
  updateNav();
  showToast('Profile updated!', 'success');
}

// ── PRODUCTS ─────────────────────────────────────────
function renderProducts() {
  const products = getProducts();
  const container = document.getElementById('productsContainer');
  const noProducts = document.getElementById('noProducts');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '';
    noProducts?.classList.remove('hidden');
    return;
  }
  noProducts?.classList.add('hidden');
  container.innerHTML = products.map(p => `
    <div class="product-card">
      ${p.image
        ? `<div class="product-img"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"/></div>`
        : `<div class="product-placeholder"><i class="fas fa-camera"></i><span>${escapeHtml(p.category?.toUpperCase() || 'PRODUCT')}</span></div>`
      }
      <div class="product-body">
        <div class="product-category">${escapeHtml(p.category || 'Security Equipment')}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-desc">${escapeHtml(p.description)}</div>
        <div class="product-footer">
          <span class="product-price">$${parseFloat(p.price).toFixed(2)}</span>
          <button class="btn-primary small" onclick="openBookingModal()">
            <i class="fas fa-calendar-check"></i> Book Install
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── BOOKING ──────────────────────────────────────────
function openBookingModal() {
  const session = getSession();
  if (session && !session.isAdmin) {
    document.getElementById('bookName').value  = `${session.firstName} ${session.lastName}`.trim();
    document.getElementById('bookEmail').value = session.email;
    document.getElementById('bookPhone').value = session.phone || '';
  }
  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('bookDate').min = tomorrow.toISOString().split('T')[0];

  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBookingModal() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target.id === 'bookingModal') closeBookingModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBookingModal(); });

function submitBooking(e) {
  e.preventDefault();
  const errEl = document.getElementById('bookError');
  errEl.classList.add('hidden');

  const session = getSession();
  const booking = {
    id:       'b' + Date.now(),
    userId:   session?.id || 'guest',
    name:     document.getElementById('bookName').value.trim(),
    email:    document.getElementById('bookEmail').value.trim(),
    phone:    document.getElementById('bookPhone').value.trim(),
    date:     document.getElementById('bookDate').value,
    service:  document.getElementById('bookService').value,
    property: document.getElementById('bookProperty').value,
    address:  document.getElementById('bookAddress').value.trim(),
    notes:    document.getElementById('bookNotes').value.trim(),
    status:   'pending',
    createdAt: new Date().toISOString(),
  };

  if (!booking.service) { showError(errEl, 'Please select a service type.'); return; }

  const bookings = getBookings();
  bookings.unshift(booking);
  saveBookings(bookings);

  closeBookingModal();
  e.target.reset();
  showToast('Booking submitted! We\'ll contact you within 24 hours.', 'success');

  if (document.getElementById('page-dashboard').classList.contains('active')) {
    initDashboard();
  }
}

// ── CONTACT ──────────────────────────────────────────
function submitContact(e) {
  e.preventDefault();
  const msg = {
    id:       'm' + Date.now(),
    name:     document.getElementById('cName').value.trim(),
    email:    document.getElementById('cEmail').value.trim(),
    subject:  document.getElementById('cSubject').value.trim(),
    message:  document.getElementById('cMessage').value.trim(),
    createdAt: new Date().toISOString(),
  };
  const messages = getMessages();
  messages.unshift(msg);
  saveMessages(messages);
  e.target.reset();
  showToast('Message sent! We\'ll get back to you soon.', 'success');
}

// ── CUSTOMER DASHBOARD ────────────────────────────────
function initDashboard() {
  const session = getSession();
  if (!session) return;

  document.getElementById('dashGreeting').textContent = `Welcome back, ${session.firstName}!`;
  document.getElementById('profileFirst').value = session.firstName || '';
  document.getElementById('profileLast').value  = session.lastName  || '';
  document.getElementById('profileEmail').value = session.email     || '';
  document.getElementById('profilePhone').value = session.phone     || '';

  const allBookings = getBookings().filter(b => b.userId === session.id);
  const pending     = allBookings.filter(b => b.status === 'pending').length;
  const done        = allBookings.filter(b => b.status === 'completed').length;
  const msgs        = getMessages().filter(m => m.email === session.email).length;

  document.getElementById('dashBookingCount').textContent = allBookings.length;
  document.getElementById('dashPendingCount').textContent = pending;
  document.getElementById('dashDoneCount').textContent    = done;
  document.getElementById('dashMsgCount').textContent     = msgs;

  const recent = document.getElementById('dashRecentBookings');
  if (recent) recent.innerHTML = renderBookingRows(allBookings.slice(0,5), false);

  const all = document.getElementById('dashAllBookings');
  if (all) all.innerHTML = allBookings.length ? renderBookingRows(allBookings, false) : '<p style="color:var(--gray2)">No bookings yet. <a href="#" onclick="openBookingModal()">Book now!</a></p>';

  const msgDiv = document.getElementById('dashMessages');
  if (msgDiv) {
    const myMsgs = getMessages().filter(m => m.email === session.email);
    msgDiv.innerHTML = myMsgs.length
      ? myMsgs.map(m => `<div class="msg-row"><strong>${escapeHtml(m.subject)}</strong><span>${fmtDate(m.createdAt)}</span><div class="msg-body">${escapeHtml(m.message)}</div></div>`).join('')
      : '<p style="color:var(--gray2)">No messages yet.</p>';
  }
}

function showDashTab(tab, el) {
  document.querySelectorAll('#page-dashboard .dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#page-dashboard .dash-link').forEach(a => a.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  el.classList.add('active');
  if (tab === 'bookings' || tab === 'messages') initDashboard();
}

// ── ADMIN DASHBOARD ───────────────────────────────────
function initAdminDashboard() {
  const users    = getUsers();
  const bookings = getBookings();
  const products = getProducts();
  const messages = getMessages();

  document.getElementById('adminUserCount').textContent = users.length;
  document.getElementById('adminBookCount').textContent = bookings.length;
  document.getElementById('adminProdCount').textContent = products.length;
  document.getElementById('adminMsgCount').textContent  = messages.length;

  const recent = document.getElementById('adminRecentBookings');
  if (recent) recent.innerHTML = renderBookingRows(bookings.slice(0,5), true);

  const allB = document.getElementById('adminAllBookings');
  if (allB) allB.innerHTML = bookings.length ? renderBookingRows(bookings, true) : '<p style="color:var(--gray2)">No bookings yet.</p>';

  renderAdminProducts();
  renderAdminUsers();
  renderAdminMessages();
}

function showAdminTab(tab, el) {
  document.querySelectorAll('#page-admin-dashboard .dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#page-admin-dashboard .dash-link').forEach(a => a.classList.remove('active'));
  document.getElementById('admin-tab-' + tab)?.classList.add('active');
  el.classList.add('active');
  initAdminDashboard();
}

// ── BOOKINGS RENDER ───────────────────────────────────
function renderBookingRows(bookings, isAdmin) {
  if (!bookings.length) return '<p style="color:var(--gray2)">No bookings found.</p>';
  return bookings.map(b => `
    <div class="booking-row">
      <div class="booking-info">
        <strong>${escapeHtml(b.service)}</strong>
        <span>${escapeHtml(b.name)} &nbsp;·&nbsp; ${escapeHtml(b.phone)} &nbsp;·&nbsp; 📅 ${b.date}</span>
        ${b.address ? `<span>📍 ${escapeHtml(b.address)}</span>` : ''}
        ${b.notes   ? `<span>📝 ${escapeHtml(b.notes)}</span>` : ''}
      </div>
      <div class="booking-meta">
        <span class="status-badge status-${b.status}">${b.status}</span>
        ${isAdmin ? `
          <select class="status-select" onchange="updateBookingStatus('${b.id}', this.value)">
            <option value="pending"   ${b.status==='pending'  ?'selected':''}>Pending</option>
            <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Confirmed</option>
            <option value="completed" ${b.status==='completed'?'selected':''}>Completed</option>
            <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Cancelled</option>
          </select>` : ''}
      </div>
    </div>
  `).join('');
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return;
  bookings[idx].status = status;
  saveBookings(bookings);
  showToast('Booking status updated.', 'success');
  // Re-render all booking views
  const allB = document.getElementById('adminAllBookings');
  if (allB) allB.innerHTML = renderBookingRows(bookings, true);
  const recent = document.getElementById('adminRecentBookings');
  if (recent) recent.innerHTML = renderBookingRows(bookings.slice(0,5), true);
}

// ── PRODUCT MANAGEMENT ───────────────────────────────
function previewImage(input) {
  const preview = document.getElementById('imgPreview');
  const zone    = document.getElementById('imgUploadZone');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      zone.querySelector('span').textContent = input.files[0].name;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function addProduct(e) {
  e.preventDefault();
  const name     = document.getElementById('prodName').value.trim();
  const price    = parseFloat(document.getElementById('prodPrice').value);
  const desc     = document.getElementById('prodDesc').value.trim();
  const category = document.getElementById('prodCategory').value;
  const imgEl    = document.getElementById('imgPreview');
  const image    = (!imgEl.classList.contains('hidden') && imgEl.src) ? imgEl.src : null;

  const product = {
    id: 'p' + Date.now(),
    name, price, description: desc, category,
    image,
    createdAt: new Date().toISOString(),
  };

  const products = getProducts();
  products.unshift(product);
  saveProducts(products);

  // Reset form
  e.target.reset();
  document.getElementById('imgPreview').classList.add('hidden');
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgUploadZone').querySelector('span').textContent = 'Click to upload image';

  showToast('Product added successfully!', 'success');
  renderAdminProducts();
  updateAdminCounts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  showToast('Product deleted.', 'success');
  renderAdminProducts();
  updateAdminCounts();
  // Refresh public products page if open
  if (document.getElementById('page-products').classList.contains('active')) renderProducts();
}

function renderAdminProducts() {
  const container = document.getElementById('adminProductList');
  if (!container) return;
  const products = getProducts();
  if (!products.length) { container.innerHTML = '<p style="color:var(--gray2)">No products yet.</p>'; return; }
  container.innerHTML = products.map(p => `
    <div class="admin-prod-row">
      ${p.image
        ? `<img class="admin-prod-thumb" src="${p.image}" alt="${escapeHtml(p.name)}"/>`
        : `<div class="admin-prod-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--cyan3);font-size:1.2rem"><i class="fas fa-camera"></i></div>`
      }
      <div class="admin-prod-info">
        <strong>${escapeHtml(p.name)}</strong>
        <span>$${parseFloat(p.price).toFixed(2)}</span>
        <small>${escapeHtml(p.category)}</small>
      </div>
      <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function renderAdminUsers() {
  const container = document.getElementById('adminUserList');
  if (!container) return;
  const users = getUsers();
  if (!users.length) { container.innerHTML = '<p style="color:var(--gray2)">No registered users yet.</p>'; return; }
  container.innerHTML = users.map(u => `
    <div class="user-row">
      <strong>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</strong>
      <span>${escapeHtml(u.email)} &nbsp;·&nbsp; ${escapeHtml(u.phone || 'No phone')} &nbsp;·&nbsp; Joined ${fmtDate(u.createdAt)}</span>
    </div>
  `).join('');
}

function renderAdminMessages() {
  const container = document.getElementById('adminMessageList');
  if (!container) return;
  const messages = getMessages();
  if (!messages.length) { container.innerHTML = '<p style="color:var(--gray2)">No messages yet.</p>'; return; }
  container.innerHTML = messages.map(m => `
    <div class="msg-row">
      <strong>${escapeHtml(m.subject)}</strong>
      <span>${escapeHtml(m.name)} &lt;${escapeHtml(m.email)}&gt; &nbsp;·&nbsp; ${fmtDate(m.createdAt)}</span>
      <div class="msg-body">${escapeHtml(m.message)}</div>
    </div>
  `).join('');
}

function updateAdminCounts() {
  const el = document.getElementById('adminProdCount');
  if (el) el.textContent = getProducts().length;
}

// ── FAQ ───────────────────────────────────────────────
function toggleFaq(btn) {
  const item  = btn.parentElement;
  const ans   = item.querySelector('.faq-a');
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

// ── UTILITIES ─────────────────────────────────────────
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

function togglePwd(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  } catch { return iso; }
}

// ── SCROLL CSS INJECTION ──────────────────────────────
(function injectScrollCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .scroll-hidden { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .scroll-hidden.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
})();

// ── NAVBAR SCROLL EFFECT ─────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 30px rgba(0,0,0,0.4)'
      : '';
  }
}, { passive: true });

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  updateNav();
  initScrollAnimations();
  showPage('home');
});
