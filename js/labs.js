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
    
    // Trigger AI Assistant tip when Matrix is enabled
    if (window.showTip) {
      setTimeout(() => window.showTip('matrixEnabled'), 1000);
    }
  }
  
  function stop(){ 
    if (intervalId){ clearInterval(intervalId); intervalId=null; } 
    ctx.clearRect(0,0,canvas.width,canvas.height); 
    canvas.style.display='none';
    
    // Trigger AI Assistant tip when Matrix is disabled
    if (window.showTip) {
      setTimeout(() => window.showTip('matrixDisabled'), 500);
    }
  }

  // Start ON by default (Labs opens dark mode)
  start();

  // Ensure toggle exists + move into .toggle-group
  var btn = document.getElementById('matrixToggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'matrixToggle';
  }
  var group = document.querySelector('.toggle-group');
  if (group && !group.contains(btn)) group.appendChild(btn); else if (!btn.isConnected) document.body.appendChild(btn);

  // Labels
  function setLabel(){ btn.textContent = intervalId ? '🟢 Matrix' : '⚫ Matrix'; }
  setLabel();
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