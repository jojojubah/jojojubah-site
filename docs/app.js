/* ==========================================================
   app.js — shared site logic (clean, minimal, reversible)
   ========================================================== */

/* 1) Cookie consent + Google Analytics (loads GA only if accepted) */
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

    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${MEASUREMENT_ID}', { anonymize_ip: true, cookie_flags: 'secure;samesite=strict' });
    `;

    document.head.appendChild(s1);
    document.head.appendChild(s2);
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
      alert('We use Google Analytics to understand what helps most. Clear site data to change your choice later.');
    });
  }

  showConsentBanner();
  document.addEventListener('DOMContentLoaded', hookBannerButtons);
})();

/* 2) Mobile nav (supports both .nav-toggle and #mobileMenuBtn) */
(function mobileNav(){
  document.addEventListener('DOMContentLoaded', function(){
    const links = document.querySelector('.nav-links');

    const toggleNew = document.querySelector('.nav-toggle');
    if (toggleNew && links){
      toggleNew.addEventListener('click', function(){
        const open = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!open));
        links.classList.toggle('open'); // CSS shows .nav-links.open
      });
    }

    const toggleOld = document.getElementById('mobileMenuBtn');
    if (toggleOld && links){
      toggleOld.addEventListener('click', function(){
        this.classList.toggle('active');  // animate the bars
        links.classList.toggle('active'); // CSS shows .nav-links.active
      });
    }
  });
})();

/* 3) Theme toggle (uses <html>.classList 'dark' to match CSS) + page helpers */
(function themeAndHelpers(){
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('themeToggle');
    if (btn){
      const root = document.documentElement; // <html>
      const current = localStorage.getItem('theme') || 'light';
      if (current === 'dark') root.classList.add('dark');

      btn.addEventListener('click', function(){
        const isDark = root.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        window.showTip && window.showTip('themeToggle');
      });
    }
  });

  // Tiny toast helper
  function showToastEl(el){
    if (!el) return;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 6000);
  }

  // Page-specific hooks
  const learnAcc  = document.getElementById('learnAccordion');     // home
  const learnToastEl = document.getElementById('learnToast');       // home
  const econLeft  = document.getElementById('econGlossaryLeft');    // economics
  const econRight = document.getElementById('econGlossaryRight');   // economics
  const econToast = document.getElementById('econToast');           // economics
  const projects  = document.getElementById('projects');            // home

  document.addEventListener('DOMContentLoaded', function(){
    if (learnAcc && learnToastEl){
      learnAcc.addEventListener('toggle', function(e){
        if (e.target && e.target.open) showToastEl(learnToastEl);
      }, true);
    }

    if (econLeft && econRight && econToast){
      let opened = new Set();
      const handler = (e) => {
        if (e.target && e.target.tagName === 'DETAILS' && e.target.open){
          opened.add(e.target.id || e.target.textContent || Math.random().toString(36));
          if (opened.size >= 10) showToastEl(econToast);
        }
      };
      econLeft.addEventListener('toggle', handler, true);
      econRight.addEventListener('toggle', handler, true);
    }

    if (projects){
      const observer = new IntersectionObserver(entries => {
        for (const en of entries){
          if (en.isIntersecting){
            if (typeof window.showTip === 'function') window.showTip('secretLab');
          }
        }
      }, { threshold: 0.4 });
      observer.observe(projects);
    }
  });

  /* Assistant bubble open/close + drag */
  const root = document.getElementById('jojoAssistant');
  if (root) {
    const bubble   = document.getElementById('assistantBubble');
    const textEl   = document.getElementById('assistantText');
    const closeBtn = document.getElementById('assistantClose');

    let tips = {};
    fetch('data/tips.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.resolve({}))
      .then(json => { tips = json || {}; })
      .catch(() => { tips = {}; });

    window.showTip = function(key){
      if (!tips[key]) return;
      textEl.textContent = tips[key];
      bubble.classList.add('show');
      setTimeout(()=> bubble.classList.remove('show'), 9000);
    };

    function openBubble() {
      bubble.classList.add('show');
      const input = document.getElementById('clippyInput');
      if (input) setTimeout(() => input.focus(), 0);
    }
    function closeBubble() { bubble.classList.remove('show'); }

    const avatar = root.querySelector('.assistant-avatar');
    avatar?.addEventListener('click', () => {
      bubble.classList.contains('show') ? closeBubble() : openBubble();
    });
    closeBtn?.addEventListener('click', closeBubble);

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!bubble.classList.contains('show')) return;
      const within = e.target.closest('#assistantBubble') || e.target.closest('#jojoAssistant');
      if (!within) closeBubble();
    });

    // Drag to move
    (function enableDrag(){
      let isDown = false, startX=0, startY=0, startLeft=0, startTop=0;
      const container = root;
      container.addEventListener('mousedown', (e)=>{
        if (e.target.closest('#assistantBubble')) return;
        isDown = true;
        startX = e.clientX; startY = e.clientY;
        const rect = container.getBoundingClientRect();
        startLeft = rect.left; startTop = rect.top;
        container.style.position = 'fixed';
      });
      window.addEventListener('mousemove', (e)=>{
        if (!isDown) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        container.style.left = (startLeft + dx) + 'px';
        container.style.top  = (startTop  + dy) + 'px';
      });
      window.addEventListener('mouseup', ()=> isDown = false);
    })();
  }
})();

/* 4) Accordions (.acc-item) — click header toggles panel */
document.addEventListener('DOMContentLoaded', () => {
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
  document.querySelectorAll('.acc-item').forEach(wireAccordionItem);
});

/* 5) Reveal on scroll + active nav + progress (bug-fixed) */
(function revealAndNav(){
  document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar') || document.querySelector('nav');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
    const sections = document.querySelectorAll('section');

    function onScroll() {
      const y = window.scrollY || window.pageYOffset; // <-- single definition

      if (navbar) navbar.classList.toggle('scrolled', y > 20);

      if (scrollIndicator) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollIndicator.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }

      document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) el.classList.add('visible');
      });

      let current = '';
      const mid = y + window.innerHeight / 3;
      sections.forEach(sec => { if (sec.offsetTop <= mid) current = sec.id; });
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', href === '#' + current);
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

/* 6) Mini chat UI inside assistant bubble (calls window.askClippy) */
document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("assistantBubble");
  if (!bubble || typeof window.askClippy !== "function") return;

  bubble.insertAdjacentHTML(
    "beforeend",
    `
    <form id="clippyForm" class="clippy-form" autocomplete="off">
      <input id="clippyInput" class="clippy-input" placeholder="Ask Clippy…" />
      <button id="clippySend" class="clippy-send" type="submit" aria-label="Send">➤</button>
    </form>
    <div id="clippyLog" class="clippy-log" aria-live="polite"></div>
    `
  );

  const form = document.getElementById("clippyForm");
  const input = document.getElementById("clippyInput");
  const sendBtn = document.getElementById("clippySend");
  const log = document.getElementById("clippyLog");

  const history = [];
  const MAX_TURNS = 16;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    append("you", text);
    input.value = "";
    sendBtn.disabled = true;

    const thinkingId = append("clippy", "…thinking");
    let dots = 0;
    const tick = setInterval(() => {
      dots = (dots + 1) % 4;
      const el = log.querySelector(`[data-id="${thinkingId}"]`);
      if (el) el.textContent = "…thinking".padEnd(10 + dots, ".");
    }, 400);

    try {
      // IMPORTANT: send current user text separately; history = previous turns only
      const reply = await window.askClippy(text, history);
      const msg = (reply?.text || reply?.content || "Hmm, I didn’t catch that.").trim();

      // now store both turns
      history.push({ role: "user", content: text });
      history.push({ role: "model", content: msg });
      if (history.length > MAX_TURNS) history.splice(0, history.length - MAX_TURNS);

      replace(thinkingId, "clippy", msg);
    } catch (err) {
      replace(thinkingId, "clippy", "⚠️ Error talking to assistant. Try again.");
      console.error(err);
    } finally {
      clearInterval(tick);
      sendBtn.disabled = false;
      input.focus();
    }
  });

  function append(who, text) {
    const id = crypto.randomUUID();
    const div = document.createElement("div");
    div.dataset.id = id;
    div.className = `line ${who}`;
    div.textContent = text;
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
