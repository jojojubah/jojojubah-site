// scripts/navigation.js
// Handles navigation, scroll effects, and mobile menu

export class NavigationService {
  constructor() {
    this.navbar = null;
    this.scrollIndicator = null;
    this.navLinks = [];
    this.sections = [];
    this.mobileMenuBtn = null;
    this.navLinksContainer = null;
    
    // Throttling for performance
    this.isScrolling = false;
    this.lastScrollY = 0;
  }

  initialize() {
    this.findDOMElements();
    this.setupEventListeners();
    this.setupMobileMenu();
    this.initialScrollCheck();
  }

  findDOMElements() {
    this.navbar = document.getElementById('navbar');
    this.scrollIndicator = document.getElementById('scrollIndicator');
    this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
    this.sections = Array.from(document.querySelectorAll('section'));
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.navLinksContainer = document.querySelector('.nav-links');
  }

  setupEventListeners() {
    // Throttled scroll handler for performance
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        requestAnimationFrame(() => {
          this.handleScroll();
          this.isScrolling = false;
        });
        this.isScrolling = true;
      }
    }, { passive: true });

    // Close mobile menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMobileMenuOpen() && 
          !this.navLinksContainer?.contains(e.target) && 
          !this.mobileMenuBtn?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key for mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });
  }

  handleScroll() {
    const y = window.scrollY || window.pageYOffset;
    this.lastScrollY = y;

    this.updateNavbarBackground(y);
    this.updateScrollIndicator(y);
    this.updateActiveNavLink(y);
    this.handleFadeInAnimations();
  }

  updateNavbarBackground(scrollY) {
    if (this.navbar) {
      this.navbar.classList.toggle('scrolled', scrollY > 20);
    }
  }

  updateScrollIndicator(scrollY) {
    if (!this.scrollIndicator) return;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    this.scrollIndicator.style.width = `${Math.min(percentage, 100)}%`;
  }

  updateActiveNavLink(scrollY) {
    if (this.navLinks.length === 0 || this.sections.length === 0) return;

    let currentSection = '';
    const offset = window.innerHeight / 3; // Adjust this for earlier/later activation
    const threshold = scrollY + offset;

    // Find the current section
    this.sections.forEach(section => {
      if (section.offsetTop <= threshold) {
        currentSection = section.id;
      }
    });

    // Update active nav link
    this.navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentSection}`;
      link.classList.toggle('active', isActive);
    });
  }

  handleFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');
    const threshold = window.innerHeight - 60;

    fadeElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top < threshold) {
        element.classList.add('visible');
      }
    });
  }

  setupMobileMenu() {
    if (!this.mobileMenuBtn || !this.navLinksContainer) return;

    this.mobileMenuBtn.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Add proper ARIA attributes
    this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    this.mobileMenuBtn.setAttribute('aria-controls', 'nav-menu');
    this.navLinksContainer.id = 'nav-menu';
  }

  toggleMobileMenu() {
    if (!this.mobileMenuBtn || !this.navLinksContainer) return;

    const isOpen = this.isMobileMenuOpen();
    
    this.mobileMenuBtn.classList.toggle('active', !isOpen);
    this.navLinksContainer.classList.toggle('active', !isOpen);
    
    // Update ARIA
    this.mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    
    // Manage focus for accessibility
    if (!isOpen) {
      // Menu is being opened
      this.navLinksContainer.querySelector('.nav-link')?.focus();
    }
  }

  openMobileMenu() {
    if (this.isMobileMenuOpen()) return;
    this.toggleMobileMenu();
  }

  closeMobileMenu() {
    if (!this.isMobileMenuOpen()) return;
    this.toggleMobileMenu();
  }

  isMobileMenuOpen() {
    return this.mobileMenuBtn?.classList.contains('active') || false;
  }

  initialScrollCheck() {
    // Call scroll handler once to set initial state
    this.handleScroll();
  }

  // Smooth scroll to section with offset for fixed navbar
  scrollToSection(sectionId, offset = 96) {
    const element = document.getElementById(sectionId);
    if (!element) return false;

    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    return true;
  }

  // Get current section
  getCurrentSection() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let current = '';

    this.sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    return current;
  }

  // Update scroll indicator manually (for testing)
  updateScrollProgress(percentage) {
    if (this.scrollIndicator) {
      this.scrollIndicator.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
    }
  }

  // Get navigation state
  getState() {
    return {
      currentSection: this.getCurrentSection(),
      scrollPosition: this.lastScrollY,
      mobileMenuOpen: this.isMobileMenuOpen(),
      navbarScrolled: this.navbar?.classList.contains('scrolled') || false
    };
  }

  // Refresh navigation (useful after dynamic content changes)
  refresh() {
    this.findDOMElements();
    this.initialScrollCheck();
  }
}
