/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SYNAPTIC SPARK EFFECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initSparks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'spark-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const sparks = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#c084fc', '#818cf8', '#e879f9'];

  /* ambient spark — random position, free zigzag */
  function spawnAmbient() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const segments = 3 + Math.floor(Math.random() * 4);
    const points   = [{ x, y }];
    for (let i = 0; i < segments; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.4;
      const len   = 8 + Math.random() * 18;
      const last  = points[points.length - 1];
      points.push({ x: last.x + Math.cos(angle) * len, y: last.y + Math.sin(angle) * len });
    }
    sparks.push({ points, life: 1.0, color: COLORS[Math.floor(Math.random() * COLORS.length)], width: 1.2 });
  }

  /* edge spark — runs along the border of a visible UI element */
  function spawnEdge() {
    const candidates = [...document.querySelectorAll('section, .disorder, .scent-card, .lobe-table-wrap, .hedonic-table-wrap, .cell-player')];
    const visible = candidates.filter(el => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0 && r.width > 0;
    });
    if (!visible.length) return;
    const el   = visible[Math.floor(Math.random() * visible.length)];
    const rect = el.getBoundingClientRect();

    /* pick an edge: 0=top 1=bottom 2=left 3=right */
    const edge = Math.floor(Math.random() * 4);
    let sx, sy, mainAxis, crossAxis;

    if (edge === 0) {
      sx = rect.left + Math.random() * rect.width;  sy = rect.top;
      mainAxis = 'x'; crossAxis = 'y';
    } else if (edge === 1) {
      sx = rect.left + Math.random() * rect.width;  sy = rect.bottom;
      mainAxis = 'x'; crossAxis = 'y';
    } else if (edge === 2) {
      sx = rect.left;  sy = rect.top + Math.random() * rect.height;
      mainAxis = 'y'; crossAxis = 'x';
    } else {
      sx = rect.right; sy = rect.top + Math.random() * rect.height;
      mainAxis = 'y'; crossAxis = 'x';
    }

    const dir      = Math.random() > 0.5 ? 1 : -1;
    const stepMain = dir * (5 + Math.random() * 9);   // runs along edge
    const segments = 5 + Math.floor(Math.random() * 5);
    const points   = [{ x: sx, y: sy }];

    for (let i = 0; i < segments; i++) {
      const last    = points[points.length - 1];
      const jitter  = (Math.random() - 0.5) * 5;      // perpendicular wobble
      const nx = mainAxis === 'x' ? last.x + stepMain + (Math.random() - 0.5) * 3 : last.x + jitter;
      const ny = mainAxis === 'y' ? last.y + stepMain + (Math.random() - 0.5) * 3 : last.y + jitter;
      points.push({ x: nx, y: ny });
    }

    sparks.push({ points, life: 1.0, color: COLORS[Math.floor(Math.random() * COLORS.length)], width: 1.0 });
  }

  /* scheduling — two independent timers */
  function scheduleAmbient() {
    const delay = 140 + Math.random() * 260;
    setTimeout(() => { spawnAmbient(); scheduleAmbient(); }, delay);
  }
  function scheduleEdge() {
    const delay = 100 + Math.random() * 200;
    setTimeout(() => { spawnEdge(); scheduleEdge(); }, delay);
  }
  scheduleAmbient();
  scheduleEdge();

  let last = 0;
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt * 2.2;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life * 0.45;
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = s.width;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = '#c084fc';
      ctx.lineCap     = 'butt';
      ctx.lineJoin    = 'miter';
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let j = 1; j < s.points.length; j++) ctx.lineTo(s.points[j].x, s.points[j].y);
      ctx.stroke();
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BACKGROUND CELL FIELD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function initCellField() {
  const field = document.createElement('div');
  field.id = 'cell-field';
  document.body.prepend(field);

  const cells = [
    { s: 480, x:  5, y: 10, d: 24, del:   0, c: '192,132,252' },
    { s: 300, x: 72, y: 55, d: 18, del:  -6, c: '216,180,254' },
    { s: 370, x: 42, y: 78, d: 28, del: -12, c: '221,214,254' },
    { s: 195, x: 88, y:  8, d: 16, del:  -3, c: '192,132,252' },
    { s: 540, x: 26, y: 42, d: 32, del:  -9, c: '237,233,254' },
    { s: 240, x: 62, y: 22, d: 20, del: -15, c: '216,180,254' },
    { s: 155, x: 14, y: 87, d: 14, del:  -2, c: '192,132,252' },
  ];

  cells.forEach(c => {
    const el = document.createElement('div');
    el.className = 'bg-cell';
    el.style.cssText =
      `left:${c.x}%;top:${c.y}%;width:${c.s}px;height:${c.s}px;` +
      `--c:${c.c};--d:${c.d}s;--del:${c.del}s;`;
    field.appendChild(el);
  });
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CELL PLAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ORGANELLE_CONFIGS = [
  { cls: 'mito',     dx1:  9, dy1: -4, dx2: -5, dy2:  8, dx3: 12, dy3:  2, dur: 7.2 },
  { cls: 'vesicle',  dx1: -7, dy1:  6, dx2: 10, dy2: -3, dx3: -4, dy3: 10, dur: 4.8 },
  { cls: 'golgi',    dx1:  5, dy1: -8, dx2: -9, dy2:  4, dx3:  8, dy3: -6, dur: 9.1 },
  { cls: 'mito',     dx1:-10, dy1:  3, dx2:  7, dy2: -7, dx3: -3, dy3:  5, dur: 6.5 },
  { cls: 'lysosome', dx1:  6, dy1:  9, dx2: -8, dy2: -2, dx3:  4, dy3: 11, dur: 5.3 },
  { cls: 'vesicle',  dx1: -4, dy1: -6, dx2: 11, dy2:  5, dx3: -7, dy3: -4, dur: 7.8 },
  { cls: 'mito',     dx1:  8, dy1:  5, dx2: -6, dy2: -8, dx3: 10, dy3:  1, dur: 8.4 },
];

const POSITIONS = [
  { x:  4, y: 18 }, { x: 16, y: 62 }, { x: 29, y: 22 },
  { x: 44, y: 55 }, { x: 60, y: 20 }, { x: 74, y: 65 },
  { x: 88, y: 30 },
];

const CODON_COUNT = 28;

class CellPlayer {
  constructor(el) {
    this.el      = el;
    this.hasSrc  = !!el.dataset.src;
    this.audio   = this.hasSrc ? new Audio(el.dataset.src) : null;
    this.playing = false;
    this._build();
    this._wire();
  }

  _build() {
    const bgHTML = ORGANELLE_CONFIGS.map((cfg, i) => {
      const pos = POSITIONS[i];
      return `<span class="organelle ${cfg.cls}" style="
        left:${pos.x}%; top:${pos.y}%;
        --dur:${cfg.dur}s; --delay:${(i * 0.85).toFixed(2)}s;
        --dx1:${cfg.dx1}px; --dy1:${cfg.dy1}px;
        --dx2:${cfg.dx2}px; --dy2:${cfg.dy2}px;
        --dx3:${cfg.dx3}px; --dy3:${cfg.dy3}px;
      "></span>`;
    }).join('');

    const codonsHTML = Array.from({ length: CODON_COUNT }, (_, i) => {
      const isTriplet = i % 3 === 2;
      const h = isTriplet ? 10 : 5;
      const opacity = isTriplet ? 0.45 : 0.22;
      return `<span class="codon-tick" style="height:${h}px;opacity:${opacity}"></span>`;
    }).join('');

    const label = this.el.dataset.label ?? '';
    const timeText = this.hasSrc ? '0:00 / 0:00' : 'Audio coming soon';

    this.el.innerHTML = `
      <div class="cell-bg">${bgHTML}</div>
      <div class="cell-controls">
        <button class="nucleus-btn" aria-label="Play" ${this.hasSrc ? '' : 'disabled'}>
          ${ICONS.play}
        </button>
        <div class="mrna-wrap">
          ${label ? `<span class="mrna-label">${label}</span>` : ''}
          <div class="mrna-track">
            <div class="mrna-codons">${codonsHTML}</div>
            <div class="mrna-fill"></div>
            <div class="ribosome">
              <div class="rib-large"></div>
              <div class="rib-small"></div>
              <div class="rib-tunnel"></div>
            </div>
          </div>
        </div>
        <span class="cell-time">${timeText}</span>
      </div>`;

    this.btn      = this.el.querySelector('.nucleus-btn');
    this.fill     = this.el.querySelector('.mrna-fill');
    this.ribosome = this.el.querySelector('.ribosome');
    this.timeEl   = this.el.querySelector('.cell-time');
    this.track    = this.el.querySelector('.mrna-track');

    if (!this.hasSrc) this.el.classList.add('no-audio');
  }

  _wire() {
    if (!this.hasSrc) return;

    this.btn.addEventListener('click', () => this._toggle());
    this.audio.addEventListener('timeupdate',     () => this._update());
    this.audio.addEventListener('loadedmetadata', () => this._update());
    this.audio.addEventListener('ended',          () => this._pause());

    let seeking = false;
    const seek = e => {
      const rect  = this.track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      if (isFinite(this.audio.duration)) this.audio.currentTime = ratio * this.audio.duration;
    };
    this.track.addEventListener('mousedown',  e => { seeking = true; seek(e); });
    window.addEventListener('mousemove', e => { if (seeking) seek(e); });
    window.addEventListener('mouseup',   ()  => { seeking = false; });
    this.track.addEventListener('touchstart', e => seek(e.touches[0]), { passive: true });
    this.track.addEventListener('touchmove',  e => seek(e.touches[0]), { passive: true });
  }

  _toggle() { this.playing ? this._pause() : this._play(); }

  _play() {
    document.querySelectorAll('.cell-player').forEach(p => {
      if (p !== this.el && p._cp) p._cp._pause();
    });
    this.audio.play();
    this.playing = true;
    this.el.classList.add('playing');
    this.btn.innerHTML = ICONS.pause;
    this.btn.setAttribute('aria-label', 'Pause');
  }

  _pause() {
    this.audio.pause();
    this.playing = false;
    this.el.classList.remove('playing');
    this.btn.innerHTML = ICONS.play;
    this.btn.setAttribute('aria-label', 'Play');
  }

  _update() {
    const { currentTime, duration } = this.audio;
    const pct = duration ? (currentTime / duration) * 100 : 0;
    this.fill.style.width    = `${pct}%`;
    this.ribosome.style.left = `${pct}%`;
    this.timeEl.textContent  = `${_fmt(currentTime)} / ${_fmt(duration || 0)}`;
  }
}

const ICONS = {
  play:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
};

function _fmt(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

document.querySelectorAll('.cell-player').forEach(el => {
  el._cp = new CellPlayer(el);
});


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LIGHTBOX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxCap   = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('figure img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src         = img.src;
    lightboxImg.alt         = img.alt;
    lightboxCap.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent ?? '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ACTIVE NAV ON SCROLL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('#main-nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`#main-nav a[href="#${entry.target.id}"]`);
      if (active) {
        active.classList.add('active');
        active.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach(s => observer.observe(s));
