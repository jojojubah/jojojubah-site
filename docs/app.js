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

    // sticky background
    if (navbar) navbar.classList.toggle('scrolled', y > 20);

    // scroll progress
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

    // active nav link (viewport middle so short sections still activate)
    let current = '';
    const mid = y + window.innerHeight / 3;
    sections.forEach(sec => {
      if (sec.offsetTop <= mid) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
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
      window.showTip && window.showTip('themeToggle');
    });

    const moveMatrixBtn = () => {
      const m = document.getElementById('matrixToggle');
      if (m && !group.contains(m)) group.appendChild(m);
    };
    moveMatrixBtn();
    setTimeout(moveMatrixBtn, 0);
  })();

  /* ===================== Accordions & Page-Specific Rewards =========== */

  // Helpers
  function setPanelHeight(panel, open){
    panel.style.maxHeight = open ? (panel.scrollHeight + 'px') : 0;
  }
  function wireAccordionItem(item, onToggle){
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
      if (typeof onToggle === 'function') onToggle(item, isOpen);
    });
  }
  function showToastEl(el){
    if (!el) return;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 6000);
  }

  // Collect sets for targeted behaviors
  const learnAcc = document.getElementById('learnAccordion');                 // home page only
  const learnToastEl = document.getElementById('learnToast');                 // home toast

  const econLeft  = document.getElementById('econGlossaryLeft');              // economics page
  const econRight = document.getElementById('econGlossaryRight');
  const econToastEl = document.getElementById('econToast');                   // economics toast

  const learnItemsSet = new Set(learnAcc ? learnAcc.querySelectorAll('.acc-item') : []);
  const econItemsSet  = new Set([
    ...(econLeft  ? econLeft.querySelectorAll('.acc-item')  : []),
    ...(econRight ? econRight.querySelectorAll('.acc-item') : [])
  ]);

  // Learn page bonus: ONLY on #learnAccordion
  let learnUnlocked = false;
  function addBonusAccordionToLearn(){
    if (!learnAcc || document.getElementById('acc-item-bonus')) return;
    learnAcc.insertAdjacentHTML('beforeend', `
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
    // Wire the newly added item
    const bonusItem = document.getElementById('acc-item-bonus');
    if (bonusItem) wireAccordionItem(bonusItem);
  }

  // Sets to track opening progress
  const LEARN_OPENED = new Set();
  const ECON_OPENED  = new Set();

  // Wire all accordion items once; attach per-page callbacks
  document.querySelectorAll('.acc-item').forEach((item) => {
    const inLearn = learnItemsSet.has(item);
    const inEcon  = econItemsSet.has(item);

    wireAccordionItem(item, (it, isOpen) => {
      if (!isOpen) return;

      if (inLearn) {
        LEARN_OPENED.add(it);
        if (!learnUnlocked && LEARN_OPENED.size >= learnItemsSet.size) {
          learnUnlocked = true;
          addBonusAccordionToLearn();
          showToastEl(learnToastEl);
        }
      }

      if (inEcon) {
        ECON_OPENED.add(it);
        if (ECON_OPENED.size >= econItemsSet.size) {
          showToastEl(econToastEl);  // 🎉 Congratulate on finishing glossary
        }
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
  const root = document.getElementById('jojoAssistant');
  if (root) {
    const bubble   = document.getElementById('assistantBubble');
    const textEl   = document.getElementById('assistantText');
    const closeBtn = document.getElementById('assistantClose');

    let tips = {};

    // Load JSON tips (non-blocking)
    fetch('data/tips.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.resolve({}))
      .then(json => { tips = json || {}; })
      .catch(() => { tips = {}; });

    // Expose safe helper
    window.showTip = function(key){
      if (!tips[key]) return;
      textEl.textContent = tips[key];
      bubble.classList.add('show');
      setTimeout(()=> bubble.classList.remove('show'), 9000);
    };

    // Close button
    closeBtn?.addEventListener('click', ()=> bubble.classList.remove('show'));

    // Trigger: user scrolls into Projects section (guarded)
    const projects = document.getElementById('projects');
    if (projects){
      const observer = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if (entry.isIntersecting){
            window.showTip && window.showTip('projectsSection');
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      observer.observe(projects);
    }
  }
});

/* === Clippy Chat UI — START (minimal, reversible) === */
/* Adds a small input + send button into your existing assistant bubble and
   streams replies into a scrollable log. */
document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("assistantBubble");
  if (!bubble || typeof window.askClippy !== "function") return;

  // Inject UI (easy to remove later)
  bubble.insertAdjacentHTML(
    "beforeend",
    `
    <form id="clippyForm" class="clippy-form" autocomplete="off" aria-label="Clippy chat">
      <input id="clippyInput" class="clippy-input" placeholder="Ask Clippy…" />
      <button id="clippySend" class="clippy-send" type="submit">Send</button>
    </form>
    <div id="clippyLog" class="clippy-log" aria-live="polite"></div>
    `
  );

  const form = document.getElementById("clippyForm");
  const input = document.getElementById("clippyInput");
  const sendBtn = document.getElementById("clippySend");
  const log = document.getElementById("clippyLog");
  const history = [];
  const MAX_TURNS = 16; // keep prompt short for cheaper/cleaner calls

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    append("you", text);
    input.value = "";

    // disable send while waiting
    sendBtn.disabled = true;

    // thinking indicator with animated dots
    const thinkingId = append("clippy", "…thinking");
    let dots = 0;
    const tick = setInterval(() => {
      dots = (dots + 1) % 4;
      const el = log.querySelector(`[data-id="${thinkingId}"]`);
      if (el) el.textContent = "…thinking" + ".".repeat(dots);
    }, 300);

    try {
      const r = await window.askClippy(text, history);
      const reply = (r && r.text) ? r.text : "(no response)";
      clearInterval(tick);
      replace(thinkingId, "clippy", reply);

      // keep short history for context
      history.push({ role: "user", content: text });
      history.push({ role: "model", content: reply });
      if (history.length > MAX_TURNS) history.splice(0, history.length - MAX_TURNS);
    } catch (err) {
      console.error(err);
      clearInterval(tick);

      let msg = "⚠️ Error talking to the server.";
      try {
        if (err && err.response && typeof err.response.json === "function") {
          const p = await err.response.json();
          if (p?.error) msg = `⚠️ ${p.error}`;
        }
      } catch {}

      replace(thinkingId, "clippy", msg);
      toast(msg); // show user-friendly popup
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });

  // Simple toast (inline styles; no CSS changes needed)
  function toast(message) {
    let t = document.getElementById("clippyToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "clippyToast";
      t.style.cssText = "position:fixed;right:16px;bottom:16px;background:#111;color:#fff;padding:10px 14px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.2);z-index:99999;font-size:14px;max-width:80vw;opacity:0;transform:translateY(10px);transition:all .25s ease";
      document.body.appendChild(t);
    }
    t.textContent = message;
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(10px)";
    }, 3500);
  }

  function append(who, text) {
    const id = crypto.randomUUID();
    const div = document.createElement("div");
    div.dataset.id = id;
    div.className = `line ${who}`;
    div.textContent = text;              // textContent avoids HTML injection
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return id;
  }
  function replace(id, who, text) {
    const el = log.querySelector(`[data-id="${id}"]`);
    if (!el) return append(who, text);
    el.className = `line ${who}`;
    el.textContent = text;
    log.scrollTop = log.scrollHeight;
  }
});
/* === Clippy Chat UI — END === */
