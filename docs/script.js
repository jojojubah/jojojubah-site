document.addEventListener('DOMContentLoaded', () => {
  /* ===== REPEATED SCROLL-REVEAL ===== */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.classList.toggle('visible', e.isIntersecting);
    });
  },{threshold:0.25});
  document.querySelectorAll('.animate').forEach(el=>observer.observe(el));

  /* ===== ACTIVE NAV & UNDERLINE ===== */
  const navLinks = [...document.querySelectorAll('nav a')];
  const underline = document.querySelector('.nav-underline');
  const sections = [...document.querySelectorAll('section')];

  function setActive(id){
    navLinks.forEach(l=>{
      const active = l.getAttribute('href')==='#'+id;
      l.classList.toggle('active',active);
      if(active){
        const rect=l.getBoundingClientRect();
        underline.style.width=`${rect.width}px`;
        underline.style.transform=`translateX(${rect.left + window.scrollX}px)`;
      }
    });
  }

  window.addEventListener('scroll',()=>{
    let current='hero';
    sections.forEach(sec=>{
      const top=sec.offsetTop-150;
      if(scrollY>=top)current=sec.id;
    });
    setActive(current);
  });

  /* initial underline position */
  setActive('hero');
});
