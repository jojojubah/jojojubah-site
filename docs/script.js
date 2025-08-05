document.addEventListener('DOMContentLoaded', ()=> {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting));
  }, {threshold:0.3});
  document.querySelectorAll('.animate').forEach(el=>observer.observe(el));

  const navLinks = [...document.querySelectorAll('nav a')];
  const underline = document.querySelector('.nav-underline');
  const sections = [...document.querySelectorAll('section')];

  function setActive(id){
    navLinks.forEach(l => {
      const active = l.getAttribute('href') === '#' + id;
      l.classList.toggle('active', active);
      if(active){
        const r = l.getBoundingClientRect();
        underline.style.width = `${r.width}px`;
        underline.style.transform = `translateX(${r.left + window.scrollX}px)`;
      }
    });
  }

  window.addEventListener('scroll', () => {
    let current = sections[0].id;
    sections.forEach(sec => {
      if(scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    setActive(current);
  });

  setActive(sections[0].id);
});
