// Matrix background + green theme toggle (from your blob page)
(function(){
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  var drops = [], columns = 0;

  // ~12fps for calmer motion
  var speedMs = 80;
  var rowStep = 16;

  let lastW = 0, lastH = 0;
  function resize(keepState = true) {
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    const prevCols = columns;

    canvas.width = w;
    canvas.height = h;

    const newCols = Math.floor(w / 20);
    if (keepState && drops.length) {
      if (newCols === prevCols) { lastW=w; lastH=h; return; }
      const next = new Array(newCols).fill(0);
      for (let i=0; i<Math.min(prevCols,newCols); i++) next[i] = drops[i];
      drops = next;
      columns = newCols;
    } else {
      columns = newCols;
      drops = Array(columns).fill(0);
    }
    lastW=w; lastH=h;
  }
  resize(true);

  window.addEventListener('resize', (() => {
    let t;
    return () => {
      const w = window.innerWidth, h = window.innerHeight;
      const widthChanged  = Math.abs(w - lastW) > 2;
      const heightChanged = Math.abs(h - lastH) > 120;
      if (!widthChanged && !heightChanged) return;
      clearTimeout(t);
      t = setTimeout(() => resize(true), 120);
    };
  })());

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '20px monospace';
    for (var x = 0; x < drops.length; x++) {
      var char = characters[Math.floor(Math.random() * characters.length)];
      var y = drops[x];
      ctx.fillText(char, x * 20, y);
      if (y > canvas.height && Math.random() > 0.975) drops[x] = 0;
      else drops[x] = y + rowStep;
    }
  }

  var intervalId = setInterval(draw, speedMs);

  // Theme toggle
  var matrixOn = true;
  var themeEl = document.getElementById('matrix-theme');
  var toggleBtn = document.getElementById('matrixToggle');

  function startMatrix(){
    if (intervalId) return;
    intervalId = setInterval(draw, speedMs);
    canvas.style.display = '';
    // add green theme if missing (matches labs.css root overrides)
    if (!document.getElementById('matrix-theme')) {
      themeEl = document.createElement('style');
      themeEl.id = 'matrix-theme';
      themeEl.textContent = ":root{--accent-primary:#22c55e;--accent-secondary:#16a34a;--accent-tertiary:#84cc16;--card-border:rgba(34,197,94,0.25);--gradient-primary:linear-gradient(135deg,#22c55e 0%,#16a34a 50%,#84cc16 100%);--gradient-secondary:linear-gradient(135deg,#16a34a 0%,#22c55e 100%);} .site-avatar{box-shadow:0 0 20px rgba(34,197,94,0.3)!important;border-color:var(--accent-primary)!important;} .site-avatar:hover{box-shadow:0 0 30px rgba(34,197,94,0.5)!important;}";
      document.head.appendChild(themeEl);
    }
  }
  function stopMatrix(){
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    canvas.style.display = 'none';
    var el = document.getElementById('matrix-theme');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function updateToggleUI(){
    if (!toggleBtn) return;
    toggleBtn.textContent = matrixOn ? 'Turn Matrix OFF' : 'Turn Matrix ON';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(){
      matrixOn = !matrixOn;
      if (matrixOn) startMatrix(); else stopMatrix();
      updateToggleUI();
    });
    updateToggleUI();
  }

  // footer year
  var y=document.getElementById('secretYear'); if (y) y.textContent = new Date().getFullYear();

  // keep your cursor/touch effects color-aware (same as blob page)
  function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  // desktop cursor trail (green on matrix ON, blue on OFF)
  document.addEventListener('mousemove', function(e){
    var color = matrixOn ? '34,197,94' : '59,130,246';
    var trail=[], trailLength=20;
    trail.push({x:e.clientX,y:e.clientY});
    if(trail.length>trailLength) trail.shift();
    document.querySelectorAll('.cursor-trail').forEach(function(el){ el.remove(); });
    trail.forEach(function(point, idx){
      var dot=document.createElement('div');
      dot.className='cursor-trail';
      dot.style.cssText='position:fixed;left:'+point.x+'px;top:'+point.y+'px;width:'+(4-idx*0.2)+'px;height:'+(4-idx*0.2)+'px;background:rgba('+color+','+(0.5-idx*0.025)+');border-radius:50%;pointer-events:none;z-index:9999;transition:all 0.1s ease-out;';
      document.body.appendChild(dot);
      setTimeout(function(){ if(dot.parentNode) dot.remove(); }, 100);
    });
  });

  if(isMobile()){
    document.addEventListener('touchstart', function(e){ var t=e.touches[0]; createParticleBurst(t.clientX,t.clientY); });
    document.addEventListener('touchmove', function(e){ var t=e.touches[0]; createTouchTrail(t.clientX,t.clientY); });
    var mobileStyles=document.createElement('style');
    mobileStyles.textContent='@media (max-width:768px){.cursor-trail{display:none!important;}}';
    document.head.appendChild(mobileStyles);
  }

  function createTouchTrail(x,y){
    var pts = [];
    pts.push({x,y,timestamp:Date.now()});
    document.querySelectorAll('.touch-trail').forEach(function(el){ el.remove(); });
    var color = matrixOn ? '34,197,94' : '6,182,212';
    pts.forEach(function(pt,idx){
      var age=Date.now()-pt.timestamp, opacity=Math.max(0,1-(age/800)), size=Math.max(2,12-idx*1.5);
      var el=document.createElement('div');
      el.className='touch-trail';
      el.style.cssText='position:fixed;left:'+(pt.x-size/2)+'px;top:'+(pt.y-size/2)+'px;width:'+size+'px;height:'+size+'px;background:rgba('+color+','+(opacity*0.7)+');border-radius:50%;pointer-events:none;z-index:9998;transition:all 0.1s ease-out;';
      document.body.appendChild(el);
    });
  }
  function createParticleBurst(x,y){
    var colors = matrixOn ? ['#22c55e','#16a34a','#84cc16','#10b981'] : ['#3b82f6','#06b6d4','#8b5cf6','#10b981'];
    var count=6;
    for(var i=0;i<count;i++){
      (function(i){
        var ang=(360/count)*i, vel=30+Math.random()*20, color=colors[Math.floor(Math.random()*colors.length)];
        var el=document.createElement('div');
        el.className='touch-particle';
        el.style.cssText='position:fixed;left:'+(x-3)+'px;top:'+(y-3)+'px;width:6px;height:6px;background:'+color+';border-radius:50%;pointer-events:none;z-index:9997;animation:particleBurst'+i+' 0.8s ease-out forwards;';
        var keyframes='@keyframes particleBurst'+i+'{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate('+(Math.cos(ang*Math.PI/180)*vel)+'px,'+(Math.sin(ang*Math.PI/180)*vel)+'px) scale(0);opacity:0;}}';
        if(!document.getElementById('pbkf-'+i)){ var s=document.createElement('style'); s.id='pbkf-'+i; s.textContent=keyframes; document.head.appendChild(s); }
        document.body.appendChild(el);
        setTimeout(function(){ if(el.parentNode) el.remove(); }, 800);
      })(i);
    }
  }
})();
