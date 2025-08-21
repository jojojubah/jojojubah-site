/* app.js — Main application with modular architecture */

// Global services container
window.siteServices = {};

/* ========================= Fallback Functions ============================ */

function setupBasicNavigation() {
  console.log('Setting up basic navigation fallback...');
  
  // Basic scroll handler
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      requestAnimationFrame(() => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
          navbar.classList.toggle('scrolled', window.scrollY > 20);
        }
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // Basic mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      mobileBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
}

function setupBasicTheme() {
  console.log('Setting up basic theme fallback...');
  
  const body = document.body;
  let themeBtn = document.getElementById('themeToggle');
  
  if (!themeBtn) {
    let group = document.querySelector('.toggle-group');
    if (!group) {
      group = document.createElement('div');
      group.className = 'toggle-group';
      document.body.appendChild(group);
    }
    
    themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.textContent = '☀️';
    group.appendChild(themeBtn);
  }

  themeBtn.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      body.removeAttribute('data-theme');
      themeBtn.textContent = '☀️';
    } else {
      body.setAttribute('data-theme', 'dark');
      themeBtn.textContent = '🌙';
    }
  });
}

function setupBasicAccordions() {
  console.log('Setting up basic accordion fallback...');
  
  document.querySelectorAll('.acc-item').forEach(item => {
    const header = item.querySelector('.acc-header');
    const content = item.querySelector('.acc-content');
    
    if (!header || !content) return;
    
    content.style.maxHeight = '0';
    header.setAttribute('aria-expanded', 'false');
    
    header.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      header.setAttribute('aria-expanded', String(isOpen));
      content.style.maxHeight = isOpen ? content.scrollHeight + 'px' : '0';
    });
  });
}

/* ========================= Global API & Debug Tools ====================== */

// Global functions for external access and debugging
window.siteAPI = {
  // Get service status
  getStatus() {
    const status = {};
    Object.keys(window.siteServices).forEach(serviceName => {
      const service = window.siteServices[serviceName];
      if (service && typeof service.getStatus === 'function') {
        status[serviceName] = service.getStatus();
      } else {
        status[serviceName] = { available: !!service };
      }
    });
    return status;
  },

  // Refresh all services
  async refresh() {
    console.log('🔄 Refreshing all services...');
    
    Object.values(window.siteServices).forEach(service => {
      if (service && typeof service.refresh === 'function') {
        try {
          service.refresh();
        } catch (error) {
          console.warn('Service refresh failed:', error);
        }
      }
    });
    
    console.log('✅ Services refreshed');
  },

  // Debug mode toggle
  enableDebugMode() {
    window.DEBUG_MODE = true;
    console.log('🐛 Debug mode enabled');
    console.log('Available services:', Object.keys(window.siteServices));
    console.log('Site status:', this.getStatus());
  },

  disableDebugMode() {
    window.DEBUG_MODE = false;
    console.log('🔇 Debug mode disabled');
  },

  // Service-specific shortcuts
  navigation: {
    scrollTo: (sectionId) => window.siteServices.navigation?.scrollToSection(sectionId),
    getCurrentSection: () => window.siteServices.navigation?.getCurrentSection(),
    openMobileMenu: () => window.siteServices.navigation?.openMobileMenu(),
    closeMobileMenu: () => window.siteServices.navigation?.closeMobileMenu()
  },

  theme: {
    toggle: () => window.siteServices.theme?.toggleTheme(),
    setDark: () => window.siteServices.theme?.setTheme('dark'),
    setLight: () => window.siteServices.theme?.setTheme('light'),
    getCurrent: () => window.siteServices.theme?.getCurrentTheme()
  },

  accordion: {
    openAll: (type) => window.siteServices.accordion?.openAllItems(type),
    closeAll: (type) => window.siteServices.accordion?.closeAllItems(type),
    getProgress: (type) => window.siteServices.accordion?.getProgress(type),
    reset: (type) => window.siteServices.accordion?.resetProgress(type)
  },

  assistant: {
    showTip: (key) => window.siteServices.assistantUI?.triggerTip(key),
    getState: () => window.siteServices.assistantUI?.getState(),
    enableChat: () => window.siteServices.assistantChat?.enableChat(),
    disableChat: () => window.siteServices.assistantChat?.disableChat(),
    testAPI: () => window.siteServices.assistantAPI?.testConnection()
  },

  effects: {
    enableCursor: () => window.siteServices.effects?.enableCursorTrail(),
    disableCursor: () => window.siteServices.effects?.disableCursorTrail(),
    triggerFadeIn: (selector) => window.siteServices.effects?.triggerFadeIn(selector)
  },

  analytics: {
    getStatus: () => window.siteServices.analytics?.getStatus(),
    accept: () => window.siteServices.analytics?.forceAccept(),
    decline: () => window.siteServices.analytics?.forceDecline(),
    reset: () => window.siteServices.analytics?.resetConsent()
  }
};

/* ========================= Error Handling & Recovery ==================== */

// Global error handler
window.addEventListener('error', (event) => {
  if (window.DEBUG_MODE) {
    console.error('Global error caught:', event.error);
  }
  
  // Don't let JavaScript errors break the site
  event.preventDefault();
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (window.DEBUG_MODE) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  
  // Don't let promise rejections break the site
  event.preventDefault();
});

/* ========================= Performance Monitoring ==================== */

// Optional performance monitoring
if (window.performance && window.performance.mark) {
  window.performance.mark('site-init-start');
  
  window.addEventListener('load', () => {
    window.performance.mark('site-init-end');
    window.performance.measure('site-init', 'site-init-start', 'site-init-end');
    
    if (window.DEBUG_MODE) {
      const measure = window.performance.getEntriesByName('site-init')[0];
      console.log(`📊 Site initialization took: ${measure.duration.toFixed(2)}ms`);
    }
  });
}

/* ========================= Console Welcome Message ==================== */

// Fun console message for developers
console.log(`
🎉 Welcome to JojoJubah's website!

This site uses a modular architecture for better performance and maintainability.

Available commands:
- siteAPI.getStatus() - Get all service status
- siteAPI.enableDebugMode() - Enable detailed logging
- siteAPI.theme.toggle() - Toggle dark/light theme
- siteAPI.assistant.showTip('key') - Show assistant tip

Want to contribute? Check out the source code structure in the dev tools!

Built with ❤️ by JojoJubah
`);

/* ========================= Backwards Compatibility ==================== */

// For any external scripts that might expect these global functions
window.showTip = (key) => window.siteServices.assistantUI?.triggerTip(key);
window.assistantUI = window.siteServices.assistantUI; // Will be set after initialization

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteAPI: window.siteAPI, siteServices: window.siteServices };
}= Application Initialization ===================== */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing JojoJubah site...');
  
  try {
    await initializeCore();
    await initializeFeatures();
    console.log('✅ Site initialization complete');
  } catch (error) {
    console.error('❌ Site initialization failed:', error);
    // Continue with basic functionality even if some features fail
  }
});

/* ========================= Core System Initialization ==================== */
async function initializeCore() {
  // Initialize analytics first (GDPR compliance)
  await initializeAnalytics();
  
  // Initialize core UI services
  await Promise.all([
    initializeNavigation(),
    initializeTheme(),
    initializeUtils()
  ]);
}

async function initializeFeatures() {
  // Initialize optional features that can fail gracefully
  await Promise.all([
    initializeEffects(),
    initializeAccordions(),
    initializeAssistant()
  ]);
}

/* ========================= Service Initializers ========================== */

async function initializeAnalytics() {
  try {
    const { AnalyticsService } = await import('./scripts/analytics.js');
    const analytics = new AnalyticsService();
    analytics.initialize();
    
    window.siteServices.analytics = analytics;
    console.log('✅ Analytics service initialized');
  } catch (error) {
    console.warn('⚠️ Analytics service failed to load:', error);
  }
}

async function initializeNavigation() {
  try {
    const { NavigationService } = await import('./scripts/navigation.js');
    const navigation = new NavigationService();
    navigation.initialize();
    
    window.siteServices.navigation = navigation;
    console.log('✅ Navigation service initialized');
  } catch (error) {
    console.error('❌ Navigation service failed:', error);
    // Fallback to basic navigation
    setupBasicNavigation();
  }
}

async function initializeTheme() {
  try {
    const { ThemeService } = await import('./scripts/theme.js');
    const theme = new ThemeService();
    theme.initialize();
    
    window.siteServices.theme = theme;
    console.log('✅ Theme service initialized');
  } catch (error) {
    console.error('❌ Theme service failed:', error);
    // Fallback to basic theme toggle
    setupBasicTheme();
  }
}

async function initializeUtils() {
  try {
    const { UtilsService } = await import('./scripts/utils.js');
    const utils = new UtilsService();
    utils.initialize();
    
    window.siteServices.utils = utils;
    console.log('✅ Utils service initialized');
  } catch (error) {
    console.warn('⚠️ Utils service failed:', error);
    // Most utils are optional
  }
}

async function initializeEffects() {
  try {
    const { EffectsService } = await import('./scripts/effects.js');
    const effects = new EffectsService();
    effects.initialize();
    
    window.siteServices.effects = effects;
    console.log('✅ Effects service initialized');
  } catch (error) {
    console.warn('⚠️ Effects service failed:', error);
    // Effects are optional
  }
}

async function initializeAccordions() {
  try {
    const { AccordionService } = await import('./scripts/accordion.js');
    const accordion = new AccordionService();
    accordion.initialize();
    
    window.siteServices.accordion = accordion;
    console.log('✅ Accordion service initialized');
  } catch (error) {
    console.warn('⚠️ Accordion service failed:', error);
    // Fallback to basic accordion
    setupBasicAccordions();
  }
}

async function initializeAssistant() {
  const assistantRoot = document.getElementById('jojoAssistant');
  if (!assistantRoot) {
    console.log('ℹ️ Assistant not found on this page');
    return;
  }

  try {
    // Initialize basic assistant UI first
    const { AssistantUI } = await import('./scripts/assistant/assistant-ui.js');
    const assistantUI = new AssistantUI();
    const basicInitialized = await assistantUI.initialize();
    
    if (!basicInitialized) {
      console.warn('⚠️ Basic assistant initialization failed');
      return;
    }

    window.siteServices.assistantUI = assistantUI;
    console.log('✅ Basic assistant initialized');

    // Try to enable advanced features
    try {
      await initializeAdvancedAssistant(assistantUI);
    } catch (error) {
      console.log('ℹ️ Advanced assistant features unavailable:', error.message);
      // Basic assistant still works
    }

  } catch (error) {
    console.error('❌ Assistant initialization failed:', error);
  }
}

async function initializeAdvancedAssistant(assistantUI) {
  // Import advanced modules
  const [
    { FirebaseService },
    { AssistantAPI },
    { AssistantChat }
  ] = await Promise.all([
    import('./scripts/assistant/assistant-firebase.js'),
    import('./scripts/assistant/assistant-api.js'),
    import('./scripts/assistant/assistant-chat.js')
  ]);

  // Initialize Firebase
  const firebase = new FirebaseService();
  const firebaseReady = await firebase.initialize();
  
  if (!firebaseReady) {
    throw new Error('Firebase initialization failed');
  }

  // Initialize API with connection test
  const api = new AssistantAPI(firebase);
  const connectionTest = await api.testConnection();
  
  if (!connectionTest.success) {
    throw new Error(`API test failed: ${connectionTest.error}`);
  }

  // Initialize chat interface
  const chat = new AssistantChat(assistantUI, api);
  const chatEnabled = await chat.enableChat();

  if (!chatEnabled) {
    throw new Error('Chat interface initialization failed');
  }

  // Store advanced services
  window.siteServices.assistantFirebase = firebase;
  window.siteServices.assistantAPI = api;
  window.siteServices.assistantChat = chat;
  
  console.log('✅ Advanced assistant features enabled');
}

/* ========================
