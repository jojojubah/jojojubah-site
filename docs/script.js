document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => e.target.classList.toggle("visible", e.isIntersecting)),
    { threshold: 0.3 }
  );
  document.querySelectorAll(".animate").forEach(el => revealObserver.observe(el));

  /* ---------- Nav underline / active link ---------- */
  const navLinks   = [...document.querySelectorAll("nav a")];
  const underline  = document.querySelector(".nav-underline");
  const sections   = [...document.querySelectorAll("section")];

  function setActive(id){
    navLinks.forEach(l => {
      const active = l.getAttribute("href") === "#" + id;
      l.classList.toggle("active", active);
      if(active){
        const r = l.getBoundingClientRect();
        underline.style.width  = `${r.width}px`;
        underline.style.transform = `translateX(${r.left + window.scrollX}px)`;
      }
    });
  }

  window.addEventListener("scroll", () => {
    let current = sections[0].id;
    sections.forEach(sec => {
      if(scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    setActive(current);
  });
  setActive(sections[0].id);

  /* ---------- Heading gradient swap (Safari-safe) ---------- */
  const brandGradients = [
    "linear-gradient(90deg, #0a0a0a, #004aad)",
    "linear-gradient(90deg, #004aad, #b0b0b0)",
    "linear-gradient(90deg, #1f1f1f, #004aad)",
    "linear-gradient(90deg, #004aad, #808080)"
  ];

  const headingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const g = brandGradients[Math.floor(Math.random() * brandGradients.length)];
        entry.target.style.backgroundImage       = g;            // important: backgroundImage, not shorthand
        entry.target.style.webkitBackgroundClip  = "text";
        entry.target.style.webkitTextFillColor   = "transparent";
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll("h2").forEach(h => headingObserver.observe(h));

});