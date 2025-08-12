// GDPR Cookie Consent & Analytics Script - ADDED AT END (changed from <!--)
  
    // Cookie Consent & Analytics Management
    (function() {
      const MEASUREMENT_ID = 'G-0ZM44HTK32';
      
      // Show banner only if user hasn't made a choice
      function showConsentBanner() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
          document.getElementById('cookieConsentBanner').style.display = 'block';
        } else if (consent === 'accepted') {
          enableGoogleAnalytics();
        }
      }

      // Load Google Analytics when user accepts
      function enableGoogleAnalytics() {
        if (window.GA_LOADED) return; // Prevent double loading
        window.GA_LOADED = true;
        
        // Load Google Analytics script
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);

        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', MEASUREMENT_ID, {
          anonymize_ip: true, // GDPR compliance
          cookie_flags: 'secure;samesite=strict' // Enhanced security
        });
        
        console.log('✅ Google Analytics enabled');
      }

      // Handle Accept button
      document.getElementById('acceptCookies').onclick = function() {
        localStorage.setItem('cookieConsent', 'accepted');
        document.getElementById('cookieConsentBanner').style.display = 'none';
        enableGoogleAnalytics();
      };

      // Handle Decline button
      document.getElementById('declineCookies').onclick = function() {
        localStorage.setItem('cookieConsent', 'declined');
        document.getElementById('cookieConsentBanner').style.display = 'none';
        console.log('❌ Analytics declined by user');
      };

      // Initialize on page load
      showConsentBanner();
    })();

    // Learn More Modal functionality
function showLearnMoreModal() {
  const modalHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="learn-more-modal">
        <button class="close-btn" id="closeModal">&times;</button>
        <h3>🍪 Why Accept Cookies?</h3>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
          We use Google Analytics to understand which content you love most, so we can create better tutorials and projects for you! 🎯<br><br>
          
          ✅ Helps us improve your experience<br>
          ✅ Shows us which tutorials are most helpful<br>
          ✅ Completely anonymous - no personal data collected<br>
          ✅ You can change your mind anytime<br><br>
          
          <strong style="color: var(--accent-primary);">Choose 'Accept' to help us make better content for creators like you!</strong>
        </p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Close modal handlers
  document.getElementById('closeModal').onclick = closeLearnMoreModal;
  document.getElementById('modalOverlay').onclick = function(e) {
    if (e.target === this) closeLearnMoreModal();
  };
}

function closeLearnMoreModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.remove();
}

// Add learn more click handler
document.getElementById('learnMoreBtn').onclick = function(e) {
  e.preventDefault();
  showLearnMoreModal();
};
    // Enhanced JavaScript with modern animations and effects (EXISTING CODE CONTINUES)
    document.addEventListener('DOMContentLoaded', function() {
      // Elements
      const navbar = document.getElementById('navbar');
      const scrollIndicator = document.getElementById('scrollIndicator');
      const navLinks = document.querySelectorAll('.nav-link');
      const sections = document.querySelectorAll('section');
      const fadeElements = document.querySelectorAll('.fade-in');
      const particlesContainer = document.getElementById('particles');

      // Create floating particles
      function createParticles() {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 20 + 's';
          particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
          particlesContainer.appendChild(particle);
        }
      }

      // Scroll indicator
      function updateScrollIndicator() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollIndicator.style.width = scrollPercentage + '%';
      }

      // Navbar scroll effect
      function handleNavbarScroll() {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Active section highlighting
      function highlightActiveSection() {
        let current = '';
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
          }
        });
      }

      // Intersection Observer for fade-in animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      fadeElements.forEach(element => {
        observer.observe(element);
      });

      // Smooth scrolling for navigation links
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetSection = document.querySelector(targetId);
          
          if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        });
      });

      // Mobile menu functionality
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const navLinksContainer = document.querySelector('.nav-links');

      mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
      });

      // Parallax effect for hero section
      function handleParallax() {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const parallaxSpeed = 0.5;
        
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
      }

      // Throttled scroll handler
      let ticking = false;
      function handleScroll() {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateScrollIndicator();
            handleNavbarScroll();
            highlightActiveSection();
            handleParallax();
            ticking = false;
          });
          ticking = true;
        }
      }

      // Event listeners
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('load', () => {
        createParticles();
        handleScroll();
      });

      // Enhanced hover effects for project cards
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
        });
      });

      // Social link hover effects
      const socialLinks = document.querySelectorAll('.social-link');
      socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-8px) scale(1.15) rotate(5deg)';
        });
        
        link.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        });
      });

      // Typing effect for hero subtitle
      const subtitle = document.querySelector('.hero-subtitle');
      if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        let i = 0;
        
        setTimeout(() => {
          const typeInterval = setInterval(() => {
            if (i < text.length) {
              subtitle.textContent += text.charAt(i);
              i++;
            } else {
              clearInterval(typeInterval);
            }
          }, 50);
        }, 1500);
      }
      // Add cursor trail effect
      let trail = [];
      const trailLength = 20;

      document.addEventListener('mousemove', function(e) {
        trail.push({ x: e.clientX, y: e.clientY });
        if (trail.length > trailLength) {
          trail.shift();
        }
        
        // Create or update trail elements
        const existingTrails = document.querySelectorAll('.cursor-trail');
        existingTrails.forEach(el => el.remove());
        
        trail.forEach((point, index) => {
          const trailElement = document.createElement('div');
          trailElement.className = 'cursor-trail';
          trailElement.style.cssText = `
            position: fixed;
            left: ${point.x}px;
            top: ${point.y}px;
            width: ${4 - (index * 0.2)}px;
            height: ${4 - (index * 0.2)}px;
            background: rgba(59, 130, 246, ${0.5 - (index * 0.025)});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease-out;
          `;
          document.body.appendChild(trailElement);
          
          setTimeout(() => {
            if (trailElement.parentNode) {
              trailElement.remove();
            }
          }, 100);
        });
      });
    // Mobile touch effects - particles and trail only
      
      // Touch trail (like cursor trail but for touch)
      let touchTrail = [];

      function createTouchTrail(x, y) {
        touchTrail.push({ x, y, timestamp: Date.now() });
        
        // Remove old trail points
        touchTrail = touchTrail.filter(point => Date.now() - point.timestamp < 800);
        
        // Clean up existing trail elements
        const existingTrails = document.querySelectorAll('.touch-trail');
        existingTrails.forEach(el => el.remove());
        
        // Create new trail
        touchTrail.forEach((point, index) => {
          const trailElement = document.createElement('div');
          const age = Date.now() - point.timestamp;
          const opacity = Math.max(0, 1 - (age / 800));
          const size = Math.max(2, 12 - (index * 1.5));
          
          trailElement.className = 'touch-trail';
          trailElement.style.cssText = `
            position: fixed;
            left: ${point.x - size/2}px;
            top: ${point.y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            background: rgba(6, 182, 212, ${opacity * 0.7});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transition: all 0.1s ease-out;
          `;
          document.body.appendChild(trailElement);
        });
      }

      // Particle burst on tap
      function createParticleBurst(x, y) {
        const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981'];
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          const angle = (360 / particleCount) * i;
          const velocity = 30 + Math.random() * 20;
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          particle.className = 'touch-particle';
          particle.style.cssText = `
            position: fixed;
            left: ${x - 3}px;
            top: ${y - 3}px;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9997;
            animation: particleBurst${i} 0.8s ease-out forwards;
          `;
          
          // Create unique animation for each particle
          const keyframes = `
            @keyframes particleBurst${i} {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${Math.cos(angle * Math.PI / 180) * velocity}px, 
                                   ${Math.sin(angle * Math.PI / 180) * velocity}px) scale(0);
                opacity: 0;
              }
            }
          `;
          
          // Add keyframes to document
          if (!document.querySelector(`#particle-keyframes-${i}`)) {
            const style = document.createElement('style');
            style.id = `particle-keyframes-${i}`;
            style.textContent = keyframes;
            document.head.appendChild(style);
          }
          
          document.body.appendChild(particle);
          
          setTimeout(() => {
            if (particle.parentNode) {
              particle.remove();
            }
          }, 800);
        }
      }

      // Detect mobile and add touch events
      function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0);
      }

      if (isMobile()) {
        // Touch start - create particle burst
        document.addEventListener('touchstart', function(e) {
          const touch = e.touches[0];
          createParticleBurst(touch.clientX, touch.clientY);
        });

        // Touch move - create trail
        document.addEventListener('touchmove', function(e) {
          const touch = e.touches[0];
          createTouchTrail(touch.clientX, touch.clientY);
        });

        // Disable cursor trail on mobile to save performance
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
          @media (max-width: 768px) {
            .cursor-trail {
              display: none !important;
            }
          }
        `;
        document.head.appendChild(mobileStyles);
      }
    });
  
