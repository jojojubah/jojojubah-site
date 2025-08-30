/* app.js — Complete JojoJubah site logic with AI Assistant integration */

/* ================= URL Cleaner ================== */
// Clean up .html extensions from URLs for aesthetics
(function cleanUrls(){
  const path = window.location.pathname;
  if (path === '/index.html') {
    window.history.replaceState({}, '', '/');
  } else if (path === '/labs.html') {
    window.history.replaceState({}, '', '/labs');
  } else if (path === '/economics.html') {
    window.history.replaceState({}, '', '/economics');
  }
})();

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
      // Also sync with cookie preferences system
      const cookiePreferences = {
        necessary: true,
        analytics: true, // User accepted all cookies
        advertising: false
      };
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      banner && (banner.style.display = 'none');
      enableGoogleAnalytics();
    });

    decline && (decline.onclick = function(){
      localStorage.setItem('cookieConsent','declined');
      // Also sync with cookie preferences system
      const cookiePreferences = {
        necessary: true,
        analytics: false, // User declined cookies
        advertising: false
      };
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
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

/* ================= Cookie Preferences Management ================== */
(function cookiePreferences(){
  // Get current cookie preferences from localStorage
  function getCookiePreferences() {
    const stored = localStorage.getItem('cookiePreferences');
    return stored ? JSON.parse(stored) : {
      necessary: true,  // Always true
      analytics: false, // Default off
      advertising: false // Default off (not implemented)
    };
  }

  // Save cookie preferences to localStorage
  function saveCookiePreferences(preferences) {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Handle Google Analytics based on analytics preference
    if (preferences.analytics) {
      enableGoogleAnalytics();
      localStorage.setItem('cookieConsent', 'accepted'); // Sync with old system
    } else {
      localStorage.setItem('cookieConsent', 'declined'); // Sync with old system
      // Disable GA if it was previously enabled
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }
  }

  // Reference to the Google Analytics function from the original code
  function enableGoogleAnalytics() {
    if (window.GA_LOADED) return;
    window.GA_LOADED = true;
    const MEASUREMENT_ID = 'G-0ZM44HTK32';
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

  function initCookiePreferences() {
    // Apply stored preferences on page load
    const preferences = getCookiePreferences();
    if (preferences.analytics) {
      enableGoogleAnalytics();
    }

    // Set up modal functionality
    const modal = document.getElementById('cookieModal');
    const openBtn = document.getElementById('cookiePreferences');
    const closeBtn = document.getElementById('closeCookieModal');
    const saveBtn = document.getElementById('saveCookiePreferences');
    const analyticsToggle = document.getElementById('analyticsToggle');

    if (!modal || !openBtn || !closeBtn || !saveBtn || !analyticsToggle) return;

    // Load current preferences into modal
    analyticsToggle.checked = preferences.analytics;

    // Open modal - add both click and touchstart for better mobile support
    const openModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'flex';
      // Refresh toggle state
      analyticsToggle.checked = getCookiePreferences().analytics;
    };
    
    openBtn.addEventListener('click', openModal);
    openBtn.addEventListener('touchstart', openModal, { passive: false });

    // Close modal
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });

    // Save preferences
    saveBtn.addEventListener('click', () => {
      const newPreferences = {
        necessary: true, // Always true
        analytics: analyticsToggle.checked,
        advertising: false // Not implemented yet
      };
      
      saveCookiePreferences(newPreferences);
      modal.style.display = 'none';
      
      // Show confirmation (optional)
      console.log('Cookie preferences saved:', newPreferences);
      
      // Hide the original consent banner if visible
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        banner.style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initCookiePreferences);
})();

/* ========================= Simple Toast System ===================== */
function showSimpleToast(message) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 5000);

  return toast;
}

// Make globally available
window.showSimpleToast = showSimpleToast;

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

    // active nav link (use viewport middle so short sections still activate)
    // Only run on homepage - skip on other pages
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    if (isHomepage) {
      let current = '';
      const y2 = window.scrollY || window.pageYOffset;
      const mid = y2 + window.innerHeight / 3; // adjust if you want earlier/later switch

      sections.forEach(sec => {
        if (sec.offsetTop <= mid) current = sec.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init

  // Mobile menu (hamburger)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinksContainer = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', function(){
      this.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });
    
    // Close mobile menu when any nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', function(){
        mobileMenuBtn.classList.remove('active');
        navLinksContainer.classList.remove('active');
      });
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
      // Save to localStorage
      localStorage.setItem('theme-preference', mode);
    }

    // Load saved theme preference, fallback to 'light'
    const savedTheme = localStorage.getItem('theme-preference') || 'light';
    apply(savedTheme);

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
            <p>Nice one! You explored every topic. Here's a link to JubahLabs.</p>
            <h4>Ideas to try next</h4>
            <p>• Turn a prompt into JSON and attach it in chat.<br>
               • Build a tiny agent in n8n.<br>
               • Test an open-source model locally and compare.</p>
            <div style="margin-top:1rem">
              <a class="btn" href="labs.html">Open JubahLabs</a>
            </div>
          </div>
        </div>
      </div>
    `);
    const bonusItem = document.getElementById('acc-item-bonus');
    if (bonusItem) wireAccordionItem(bonusItem);
  }

  function showToast(){
    if (!toastEl) {
      showSimpleToast('🎉 Amazing! You explored every topic. Check out JubahLabs for more!');
      return;
    }
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

    // Load JSON tips - Updated with new tips for chatbot
    const tipsData = {
      "themeToggle": "🌙 Nice! Dark mode looks sleek. Try clicking on different sections to explore more.",
      "projectsSection": "📽️ Check out these hands-on tutorials! Each one teaches practical AI and coding skills.",
      "assistantChat": "🤖 Hi there! I'm your AI assistant. Ask me anything about AI, coding, or Jojo's tutorials!",
      "learnSection": "📚 These guides cover the essentials of working with AI. Perfect for getting started!",
      "contactSection": "📧 Want to collaborate? Feel free to reach out - Jojo loves connecting with fellow builders!",
      "chatbotOpened": "💬 Great! Now you can have real conversations with me. I know all about Jojo's tutorials and can help with your projects!"
    };
    
    // Load tips from JSON or fallback to embedded data
    fetch('data/tips.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : tipsData)
      .then(json => { tips = json || tipsData; })
      .catch(() => { tips = tipsData; });

    // Show specific tip by key
    window.showTip = function(key){
      if (!tips[key]) return;
      if (textEl) textEl.textContent = tips[key];   // ✅ only text, no button
      if (bubble) bubble.classList.add('show');
      setTimeout(()=> bubble && bubble.classList.remove('show'), 9000); // auto-hide after 9s
    };

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', ()=> bubble && bubble.classList.remove('show'));
    }

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

  /* ======================== Mystery Toggle (Chaos Mode) =============== */
  const mysteryToggle = document.getElementById('mysteryToggle');
  let chaosLevel = 0;
  let chaosActive = false;
  let pageFlipped = false;
  let savedScrollPosition = 0;

  // Toast messages for each chaos level
  const chaosMessages = [
    "You shouldn't press random buttons...",
    "Why did you press that?",
    "Seriously, stop clicking things!",
    "This is getting out of hand...",
    "You've been warned multiple times!",
    "MAXIMUM CHAOS ACHIEVED! 🌪️"
  ];

  function showChaosToast(message) {
    showSimpleToast(message);
  }

  if (mysteryToggle) {
    mysteryToggle.addEventListener('click', function() {
      chaosLevel++;
      // Reset chaos level back to 1 after reaching 6
      if (chaosLevel > 6) {
        chaosLevel = 1;
      }
      
      chaosActive = !chaosActive;
      
      this.classList.toggle('active');
      
      // Show progressive toast message (loops back to start after max chaos)
      const messageIndex = (chaosLevel - 1) % chaosMessages.length;
      showChaosToast(chaosMessages[messageIndex]);
      
      if (chaosActive) {
        // Always save scroll position when chaos activates
        savedScrollPosition = window.scrollY || window.pageYOffset;
        
        // Check for page flip effect
        const shouldFlip = Math.random() < 0.3; // 30% chance
        if (shouldFlip && !pageFlipped) {
          // Use simple viewport center to maintain document boundaries
          document.body.classList.add('page-flipped');
          pageFlipped = true;
          
          // Simple repaint trigger
          setTimeout(() => {
            document.body.style.visibility = 'hidden';
            document.body.offsetHeight;
            document.body.style.visibility = 'visible';
          }, 10);
        } else {
          // Even if no page flip, restore scroll position to prevent jumping
          setTimeout(() => {
            window.scrollTo(0, savedScrollPosition);
          }, 10);
        }
        
        // Apply other chaos effects to random elements
        const targets = document.querySelectorAll('.neu-plate, .project-card, .acc-item, .social-link, .nav-link, .btn');
        const effects = ['shake', 'rainbow', 'glitch'];
        
        targets.forEach(target => {
          const effect = effects[Math.floor(Math.random() * effects.length)];
          target.classList.add(effect);
          setTimeout(() => target.classList.remove(effect), 2000 + Math.random() * 1000);
        });
        
        // Chaos mode activation at level 5
        if (chaosLevel >= 5) {
          document.body.classList.add('chaos-mode');
          setTimeout(() => document.body.classList.remove('chaos-mode'), 3000);
        }
      } else {
        // Remove page flip when toggled off
        if (pageFlipped) {
          document.body.classList.remove('page-flipped');
          pageFlipped = false;
          
          // Simple repaint trigger
          setTimeout(() => {
            document.body.style.visibility = 'hidden';
            document.body.offsetHeight;
            document.body.style.visibility = 'visible';
          }, 10);
        }
      }
    });
  }

  /* ==================== Floating Particles Effect =================== */
  (function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particles = [];
    const particleCount = Math.min(50, Math.max(20, window.innerWidth / 30));

    function createParticle() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      };
    }

    function initializeParticles() {
      particlesContainer.innerHTML = '';
      particles.length = 0;

      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        particles.push(particle);

        const elem = document.createElement('div');
        elem.style.cssText = `
          position: absolute;
          width: ${particle.size}px;
          height: ${particle.size}px;
          background: rgba(59, 130, 246, ${particle.opacity});
          border-radius: 50%;
          pointer-events: none;
        `;
        particlesContainer.appendChild(elem);
      }
    }

    function animateParticles() {
      particles.forEach((particle, i) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.y > window.innerHeight) particle.y = 0;
        if (particle.y < 0) particle.y = window.innerHeight;

        const elem = particlesContainer.children[i];
        if (elem) {
          elem.style.left = particle.x + 'px';
          elem.style.top = particle.y + 'px';
        }
      });

      requestAnimationFrame(animateParticles);
    }

    initializeParticles();
    animateParticles();

    // Reinit on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(initializeParticles, 150);
    });
  })();

  /* ======================== Fear & Greed Index Integration ===================== */
  // Add hover effects to embedded Fear & Greed gauge
  const isEconomicsPage = window.location.pathname.includes('economics.html');
  
  if (isEconomicsPage) {
    // Wait a moment for the embedded content to load, then add interactions
    setTimeout(() => {
      const gauge = document.querySelector('.fear-greed-gauge');
      if (gauge) {
        gauge.addEventListener('mouseenter', () => {
          gauge.style.transform = 'scale(1.02)';
          gauge.style.transition = 'transform 0.3s ease';
        });
        
        gauge.addEventListener('mouseleave', () => {
          gauge.style.transform = 'scale(1)';
        });
        
        // Track interaction with embedded gauge
        gauge.addEventListener('click', () => {
          if (window.gtag) {
            window.gtag('event', 'fear_greed_interaction', {
              event_category: 'engagement',
              event_label: 'embedded_gauge_click'
            });
          }
        });
      }
    }, 1500); // Wait for content to load
  }

  /* ======================== VS Section Accordion Functionality ===================== */
  // Initialize accordion functionality for VS section
  function initializeAccordions() {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    
    accordionTriggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId);
        
        if (!content) return;
        
        // Toggle active states
        const isActive = this.classList.contains('active');
        
        if (isActive) {
          // Close accordion
          this.classList.remove('active');
          content.classList.remove('active');
        } else {
          // Close other accordions in the same VS card
          const currentCard = this.closest('.vs-card');
          const otherTriggers = currentCard.querySelectorAll('.accordion-trigger.active');
          const otherContents = currentCard.querySelectorAll('.accordion-content.active');
          
          otherTriggers.forEach(t => t.classList.remove('active'));
          otherContents.forEach(c => c.classList.remove('active'));
          
          // Open current accordion
          this.classList.add('active');
          content.classList.add('active');
          
          // Show toast notification
          showAccordionToast();
        }
      });
    });
  }
  
  // Show toast when accordion is unlocked
  function showAccordionToast() {
    showSimpleToast('🎉 Bonus insights unlocked!');
  }
  
  // Initialize accordions when page loads
  initializeAccordions();

});
