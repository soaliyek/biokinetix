/* BioKinetiX v3 — Lusion-inspired cinematic light theme */

function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Nav scroll state
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal with stagger support
  const reveal = (els) => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => obs.observe(el));
  };
  reveal(document.querySelectorAll('.reveal'));

  // ===========================================================
  // Native cursor — custom cursor removed per user feedback
  // ===========================================================
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===========================================================
  // Molecule canvas replaced with video background
  // ===========================================================


  // ===========================================================
  // PARALLAX on the hero title (mouse-based)
  // ===========================================================
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !isTouch && !reduceMotion) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      heroTitle.style.transform = `translate3d(${mx * 14}px, ${my * 8}px, 0)`;
    });
  }

  // ===========================================================
  // TILE HOVER reveal (lusion-style project grid)
  // ===========================================================
  document.querySelectorAll('.tile').forEach(t => {
    t.addEventListener('mousemove', (e) => {
      const r = t.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 6;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 6;
      t.style.setProperty('--tx', mx + 'px');
      t.style.setProperty('--ty', my + 'px');
    });
    t.addEventListener('mouseleave', () => {
      t.style.setProperty('--tx', '0px');
      t.style.setProperty('--ty', '0px');
    });
  });
});

/* ============================================================
   PK Simulator (unchanged — RK4 live)
============================================================ */
function PKSimulator(canvasId, ctrl) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const defaults = { k10: 0.05, k12: 0.50, k21: 0.25, Cp0: 200 };
  let p = Object.assign({}, defaults);
  const W = 720, H = 380, padL = 56, padR = 56, padT = 24, padB = 44;
  canvas.width = W; canvas.height = H;

  function simulate() {
    const dt = 0.05, T = 10, N = Math.round(T / dt) + 1;
    const t = [], Cc = [], Cp = [];
    let cc = 0, cp = p.Cp0;
    const f1 = (c, q) => -(p.k12 + p.k10) * c + p.k21 * q;
    const f2 = (c, q) => p.k12 * c - p.k21 * q;
    for (let i = 0; i < N; i++) {
      t.push(i * dt); Cc.push(cc); Cp.push(cp);
      const m1 = dt * f1(cc, cp),       l1 = dt * f2(cc, cp);
      const m2 = dt * f1(cc+m1/2, cp+l1/2), l2 = dt * f2(cc+m1/2, cp+l1/2);
      const m3 = dt * f1(cc+m2/2, cp+l2/2), l3 = dt * f2(cc+m2/2, cp+l2/2);
      const m4 = dt * f1(cc+m3, cp+l3),     l4 = dt * f2(cc+m3, cp+l3);
      cc += (m1 + 2*m2 + 2*m3 + m4) / 6;
      cp += (l1 + 2*l2 + 2*l3 + l4) / 6;
    }
    return { t, Cc, Cp };
  }

  function draw() {
    const { t, Cc, Cp } = simulate();
    ctx.clearRect(0, 0, W, H);
    const xmax = 10, ymax = Math.max(p.Cp0, 60) * 1.05;
    const X = v => padL + (v / xmax) * (W - padL - padR);
    const Y = v => H - padB - (v / ymax) * (H - padT - padB);
    ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1;
    ctx.font = '11px "JetBrains Mono", monospace'; ctx.fillStyle = '#94A3B8';
    for (let gx = 0; gx <= 10; gx += 2) {
      ctx.beginPath(); ctx.moveTo(X(gx), padT); ctx.lineTo(X(gx), H - padB); ctx.stroke();
      ctx.fillText(gx + 'h', X(gx) - 6, H - padB + 18);
    }
    for (let gy = 0; gy <= ymax; gy += 50) {
      ctx.beginPath(); ctx.moveTo(padL, Y(gy)); ctx.lineTo(W - padR, Y(gy)); ctx.stroke();
      ctx.fillText(gy.toFixed(0), padL - 34, Y(gy) + 4);
    }
    ctx.fillStyle = '#0B2545'; ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText('Time (hours)', W / 2 - 30, H - 6);
    function plot(data, color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      data.forEach((v, i) => { const px = X(t[i]), py = Y(v);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
      ctx.stroke();
    }
    plot(Cp, '#C1121F', 3);
    plot(Cc, '#0B2545', 3);
  }

  const sliders = [
    { key: 'k12', label: 'k₁₂ — central → peripheral', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'k21', label: 'k₂₁ — peripheral → central', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'k10', label: 'k₁₀ — elimination', min: 0.01, max: 0.5, step: 0.01 },
    { key: 'Cp0', label: 'Initial peripheral dose (mg/L)', min: 50, max: 300, step: 10 },
  ];
  const box = document.getElementById(ctrl);
  sliders.forEach(s => {
    const lab = document.createElement('label');
    lab.innerHTML = `${s.label}: <span class="sim-val" id="v_${s.key}">${p[s.key]}</span>`;
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = s.min; inp.max = s.max; inp.step = s.step; inp.value = p[s.key];
    inp.addEventListener('input', () => {
      p[s.key] = parseFloat(inp.value);
      document.getElementById('v_' + s.key).textContent = p[s.key];
      draw();
    });
    box.appendChild(lab); box.appendChild(inp);
  });
  const reset = document.createElement('button');
  reset.className = 'sim-reset'; reset.textContent = '↺ Reset to paper values';
  reset.addEventListener('click', () => {
    p = Object.assign({}, defaults);
    sliders.forEach(s => {
      box.querySelector(`#v_${s.key}`).textContent = p[s.key];
      box.querySelectorAll('input')[sliders.indexOf(s)].value = p[s.key];
    });
    draw();
  });
  box.appendChild(reset);
  draw();
}
