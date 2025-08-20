/* app.js — shared site logic
   Comments are "explain like I'm 12" style so it's easy to tweak. */

/* ==========================================================
   COOKIE CONSENT + GOOGLE ANALYTICS
   Think: "ask user once, only load GA if they say yes"
   ========================================================== */
(function cookieConsent(){
  const MEASUREMENT_ID = 'G-0ZM44HTK32';

  // Make the banner if it's not already on the page
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

  // Load GA only if allowed
  function enableGoogleAnalytics() {
    if (window.GA_LOADED) return;
    window.GA_LOADED = true;

    // Load the GA script
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

    // Configure GA (basic, privacy-friendly)
    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', '${MEASUREMENT_ID}');
    `;

    document.head.appendChild(s1);
    document.head.appendChild(s2);
  }

  // Show banner if we don't have a decision saved
  function restoreConsentState() {
    ensureBanner();
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsentBanner');
    if (!consent) banner.style.display = 'block';
    else if (consent === 'accepted') enableGoogleAnalytics();
  }

  // Wire the buttons on the banner
  function hookBannerButtons() {
    const accept = document.getElementById('acceptCookies');
    const decline = document.getElementById('declineCookies');
    const learnMore = document.getElementById('learnMoreBtn');
    const banner = document.getElementById('cookieConsentBanner');

    accept && (accept.onclick = function(){
      localStorage.setItem('cookieConsent', 'accepted');
      enableGoogleAnalytics();
      banner.style.display = 'none';
    });
    decline && (decline.onclick = function(){
      localStorage.setItem('cookieConsent', 'declined');
      banner.style.display = 'none';
    });
    learnMore && (learnMore.onclick = function(e){
      e.preventDefault();
      alert('We use Google Analytics to understand what content helps most. You can clear site data to change your choice later.');
    });
  }

  // Kick off
  document.addEventListener('DOMContentLoaded', function(){
    restoreConsentState();
    hookBannerButtons();
  });
})();

/* ==========================================================
   MOBILE NAV (hamburger)
   Think: "make the menu open/close on phones"
   Supports BOTH old (#mobileMenuBtn) and new (.nav-toggle)
   ========================================================== */
(function mobileNav(){
  document.addEventListener('DOMContentLoaded', function(){
    const links = document.querySelector('.nav-links');

    // Newer button pattern: .nav-toggle (has 3 bars inside)
    const toggleNew = document.querySelector('.nav-toggle');
    if (toggleNew && links){
      toggleNew.addEventListener('click', function(){
        const open = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!open));
        links.classList.toggle('open');    // CSS shows .nav-links.open
      });
    }

    // Older button pattern: #mobileMenuBtn (also has 3 bars)
    const toggleOld = document.getElementById('mobileMenuBtn');
    if (toggleOld && links){
      toggleOld.addEventListener('click', function(){
        this.classList.toggle('active');   // animate the bars
        links.classList.toggle('active');  // CSS shows .nav-links.active
      });
    }
  });
})();

/* ==========================================================
   THEME TOGGLE (light/dark)
   Think: "click sun/moon => switch theme, remember choice"
   ========================================================== */
(function themeToggle(){
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const root = document.documentElement;     // <html> element
    const current = localStorage.getItem('theme') || 'light';
    if (current === 'dark') root.classList.add('dark');

    btn.addEventListener('click', function(){
      const isDark = root.classList.toggle('dark');     // add/remove class
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  });

  /* ---------- Page-specific toasts & observers ---------- */
  function showToastEl(el){
    if (!el) return;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 6000);
  }

  const learnAcc  = document.getElementById('learnAccordion'); // on home page
  const learnToastEl = document.getElementById('learnToast');

  const econLeft  = document.getElementById('econGlossaryLeft');  // economics page
  const econRight = document.getElementById('econGlossaryRight');
  const econToast = document.getElementById('econToast');

  const projects  = document.getElementById('projects');          // home page

  document.addEventListener('DOMContentLoaded', function(){
    // When a <details> inside #learnAccordion is opened, pop a toast
    if (learnAcc && learnToastEl){
      learnAcc.addEventListener('toggle', function(e){
        if (e.target && e.target.open) showToastEl(learnToastEl);
      }, true);
    }

    // Economics: when 10 glossary items opened, celebrate
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

    // When projects section enters the screen, show the "secret lab" tip
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

  /* ======================================================
     FLOATING ASSISTANT ("Clippy")
     Think: "click the avatar to open a chat bubble"
     ====================================================== */
  const root = document.getElementById('jojoAssistant');
  if (root) {
    const bubble   = document.getElementById('assistantBubble');
    const textEl   = document.getElementById('assistantText');
    const closeBtn = document.getElementById('assistantClose');

    let tips = {};

    // Load tiny tips from JSON (non-blocking). If it fails, no worries.
    fetch('data/tips.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.resolve({}))
      .then(json => { tips = json || {}; })
      .catch(() => { tips = {}; });

    // Helper so other code can ask the assistant to speak
    window.showTip = function(key){
      if (!tips[key]) return;
      textEl.textContent = tips[key];
      bubble.classList.add('show');
      setTimeout(()=> bubble.classList.remove('show'), 9000);
    };

    // Close with the × button
    closeBtn?.addEventListener('click', ()=> bubble.classList.remove('show'));

    // Open/close when clicking the avatar (this is what you wanted)
    function openBubble() {
      bubble.classList.add('show');
      const input = document.getElementById('clippyInput');
      if (input) setTimeout(() => input.focus(), 0);   // focus the text box
    }
    function closeBubble() {
      bubble.classList.remove('show');
    }
    const avatar = root.querySelector('.assistant-avatar');
    avatar?.addEventListener('click', () => {
      if (bubble.classList.contains('show')) closeBubble();
      else openBubble();
    });

    // Click anywhere outside => close the bubble (feels natural)
    document.addEventListener('click', (e) => {
      if (!bubble.classList.contains('show')) return;
      const withinAssistant = e.target.closest('#assistantBubble') || e.target.closest('#jojoAssistant');
      if (!withinAssistant) closeBubble();
    });

    // Drag to move the assistant around (fun + useful on mobile/TV)
    (function enableDrag(){
      let isDown = false, startX=0, startY=0, startLeft=0, startTop=0;
      const container = root;
      container.addEventListener('mousedown', (e)=>{
        if (e.target.closest('#assistantBubble')) return; // don't drag when using chat
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

/* ==========================================================
   ACCORDIONS (.acc-item) — RESTORED
   Think: "click a question => the answer box opens smoothly"
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  function setPanelHeight(panel, open){
    // If open, set height to content; if closed, set to 0 (so it can animate)
    panel.style.maxHeight = open ? (panel.scrollHeight + 'px') : 0;
  }
  function wireAccordionItem(item){
    const btn   = item.querySelector('.acc-header');   // the clickable title
    const panel = item.querySelector('.acc-content');  // the hidden content
    if (!btn || !panel) return;

    // Start closed
    item.classList.remove('open');
    setPanelHeight(panel, false);
    btn.setAttribute('aria-expanded', 'false');

    // Toggle open/close on click
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      setPanelHeight(panel, isOpen);
    });
  }
  document.querySelectorAll('.acc-item').forEach(wireAccordionItem);
});

/* ==========================================================
   REVEAL-ON-SCROLL + ACTIVE NAV LINK
   Think: "cards slide in; navbar highlights current section"
   ========================================================== */
(function () {
  const navbar = document.getElementById('navbar') || document.querySelector('nav');
  const scrollIndicator = document.getElementById('scrollIndicator');
  // Support both patterns: .nav-link (old) OR .nav-links a (new)
  const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
  const sections = document.querySelectorAll('section');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    // Navbar style when scrolling a bit
    if (navbar) navbar.classList.toggle('scrolled', y > 20);

    // Progress bar width
    if (scrollIndicator) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollIndicator.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
    }

    // Reveal ".fade-in" things when they are near the viewport
    document.querySelectorAll('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) el.classList.add('visible');
    });

    // Make the right navbar link glow
    let current = '';
    const mid = y + window.innerHeight / 3; // "one third down the screen"
    sections.forEach(sec => { if (sec.offsetTop <= mid) current = sec.id; });
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load so first elements show up
})();

/* ==========================================================
   TINY CHAT UI INSIDE THE BUBBLE (input + send button)
   Think: "type a question, click ➤, show reply"
   Requires: window.askClippy(history) provided in index.js (your Firebase proxy)
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("assistantBubble");
  if (!bubble || typeof window.askClippy !== "function") return;

  // Insert a simple form and a log area (easy to remove later)
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

  // Keep a short history so answers make sense, but don't get too long/expensive
  const history = [];
  const MAX_TURNS = 16;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = (input.value || "").trim();
    if (!text) return;

    append("you", text);
    input.value = "";
    sendBtn.disabled = true;

    // Show a simple "thinking..." line with bouncing dots
    const thinkingId = append("clippy", "…thinking");
    let dots = 0;
    const tick = setInterval(() => {
      dots = (dots + 1) % 4;
      const el = log.querySelector(`[data-id="${thinkingId}"]`);
      if (el) el.textContent = "…thinking".padEnd(10 + dots, ".");
    }, 400);

    try {
      // Add user message to history
      history.push({ role: "user", content: text });
      while (history.length > MAX_TURNS) history.shift();

      // Ask your backend (Firebase proxy) for an answer
      const reply = await window.askClippy(history);
      const msg = (reply?.text || reply?.content || "Hmm, I didn’t catch that.").trim();

      // Add assistant message to history
      history.push({ role: "assistant", content: msg });
      while (history.length > MAX_TURNS) history.shift();

      replace(thinkingId, "clippy", msg);
    } catch (err) {
      replace(thinkingId, "clippy", "⚠️ Error talking to assistant. Try again.");
      console.error(err);
    } finally {
      clearInterval(tick);
      sendBtn.disabled = false;
    }
  });

  // Helper to add a line to the log
  function append(who, text) {
    const id = crypto.randomUUID();
    const div = document.createElement("div");
    div.dataset.id = id;
    div.className = `line ${who}`;
    div.textContent = text;            // textContent = safe (no HTML injection)
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return id;
  }
  // Helper to replace a specific line (used for "thinking..." -> reply)
  function replace(id, who, text) {
    const el = log.querySelector(`[data-id="${id}"]`);
    if (!el) return append(who, text);
    el.className = `line ${who}`;
    el.textContent = text;
    log.scrollTop = log.scrollHeight;
  }
});
