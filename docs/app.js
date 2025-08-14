/* app.js — shared site logic (no Matrix) */

// --- Cookie Consent + Google Analytics (runs on every page) ---
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
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(ga);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'secure;samesite=strict'
    });
  }

  function showConsentBanner() {
    ensureBanner();
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsentBanner');
    if (!consent) { banner.style.display = 'block'; }
    else if (consent === 'accepted') enableGoogleAnalytics();
  }

  function hookBannerButtons() {
    const accept = document.getElementById('acceptCookies');
    const decline = document.getElementById('declineCookies');
    const learnMore = document.getElementById('learnMoreBtn');
    const banner = document.getElementById('cookieConsentBanner');

    accept && (accept.onclick = function(){
      localStorage.setItem('cookieConsent','accepted');
      if (banner) banner.style.display = 'none';
      enableGoogleAnalytics();
    });

    decline && (decline.onclick = function(){
      localStorage.setItem('cookieConsent','declined');
      if (banner) banner.style.display = 'none';
      console.log('❌ Analytics declined by user');
    });

    // Simple Learn More modal (only if the link exists on this page)
    learnMore && (learnMore.onclick = function(e){
      e.preventDefault();
      const modal = document.createElement('div');
      modal.id = 'modalOverlay';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="learn-more-modal">
          <button class="close-btn" id="closeModal">&times;</button>
          <h3>🍪 Why Accept Cookies?</h3>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
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

  // init immediately (safe even before DOMContentLoaded)
  showConsentBanner();
  // defer wiring until DOM is ready, so banner nodes are present
  document.addEventListener('DOMContentLoaded', hookBannerButtons);
})();


// --- Main site interactions (guarded so they don’t error on Labs page) ---
document.addEventListener('DOMContentLoaded', () => {
  // Sticky navbar + active section highlight
  const navbar = document.getElementById('navbar');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('scrolled', y > 20);

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

    // active link
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (y >= top) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinksContainer = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', function () {
      this.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });
  }

  // Particles + cursor trails (skip here if Matrix canvas exists to avoid double effects on Labs)
  const hasMatrix = !!document.getElementById('matrix-canvas');
  if (!hasMatrix) {
    // cursor trail (desktop)
    let trail = [], trailLength = 20;
    document.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY });
      if (trail.length > trailLength) trail.shift();
      document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
      const color = '59,130,246'; // blue for main site
      trail.forEach((p, i) => {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `position:fixed;left:${p.x}px;top:${p.y}px;width:${4 - i * 0.2}px;height:${4 - i * 0.2}px;background:rgba(${color},${0.5 - i * 0.025});border-radius:50%;pointer-events:none;z-index:9999;transition:all .1s ease-out;`;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 100);
      });
    });

    // touch effects
    function isMobile(){
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
             || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    function createTouchTrail(x,y){
      const el = document.createElement('div');
      el.className = 'touch-trail';
      el.style.cssText = `position:fixed;left:${x-6}px;top:${y-6}px;width:12px;height:12px;background:rgba(59,130,246,.6);border-radius:50%;pointer-events:none;z-index:9998;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 250);
    }
    function createParticleBurst(x,y){
      const colors = ['#3b82f6','#06b6d4','#8b5cf6','#10b981'];
      const count = 6;
      for (let i=0;i<count;i++){
        const ang = (360/count)*i, vel = 30+Math.random()*20, color = colors[Math.floor(Math.random()*colors.length)];
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;left:${x-3}px;top:${y-3}px;width:6px;height:6px;background:${color};border-radius:50%;pointer-events:none;z-index:9997;animation:particleBurst${i} .8s ease-out forwards;`;
        if(!document.getElementById('pbkf-'+i)){
          const s = document.createElement('style');
          s.id='pbkf-'+i;
          s.textContent = `@keyframes particleBurst${i}{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(${Math.cos(ang*Math.PI/180)*vel}px,${Math.sin(ang*Math.PI/180)*vel}px) scale(0);opacity:0;}}`;
          document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
      }
    }
    if (isMobile()){
      document.addEventListener('touchstart', e => { const t=e.touches[0]; createParticleBurst(t.clientX,t.clientY); }, {passive:true});
      document.addEventListener('touchmove',  e => { const t=e.touches[0]; createTouchTrail(t.clientX,t.clientY); }, {passive:true});
      const css = document.createElement('style');
      css.textContent = '@media (max-width:768px){.cursor-trail{display:none!important;}}';
      document.head.appendChild(css);
    }
  }

  // Accordion + toast
  const accButtons = document.querySelectorAll('.acc-header');
  const toastEl = document.getElementById('learnToast');
  const totalAcc = accButtons.length;
  const openedOnce = new Set();
  let toastShown = false;

  function setPanelHeight(panel, open) { panel.style.maxHeight = open ? (panel.scrollHeight+'px') : 0; }

  function showToast() {
    if (!toastEl || toastShown) return;
    toastEl.classList.add('show');
    addBonusAccordion(); // add extra item once unlocked
    toastShown = true;
    setTimeout(() => toastEl.classList.remove('show'), 6000);
  }

  function addBonusAccordion(){
    if (document.getElementById('acc-item-bonus')) return;
    const container = document.getElementById('learnAccordion');
    if (!container) return;

    container.insertAdjacentHTML('beforeend', `
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

    // wire up this new item (collapsed by default)
    const btn = document.getElementById('acc-button-bonus');
    const item = btn?.closest('.acc-item');
    const panel = item?.querySelector('.acc-content');
    if (item && panel && btn) {
      item.classList.remove('open');
      setPanelHeight(panel, false);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        setPanelHeight(panel, isOpen);
      });
    }
  }

  accButtons.forEach(btn => {
    const item = btn.closest('.acc-item');
    const panel = item.querySelector('.acc-content');
    item.classList.remove('open');
    setPanelHeight(panel, false);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      setPanelHeight(panel, isOpen);
      if (isOpen) {
        openedOnce.add(btn.id || btn.textContent.trim());
        if (!toastShown && openedOnce.size === totalAcc) showToast();
      }
    });
  });

  // Footer year (works on both pages)
  const y = document.getElementById('secretYear');
  if (y) y.textContent = new Date().getFullYear();
/* ==== Dark Mode Toggle ============================================= */
(function(){
  const body = document.body;
  const KEY = 'site-theme';
  const saved = localStorage.getItem(KEY);
  const initial = (saved === 'dark' || (saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches))
    ? 'dark' : 'light';

  function applyTheme(mode){
    if (mode === 'dark') {
      body.setAttribute('data-theme','dark');
    } else {
      body.removeAttribute('data-theme');
    }
    localStorage.setItem(KEY, mode);
    btn.textContent = (mode === 'dark') ? 'Light Mode' : 'Dark Mode';
  }

  // ensure button exists (added here so no HTML edits needed)
  let btn = document.getElementById('themeToggle');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'themeToggle';
    document.body.appendChild(btn);
  }

  // init + click
  applyTheme(initial);
  btn.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
})();

});
