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

    // Tag script
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;

    // Config script
    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', '${MEASUREMENT_ID}');
    `;

    document.head.appendChild(s1);
    document.head.appendChild(s2);
  }

  function restoreConsentState() {
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
      alert('We use Google Analytics to understand aggregate usage. You can change your decision anytime by clearing site data.');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    restoreConsentState();
    hookBannerButtons();
  });
})();

/* ===================== Mobile nav (burger) ======================= */
(function mobileNav(){
  document.addEventListener('DOMContentLoaded', function(){
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function(){
      const open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open');
    });
  });
})();

/* ===================== Theme toggle (light/dark) ================= */
(function themeToggle(){
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const root = document.documentElement;
    const current = localStorage.getItem('theme') || 'light';
    if (current === 'dark') root.classList.add('dark');

    btn.addEventListener('click', function(){
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      // Optional toast cue:
      const toast = document.getElementById('learnToast');
      showToastEl(toast);
    });
  });

  function showToastEl(el){
    if (!el) return;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 6000);
  }

  // Collect sets for targeted behaviors
  const learnAcc = document.getElementById('learnAccordion');                 // home page only
  const learnToastEl = document.getElementById('learnToast');                 // home toast

  const econLeft  = document.getElementById('econGlossaryLeft');              // economics page
  const econRight = document.getElementById('econGlossaryRight');             // economics page
  const econToast = document.getElementById('econToast');                     // economics toast

  const projects  = document.getElementById('projects');                      // home page observer

  document.addEventListener('DOMContentLoaded', function(){
    // Home "learn" accordion toast
    if (learnAcc && learnToastEl){
      learnAcc.addEventListener('toggle', function(e){
        if (e.target && e.target.open) showToastEl(learnToastEl);
      }, true);
    }

    // Economics: show toast after 10 sections opened (progress-based)
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

    // Reveal assistant tip when projects enter view (legacy behavior kept)
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

    // Open/close helpers
    function openBubble() {
      bubble.classList.add('show');
      const input = document.getElementById('clippyInput');
      if (input) setTimeout(() => input.focus(), 0);
    }
    function closeBubble() {
      bubble.classList.remove('show');
    }

    // Click avatar to toggle bubble (ignore clicks inside bubble)
    const avatar = root.querySelector('.assistant-avatar');
    avatar?.addEventListener('click', (e) => {
      if (bubble.classList.contains('show')) closeBubble();
      else openBubble();
    });

    // Allow clicking outside bubble to close
    document.addEventListener('click', (e) => {
      if (!bubble.classList.contains('show')) return;
      const withinAssistant = e.target.closest('#assistantBubble') || e.target.closest('#jojoAssistant');
      if (!withinAssistant) closeBubble();
    });

    // Drag = move assistant widget
    (function enableDrag(){
      let isDown = false, startX=0, startY=0, startLeft=0, startTop=0;
      const container = document.getElementById('jojoAssistant');

      container.addEventListener('mousedown', (e)=>{
        if (e.target.closest('#assistantBubble')) return; // don't drag when interacting with bubble
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
      if (el) el.textContent = "…thinking".padEnd(10 + dots, ".");
    }, 400);

    try {
      // keep a short rolling history
      history.push({ role: "user", content: text });
      while (history.length > MAX_TURNS) history.shift();

      const reply = await window.askClippy(history);
      const msg = (reply?.text || reply?.content || "Hmm, I didn’t catch that.").trim();

      // store assistant turn too
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
