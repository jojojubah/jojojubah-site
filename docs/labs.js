// Jubah Labs — Matrix rain with softer teal-green + theme-safe fade
// Works even if the toggle/button isn't present. No HTML edits required.
(function () {
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  // Palette tuned to avoid clash with dark-neumorphism panels
  var MATRIX_COLOR   = 'rgba(84, 255, 190, 0.85)';   // soft neon teal-green
  var GLOW_COLOR     = 'rgba(120, 255, 210, 0.25)';  // subtle glow halo
  var BG_FADE        = 'rgba(8, 12, 22, 0.07)';      // gentle bluish fade instead of pure black
  var TRAIL_FADE_END = 'rgba(8, 12, 22, 0.18)';      // for heavier refresh on mobile

  var characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  var drops = [], columns = 0;
  var speedMs = 70;           // slightly faster
  var rowStep = 16;
  var lastW = 0, lastH = 0, intervalId = null;

  function resize(keepState) {
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var w = Math.floor(document.documentElement.clientWidth);
    var h = Math.floor(window.innerHeight);

    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var newCols = Math.ceil(w / rowStep);
    if (keepState && drops.length) {
      var next = new Array(newCols).fill(0);
      for (var i = 0; i < Math.min(newCols, drops.length); i++) next[i] = drops[i];
      drops = next;
      columns = newCols;
    } else {
      columns = newCols;
      drops = Array(columns).fill(0);
    }
    lastW = w; lastH = h;
  }
  resize(true);

  window.addEventListener('resize', (function () {
    var t;
    return function () {
      var w = window.innerWidth, h = window.innerHeight;
      var widthChanged  = Math.abs(w - lastW) > 2;
      var heightChanged = Math.abs(h - lastH) > 120;
      if (!widthChanged && !heightChanged) return;
      clearTimeout(t);
      t = setTimeout(function(){ resize(true); }, 120);
    };
  })());

  function draw() {
    // fade the whole canvas to give the trailing effect
    ctx.fillStyle = BG_FADE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // main matrix glyphs
    ctx.shadowColor = GLOW_COLOR;
    ctx.shadowBlur = 8;
    ctx.fillStyle = MATRIX_COLOR;
    ctx.font = '20px monospace';

    for (var x = 0; x < drops.length; x++) {
      var char = characters[Math.floor(Math.random() * characters.length)];
      var y = drops[x];
      ctx.fillText(char, x * rowStep, y * rowStep);

      // reset drop to the top randomly to vary streams
      if (y * rowStep > canvas.height && Math.random() > 0.975) {
        drops[x] = 0;
      } else {
        drops[x]++;
      }
    }

    // occasional stronger fade to prevent burn-in on slower devices
    if (Math.random() < 0.02) {
      ctx.fillStyle = TRAIL_FADE_END;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // --- Theme hook (optional) ---
  // If you have a toggle with id="matrixToggle", we'll wire it up.
  var toggleBtn = document.getElementById('matrixToggle');
  var running = true;
  function start(){ if (!intervalId) intervalId = setInterval(draw, speedMs); running = true; canvas.style.display=''; }
  function stop(){ if (intervalId){ clearInterval(intervalId); intervalId=null; } running = false; canvas.style.display='none'; }

  start();
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(){
      running ? stop() : start();
      if (toggleBtn.dataset.labelOn && toggleBtn.dataset.labelOff){
        toggleBtn.textContent = running ? toggleBtn.dataset.labelOff : toggleBtn.dataset.labelOn;
      }
    });
  }

  // --- Cursor/touch trail (subtle, color-aware, and auto-disabled on mobile) ---
  function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }
  if (!isMobile()) {
    var trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.cssText = 'position:fixed;left:0;top:0;width:12px;height:12px;border-radius:50%;' +
                          'transform:translate(-50%,-50%);pointer-events:none;z-index:9998;' +
                          'box-shadow:0 0 14px 6px ' + GLOW_COLOR + ';background:' + MATRIX_COLOR + ';opacity:.15;';
    document.body.appendChild(trail);
    window.addEventListener('mousemove', function(e){
      trail.style.left = e.clientX + 'px';
      trail.style.top  = e.clientY + 'px';
    });
    var mobileStyles=document.createElement('style');
    mobileStyles.textContent='@media (max-width:768px){.cursor-trail{display:none!important;}}';
    document.head.appendChild(mobileStyles);
  }
})();
