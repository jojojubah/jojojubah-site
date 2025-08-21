// scripts/utils.js
// Utility functions and small site interactions

export class UtilsService {
  constructor() {
    this.emailRevealed = false;
  }

  initialize() {
    this.setupEmailReveal();
    this.updateFooterYear();
    this.setupKeyboardShortcuts();
  }

  setupEmailReveal() {
    document.addEventListener('click', (e) => {
      const revealBtn = e.target.closest('#revealEmail');
      if (!revealBtn) return;

      this.revealEmail();
    });
  }

  revealEmail() {
    if (this.emailRevealed) return;

    const hiddenWrapper = document.getElementById('emailHidden');
    const visibleEmail = document.getElementById('emailVisible');

    if (hiddenWrapper && visibleEmail) {
      // Add fade out animation to button
      hiddenWrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      hiddenWrapper.style.opacity = '0';
      hiddenWrapper.style.transform = 'scale(0.9)';

      setTimeout(() => {
        hiddenWrapper.remove();
        visibleEmail.hidden = false;
        
        // Add fade in animation to email
        visibleEmail.style.opacity = '0';
        visibleEmail.style.transition = 'opacity 0.3s ease';
        
        requestAnimationFrame(() => {
          visibleEmail.style.opacity = '1';
        });
        
        this.emailRevealed = true;
      }, 300);
    }
  }

  updateFooterYear() {
    const yearElement = document.getElementById('secretYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Handle various keyboard shortcuts
      this.handleKeyboardShortcut(e);
    });
  }

  handleKeyboardShortcut(e) {
    // Escape key - close any open modals/menus
    if (e.key === 'Escape') {
      this.closeOpenOverlays();
    }

    // Ctrl/Cmd + K - Focus search (if exists)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      const searchInput = document.querySelector('input[type="search"], .search-input, #clippyInput');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }

    // Ctrl/Cmd + / - Show keyboard shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      this.showKeyboardShortcuts();
    }
  }

  closeOpenOverlays() {
    // Close cookie banner modal
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.remove();
    }

    // Close assistant bubble
    const assistantBubble = document.getElementById('assistantBubble');
    if (assistantBubble && assistantBubble.classList.contains('show')) {
      assistantBubble.classList.remove('show');
    }

    // Close mobile menu
    if (window.navigationService) {
      window.navigationService.closeMobileMenu();
    }
  }

  showKeyboardShortcuts() {
    const shortcuts = [
      { key: 'Esc', description: 'Close overlays and menus' },
      { key: 'Ctrl/Cmd + K', description: 'Focus search input' },
      { key: 'Ctrl/Cmd + Shift + T', description: 'Toggle theme' },
      { key: 'Ctrl/Cmd + /', description: 'Show this help' }
    ];

    this.showModal(
      'Keyboard Shortcuts',
      this.createShortcutsHTML(shortcuts)
    );
  }

  createShortcutsHTML(shortcuts) {
    return `
      <div style="text-align: left;">
        ${shortcuts.map(shortcut => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
            <kbd style="background: var(--bg-2); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem;">${shortcut.key}</kbd>
            <span style="margin-left: 1rem; color: var(--text-dim);">${shortcut.description}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  showModal(title, content) {
    // Remove existing modal
    const existingModal = document.getElementById('utilsModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'utilsModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="learn-more-modal">
        <button class="close-btn" id="closeUtilsModal">&times;</button>
        <h3>${title}</h3>
        <div style="color: var(--text-dim); line-height: 1.6; margin-top: 1rem;">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeModal = () => modal.remove();
    
    document.getElementById('closeUtilsModal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Auto-close after 10 seconds
    setTimeout(closeModal, 10000);
  }

  // Utility functions for other services

  // Debounce function for performance optimization
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  // Throttle function for performance optimization
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Check if element is in viewport
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  }

  // Smooth scroll to element
  scrollToElement(elementOrId, offset = 96) {
    let element;
    
    if (typeof elementOrId === 'string') {
      element = document.getElementById(elementOrId) || document.querySelector(elementOrId);
    } else {
      element = elementOrId;
    }

    if (!element) return false;

    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    return true;
  }

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format date for display
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  }

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Get device type
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Local storage helpers with error handling
  getStoredValue(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to get stored value:', error);
      return defaultValue;
    }
  }

  setStoredValue(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to set stored value:', error);
      return false;
    }
  }

  removeStoredValue(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove stored value:', error);
      return false;
    }
  }

  // Get site status
  getStatus() {
    return {
      emailRevealed: this.emailRevealed,
      deviceType: this.getDeviceType(),
      reducedMotion: this.prefersReducedMotion(),
      currentYear: new Date().getFullYear()
    };
  }
}

// Make available globally
window.UtilsService = UtilsService;
