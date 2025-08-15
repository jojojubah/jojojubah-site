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
  onScroll();

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
    let group = document.querySelector('.toggle-group');
    if (!group) {
      group = document.createElement('div');
      group.className = 'toggle-group';
      document.body.appendChild(group);
    }

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

    const isLabs = !!document.getElementById('matrix-canvas') || /jubah-labs\.html$/i.test(location.pathname);
    const initial = isLabs ? 'dark' : 'light';
    apply(initial);

    themeBtn.addEventListener('click', () => {
      const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);

      // 🧩 Assistant trigger for theme change
      showTip && showTip('themeToggle');
    });

    const moveMatrixBtn = () => {
      const m = document.getElementById('matrixToggle');
      if (m && !group.contains(m)) group.appendChild(m);
    };
    moveMatrixBtn();
    setTimeout(moveMatrixBtn, 0);
  })();

  /* ===================== Accordion + Easter Egg Toast ================= */
  const accContainer = document.getElementById('learnAccordion') || document.querySelector('.accordion');
  const accButtons   = document.querySelectorAll('.acc-header');
  const toastEl      = document.getElementById('learnToast');

  const initialCount = accContainer ? accContainer.querySelectorAll('.acc-item').length : accButtons.length;
  const OPENED = new Set();
  let unlocked = false;

  function setPanelHeight(panel, open){
    panel.style.maxHeight = open ? (panel.scrollHeight + 'px') : 0;
  }

  function wireAccordionItem(item){
    const btn   = item.querySelector('.acc-header');
    const panel = item.querySelector('.acc-content');
    if (!btn || !panel) return;
    item.classList.remove('open');
    setPanelHeight(panel, false);
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      setPanelHeight(panel, isOpen);
    });
  }

  function addBonusAccordion(){
    if (!accContainer || document.getElementById('acc-item-bonus')) return;
    accContainer.insertAdjacentHTML('beforeend', `
      <div class="acc-item" id="acc-item-bonus">
        <button class="acc-header" aria-expanded="false" aria-controls="acc-panel-bonus" id="acc-button-bonus">
          <span>Hmm... What's this?</span>
          <svg class="acc-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 15.5l-7-7 1.4-1.4L12 12.7l5.6-5.6L19 8.5z"/>
          </svg>
        </button>
        <div class="acc-content" id="acc-panel-bonus" role="region" aria-labelledby="acc-button-bonus">
          <div class="acc-inner">
            <h3>Bonus Unlock!!</h3>
            <p>Nice one! You explored every topic. Here’s a link to JubahLabs.</p>
            <h4>Ideas to try next</h4>
            <p>• Turn a prompt into JSON and attach it in chat.<br>
               • Build a tiny agent in n8n.<br>
               • Test an open-source model locally and compare.</p>
            <div style="margin-top:1rem">
              <a class="btn" href="jubah-labs.html">Open JubahLabs</a>
            </div>
          </div>
        </div>
      </div>
    `);
    const bonusItem = document.getElementById('acc-item-bonus');
    if (bonusItem) wireAccordionItem(bonusItem);
  }

  function showToast(){
    if (!toastEl) return;
    toastEl.classList.add('show');
    setTimeout(()=>toastEl.classList.remove('show'), 6000);
  }

  // ✅ BONUS UNLOCK (no persistence)
  function unlockBonus(){
    if (unlocked) return;
    unlocked = true;
    addBonusAccordion();
    showToast();
  }

  // wire originals
  document.querySelectorAll('.acc-item').forEach((item, i) => {
    wireAccordionItem(item);
    const btn = item.querySelector('.acc-header');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (item.classList.contains('open')) {
        OPENED.add(i);
        if (!unlocked && OPENED.size >= initialCount) unlockBonus();
      }
    });
  });

  // Footer year
  const y = document.getElementById('secretYear');
  if (y) y.textContent = new Date().getFullYear();

  // Contact: reveal email
  document.addEventListener('click', function(e){
    const btn = e.target.closest('#revealEmail');
    if (!btn) return;
    const hiddenWrap   = document.getElementById('emailHidden');
    const visibleEmail = document.getElementById('emailVisible');
    if (hiddenWrap && visibleEmail) {
      hiddenWrap.remove();
      visibleEmail.hidden = false;
    }
  });

  /* ========================== Assistant (Jojo) ======================== */
  const root   = document.getElementById('jojoAssistant');
  if (root) {
    const bubble = document.getElementById('assistantBubble');
    const textEl = document.getElementById('assistantText');
    const closeBtn = document.getElementById('assistantClose');

    let tips = {};

    // Load JSON tips
    fetch('data/tips.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then(json => { tips = json || {}; });

    // Show specific tip by key
    window.showTip = function(key){
      if (!tips[key]) return;
      textEl.textContent = tips[key];
      bubble.classList.add('show');
      setTimeout(()=> bubble.classList.remove('show'), 9000); // auto-hide after 6s
    };

    // Close button
    closeBtn.addEventListener('click', ()=> bubble.classList.remove('show'));

    // Trigger 2: user scrolls into Projects section
    const projects = document.getElementById('projects');
    if (projects){
      const observer = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            showTip('projectsSection');
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      observer.observe(projects);
    }
  }
});
