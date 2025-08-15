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
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  }

  function showBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (!banner) return;

    const css = document.createElement('style');
    css.textContent = `
      #cookieConsentBanner {
        position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
        max-width: 640px; width: calc(100% - 24px);
        background: rgba(20,20,20,0.95); color: #fff; border-radius: 12px;
        padding: 14px 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index: 10000;
      }
      #cookieConsentBanner p { margin: 0 0 10px; font-size: 14px; }
      #cookieConsentBanner a { color: #9bdcff; text-decoration: underline; }
      #cookieConsentBanner .cookie-buttons { display: flex; gap: 8px; justify-content: flex-end; }
      #cookieConsentBanner .cookie-btn {
        cursor: pointer; padding: 8px 12px; border: 0; border-radius: 8px; font-weight: 600;
      }
      #cookieConsentBanner .cookie-btn.accept { background: #23b14d; color: #fff; }
      #cookieConsentBanner .cookie-btn.decline { background: #333; color: #fff; }
    `;
    document.head.appendChild(css);

    banner.style.display = 'block';
  }

  function hookBannerButtons() {
    ensureBanner();

    const accepted = localStorage.getItem('cookieConsent') === 'accepted';
    const declined = localStorage.getItem('cookieConsent') === 'declined';

    if (accepted) {
      enableGoogleAnalytics();
      return; // no banner
    }
    if (!declined) showBanner(); // only show if not declined

    const banner = document.getElementById('cookieConsentBanner');
    if (!banner) return;

    banner.addEventListener('click', (e) => {
      const accept = e.target && e.target.id === 'acceptCookies';
      const decline = e.target && e.target.id === 'declineCookies';
      if (accept) {
        localStorage.setItem('cookieConsent', 'accepted');
        enableGoogleAnalytics();
        banner.remove();
      } else if (decline) {
        localStorage.setItem('cookieConsent', 'declined');
        banner.remove();
      } else if (e.target && e.target.id === 'learnMoreBtn') {
        e.preventDefault();
        alert('We use Google Analytics (with IP anonymization) to understand traffic and improve the site. You can accept or decline.');
      }
    });
  }

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
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const pct = height > 0 ? (y / height) * 100 : 0;
      scrollIndicator.style.width = pct + '%';
    }

    // fade-ins
    document.querySelectorAll('.fade-in').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 60) el.classList.add('visible');
    });

    // active nav link
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (y >= top) current = sec.id;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  onScroll();
  window.addEventListener('scroll', onScroll);

  // Theme toggle (light/dark)
  (function setupTheme(){
    const body    = document.body;
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;

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
    const group = document.getElementById('actionButtons') || themeBtn.parentElement;
    const moveMatrixBtn = () => {
      const m = document.getElementById('matrixToggle');
      if (m && !group.contains(m)) group.appendChild(m);
    };
    moveMatrixBtn();
    setTimeout(moveMatrixBtn, 0);
  })();

  /* ===================== Accordion + Easter Egg Toast ================= */
  // container + elements
  const accContainer =
    document.getElementById('learnAccordion') ||
    document.querySelector('.accordion');
  const accButtons = document.querySelectorAll('.acc-header');
  const toastEl    = document.getElementById('learnToast');

  // count ONLY originals present at load (not the future bonus item)
  const initialCount = accContainer
    ? accContainer.querySelectorAll('.acc-item').length
    : accButtons.length;

  const OPENED = new Set();
  let unlocked  = false;

  function setPanelHeight(panel, open){
    if (!panel) return;
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0px';
    }
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

    const bonusItem = document.getElementById('acc-item-bonus'); // fixed split typo
    if (bonusItem) wireAccordionItem(bonusItem);
  }

  function showToast(){
    if (!toastEl) return;
    toastEl.classList.add('show');
    setTimeout(()=>toastEl.classList.remove('show'), 6000);
  }

  // === BONUS UNLOCK (no persistence on refresh) ===
  function unlockBonus(){
    if (unlocked) return;
    unlocked = true;
    addBonusAccordion();
    showToast();
    // no persistence — do not store unlock state
  }

  // wire ORIGINAL items + completion tracking
  // (use the count captured at load so the bonus doesn’t affect it)
  document.querySelectorAll('.acc-item').forEach((item, i) => {
    wireAccordionItem(item);
    const btn = item.querySelector('.acc-header');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (item.classList.contains('open')) {
        OPENED.add(i);                     // track this original by index
        if (!unlocked && OPENED.size >= initialCount) unlockBonus();
      }
    });
  });

  // Footer year
  const y = document.getElementById('secretYear');
  if (y) y.textContent = new Date().getFullYear();
});
