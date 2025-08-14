// Jubah Labs — Matrix rain (theme-aware) + toggle integration
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

  function start(){ if (!intervalId) intervalId = setInterval(draw, speedMs); canvas.style.display=''; }
  function stop(){ if (intervalId){ clearInterval(intervalId); intervalId=null; } ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }

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
  });
})();
