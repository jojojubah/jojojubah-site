// app.js (module entry point)
// Imports (ESM) — paths match the new /scripts folder
import { AnalyticsService }  from './scripts/analytics.js';
import { ThemeService }      from './scripts/theme.js';
import { NavigationService } from './scripts/navigation.js';
import { AccordionService }  from './scripts/accordion.js';
import { EffectsService }    from './scripts/effects.js';
import { UtilsService }      from './scripts/utils.js';

// Create singletons
const analyticsService  = new AnalyticsService();
const themeService      = new ThemeService();
const navigationService = new NavigationService();
const accordionService  = new AccordionService();
const effectsService    = new EffectsService();
const utilsService      = new UtilsService();

// Expose for quick debugging (optional)
window.analyticsService  = analyticsService;
window.themeService      = themeService;
window.navigationService = navigationService;
window.accordionService  = accordionService;
window.effectsService    = effectsService;
window.utilsService      = utilsService;

// Init after DOM is ready (defer is not needed with modules, but safe)
const start = () => {
  // Order matters a little: utils/theme first, then nav/effects/accordion, then analytics
  utilsService.initialize();          // email reveal, footer year, shortcuts
  themeService.initialize();          // theme button + initial theme
  navigationService.initialize();     // navbar scroll, mobile menu
  effectsService.initialize();        // fade-ins, cursor trails, particles
  accordionService.initialize();      // wire accordions + toasts
  analyticsService.initialize();      // cookie banner + GA (only if accepted)
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
