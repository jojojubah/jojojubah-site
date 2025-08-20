/* ==========================================================
   app.js — fixed site logic
   ========================================================== */

/* ==========================================================
   1) COOKIE CONSENT + GOOGLE ANALYTICS
   ========================================================== */
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
      alert('We use Google Analytics to understand what helps most. Clear site data to change your choice later.');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    restoreConsentState();
    hookBannerButtons();
  });
})();

/* ==========================================================
   2) MOBILE NAV (HAMBURGER) - FIXED
   ========================================================== */
(function mobileNav(){
  document.addEventListener('DOMContentLoaded', function(){
    const links = document.querySelector('.nav-links');
    const toggleOld = document.getElementById('mobileMenuBtn');
    
    if (toggleOld && links){
      toggleOld.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        
        this.classList.toggle('active');
        links.classList.toggle('active');
      });
      
      // Close menu when clicking a nav link
      links.addEventListener('click', function(e){
        if (e.target.classList.contains('nav-link')){
          toggleOld.classList.remove('active');
          links.classList.remove('active');
        }
      });
    }
  });
})();

/* ==========================================================
   3) EMAIL REVEAL FUNCTIONALITY
   ========================================================== */
(function emailReveal(){
  document.addEventListener('DOMContentLoaded', function(){
    const revealBtn = document.getElementById('revealEmail');
    const hiddenSpan = document.getElementById('emailHidden');
    const visibleSpan = document.getElementById('emailVisible');
    
    if (revealBtn && hiddenSpan && visibleSpan){
      revealBtn.addEventListener('click', function(){
        hiddenSpan.style.display = 'none';
        visibleSpan.removeAttribute('hidden');
        visibleSpan.style.display = 'inline';
      });
    }
  });
})();

/* ==========================================================
   4) ACCORDIONS (.acc-item) - FIXED
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  function wireAccordionItem(item){
    const btn = item.querySelector('.acc-header');
    const panel = item.querySelector('.acc-content');
    if (!btn || !panel) return;

    // Start closed
    item.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');

    // Toggle open/close on click
    btn.addEventListener('click', () => {
      // Close other accordion items first (optional - remove if you want multiple open)
      const accordion = item.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.acc-item.open').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherBtn = otherItem.querySelector('.acc-header');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
      
      // Toggle current item
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  }
  document.querySelectorAll('.acc-item').forEach(wireAccordionItem);
});

/* ==========================================================
   5) REVEAL-ON-SCROLL + ACTIVE NAV LINK + PROGRESS BAR
   ========================================================== */
(function revealAndNav(){
  document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar') || document.querySelector('nav');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
    const sections = document.querySelectorAll('section');

    function onScroll() {
      const y = window.scrollY || window.pageYOffset;

      // 1) Navbar background effect
      if (navbar) navbar.classList.toggle('scrolled', y > 20);

      // 2) Progress bar width
      if (scrollIndicator) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollIndicator.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }

      // 3) Reveal fade-in items
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) el.classList.add('visible');
      });

      // 4) Active nav link highlighting
      let current = '';
      const mid = y + window.innerHeight / 3;
      sections.forEach(sec => { 
        if (sec.offsetTop <= mid) current = sec.id; 
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', href === '#' + current);
      });
    }

    // Run once and on scroll
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

/* ==========================================================
   6) TOAST NOTIFICATIONS
   ========================================================== */
function showToast(toastId, duration = 6000) {
  const toast = document.getElementById(toastId);
  if (!toast) return;
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ==========================================================
   7) LEARN SECTION PROGRESS TRACKING
   ========================================================== */
(function learnProgress(){
  document.addEventListener('DOMContentLoaded', function(){
    const learnAccordion = document.getElementById('learnAccordion');
    const learnToast = document.getElementById('learnToast');
    
    if (!learnAccordion || !learnToast) return;
    
    let openedItems = new Set();
    
    learnAccordion.addEventListener('click', function(e){
      const button = e.target.closest('.acc-header');
      if (!button) return;
      
      const item = button.closest('.acc-item');
      if (!item) return;
      
      // Track when items are opened
      setTimeout(() => {
        if (item.classList.contains('open')) {
          const itemId = button.textContent.trim();
          openedItems.add(itemId);
          
          // Show toast when all items have been opened
          const totalItems = learnAccordion.querySelectorAll('.acc-item').length;
          if (openedItems.size >= totalItems) {
            showToast('learnToast');
          }
        }
      }, 100);
    });
  });
})();

/* ==========================================================
   8) FLOATING ASSISTANT CHAT UI
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("assistantBubble");
  const assistant = document.getElementById("jojoAssistant");
  
  if (!bubble || !assistant) return;

  // Inject chat form if not already present
  if (!document.getElementById("clippyForm")) {
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
  }

  const form = document.getElementById("clippyForm");
  const input = document.getElementById("clippyInput");
  const sendBtn = document.getElementById("clippySend");
  const log = document.getElementById("clippyLog");
  const textEl = document.getElementById("assistantText");
  const closeBtn = document.getElementById("assistantClose");
  const avatar = assistant.querySelector('.assistant-avatar');

  // Chat history
  const history = [];
  const MAX_TURNS = 16;

  // Assistant interaction
  function openBubble() {
    bubble.classList.add('show');
    setTimeout(() => input?.focus(), 100);
  }
  
  function closeBubble() {
    bubble.classList.remove('show');
  }

  // Avatar click toggles bubble
  avatar?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bubble.classList.contains('show')) {
      closeBubble();
    } else {
      openBubble();
    }
  });

  // Close button
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBubble();
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!bubble.classList.contains('show')) return;
    const withinAssistant = e.target.closest('#assistantBubble') || e.target.closest('#jojoAssistant');
    if (!withinAssistant) closeBubble();
  });

  // Chat form submission
  if (form && typeof window.askClippy === "function") {
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
        history.push({ role: "user", content: text });
        while (history.length > MAX_TURNS) history.shift();

        const reply = await window.askClippy(history);
        const msg = (reply?.text || reply?.content || "Hmm, I didn't catch that.").trim();

        history.push({ role: "assistant", content: msg });
        while (history.length > MAX_TURNS) history.shift();

        replace(thinkingId, "clippy", msg);
      } catch (err) {
        replace(thinkingId, "clippy", "⚠️ Error talking to assistant. Try again.");
        console.error('Chat error:', err);
      } finally {
        clearInterval(tick);
        sendBtn.disabled = false;
      }
    });
  }

  // Chat log functions
  function append(who, text) {
    if (!log) return null;
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
    if (!log) return;
    const el = log.querySelector(`[data-id="${id}"]`);
    if (!el) return append(who, text);
    el.className = `line ${who}`;
    el.textContent = text;
    log.scrollTop = log.scrollHeight;
  }

  // Drag functionality
  (function enableDrag(){
    let isDown = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    
    assistant.addEventListener('mousedown', (e) => {
      if (e.target.closest('#assistantBubble')) return;
      
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = assistant.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      assistant.style.position = 'fixed';
      assistant.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      assistant.style.left = (startLeft + dx) + 'px';
      assistant.style.top = (startTop + dy) + 'px';
      assistant.style.right = 'auto';
      assistant.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      isDown = false;
      assistant.style.cursor = 'grab';
    });
  })();
});

/* ==========================================================
   9) REVEAL-ON-SCROLL + ACTIVE NAV LINK + PROGRESS BAR
   ========================================================== */
(function revealAndNav(){
  document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar') || document.querySelector('nav');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
    const sections = document.querySelectorAll('section');

    function onScroll() {
      const y = window.scrollY || window.pageYOffset;

      // 1) Navbar background effect
      if (navbar) navbar.classList.toggle('scrolled', y > 20);

      // 2) Progress bar width
      if (scrollIndicator) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollIndicator.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }

      // 3) Reveal fade-in items
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) el.classList.add('visible');
      });

      // 4) Active nav link highlighting
      let current = '';
      const mid = y + window.innerHeight / 3;
      sections.forEach(sec => { 
        if (sec.offsetTop <= mid) current = sec.id; 
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', href === '#' + current);
      });
    }

    // Run once and on scroll
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

/* ==========================================================
   10) TIPS SYSTEM
   ========================================================== */
(function tipsSystem(){
  let tips = {};

  // Load tips from JSON file
  fetch('data/tips.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.resolve({}))
    .then(json => { tips = json || {}; })
    .catch(() => { tips = {}; });

  // Make showTip available globally
  window.showTip = function(key){
    const textEl = document.getElementById('assistantText');
    const bubble = document.getElementById('assistantBubble');
    
    if (!tips[key] || !textEl || !bubble) return;
    
    textEl.textContent = tips[key];
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), 9000);
  };

  // Projects section tip trigger
  document.addEventListener('DOMContentLoaded', function(){
    const projects = document.getElementById('projects');
    if (projects && typeof window.showTip === 'function') {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries){
          if (entry.isIntersecting){
            window.showTip('secretLab');
          }
        }
      }, { threshold: 0.4 });
      observer.observe(projects);
    }
  });
})();
