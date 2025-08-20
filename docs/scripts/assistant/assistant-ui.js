// scripts/assistant/assistant-ui.js
// Handles basic assistant bubble, tips, show/hide - no chat functionality

export class AssistantUI {
  constructor() {
    this.bubble = null;
    this.textEl = null;
    this.closeBtn = null;
    this.tips = {};
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Find DOM elements
    this.bubble = document.getElementById('assistantBubble');
    this.textEl = document.getElementById('assistantText');
    this.closeBtn = document.getElementById('assistantClose');

    if (!this.bubble || !this.textEl || !this.closeBtn) {
      console.warn('Assistant DOM elements not found');
      return false;
    }

    // Load tips from JSON
    await this.loadTips();

    // Setup event listeners
    this.setupEventListeners();

    // Setup intersection observer for projects section
    this.setupProjectsObserver();

    this.isInitialized = true;
    return true;
  }

  async loadTips() {
    try {
      const response = await fetch('data/tips.json', { cache: 'no-store' });
      if (response.ok) {
        this.tips = await response.json();
      }
    } catch (error) {
      console.warn('Could not load assistant tips:', error);
      this.tips = {
        // Fallback tips
        'themeToggle': 'Nice! You discovered the theme toggle. Try switching between light and dark modes.',
        'projectsSection': 'Welcome to my projects! Each one has a tutorial you can follow along with.'
      };
    }
  }

  setupEventListeners() {
    // Close button
    this.closeBtn?.addEventListener('click', () => {
      this.hide();
    });

    // Click outside to close (optional)
    document.addEventListener('click', (e) => {
      if (this.bubble?.classList.contains('show') && 
          !this.bubble.contains(e.target) && 
          !e.target.closest('.assistant-avatar')) {
        this.hide();
      }
    });
  }

  setupProjectsObserver() {
    const projects = document.getElementById('projects');
    if (!projects) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.showTip('projectsSection');
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(projects);
  }

  showTip(key) {
    if (!this.isInitialized || !this.tips[key]) return;

    this.textEl.textContent = this.tips[key];
    this.show();

    // Auto-hide after 9 seconds
    setTimeout(() => this.hide(), 9000);
  }

  show() {
    if (!this.bubble) return;
    this.bubble.classList.add('show');
  }

  hide() {
    if (!this.bubble) return;
    this.bubble.classList.remove('show');
  }

  // Public method for external triggers (like theme toggle)
  triggerTip(key) {
    this.showTip(key);
  }

  // Check if assistant is ready
  isReady() {
    return this.isInitialized;
  }

  // Get current state
  getState() {
    return {
      initialized: this.isInitialized,
      visible: this.bubble?.classList.contains('show') || false,
      tipsLoaded: Object.keys(this.tips).length > 0
    };
  }
}
