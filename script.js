// Portfolio interactions: mobile menu, active nav, reveal effects, stat counts, and particles.
(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sections = [...document.querySelectorAll("main section[id]")];
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => activeObserver.observe(section));

  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.count || 0);
        const decimals = Number.isInteger(target) ? 0 : 1;
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals);
        };

        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => countObserver.observe(counter));

  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const pointer = { x: null, y: null };
  let particles = [];
  let width = 0;
  let height = 0;
  let animationId = null;

  const resize = () => {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const count = Math.min(95, Math.max(44, Math.floor(window.innerWidth / 16)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: Math.random() * 1.8 + 0.8,
      hue: Math.random() > 0.68 ? "168, 85, 247" : "0, 245, 255"
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;

      if (pointer.x !== null && pointer.y !== null) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 120 && distance > 0) {
          p.x += dx / distance * 0.16;
          p.y += dy / distance * 0.16;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, 0.78)`;
      ctx.shadowColor = `rgba(${p.hue}, 0.7)`;
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${0.13 * (1 - d / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  window.addEventListener("mouseleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  resize();
  draw();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animationId) cancelAnimationFrame(animationId);
    if (!document.hidden) draw();
  });
})();
