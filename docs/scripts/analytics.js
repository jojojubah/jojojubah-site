// scripts/analytics.js
// Handles cookie consent and Google Analytics loading

export class AnalyticsService {
  constructor() {
    this.measurementId = 'G-0ZM44HTK32';
    this.isLoaded = false;
    this.consentGiven = false;
    this.banner = null;
  }

  initialize() {
    this.checkExistingConsent();
    this.createConsentBanner();
    this.showConsentBannerIfNeeded();
    
    // Setup event listeners when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.hookBannerButtons());
    } else {
      this.hookBannerButtons();
    }
  }

  checkExistingConsent() {
    const consent = localStorage.getItem('cookieConsent');
    this.consentGiven = consent === 'accepted';
    
    if (this.consentGiven) {
      this.enableGoogleAnalytics();
    }
  }

  createConsentBanner() {
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
      </div>
    `;
    
    document.body.appendChild(banner);
    this.banner = banner;
  }

  showConsentBannerIfNeeded() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent && this.banner) {
      this.banner.style.display = 'block';
    }
  }

  enableGoogleAnalytics() {
    if (this.isLoaded) return;
    
    try {
      this.isLoaded = true;
      
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() { 
        window.dataLayer.push(arguments); 
      }
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', this.measurementId, { 
        anonymize_ip: true, 
        cookie_flags: 'secure;samesite=strict' 
      });

      console.log('✅ Google Analytics enabled');
      
    } catch (error) {
      console.error('Failed to load Google Analytics:', error);
      this.isLoaded = false;
    }
  }

  hookBannerButtons() {
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
    const learnMoreBtn = document.getElementById('learnMoreBtn');

    if (acceptBtn) {
      acceptBtn.onclick = () => this.acceptCookies();
    }

    if (declineBtn) {
      declineBtn.onclick = () => this.declineCookies();
    }

    if (learnMoreBtn) {
      learnMoreBtn.onclick = (e) => this.showLearnMoreModal(e);
    }
  }

  acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    this.consentGiven = true;
    this.hideBanner();
    this.enableGoogleAnalytics();
  }

  declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    this.consentGiven = false;
    this.hideBanner();
    console.log('❌ Analytics declined by user');
  }

  hideBanner() {
    if (this.banner) {
      this.banner.style.display = 'none';
    }
  }

  showLearnMoreModal(e) {
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
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => {
      if (modal && modal.parentNode) {
        modal.remove();
      }
    };
    
    // Close button
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // Click outside to close
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) closeModal();
    });
    
    // Escape key to close
    const handleEscape = (ev) => {
      if (ev.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Public methods for external use
  getStatus() {
    return {
      consentGiven: this.consentGiven,
      analyticsLoaded: this.isLoaded,
      bannerVisible: this.banner ? this.banner.style.display !== 'none' : false
    };
  }

  // Force consent (for testing)
  forceAccept() {
    this.acceptCookies();
  }

  forceDecline() {
    this.declineCookies();
  }

  // Reset consent (for testing)
  resetConsent() {
    localStorage.removeItem('cookieConsent');
    this.consentGiven = false;
    this.isLoaded = false;
    location.reload();
  }
}
