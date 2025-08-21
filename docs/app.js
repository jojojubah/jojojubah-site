/* app.js — Main application with modular architecture */

// Global services container
window.siteServices = {};

/* ========================= Application Initialization ===================== */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing JojoJubah site...');
  
  try {
    await initializeCore();
    await initializeFeatures();
    setupGlobalAPI();
    console.log('✅ Site initialization complete');
  } catch (error) {
    console.error('❌ Site initialization failed:', error);
    // Continue with basic functionality even if some features fail
    setupFallbacks();
  }
});

/* ========================= Core System Initialization ==================== */
async function initializeCore() {
  // Check if modules are available (they should be loaded by now)
  const coreModules = ['utils', 'analytics', 'theme', 'navigation'];
  
  for (const moduleName of coreModules) {
    try {
      await initializeModule(moduleName);
    } catch (error) {
      console.warn(`⚠️ Failed to initialize ${moduleName}:`, error);
    }
  }
}

async function initializeFeatures() {
  const featureModules = ['effects', 'accordion'];
  
  for (const moduleName of featureModules) {
    try {
      await initializeModule(moduleName);
    } catch (error) {
      console.warn(`⚠️ Failed to initialize ${moduleName}:`, error);
    }
  }
  
  // Initialize assistant if present
  await initializeAssistant();
}

async function initializeModule(moduleName) {
  try {
    // Check if the service class is available on window
    const serviceClass = window[`${capitalize(moduleName)}Service`];
    
    if (serviceClass) {
      const service = new serviceClass();
      if (service.initialize) {
        service.initialize();
      }
      window.siteServices[moduleName] = service;
      console.log(`✅ ${moduleName} service initialized`);
    } else {
      console.warn(`⚠️ ${moduleName} service class not found`);
    }
  } catch (error) {
    console.error(`❌ Failed to initialize ${moduleName}:`, error);
    throw error;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function initializeAssistant() {
  const assistantRoot = document.getElementById('jojoAssistant');
  if (!assistantRoot) {
    console.log('ℹ️ Assistant not found on this page');
    return;
  }

  try {
    // Basic assistant setup would go here
    console.log('✅ Basic assistant initialized');
  } catch (error) {
    console.error('❌ Assistant initialization failed:', error);
  }
}

/* ========================= Fallback Functions ============================ */

function setupFallbacks() {
  console.log('Setting up fallback functions...');
  
  setupBasicNavigation();
  setupBasicTheme();
  setupBasicAccordions();
}

function setupBasicNavigation() {
  console.log('Setting up basic navigation fallback...');
  
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  
  // Basic scroll handler
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      requestAnimationFrame(() => {
        if (navbar) {
          navbar.classList.toggle('scrolled', window.scrollY > 20);
        }
        
        // Update scroll progress
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (scrollIndicator) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percentage = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
          scrollIndicator.style.width = `${Math.min(percentage, 100)}%`;
        }
        
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // Basic mobile menu
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
  let toggleGroup = document.querySelector('.toggle-group');
  let themeBtn = document.getElementById('themeToggle');
  
  // Create toggle group if it doesn't exist
  if (!toggleGroup) {
    toggleGroup = document.createElement('div');
    toggleGroup.className = 'toggle-group';
    document.body.appendChild(toggleGroup);
  }
  
  // Create theme button if it doesn't exist
  if (!themeBtn) {
    themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.setAttribute('aria-label', 'Toggle theme');
    themeBtn.setAttribute('title', 'Switch between light and dark theme');
    toggleGroup.appendChild(themeBtn);
  }

  // Detect initial theme
  const storedTheme = localStorage.getItem('preferred-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  // Set initial theme
  if (initialTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '🌙';
  } else {
    body.removeAttribute('data-theme');
    themeBtn.textContent = '☀️';
  }

  // Theme toggle handler
  themeBtn.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      body.removeAttribute('data-theme');
      themeBtn.textContent = '☀️';
      localStorage.setItem('preferred-theme', 'light');
    } else {
      body.setAttribute('data-theme', 'dark');
      themeBtn.textContent = '🌙';
      localStorage.setItem('preferred-theme', 'dark');
    }
  });
}

function setupBasicAccordions() {
  console.log('Setting up basic accordion fallback...');
  
  const accordionTrackers = new Map();
  
  // Setup learn accordion tracking
  const learnAccordion = document.getElementById('learnAccordion');
  if (learnAccordion) {
    const learnItems = Array.from(learnAccordion.querySelectorAll('.acc-item'));
    accordionTrackers.set('learn', { items: learnItems, opened: new Set() });
  }
  
  // Setup economics accordion tracking
  const econLeft = document.getElementById('econGlossaryLeft');
  const econRight = document.getElementById('econGlossaryRight');
  if (econLeft || econRight) {
    const econItems = [
      ...(econLeft ? econLeft.querySelectorAll('.acc-item') : []),
      ...(econRight ? econRight.querySelectorAll('.acc-item') : [])
    ];
    accordionTrackers.set('economics', { items: econItems, opened: new Set() });
  }
  
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
      
      if (isOpen) {
        // Track progress
        for (const [type, tracker] of accordionTrackers) {
          if (tracker.items.includes(item)) {
            tracker.opened.add(item);
            
            // Check if all items opened
            if (tracker.opened.size >= tracker.items.length) {
              handleAccordionComplete(type);
            }
            break;
          }
        }
      }
    });
  });
  
  function handleAccordionComplete(type) {
    console.log(`🎉 ${type} accordion completed!`);
    
    if (type === 'learn') {
      // Add bonus section
      const learnContainer = document.getElementById('learnAccordion');
      if (learnContainer && !document.getElementById('acc-item-bonus')) {
        const bonusHTML = `
          <div class="acc-item" id="acc-item-bonus">
            <button class="acc-header" aria-expanded="false" aria-controls="acc-panel-bonus">
              <span>Hmm... What's this?</span>
              <svg class="acc-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M12 15.5l-7-7 1.4-1.4L12 12.7l5.6-5.6L19 8.5z"/>
              </svg>
            </button>
            <div class="acc-content" id="acc-panel-bonus" role="region" aria-labelledby="acc-button-bonus">
              <div class="acc-inner">
                <h3>Bonus Unlock!!</h3>
                <p>Nice one! You explored every topic. Here's a link to JubahLabs.</p>
                <div style="margin-top:1rem">
                  <a class="btn" href="jubah-labs.html">Open JubahLabs</a>
                </div>
              </div>
            </div>
          </div>
        `;
        learnContainer.insertAdjacentHTML('beforeend', bonusHTML);
        
        // Wire the new item
        const bonusItem = document.getElementById('acc-item-bonus');
        const bonusHeader = bonusItem.querySelector('.acc-header');
        const bonusContent = bonusItem.querySelector('.acc-content');
        
        bonusContent.style.maxHeight = '0';
        bonusHeader.addEventListener('click', () => {
          const isOpen = bonusItem.classList.toggle('open');
          bonusHeader.setAttribute('aria-expanded', String(isOpen));
          bonusContent.style.maxHeight = isOpen ? bonusContent.scrollHeight + 'px' : '0';
        });
      }
    }
    
    // Show toast
    const toastId = type === 'learn' ? 'learnToast' : 'econToast';
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 6000);
    }
  }
}

/* ========================= Global API & Debug Tools ====================== */

function setupGlobalAPI() {
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
      getCurrentSection: () => window.siteServices.navigation?.getCurrentSection()
    },

    theme: {
      toggle: () => {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.click();
      },
      getCurrent: () => {
        return document.body.getAttribute('data-theme') || 'light';
      }
    }
  };
}

/* ========================= Error Handling ==================== */

// Global error handler
window.addEventListener('error', (event) => {
  if (window.DEBUG_MODE) {
    console.error('Global error caught:', event.error);
  }
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  if (window.DEBUG_MODE) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

/* ========================= Console Welcome Message ==================== */

console.log(`
🎉 Welcome to JojoJubah's website!

Available commands:
- siteAPI.getStatus() - Get all service status
- siteAPI.enableDebugMode() - Enable detailed logging
- siteAPI.theme.toggle() - Toggle dark/light theme

Built with ❤️ by JojoJubah
`);
