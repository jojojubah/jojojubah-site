document.addEventListener('DOMContentLoaded', () => {
  /* === Scroll-reveal === */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');   // reverse when leaving view
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.animate').forEach(el => observer.observe(el));

  /* === Active nav link highlight === */
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;   // offset for sticky nav
      if (scrollY >= top) current = sec.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  });
});
