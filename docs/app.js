/* app.js — shared site logic */

/* ================= Cookie Consent + Google Analytics ================== */
(function cookieConsent(){
  const MEASUREMENT_ID = 'G-0ZM44HTK32';

  function ensureBanner() {
    if (document.getElementById('cookieConsentBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.style.display = 'none';
    banner.innerHTML = `
      <p>🍪 This site uses cookies for analytics to improve your experience.
        <a href="#" id="learnMoreBtn">Learn more</a>
      </p>
      <div class="cookie-buttons">
        <button id="acceptCookies" class="cookie-btn accept">Accept All Cookies</button>
        <button id="declineCookies" class="cookie-btn decline">Decline</button>
      </div>`;
    document.body.appendChild(banner);
  }

  function enableGoogleAnalytics() {
    if (window.GA_LOADED) return;
    window.GA_LOADED = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true, cookie_flags: 'secure;samesite=strict' });
  }

  function showConsentBanner() {
    ensureBanner();
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsentBanner');
    if (!consent) banner.style.display = 'block';
    else if (consent === 'accepted') enableGoogleAnalytics();
  }

  function hookBannerButtons() {
    const accept = document.getElementById('acceptCookies');
    const decline = document.getElementById('declineCookies');
    const learnMore = document.getElementById('learnMoreBtn');
    const banner = document.getElementById('cookieConsentBanner');

    accept && (accept.onclick = function(){
      localStorage.setItem('cookieConsent','accepted');
      banner && (banner.style.display = 'none');
      enableGoogleAnalytics();
    });

    decline && (decline.onclick = function(){
      localStorage.setItem('cookieConsent','declined');
      banner && (banner.style.display = 'none');
      console.log('❌ Analytics declined by user');
    });

    learnMore && (learnMore.onclick = function(e){
      e.preventDefault();
      const modal = document.createElement('div');
      modal.id = 'modalOverlay';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="learn-more-modal">
          <button class="close-btn" id="closeModal">&times;</button>
          <h3>🍪 Why Accept Cookies?</h3>
          <p style="color: var(--text-dim); line-height: 1.6; margin-bottom: 1.5rem;">
            We use Google Analytics to understand which content you love most, so we can create better tutorials and projects for you! 🎯<br><br>
            ✅ Helps improve your experience<br>
            ✅ Shows which tutorials are most helpful<br>
            ✅ Anonymous — no personal data<br>
            ✅ You can change your mind anytime
          </p>
        </div>`;
      document.body.appendChild(modal);
      const close = () => modal && modal.remove();
      document.getElementById('closeModal')?.addEventListener('click', close);
      modal.addEventListener('click', (ev)=>{ if (ev.target === modal) close(); });
    });
  }

  showConsentBanner();                               // safe before DOM ready
  document.addEventListener('DOMContentLoaded', hookBannerButtons);
})();

/* ========================= Main Site Interactions ===================== */
document.addEventListener('DOMContentLoaded', () => {
  // Sticky navbar, scroll progress, fade-ins, active link
  const navbar = document.getElementById('navbar');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    navbar && navbar.classList.toggle('scrolled', y > 20);

    if (scrollIndicator) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      scrollIndicator.style.width = pct + '%';
    }

    // reveal on scroll
    document.querySelectorAll('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) el.classList.add('visible');
    });

    // active nav link
    let current = '';
    sections.forEach(sec => { if (y >= sec.offsetTop - 120) current = sec.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once so sections are visible even before scrolling

  // Mobile menu (hamburger)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinksContainer = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', function(){
      this.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });
  }

  // Light cursor trails only on main page (skip if matrix exists)
  if (!document.getElementById('matrix-canvas')) {
    let trail = [], trailLength = 20;
    document.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY });
      if (trail.length > trailLength) trail.shift();
      document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
      const color = '59,130,246';
      trail.forEach((p, i) => {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `position:fixed;left:${p.x}px;top:${p.y}px;width:${4 - i*0.2}px;height:${4 - i*0.2}px;background:rgba(${color},${Math.max(0,0.5 - i*0.025)});border-radius:50%;pointer-events:none;z-index:9999;`;
        document.body.appendChild(dot);
        setTimeout(()=>dot.remove(), 40);
      });
    }, { passive: true });
  }

  /* ======================= Dark/Light Mode Toggle ===================== */
  (function initThemeToggle(){
    const body = document.body;

    // Ensure a single shared group for top-right toggles
    let group = document.querySelector('.toggle-group');
    if (!group) {
      group = document.createElement('div');
      group.className = 'toggle-group';
      document.body.appendChild(group);
    }

    // Create theme button (always present on both pages)
    let themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) {
      themeBtn = document.createElement('button');
      themeBtn.id = 'themeToggle';
      group.appendChild(themeBtn);
    }

    function setIcon(mode){ themeBtn.textContent = (mode === 'dark') ? '🌙' : '☀️'; }
    function apply(mode){
      if (mode === 'dark') body.setAttribute('data-theme','dark');
      else body.removeAttribute('data-theme');
      setIcon(mode);
    }

    // Page defaults: main = light, labs = dark (always open like this)
    const isLabs = !!document.getElementById('matrix-canvas') || /jubah-labs\.html$/i.test(location.pathname);
    const initial = isLabs ? 'dark' : 'light';
    apply(initial);

    themeBtn.addEventListener('click', () => {
      const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    });

    // If Matrix button gets injected later by labs.js, move it next to theme button
    const moveMatrixBtn = () => {
      const m = document.getElementById('matrixToggle');
      if (m && !group.contains(m)) group.appendChild(m);
    };
    moveMatrixBtn();
    setTimeout(moveMatrixBtn, 0);
  })();

  /* ===================== Accordion + Easter Egg Toast ================= */
// containers
const accContainer = document.getElementById('learnAccordion');
const accButtons   = document.querySelectorAll('.acc-header');
const toastEl      = document.getElementById('learnToast');

// track which originals were opened
const OPENED = new Set();
// count only original items (not the bonus)
const initialCount = accContainer ? accContainer.querySelectorAll('.acc-item').length : accButtons.length;
let toastShown = false;

// helper for smooth open/close height
function setPanelHeight(panel, open){
  panel.style.maxHeight = open ? (panel.scrollHeight + 'px') : 0;
}

// create the bonus item (idempotent)
function addBonusAccordion(){
  if (!accContainer || document.getElementById('acc-item-bonus')) return;

  accContainer.insertAdjacentHTML('beforeend', `
    <div class="acc-item" id="acc-item-bonus">
      <button class="acc-header" aria-expanded="false" aria-controls="acc-panel-bonus" id="acc-button-bonus">
        <span>Hmm… What's this?</span>
        <svg class="acc-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 15.5l-7-7 1.4-1.4L12 12.7l5.6-5.6L19 8.5z"/>
        </svg>
      </button>
      <div class="acc-content" id="acc-panel-bonus" role="region" aria-labelledby="acc-button-bonus">
        <div class="acc-inner">
          <h3>Bonus Unlock!!</h3>
          <p>Nice one! You explored every topic. Here’s a Link to JubahLabs.</p>
          <h4>Ideas to try next</h4>
          <p>• Turn a prompt into a JSON file and attach it in your chat.<br>
             • Try creating your own agent with N8N.<br>
             • Test an opensource model locally and note trade-offs.</p>
          <p class="muted">Psst — you can see this panel because you opened all topics 😉</p>
          <div style="margin-top:1rem">
            <a class="btn" href="jubah-labs.html">Open JubahLabs</a>
          </div>
        </div>
      </div>
    </div>
  `);

  // wire up the new item
  const btn   = document.getElementById('acc-button-bonus');
  const item  = btn?.closest('.acc-item');
  const panel = item?.querySelector('.acc-content');
  if (btn && item && panel){
    item.classList.remove('open'); setPanelHeight(panel, false);
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', ()=>{
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      setPanelHeight(panel, isOpen);
    });
  }
}

// toast + unlock helper
function showToastAndBonus(){
  if (toastShown) return;
  if (toastEl){
    toastEl.classList.add('show');
    setTimeout(()=>toastEl.classList.remove('show'), 6000);
  }
  addBonusAccordion();
  localStorage.setItem('learnBonusUnlocked','1'); // persist across reloads
  toastShown = true;
}

// recreate bonus if user unlocked previously
if (localStorage.getItem('learnBonusUnlocked') === '1') {
  addBonusAccordion();
}

// wire up original accordion items
accButtons.forEach(btn=>{
  const item  = btn.closest('.acc-item');
  const panel = item.querySelector('.acc-content');
  item.classList.remove('open'); setPanelHeight(panel, false);
  btn.setAttribute('aria-expanded','false');

  btn.addEventListener('click', ()=>{
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    setPanelHeight(panel, isOpen);
    if (isOpen){
      OPENED.add(btn.id || btn.textContent.trim());
      if (!toastShown && OPENED.size >= initialCount) showToastAndBonus();
    }
  });
});


  // Footer year
  const y = document.getElementById('secretYear');
  if (y) y.textContent = new Date().getFullYear();
});
