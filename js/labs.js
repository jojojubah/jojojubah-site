// Jubah Labs — Matrix rain (theme-aware) + toggle integration + AI Assistant compatibility
(function () {
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  // Palette from CSS variables (updates when theme changes)
  var MATRIX_COLOR = '#00ff41';
  var GLOW_COLOR   = 'rgba(0,0,0,0)';
  var BG_FADE      = 'rgba(0,0,0,0.07)';
  var useGlow = false;

  function updatePalette(){
    var cs = getComputedStyle(document.body);
    MATRIX_COLOR = (cs.getPropertyValue('--matrix-color') || '#00ff41').trim();
    GLOW_COLOR   = (cs.getPropertyValue('--matrix-glow')  || 'rgba(0,0,0,0)').trim();
    BG_FADE      = (cs.getPropertyValue('--matrix-fade')  || 'rgba(0,0,0,0.07)').trim();
    useGlow = !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/i.test(GLOW_COLOR) && !/^\s*$/.test(GLOW_COLOR);
  }
  updatePalette();
  new MutationObserver(updatePalette).observe(document.body, { attributes:true, attributeFilter:['data-theme'] });

  var characters = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var drops = [], rowStep = 16, speedMs = 75, intervalId = null, lastW = 0, lastH = 0;

  function resize(keep) {
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var w = Math.floor(document.documentElement.clientWidth);
    var h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cols = Math.ceil(w / rowStep);
    if (keep && drops.length) {
      var next = new Array(cols).fill(0);
      for (var i = 0; i < Math.min(cols, drops.length); i++) next[i] = drops[i];
      drops = next;
    } else {
      drops = Array(cols).fill(0);
    }
    lastW = w; lastH = h;
  }
  resize(true);

  window.addEventListener('resize', (function(){
    var t;
    return function(){
      var w = window.innerWidth, h = window.innerHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 120) return;
      clearTimeout(t); t = setTimeout(function(){ resize(true); }, 120);
    };
  })());

  function draw() {
    // trail fade
    ctx.fillStyle = BG_FADE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // optional glow
    ctx.shadowColor = GLOW_COLOR;
    ctx.shadowBlur = useGlow ? 8 : 0;

    // glyphs
    ctx.fillStyle = MATRIX_COLOR;
    ctx.font = '20px monospace';

    for (var x = 0; x < drops.length; x++) {
      var ch = characters[Math.floor(Math.random() * characters.length)];
      var y = drops[x];
      ctx.fillText(ch, x * rowStep, y * rowStep);

      if (y * rowStep > canvas.height && Math.random() > 0.975) drops[x] = 0;
      else drops[x] = y + 1;
    }
  }

  function start(){ 
    if (!intervalId) intervalId = setInterval(draw, speedMs); 
    canvas.style.display=''; 
    // Save Matrix enabled state
    localStorage.setItem('matrix-rain-preference', 'enabled');
    
    // Trigger AI Assistant tip when Matrix is enabled
    if (window.showTip) {
      setTimeout(() => window.showTip('matrixEnabled'), 1000);
    }
  }
  
  function stop(){ 
    if (intervalId){ clearInterval(intervalId); intervalId=null; } 
    ctx.clearRect(0,0,canvas.width,canvas.height); 
    canvas.style.display='none';
    // Save Matrix disabled state
    localStorage.setItem('matrix-rain-preference', 'disabled');
    
    // Trigger AI Assistant tip when Matrix is disabled
    if (window.showTip) {
      setTimeout(() => window.showTip('matrixDisabled'), 500);
    }
  }

  // Start Matrix based on saved Matrix preference (default ON for labs)
  const savedMatrixPreference = localStorage.getItem('matrix-rain-preference');
  if (savedMatrixPreference === null || savedMatrixPreference === 'enabled') {
    // Default to enabled, or use saved 'enabled' preference
    start();
  } else if (savedMatrixPreference === 'disabled') {
    // User has explicitly disabled Matrix rain
    // Don't start
  }

  // Ensure toggle exists + move into .toggle-group
  var btn = document.getElementById('matrixToggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'matrixToggle';
  }
  var group = document.querySelector('.toggle-group');
  if (group && !group.contains(btn)) group.appendChild(btn); else if (!btn.isConnected) document.body.appendChild(btn);

  // Labels - check current state including saved preference
  function setLabel(){ 
    const savedMatrixPreference = localStorage.getItem('matrix-rain-preference');
    const isRunning = intervalId !== null;
    // Update button text based on actual running state
    btn.textContent = isRunning ? '🟢 Matrix' : '⚫ Matrix'; 
  }
  
  // Set initial label based on current state
  setTimeout(setLabel, 100); // Small delay to ensure Matrix state is initialized
  btn.addEventListener('click', function(){
    if (intervalId) stop(); else start();
    setLabel();
    
    // Integrate with theme toggle for AI tips
    if (window.showTip) {
      window.showTip('matrixToggle');
    }
  });

  // Expose Matrix controls globally for AI Assistant integration
  window.matrixControls = {
    isRunning: function() { return !!intervalId; },
    toggle: function() { btn.click(); },
    start: start,
    stop: stop,
    getSettings: function() {
      return {
        running: !!intervalId,
        speed: speedMs,
        characters: characters.length,
        columns: drops.length,
        color: MATRIX_COLOR
      };
    },
    updateSpeed: function(newSpeed) {
      if (newSpeed >= 25 && newSpeed <= 200) {
        speedMs = newSpeed;
        if (intervalId) {
          stop();
          start();
        }
      }
    }
  };

})();

// Enhanced Labs Tips for AI Assistant
(function enhanceLabsTips() {
  // Wait for the main app to load tips
  setTimeout(function() {
    if (window.showTip && typeof window.showTip === 'function') {
      // Add Matrix-specific tips to the existing tips system
      var labsTips = {
        'matrixEnabled': '🟢 Matrix rain activated! The AI assistant works great with this cyber aesthetic.',
        'matrixDisabled': '⚫ Matrix rain paused. Click 🟢 Matrix to bring back the digital rain.',
        'matrixToggle': '🎛️ Nice! You can control Matrix effects. Try asking the AI about the Matrix theme!',
        'labsWelcome': '🧪 Welcome to Jubah Labs! This is my experimental space with Matrix themes and AI assistance.',
        'aiLabsDemo': '🤖 The AI assistant knows all about these lab experiments. Try asking about any project!',
        'matrixChat': '💚 Matrix mode + AI chat = ultimate hacker vibe. Ask me anything about the experiments!'
      };

      // Extend the existing tips system
      var originalShowTip = window.showTip;
      window.showTip = function(key) {
        if (labsTips[key]) {
          var bubble = document.getElementById('assistantBubble');
          var textEl = document.getElementById('assistantText');
          if (textEl && bubble) {
            textEl.textContent = labsTips[key];
            bubble.classList.add('show');
            setTimeout(() => bubble.classList.remove('show'), 8000);
          }
        } else {
          originalShowTip(key);
        }
      };

      // Welcome tip for Labs page
      setTimeout(() => window.showTip('labsWelcome'), 2000);
    }
  }, 1000);
})();

// Matrix-aware AI Assistant enhancements
(function matrixAIEnhancements() {
  document.addEventListener('DOMContentLoaded', function() {
    // Check if AI Assistant chat is opened
    var chatOpenObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          var chat = document.getElementById('assistantChat');
          if (chat && chat.classList.contains('show')) {
            // AI chat opened in Matrix environment
            setTimeout(() => {
              if (window.showTip) window.showTip('matrixChat');
            }, 1500);
          }
        }
      });
    });

    var assistantChat = document.getElementById('assistantChat');
    if (assistantChat) {
      chatOpenObserver.observe(assistantChat, { attributes: true });
    }

    // Matrix theme detection for AI responses
    window.isMatrixTheme = function() {
      return document.body.hasAttribute('data-theme') && 
             document.body.getAttribute('data-theme') === 'dark' &&
             document.getElementById('matrix-canvas') &&
             window.matrixControls && window.matrixControls.isRunning();
    };

    // Add Matrix context to AI conversations
    if (window.jojoAssistant) {
      var originalSendMessage = window.jojoAssistant.sendMessage;
      if (originalSendMessage) {
        window.jojoAssistant.sendMessage = function() {
          // Add Matrix context to conversation if in Matrix mode
          if (window.isMatrixTheme && window.isMatrixTheme()) {
            this.conversationHistory.push({
              role: 'system',
              parts: [{ text: 'User is currently in Jubah Labs with Matrix theme active - respond with appropriate cyber/hacker aesthetic awareness when relevant.' }]
            });
          }
          return originalSendMessage.call(this);
        };
      }
    }
  });
})();

// Difficulty Accordion Functionality
function toggleAccordion(button) {
  const accordion = button.parentElement;
  const content = accordion.querySelector('.difficulty-content');
  const isOpen = accordion.classList.contains('open');
  
  // Close all other accordions
  document.querySelectorAll('.difficulty-accordion.open').forEach(otherAccordion => {
    if (otherAccordion !== accordion) {
      otherAccordion.classList.remove('open');
      const otherContent = otherAccordion.querySelector('.difficulty-content');
      if (otherContent) {
        otherContent.style.maxHeight = '0';
      }
    }
  });
  
  // Toggle current accordion
  if (isOpen) {
    accordion.classList.remove('open');
    content.style.maxHeight = '0';
  } else {
    accordion.classList.add('open');
    content.style.maxHeight = content.scrollHeight + 'px';
    
    // Show AI Assistant tip for first accordion open
    if (window.showTip) {
      setTimeout(() => window.showTip('jailbreakResearch'), 500);
    }
  }
}

// Enhanced Labs Tips for Jailbreaking Research
(function enhanceJailbreakTips() {
  setTimeout(function() {
    if (window.showTip && typeof window.showTip === 'function') {
      // Add jailbreaking research tips
      const jailbreakTips = {
        'jailbreakResearch': '🔍 Exploring LLM safety mechanisms! This research helps understand defensive AI alignment.',
        'difficultyRating': '⭐ Each star represents how robust the model\'s safety training is against prompt injection attempts.',
        'ethicalResearch': '🛡️ Remember: This research is for defensive security and educational purposes only.'
      };

      // Extend the existing tips system
      var originalShowTip = window.showTip;
      window.showTip = function(key) {
        if (jailbreakTips[key]) {
          var bubble = document.getElementById('assistantBubble');
          var textEl = document.getElementById('assistantText');
          if (textEl && bubble) {
            textEl.textContent = jailbreakTips[key];
            bubble.classList.add('show');
            setTimeout(() => bubble.classList.remove('show'), 8000);
          }
        } else {
          originalShowTip(key);
        }
      };
    }
  }, 1000);
})();

// ==================== NASA APOD Functionality ==================== 
(function nasaAPOD() {
  // Wait for DOM to load
  document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dateInput = document.getElementById('apod-date');
    const loadBtn = document.getElementById('load-apod-btn');
    const retryBtn = document.getElementById('retry-apod-btn');
    const loading = document.getElementById('apod-loading');
    const display = document.getElementById('apod-display');
    const error = document.getElementById('apod-error');
    
    // Display elements
    const title = document.getElementById('apod-title');
    const dateDisplay = document.getElementById('apod-date-display');
    const img = document.getElementById('apod-img');
    const videoContainer = document.getElementById('apod-video-container');
    const video = document.getElementById('apod-video');
    const desc = document.getElementById('apod-desc');
    const credit = document.getElementById('apod-credit');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Your Firebase Function URL (will be updated after deployment)
    const FIREBASE_FUNCTION_URL = 'https://us-central1-jojojubah-f2996.cloudfunctions.net/nasaApod';

    // Load APOD data
    async function loadAPOD(date = '') {
      showState('loading');
      
      try {
        const url = date ? `${FIREBASE_FUNCTION_URL}?date=${date}` : FIREBASE_FUNCTION_URL;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle potential error response from our function
        if (data.error) {
          throw new Error(data.error);
        }
        
        displayAPOD(data);
        showState('display');
        
        // Show AI Assistant tip for successful load
        if (window.showTip) {
          setTimeout(() => window.showTip('nasaLoaded'), 1000);
        }
        
      } catch (err) {
        console.error('NASA APOD Error:', err);
        showState('error');
        
        // Show AI Assistant tip for error
        if (window.showTip) {
          setTimeout(() => window.showTip('nasaError'), 500);
        }
      }
    }

    // Display APOD data
    function displayAPOD(data) {
      title.textContent = data.title || 'Untitled';
      dateDisplay.textContent = data.date ? `Date: ${data.date}` : '';
      desc.textContent = data.explanation || 'No description available.';
      
      // Handle copyright/credit
      if (data.copyright) {
        credit.textContent = `© ${data.copyright}`;
        credit.style.display = 'block';
      } else {
        credit.style.display = 'none';
      }

      // Handle media (image vs video)
      if (data.media_type === 'video') {
        img.style.display = 'none';
        videoContainer.style.display = 'block';
        video.src = data.url;
      } else {
        videoContainer.style.display = 'none';
        img.style.display = 'block';
        img.src = data.url || data.hdurl || '';
        img.alt = data.title || 'NASA APOD';
      }
    }

    // Show different states
    function showState(state) {
      loading.style.display = state === 'loading' ? 'block' : 'none';
      display.style.display = state === 'display' ? 'block' : 'none';
      error.style.display = state === 'error' ? 'block' : 'none';
    }

    // Event listeners
    loadBtn.addEventListener('click', () => {
      const selectedDate = dateInput.value;
      loadAPOD(selectedDate);
    });

    retryBtn.addEventListener('click', () => {
      const selectedDate = dateInput.value;
      loadAPOD(selectedDate);
    });

    // Load today's APOD on page load
    setTimeout(() => loadAPOD(), 1000);

    // Date input change
    dateInput.addEventListener('change', () => {
      loadBtn.textContent = 'Load Image';
      loadBtn.style.background = 'var(--primary)';
    });

    // Keyboard shortcut: Enter to load
    dateInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loadBtn.click();
      }
    });

    // Enhanced Labs Tips for NASA APOD
    setTimeout(function() {
      if (window.showTip && typeof window.showTip === 'function') {
        const nasaTips = {
          'nasaLoaded': '🚀 Cosmic discovery loaded! NASA\'s daily space imagery is simply breathtaking.',
          'nasaError': '🛸 Houston, we have a problem! The space connection seems disrupted. Try again in a moment.',
          'nasaDatePicker': '📅 Time travel through space! Pick any date since June 16, 1995 to explore NASA\'s archive.',
          'nasaVideo': '🎬 Sometimes NASA features space videos instead of images - prepare to be amazed!'
        };

        // Extend the existing tips system
        const originalShowTip = window.showTip;
        window.showTip = function(key) {
          if (nasaTips[key]) {
            const bubble = document.getElementById('assistantBubble');
            const textEl = document.getElementById('assistantText');
            if (textEl && bubble) {
              textEl.textContent = nasaTips[key];
              bubble.classList.add('show');
              setTimeout(() => bubble.classList.remove('show'), 8000);
            }
          } else {
            originalShowTip(key);
          }
        };
      }
    }, 1000);
  });
})();
// ================== /NASA APOD Functionality =====================
