// Jubah Labs — Classic Matrix rain (starts ON) + works with .toggle-group
(function () {
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var MATRIX_COLOR = '#00ff41';
  var BG_FADE      = 'rgba(0, 0, 0, 0.07)';
  var characters   = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var drops = [];
  var rowStep = 16;
  var speedMs = 75;
  var intervalId = null;
  var lastW = 0, lastH = 0;

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
    ctx.fillStyle = BG_FADE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  // Start/stop helpers
  function start(){ if (!intervalId) intervalId = setInterval(draw, speedMs); canvas.style.display=''; }
  function stop(){ if (intervalId){ clearInterval(intervalId); intervalId=null; } ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }

  // Start ON by default
  start();

  // Hook up the toggle button and move it into the .toggle-group
  var btn = document.getElementById('matrixToggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'matrixToggle';
    btn.textContent = 'Turn Matrix Off';
  }
  var group = document.querySelector('.toggle-group');
  if (group && !group.contains(btn)) group.appendChild(btn); else if (!btn.isConnected) document.body.appendChild(btn);

  // Label + click
function setLabel(){
  btn.textContent = intervalId ? '🟢 Matrix' : '⚫ Matrix';
}
setLabel();
btn.addEventListener('click', function(){
  if (intervalId) stop(); else start();
  setLabel();
});

})();
