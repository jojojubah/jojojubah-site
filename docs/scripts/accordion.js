// scripts/accordion.js
// Handles accordion functionality with progress tracking and easter eggs

export class AccordionService {
  constructor() {
    this.accordions = new Map();
    this.progressTrackers = new Map();
    this.toastElements = new Map();
  }

  initialize() {
    this.setupLearnAccordion();
    this.setupEconomicsAccordions();
    this.wireAllAccordionItems();
  }

  setupLearnAccordion() {
    const learnContainer = document.getElementById('learnAccordion');
    const learnToast = document.getElementById('learnToast');
    
    if (!learnContainer) return;

    const items = Array.from(learnContainer.querySelectorAll('.acc-item'));
    
    this.accordions.set('learn', {
      container: learnContainer,
      items: new Set(items),
      unlocked: false
    });

    if (learnToast) {
      this.toastElements.set('learn', learnToast);
    }

    this.progressTrackers.set('learn', new Set());
  }

  setupEconomicsAccordions() {
    const econLeft = document.getElementById('econGlossaryLeft');
    const econRight = document.getElementById('econGlossaryRight');
    const econToast = document.getElementById('econToast');

    const econItems = [
      ...(econLeft ? econLeft.querySelectorAll('.acc-item') : []),
      ...(econRight ? econRight.querySelectorAll('.acc-item') : [])
    ];

    if (econItems.length > 0) {
      this.accordions.set('economics', {
        containers: [econLeft, econRight].filter(Boolean),
        items: new Set(econItems),
        unlocked: false
      });

      if (econToast) {
        this.toastElements.set('economics', econToast);
      }

      this.progressTrackers.set('economics', new Set());
    }
  }

  wireAllAccordionItems() {
    // Find all accordion items and wire them
    document.querySelectorAll('.acc-item').forEach(item => {
      this.wireAccordionItem(item);
    });
  }

  wireAccordionItem(item) {
    const header = item.querySelector('.acc-header');
    const panel = item.querySelector('.acc-content');
    
    if (!header || !panel) return;

    // Set initial state
    item.classList.remove('open');
    this.setPanelHeight(panel, false);
    header.setAttribute('aria-expanded', 'false');

    // Add click handler
    header.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      header.setAttribute('aria-expanded', String(isOpen));
      this.setPanelHeight(panel, isOpen);

      if (isOpen) {
        this.handleItemOpened(item);
      }
    });

    // Add keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  }

  setPanelHeight(panel, open) {
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0';
    }
  }

  handleItemOpened(item) {
    // Check which accordion this item belongs to
    const accordionType = this.getAccordionType(item);
    
    if (accordionType) {
      this.trackProgress(accordionType, item);
    }
  }

  getAccordionType(item) {
    // Check if item belongs to learn accordion
    const learnAcc = this.accordions.get('learn');
    if (learnAcc?.items.has(item)) {
      return 'learn';
    }

    // Check if item belongs to economics accordion
    const econAcc = this.accordions.get('economics');
    if (econAcc?.items.has(item)) {
      return 'economics';
    }

    return null;
  }

  trackProgress(accordionType, item) {
    const accordion = this.accordions.get(accordionType);
    const tracker = this.progressTrackers.get(accordionType);
    
    if (!accordion || !tracker) return;

    // Add to progress tracker
    tracker.add(item);

    // Check if all items have been opened
    if (tracker.size >= accordion.items.size && !accordion.unlocked) {
      accordion.unlocked = true;
      this.handleAccordionCompleted(accordionType);
    }
  }

  handleAccordionCompleted(accordionType) {
    console.log(`🎉 ${accordionType} accordion completed!`);

    switch (accordionType) {
      case 'learn':
        this.unlockLearnBonus();
        this.showToast('learn');
        break;
      case 'economics':
        this.showToast('economics');
        break;
    }
  }

  unlockLearnBonus() {
    const learnContainer = this.accordions.get('learn')?.container;
    if (!learnContainer || document.getElementById('acc-item-bonus')) return;

    const bonusHTML = `
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
              <a class="btn" href="jubah-labs.html">Open JubahLabs</a>
            </div>
          </div>
        </div>
      </div>
    `;

    learnContainer.insertAdjacentHTML('beforeend', bonusHTML);
    
    // Wire the new bonus item
    const bonusItem = document.getElementById('acc-item-bonus');
    if (bonusItem) {
      this.wireAccordionItem(bonusItem);
      
      // Add subtle animation
      bonusItem.style.opacity = '0';
      bonusItem.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        bonusItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        bonusItem.style.opacity = '1';
        bonusItem.style.transform = 'translateY(0)';
      });
    }
  }

  showToast(toastType) {
    const toastElement = this.toastElements.get(toastType);
    if (!toastElement) return;

    toastElement.classList.add('show');
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      toastElement.classList.remove('show');
    }, 6000);
  }

  // Public API methods

  // Open a specific accordion item
  openItem(itemId) {
    const item = document.getElementById(itemId);
    if (!item || item.classList.contains('open')) return false;

    const header = item.querySelector('.acc-header');
    if (header) {
      header.click();
      return true;
    }
    return false;
  }

// Make available globally
window.AccordionService = AccordionService;
