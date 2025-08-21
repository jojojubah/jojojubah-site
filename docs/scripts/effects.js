// scripts/effects.js
// Handles visual effects like cursor trails, particles, and animations

export class EffectsService {
  constructor() {
    this.cursorTrail = {
      enabled: false,
      trail: [],
      maxLength: 20,
      color: '59,130,246', // Blue
      cleanup: null
    };
    
    this.particles = {
      enabled: false,
      container: null,
      particles: []
    };

    this.animations = {
      intersectionObserver: null,
      fadeElements: new Set()
    };
  }

  initialize() {
    this.setupCursorTrails();
    this.setupFadeInAnimations();
    this.setupParticles();
  }

  setupCursorTrails() {
    // Only enable on non-matrix pages to avoid conflicts
    if (this.isMatrixPage()) {
      console.log('Skipping cursor trails on matrix page');
      return;
    }

    this.cursorTrail.enabled = true;
    
    // Use passive event listener for better performance
    this.cursorTrail.cleanup = this.throttledMouseMove.bind(this);
    document.addEventListener('mousemove', this.cursorTrail.cleanup, { passive: true });
  }

  throttledMouseMove = (() => {
    let isAnimating = false;
    
    return (e) => {
      if (!this.cursorTrail.enabled || isAnimating) return;
      
      isAnimating = true;
      requestAnimationFrame(() => {
        this.updateCursorTrail(e.clientX, e.clientY);
        isAnimating = false;
      });
    };
  })();

  updateCursorTrail(x, y) {
    const trail = this.cursorTrail.trail;
    const maxLength = this.cursorTrail.maxLength;
    
    // Add new position
    trail.push({ x, y, timestamp: Date.now() });
    
    // Remove old positions
    if (trail.length > maxLength) {
      trail.shift();
    }

    // Clean up old trail dots
    this.cleanupOldTrailDots();
    
    // Create new trail dots
    this.createTrailDots();
  }

  cleanupOldTrailDots() {
    // Remove dots older than 100ms for performance
    const cutoff = Date.now() - 100;
    document.querySelectorAll('.cursor-trail').forEach(dot => {
      const timestamp = parseInt(dot.dataset.timestamp || '0');
      if (timestamp < cutoff) {
        dot.remove();
      }
    });
  }

  createTrailDots() {
    const trail = this.cursorTrail.trail;
    const color = this.cursorTrail.color;
    
    trail.forEach((point, index) => {
      const age = trail.length - index - 1;
      const opacity = Math.max(0, 0.5 - age * 0.025);
      const size = Math.max(1, 4 - age * 0.2);
      
      if (opacity <= 0) return;
      
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      dot.dataset.timestamp = point.timestamp.toString();
      dot.style.cssText = `
        position: fixed;
        left: ${point.x}px;
        top: ${point.y}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(${color}, ${opacity});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: opacity 0.1s ease;
      `;
      
      document.body.appendChild(dot);
      
      // Auto-remove after animation
      setTimeout(() => dot.remove(), 50);
    });
  }

  setupFadeInAnimations() {
    // Use Intersection Observer for better performance
    this.animations.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.animations.fadeElements.delete(entry.target);
          this.animations.intersectionObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-60px'
    });

    // Observe all fade-in elements
    this.refreshFadeInElements();
  }

  refreshFadeInElements() {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(element => {
      this.animations.fadeElements.add(element);
      this.animations.intersectionObserver.observe(element);
    });
  }

  setupParticles() {
    this.particles.container = document.getElementById('particles');
    if (!this.particles.container) return;

    // Particles are typically handled by CSS animations
    // This is a placeholder for future particle system implementation
    this.particles.enabled = true;
  }

  // Cursor trail controls
  enableCursorTrail() {
    if (this.isMatrixPage()) return false;
    
    this.cursorTrail.enabled = true;
    if (!this.cursorTrail.cleanup) {
      this.setupCursorTrails();
    }
    return true;
  }

  disableCursorTrail() {
    this.cursorTrail.enabled = false;
    this.cleanupAllTrailDots();
  }

  cleanupAllTrailDots() {
    document.querySelectorAll('.cursor-trail').forEach(dot => dot.remove());
    this.cursorTrail.trail = [];
  }

  setCursorTrailColor(color) {
    this.cursorTrail.color = color;
  }

  setCursorTrailLength(length) {
    this.cursorTrail.maxLength = Math.max(5, Math.min(50, length));
  }

  // Animation controls
  triggerFadeIn(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }

  resetFadeIn(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove('visible');
      this.animations.intersectionObserver.observe(el);
    });
  }

  // Utility methods
  isMatrixPage() {
    return !!(
      document.getElementById('matrix-canvas') ||
      /jubah-labs\.html$/i.test(location.pathname)
    );
  }

  // Create custom animations
  createPulseEffect(element, duration = 2000) {
    if (!element) return;
    
    element.style.animation = `assistantPulse ${duration}ms ease-in-out infinite`;
    
    return () => {
      element.style.animation = '';
    };
  }

  createSlideInEffect(element, direction = 'up', duration = 500) {
    if (!element) return;
    
    const transforms = {
      up: 'translateY(30px)',
      down: 'translateY(-30px)',
      left: 'translateX(30px)',
      right: 'translateX(-30px)'
    };
    
    const initialTransform = transforms[direction] || transforms.up;
    
    element.style.opacity = '0';
    element.style.transform = initialTransform;
    element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0) translateY(0)';
    });
  }

  // Performance controls
  enableReducedMotion() {
    document.body.style.setProperty('--reduced-motion', '1');
    this.disableCursorTrail();
  }

  disableReducedMotion() {
    document.body.style.removeProperty('--reduced-motion');
    this.enableCursorTrail();
  }

  // Status and cleanup
  getStatus() {
    return {
      cursorTrail: {
        enabled: this.cursorTrail.enabled,
        trailLength: this.cursorTrail.trail.length,
        color: this.cursorTrail.color
      },
      animations: {
        fadeElements: this.animations.fadeElements.size,
        observerActive: !!this.animations.intersectionObserver
      },
      particles: {
        enabled: this.particles.enabled
      },
      isMatrixPage: this.isMatrixPage()
    };
  }

  cleanup() {
    // Clean up cursor trails
    this.disableCursorTrail();
    if (this.cursorTrail.cleanup) {
      document.removeEventListener('mousemove', this.cursorTrail.cleanup);
    }

    // Clean up intersection observer
    if (this.animations.intersectionObserver) {
      this.animations.intersectionObserver.disconnect();
    }

    // Clear all trail dots
    this.cleanupAllTrailDots();
  }

  // Refresh system (useful after page changes)
  refresh() {
    this.cleanup();
    this.initialize();
  }
}

// Make available globally
window.EffectsService = EffectsService;
