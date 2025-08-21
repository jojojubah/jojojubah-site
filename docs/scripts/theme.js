// scripts/theme.js
// Handles dark/light theme toggling and persistence

export class ThemeService {
  constructor() {
    this.currentTheme = 'light';
    this.themeBtn = null;
    this.toggleGroup = null;
    this.storageKey = 'preferred-theme';
    this.callbacks = new Set();
  }

  initialize() {
    this.createToggleGroup();
    this.createThemeButton();
    this.detectInitialTheme();
    this.setupEventListeners();
    this.moveMatrixButtonIfExists();
  }

  createToggleGroup() {
    this.toggleGroup = document.querySelector('.toggle-group');
    if (!this.toggleGroup) {
      this.toggleGroup = document.createElement('div');
      this.toggleGroup.className = 'toggle-group';
      document.body.appendChild(this.toggleGroup);
    }
  }

  createThemeButton() {
    this.themeBtn = document.getElementById('themeToggle');
    if (!this.themeBtn) {
      this.themeBtn = document.createElement('button');
      this.themeBtn.id = 'themeToggle';
      this.themeBtn.setAttribute('aria-label', 'Toggle theme');
      this.themeBtn.setAttribute('title', 'Switch between light and dark theme');
      this.toggleGroup.appendChild(this.themeBtn);
    }
  }

  detectInitialTheme() {
    // Priority: 1. Page-specific override, 2. Stored preference, 3. System preference
    const isLabsPage = this.isLabsPage();
    const storedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme;
    
    if (isLabsPage) {
      // Labs page defaults to dark
      initialTheme = 'dark';
    } else if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
      // Use stored preference
      initialTheme = storedTheme;
    } else {
      // Use system preference
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }

    this.setTheme(initialTheme, false); // Don't store initial theme
  }

  setupEventListeners() {
    // Theme toggle button
    this.themeBtn?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });

    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setTheme(theme, store = true) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    const body = document.body;
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    // Update DOM
    if (theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
    } else {
      body.removeAttribute('data-theme');
    }

    // Update button icon
    this.updateButtonIcon(theme);

    // Store preference (unless it's initial detection)
    if (store) {
      localStorage.setItem(this.storageKey, theme);
    }

    // Trigger callbacks
    this.notifyThemeChange(theme, oldTheme);

    console.log(`🎨 Theme changed to: ${theme}`);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);

    // Trigger assistant tip if available
    this.notifyAssistant();
  }

  updateButtonIcon(theme) {
    if (!this.themeBtn) return;

    const icon = theme === 'dark' ? '🌙' : '☀️';
    this.themeBtn.textContent = icon;
    this.themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }

  notifyAssistant() {
    // Trigger assistant tip if available
    if (window.assistantUI?.isReady()) {
      window.assistantUI.triggerTip('themeToggle');
    }
  }

  notifyThemeChange(newTheme, oldTheme) {
    this.callbacks.forEach(callback => {
      try {
        callback(newTheme, oldTheme);
      } catch (error) {
        console.error('Theme change callback error:', error);
      }
    });
  }

  // Move matrix button into toggle group (for labs page)
  moveMatrixButtonIfExists() {
    const moveMatrix = () => {
      const matrixBtn = document.getElementById('matrixToggle');
      if (matrixBtn && this.toggleGroup && !this.toggleGroup.contains(matrixBtn)) {
        this.toggleGroup.appendChild(matrixBtn);
      }
    };

    moveMatrix();
    // Try again after a short delay in case the button is created later
    setTimeout(moveMatrix, 100);
  }

  isLabsPage() {
    return !!(
      document.getElementById('matrix-canvas') || 
      /jubah-labs\.html$/i.test(location.pathname) ||
      location.pathname.includes('labs')
    );
  }

  // Public API methods

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  isLightMode() {
    return this.currentTheme === 'light';
  }

  // Subscribe to theme changes
  onThemeChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.add(callback);
    }
  }

  // Unsubscribe from theme changes
  offThemeChange(callback) {
    this.callbacks.delete(callback);
  }

  // Force a specific theme (for testing)
  forceTheme(theme) {
    this.setTheme(theme, true);
  }

  // Reset to system preference
  resetToSystem() {
    localStorage.removeItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(systemPrefersDark ? 'dark' : 'light', false);
  }

  // Get theme state
  getState() {
    const storedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      current: this.currentTheme,
      stored: storedTheme,
      system: systemPrefersDark ? 'dark' : 'light',
      isLabsPage: this.isLabsPage(),
      hasUserPreference: !!storedTheme
    };
  }
}
