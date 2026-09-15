(() => {
'use strict';

/* =====================================================================
   ✏️  PERSONALIZA AQUÍ
   Todo el texto, fotos y el regalo se cambian en este objeto.
   ===================================================================== */
const CONFIG = {
  name: 'Isel',
  from: '',                      // tu nombre para firmar la carta (opcional)

  // Nivel 1 — link que abre la música (puedes pegar el link de una playlist tuya)
  playlistUrl: 'https://open.spotify.com/search/Olivia%20Rodrigo',
  songs: [
    { title: 'vampire', album: 'GUTS' },
    { title: 'bad idea right?', album: 'GUTS' },
    { title: 'drivers license', album: 'SOUR' },
    { title: 'good 4 u', album: 'SOUR' },
    { title: 'deja vu', album: 'SOUR' },
    { title: 'favorite crime', album: 'SOUR' },
  ],

  // Nivel 2 — el recuerdo escondido entre los tulipanes
  firstMemory: {
    photo: 'fotos/primer recuerdo.jpeg',
    caption: 'Cine, palomitas... donde todo empezó 🎞️',
  },

  // Nivel 3 — un mensaje (y foto) por cada Cinnamoroll atrapado
  rolls: [
    { text: 'La princesa de mi vida ❤️', photo: 'fotos/WhatsApp Image 2026-09-14 at 8.16.46 PM.jpeg' },
    { text: 'Nunca cambies esa sonrisa.', photo: 'fotos/WhatsApp Image 2026-09-14 at 8.16.47 PM (1).jpeg' },
    { text: 'Quien le da color a mis días 🍀', photo: 'fotos/WhatsApp Image 2026-09-14 at 8.16.47 PM.jpeg' },
    { text: 'Mi rayito de alegría 🤍', photo: 'fotos/WhatsApp Image 2026-09-14 at 8.16.48 PM.jpeg' },
    { text: 'Y todavía falta una sorpresa...', photo: 'fotos/WhatsApp Image 2026-09-14 at 8.16.48 PM (1).jpeg' },
  ],

  // Nivel 3 — stickers de Cinnamoroll (versiones recortadas en cinammon/sprites)
  cinnamoroll: {
    start: 'cinammon/sprites/volando.png',       // el grande de la pantalla de inicio del nivel
    catchable: [                                 // los que aparecen para atrapar
      'cinammon/sprites/volando.png',
      'cinammon/sprites/dona.png',
      'cinammon/sprites/estrella.png',
      'cinammon/sprites/dulce.png',
      'cinammon/sprites/corazon.png',
    ],
    meter: 'cinammon/sprites/corazon.png',       // iconitos del contador
    complete: 'cinammon/sprites/taza.png',       // aparece en QUEST COMPLETE
  },

  // Carta final — {name} se reemplaza por el nombre
  letter: [
    'Hay personas que hacen que los días normales se sientan un poquito más especiales.',
    'Y hoy quería hacer algo diferente para ti.',
    'Así que junté algunas de las cosas que sé que te gustan: flores, música, Cinnamoroll y, por supuesto, mi toque personal: "Dinosaurios" jajaja 🌷🎵☁️🦖',
    'Espero que este pequeño lugar que hice para ti te saque aunque sea una sonrisa.',
    '*Feliz cumpleaños mi tesoro 🎂',
    'Que este nuevo año de tu vida esté lleno de momentos bonitos, personas que te quieran mucho y muchas razones para sonreír.',
    'Y recuerda...\nsi algún día todo se pone difícil,\nsiempre habrá un dinosaurio dispuesto a defenderte. 🦖',
  ],

  // Galería de fotos que aparece después de la carta
  gallery: [
    'fotos/WhatsApp Image 2026-09-14 at 8.16.49 PM.jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.49 PM (1).jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.49 PM (2).jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.50 PM.jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.50 PM (1).jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.50 PM (2).jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.51 PM.jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.52 PM.jpeg',
    'fotos/WhatsApp Image 2026-09-14 at 8.16.53 PM.jpeg',
  ],

  // El regalo dentro de la caja
  gift: {
    label: 'VALE POR',
    title: 'Una cita conmigo ☁️',
    text: 'Comida rica, un postre bonito y el plan que tú elijas. Todo el día es tuyo.',
    detail: 'Válido: cuando tú quieras 💜',
    greeting: 'Feliz cumpleaños, Princesa ❤️',
    photo: '',                   // opcional, ej. 'fotos/regalo.jpeg'
  },
};

/* ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
const src = p => encodeURI(p);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const withName = s => s.replaceAll('{name}', CONFIG.name);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Progreso guardado ---------- */
const STORE_KEY = 'birthday-adventure-v1';
const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } },
  set(patch) { try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...this.get(), ...patch })); } catch {} },
  clear() { try { localStorage.removeItem(STORE_KEY); } catch {} },
};

/* ---------- Timers por escena (se limpian al cambiar) ---------- */
const timers = new Set();
function later(fn, ms) {
  const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
  timers.add(id);
  return id;
}
function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }

/* =====================================================================
   Sonido (sintetizado, sin archivos)
   ===================================================================== */
const Sound = {
  ctx: null, master: null, muted: false,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
  },
  tone(freq, start, dur, type = 'square', vol = 0.08) {
    const c = this.ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    const t = c.currentTime + start;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  },
  pop() { this.tone(620, 0, 0.09, 'triangle', 0.18); this.tone(930, 0.05, 0.12, 'triangle', 0.14); },
  soft() { this.tone(300, 0, 0.14, 'sine', 0.1); this.tone(240, 0.06, 0.14, 'sine', 0.08); },
  chime() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, i * 0.08, 0.35, 'sine', 0.09)); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i * 0.1, 0.24, 'square', 0.05)); },
  alarm() { [0, 1, 2].forEach(i => { this.tone(880, i * 0.36, 0.16, 'square', 0.05); this.tone(660, i * 0.36 + 0.18, 0.16, 'square', 0.05); }); },
  stomps(n, gap) { for (let i = 0; i < n; i++) this.tone(70, i * gap, 0.18, 'sine', 0.5); },
  roar() {
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime, len = 1.3;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = c.createBufferSource(); noise.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1100, t); lp.frequency.exponentialRampToValueAtTime(180, t + len);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    noise.connect(lp).connect(g).connect(this.master); noise.start(t);
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(55, t + len);
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.22, t + 0.08); g2.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g2).connect(this.master); o.start(t); o.stop(t + len);
  },
  // "Happy Birthday" (dominio público) en versión 8-bit. Devuelve la duración en segundos.
  birthday() {
    const G = 392, A = 440, B = 494, C = 523, D = 587, E = 659, F = 698, G5 = 784;
    const notes = [
      [G, .75], [G, .25], [A, 1], [G, 1], [C, 1], [B, 2],
      [G, .75], [G, .25], [A, 1], [G, 1], [D, 1], [C, 2],
      [G, .75], [G, .25], [G5, 1], [E, 1], [C, 1], [B, 1], [A, 2],
      [F, .75], [F, .25], [E, 1], [C, 1], [D, 1], [C, 3],
    ];
    const beat = 0.34;
    let t = 0.15;
    for (const [f, b] of notes) {
      this.tone(f, t, b * beat * 0.95, 'square', 0.055);
      this.tone(f / 2, t, b * beat * 0.9, 'triangle', 0.07);
      t += b * beat;
    }
    return t + 0.2;
  },
};

/* =====================================================================
   Partículas de fondo
   ===================================================================== */
const FX = {
  c: $('#fx'), ctx: null, w: 0, h: 0, parts: [],
  mixes: {
    intro: { star: 60, petal: 12 },
    music: { star: 50 },
    garden: { petal: 26 },
    rolls: { sparkle: 26 },
    dino: { firefly: 26 },
    letter: { star: 80, petal: 10 },
    gift: { star: 60, petal: 12 },
  },
  init() {
    this.ctx = this.c.getContext('2d');
    this.resize();
    addEventListener('resize', () => this.resize());
    const loop = () => { this.draw(); requestAnimationFrame(loop); };
    loop();
  },
  resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    this.c.width = this.w * d; this.c.height = this.h * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  },
  setMode(mode) {
    const mix = this.mixes[mode] || {};
    const k = reducedMotion ? 0.35 : 1;
    this.parts = [];
    for (const [type, n] of Object.entries(mix))
      for (let i = 0; i < Math.round(n * k); i++) this.parts.push(this.make(type, true));
  },
  make(type, initial) {
    const { w, h } = this;
    switch (type) {
      case 'star': return { type, x: rand(0, w), y: rand(0, h), r: rand(.4, 1.6), ph: rand(0, 6.28), sp: rand(.01, .04) };
      case 'petal': return { type, x: rand(0, w), y: initial ? rand(-h, h) : -20, r: rand(4, 8), vy: rand(.4, 1.1), vx: rand(-.4, .4), rot: rand(0, 6.28), vr: rand(-.03, .03), sw: rand(0, 6.28), col: pick(['#ffb3d1', '#ff8fc0', '#f3c6ff', '#ffd6e7']) };
      case 'firefly': return { type, x: rand(0, w), y: rand(0, h), r: rand(1.2, 2.6), vx: rand(-.3, .3), vy: rand(-.3, .3), ph: rand(0, 6.28), sp: rand(.02, .05) };
      case 'sparkle': return { type, x: rand(0, w), y: initial ? rand(0, h) : h + 10, r: rand(1.5, 3.5), vy: rand(-.3, -.8), ph: rand(0, 6.28), col: pick(['#ffffff', '#ffe3b3', '#ffc2d9']) };
    }
  },
  draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    for (const p of this.parts) {
      switch (p.type) {
        case 'star':
          p.ph += p.sp;
          ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(p.ph));
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
        case 'petal':
          p.sw += .02; p.y += p.vy; p.x += p.vx + Math.sin(p.sw) * .5; p.rot += p.vr;
          if (p.y > h + 20) Object.assign(p, this.make('petal', false));
          ctx.globalAlpha = .85;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.283); ctx.fill();
          ctx.restore();
          break;
        case 'firefly': {
          p.ph += p.sp;
          p.x += p.vx + Math.sin(p.ph * .7) * .2; p.y += p.vy + Math.cos(p.ph * .5) * .2;
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
          ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(p.ph));
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, 'rgba(255,240,150,1)'); g.addColorStop(1, 'rgba(255,240,150,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
          break;
        }
        case 'sparkle':
          p.y += p.vy; p.ph += .05;
          if (p.y < -10) Object.assign(p, this.make('sparkle', false));
          ctx.globalAlpha = .2 + .6 * Math.abs(Math.sin(p.ph));
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
      }
    }
    ctx.globalAlpha = 1;
  },
};

/* =====================================================================
   Confeti
   ===================================================================== */
const Confetti = {
  c: $('#confetti'), ctx: null, parts: [], running: false,
  colors: ['#ff7eb6', '#cbb6ff', '#ffd166', '#7c4ddb', '#ffffff', '#6fd3a8'],
  size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.c.width = innerWidth * d; this.c.height = innerHeight * d;
    this.ctx = this.c.getContext('2d');
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  },
  burst(n = 140, fromTop = false) {
    this.size();
    const w = innerWidth, h = innerHeight;
    for (let i = 0; i < n * (reducedMotion ? .3 : 1); i++) {
      this.parts.push(fromTop
        ? { x: rand(0, w), y: rand(-h * .5, -10), vx: rand(-1, 1), vy: rand(2, 5), s: rand(6, 11), rot: rand(0, 6), vr: rand(-.2, .2), col: pick(this.colors), life: 400 }
        : { x: w / 2 + rand(-40, 40), y: h * .4, vx: rand(-8, 8), vy: rand(-14, -4), s: rand(6, 11), rot: rand(0, 6), vr: rand(-.3, .3), col: pick(this.colors), life: rand(120, 200) });
    }
    if (!this.running) { this.running = true; this.loop(); }
  },
  loop() {
    const { ctx } = this, h = innerHeight;
    ctx.clearRect(0, 0, innerWidth, h);
    this.parts = this.parts.filter(p => p.y < h + 30 && p.life > 0);
    for (const p of this.parts) {
      p.vy += .22; p.vx *= .99; p.vy = Math.min(p.vy, 6);
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.col; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (this.parts.length) requestAnimationFrame(() => this.loop());
    else { this.running = false; ctx.clearRect(0, 0, innerWidth, h); }
  },
};

/* =====================================================================
   Gráficos
   ===================================================================== */
const sprite = (path, cls = '') => `<img class="${cls}" src="${src(path)}" alt="" draggable="false">`;

const BUSH_SVG = `<svg class="bush" viewBox="0 0 150 90" preserveAspectRatio="none" aria-hidden="true">
  <ellipse cx="28" cy="62" rx="28" ry="26" fill="#2c7547"/>
  <ellipse cx="122" cy="62" rx="28" ry="26" fill="#2c7547"/>
  <ellipse cx="75" cy="44" rx="42" ry="40" fill="#3a9159"/>
  <ellipse cx="45" cy="58" rx="32" ry="30" fill="#3f9a5e"/>
  <ellipse cx="106" cy="58" rx="32" ry="30" fill="#358a53"/>
  <rect x="0" y="72" width="150" height="18" rx="6" fill="#276a40"/>
  <circle cx="60" cy="30" r="5" fill="#63c585" opacity=".55"/>
  <circle cx="96" cy="48" r="4" fill="#63c585" opacity=".55"/>
  <circle cx="34" cy="52" r="3.5" fill="#63c585" opacity=".55"/>
</svg>`;

function dinoSVG(color) {
  return `<svg viewBox="0 0 130 112" aria-hidden="true">
    <g class="leg leg-b"><rect x="42" y="80" width="13" height="26" rx="5" fill="${color}"/><rect x="42" y="80" width="13" height="26" rx="5" fill="#000" opacity=".15"/></g>
    <path d="M40 50 L46 38 L52 48 Z M53 46 L59 34 L65 45 Z" fill="${color}"/>
    <path d="M40 50 L46 38 L52 48 Z M53 46 L59 34 L65 45 Z" fill="#000" opacity=".14"/>
    <path d="M34 64 Q14 60 3 42 Q6 78 42 86 Z" fill="${color}"/>
    <ellipse cx="58" cy="70" rx="30" ry="22" fill="${color}"/>
    <ellipse cx="63" cy="77" rx="18" ry="12" fill="#fff" opacity=".35"/>
    <rect x="66" y="34" width="20" height="36" rx="9" fill="${color}"/>
    <path d="M68 22 L73 11 L79 20 Z" fill="${color}"/>
    <rect x="70" y="12" width="56" height="36" rx="16" fill="${color}"/>
    <circle cx="104" cy="25" r="4.8" fill="#1a1033"/>
    <circle cx="105.8" cy="23.2" r="1.6" fill="#fff"/>
    <ellipse cx="95" cy="36" rx="5.5" ry="3.2" fill="#ff8fb3" opacity=".75"/>
    <path d="M106 40 Q114 43 121 37" stroke="#1a1033" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <rect x="82" y="58" width="16" height="7" rx="3.5" fill="${color}"/>
    <g class="leg leg-a"><rect x="63" y="82" width="13" height="26" rx="5" fill="${color}"/></g>
  </svg>`;
}

const polaroidHTML = (photo, caption = '', r = -2) =>
  `<figure class="polaroid" style="--r:${r.toFixed(1)}deg">` +
  (photo ? `<img src="${src(photo)}" alt="">` : '') +
  `<figcaption>${esc(caption)}</figcaption></figure>`;

function preload(paths) { paths.forEach(p => { if (p) new Image().src = src(p); }); }

/* =====================================================================
   Modal
   ===================================================================== */
function openModal({ head = '', body = '', btn = 'Continuar', onClose }) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-inner">${head ? `<p class="modal-head">${head}</p>` : ''}${body}<button class="btn btn-primary modal-btn">${btn}</button></div>`;
  document.body.appendChild(m);
  void m.offsetWidth;
  m.classList.add('show');
  let closed = false;
  const openedAt = performance.now();
  $('.modal-btn', m).addEventListener('click', () => {
    // evita que un doble toque cierre también el siguiente modal
    if (closed || performance.now() - openedAt < 600) return;
    closed = true;
    m.classList.remove('show');
    setTimeout(() => m.remove(), 300);
    onClose && onClose();
  });
}

/* =====================================================================
   Escenas
   ===================================================================== */
const ORDER = ['intro', 'music', 'garden', 'rolls', 'dino', 'letter', 'gift'];
const TITLES = {
  music: ['NIVEL 1', 'Your Soundtrack'],
  garden: ['NIVEL 2', 'The Tulip Garden'],
  rolls: ['NIVEL 3', 'Cinnamoroll Quest'],
  dino: ['NIVEL 4', 'Jurassic Surprise'],
  letter: ['FINAL', 'Una carta para ti 💌'],
};
const scenes = {};
let current = null;
let transitioning = false;

function show(name) {
  clearTimers();
  current = name;
  $$('.scene').forEach(s => s.classList.toggle('active', s.id === 'scene-' + name));
  $$('.bg').forEach(b => b.classList.toggle('active', b.dataset.bg === name));
  FX.setMode(name);
  updateHud();
  if (name !== 'intro') store.set({ chapter: ORDER.indexOf(name) });
  scenes[name] && scenes[name]();
}

function goTo(name) {
  if (transitioning) return;
  const t = TITLES[name];
  if (!t) { show(name); return; }
  transitioning = true;
  const card = $('#titleCard');
  $('.tc-kicker', card).textContent = t[0];
  $('.tc-title', card).textContent = t[1];
  card.classList.add('show');
  Sound.chime();
  setTimeout(() => show(name), 700);
  setTimeout(() => { card.classList.remove('show'); transitioning = false; }, 1900);
}

function updateHud() {
  const idx = ORDER.indexOf(current);
  $('#hud').hidden = current === 'intro';
  $('#hud').classList.remove('tucked');
  $$('.hud-dots span').forEach(s => {
    const i = ORDER.indexOf(s.dataset.step);
    s.classList.toggle('done', i < idx);
    s.classList.toggle('current', i === idx);
  });
}

/* ---------- Inicio ---------- */
function setupIntro() {
  const row = $('#tulipRow');
  const colors = ['#ff7eb6', '#c77dff', '#ffb3d1', '#ff5c8a', '#e0b3ff', '#ff9fc4'];
  const n = Math.max(9, Math.round(innerWidth / 38));
  for (let i = 0; i < n; i++) {
    const h = rand(90, 180);
    row.insertAdjacentHTML('beforeend',
      `<svg style="left:${(i / (n - 1)) * 100 - 4 + rand(-2, 2)}%;height:${h}px;width:${h / 2}px;color:${pick(colors)};animation-delay:${-rand(0, 4)}s;animation-duration:${rand(3, 5)}s"><use href="#tulip"/></svg>`);
  }

  const saved = store.get().chapter || 0;
  if (saved > 0) {
    $('#startBtn').textContent = 'CONTINUAR';
    $('#restartBtn').hidden = false;
  }
  $('#startBtn').addEventListener('click', () => {
    Sound.ensure();
    const ch = store.get().chapter || 0;
    goTo(ORDER[Math.max(1, ch)]);
  });
  $('#restartBtn').addEventListener('click', () => {
    Sound.ensure();
    store.clear();
    goTo('music');
  });
}

/* ---------- Nivel 1 · Música ---------- */
function setupMusic() {
  const eq = $('#eq');
  for (let i = 0; i < 16; i++) eq.insertAdjacentHTML('beforeend', `<i style="--d:${-rand(0, .7).toFixed(2)}s"></i>`);

  $('#songList').innerHTML = CONFIG.songs.map(s => {
    const url = 'https://open.spotify.com/search/' + encodeURIComponent(`${s.title} Olivia Rodrigo`);
    return `<li><a href="${url}" target="_blank" rel="noopener"><span>${esc(s.title)}</span><small>${esc(s.album)} ↗</small></a></li>`;
  }).join('');
  $('#playlistLink').href = CONFIG.playlistUrl;

  const player = $('#player');
  const fmt = s => `0:${String(Math.floor(s)).padStart(2, '0')}`;

  $('#playBtn').addEventListener('click', () => {
    if (player.classList.contains('playing')) return;
    player.classList.add('playing');
    $('#trackSub').textContent = 'Happy Birthday (8-bit version) 🎂';
    const dur = Sound.birthday();
    $('#tTotal').textContent = fmt(dur);
    const t0 = performance.now();
    const tick = () => {
      if (current !== 'music') return;
      const el = (performance.now() - t0) / 1000;
      const p = Math.min(1, el / dur);
      $('#musicProgress').style.width = (p * 100) + '%';
      $('#tNow').textContent = fmt(Math.min(el, dur));
      if (p < 1) { requestAnimationFrame(tick); return; }
      player.classList.remove('playing');
      player.classList.add('unlocked');
      $('#trackSub').textContent = '✨ Siguiente capítulo desbloqueado ✨';
      $('#musicNext').hidden = false;
      Sound.chime();
      Confetti.burst(80);
    };
    requestAnimationFrame(tick);
  });
  $('#musicNext').addEventListener('click', () => goTo('garden'));
}
scenes.music = () => {
  const player = $('#player');
  player.classList.remove('playing', 'unlocked');
  $('#musicProgress').style.width = '0';
  $('#tNow').textContent = '0:00';
  $('#trackSub').textContent = 'Pero antes de comenzar, necesitamos poner la música correcta.';
  $('#musicNext').hidden = true;
};

/* ---------- Nivel 2 · Jardín ---------- */
scenes.garden = () => {
  preload([CONFIG.firstMemory.photo]);
  const field = $('#field');
  field.innerHTML = '';
  $('#gardenCount').textContent = '0';
  const positions = [
    [18, 1], [50, 4], [82, 0],
    [14, 34], [47, 31], [80, 35],
    [24, 66], [56, 67], [86, 65],
  ];
  const colors = ['#ff7eb6', '#ff5c8a', '#c77dff', '#ff9f6b', '#e79cff', '#ff6fa5'];
  const hidden = new Set(shuffle([...positions.keys()]).slice(0, 3));
  let found = 0;

  positions.forEach(([x, y], i) => {
    const b = document.createElement('button');
    b.className = 'tulip-btn';
    b.setAttribute('aria-label', 'Tulipán');
    b.style.left = (x + rand(-3, 3)) + '%';
    b.style.top = y + '%';
    b.style.color = pick(colors);
    b.style.setProperty('--d', `${-rand(0, 3.4).toFixed(2)}s`);
    b.innerHTML = `<svg><use href="#tulip"/></svg><span class="reveal"></span>`;
    b.addEventListener('click', () => {
      if (b.classList.contains('tapped')) return;
      b.classList.add('tapped');
      const reveal = $('.reveal', b);
      if (hidden.has(i)) {
        b.classList.add('found');
        reveal.textContent = '✨';
        Sound.chime();
        found++;
        $('#gardenCount').textContent = found;
        const pill = $('#gardenPill');
        pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump');
        if (found === 3) {
          later(() => {
            Confetti.burst(120);
            Sound.win();
            openModal({
              head: '✨ Encontraste el primer recuerdo ✨',
              body: polaroidHTML(CONFIG.firstMemory.photo, CONFIG.firstMemory.caption, -2),
              btn: 'Siguiente nivel →',
              onClose: () => goTo('rolls'),
            });
          }, 900);
        }
      } else {
        reveal.textContent = pick(['🐝', '🦋', '🐞', '🍃', '🌸']);
        Sound.soft();
      }
    });
    field.appendChild(b);
  });
};

/* ---------- Nivel 3 · Cinnamon rolls ---------- */
const rollState = { got: 0, active: false };
function setupRolls() {
  $('#bigRoll').innerHTML = sprite(CONFIG.cinnamoroll.start);
  const sky = $('.bg-rolls');
  for (let i = 0; i < 6; i++) {
    sky.insertAdjacentHTML('beforeend',
      `<div class="cloud" style="top:${(8 + i * 15 + rand(-4, 4)).toFixed(0)}%;scale:${rand(.5, 1.1).toFixed(2)};animation-duration:${rand(28, 50).toFixed(0)}s;animation-delay:${-rand(0, 50).toFixed(0)}s"></div>`);
  }
  $('#rollsGo').addEventListener('click', () => {
    Sound.pop();
    $('#rollsStart').hidden = true;
    rollState.active = true;
    later(spawnRoll, 400);
  });
}
scenes.rolls = () => {
  const cr = CONFIG.cinnamoroll;
  preload([...CONFIG.rolls.map(r => r.photo), ...cr.catchable, cr.complete]);
  rollState.got = 0; rollState.active = false;
  $$('#arena .roll, #arena .plus').forEach(el => el.remove());
  $('#rollsStart').hidden = false;
  $('#rollMeter').innerHTML = sprite(cr.meter).repeat(CONFIG.rolls.length);
};

function spawnRoll() {
  if (!rollState.active || current !== 'rolls') return;
  const arena = $('#arena');
  if ($$('.roll:not(.leaving)', arena).length < 2) {
    const el = document.createElement('button');
    el.className = 'roll';
    el.setAttribute('aria-label', 'Cinnamoroll');
    el.dataset.sprite = pick(CONFIG.cinnamoroll.catchable);
    el.innerHTML = sprite(el.dataset.sprite);
    el.style.left = rand(16, 84) + '%';
    el.style.top = rand(12, 86) + '%';
    el.style.setProperty('--dx', rand(-40, 40).toFixed(0) + 'px');
    el.style.setProperty('--dy', rand(-40, 40).toFixed(0) + 'px');
    arena.appendChild(el);
    const life = later(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 360);
    }, 2800);
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!rollState.active || el.classList.contains('leaving')) return;
      clearTimeout(life); timers.delete(life);
      catchRoll(el);
    });
  }
  later(spawnRoll, rand(850, 1250));
}

function catchRoll(el) {
  const arena = $('#arena');
  rollState.active = false;
  clearTimers();
  $$('.roll', arena).forEach(r => { if (r !== el) r.remove(); });
  el.classList.add('caught');
  Sound.pop();

  const plus = document.createElement('span');
  plus.className = 'plus';
  plus.textContent = '+1';
  plus.style.left = el.style.left; plus.style.top = el.style.top;
  arena.appendChild(plus);
  setTimeout(() => plus.remove(), 900);

  const i = rollState.got++;
  $$('#rollMeter img')[i].classList.add('got');
  const caughtSprite = el.dataset.sprite;
  const item = CONFIG.rolls[i];
  const total = CONFIG.rolls.length;

  setTimeout(() => {
    el.remove();
    const last = rollState.got >= total;
    openModal({
      head: `☁️ ${rollState.got}/${total}`,
      body: `<div class="stickered">${polaroidHTML(item.photo, item.text, rand(-3, 3))}${sprite(caughtSprite, 'sticker')}</div>`,
      btn: last ? '¿Y ahora?' : 'Seguir ›',
      onClose: () => {
        if (current !== 'rolls') return;
        if (!last) { rollState.active = true; later(spawnRoll, 450); return; }
        Sound.win();
        Confetti.burst(160);
        openModal({
          body: `<div class="quest">${sprite(CONFIG.cinnamoroll.complete, 'quest-img')}<p class="quest-title">QUEST<br>COMPLETE</p><p>🎉 ${total}/${total} Cinnamorolls</p></div>`,
          btn: 'Siguiente nivel →',
          onClose: () => goTo('dino'),
        });
      },
    });
  }, 380);
}

/* ---------- Nivel 4 · Dinosaurios ---------- */
function setupDino() {
  // Pinos de fondo
  let svg = '<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">';
  svg += '<circle cx="320" cy="120" r="60" fill="#e8ffd9" opacity=".08"/>';
  const layers = [
    { n: 7, base: 470, h: 260, col: '#0f2c21' },
    { n: 6, base: 640, h: 250, col: '#153b2b' },
    { n: 5, base: 820, h: 230, col: '#1b4a34' },
  ];
  layers.forEach((l, li) => {
    for (let i = 0; i < l.n; i++) {
      const x = (i + .5) * (400 / l.n) + (li % 2 ? 22 : -10), w = l.h * .32;
      for (let t = 0; t < 3; t++) {
        const y = l.base - t * l.h * .28, tw = w * (1 - t * .25);
        svg += `<polygon points="${x},${y - l.h * .45} ${x - tw},${y} ${x + tw},${y}" fill="${l.col}"/>`;
      }
    }
  });
  svg += '</svg>';
  $('.bg-dino').innerHTML = svg;
  $('#walkerSvg').innerHTML = dinoSVG('#6fcf7f');

  $('#dinoGo').addEventListener('click', () => {
    Sound.pop();
    $('#dinoWarning').hidden = true;
    $('#forest').hidden = false;
  });
  $('#dinoNext').addEventListener('click', () => {
    $('#bigDino').hidden = true;
    goTo('letter');
  });
}
scenes.dino = () => {
  $('#dinoWarning').hidden = false;
  $('#forest').hidden = true;
  $('#bigDino').hidden = true;
  later(() => Sound.alarm(), 900);

  const stage = $('#forestStage');
  stage.innerHTML = '';
  $('#dinoCount').textContent = '0';
  const spots = [[24, 6], [74, 8], [48, 32], [18, 55], [80, 55], [50, 78], [20, 98], [76, 100]];
  const dinoSpots = new Set(shuffle([...spots.keys()]).slice(0, 5));
  const colors = shuffle(['#6fcf7f', '#b18cff', '#ff9cc6', '#5fd3c6', '#ffc75f']);
  let found = 0, c = 0;

  spots.forEach(([x, y], i) => {
    const s = document.createElement('button');
    s.className = 'spot';
    s.setAttribute('aria-label', 'Arbusto');
    s.style.left = x + '%';
    // reparte los arbustos en toda la altura sin que el último se salga
    s.style.top = `calc(${y}% - clamp(104px, 32vw, 150px) * ${(0.8 * y / 100).toFixed(3)})`;
    const has = dinoSpots.has(i);
    if (has) {
      s.classList.add('has-dino');
      if (Math.random() < .5) s.classList.add('flip');
      s.style.setProperty('--p', rand(3.8, 6).toFixed(1) + 's');
      s.style.setProperty('--pd', (-rand(0, 5)).toFixed(1) + 's');
      s.innerHTML = `<div class="dino-wrap"><div class="dino">${dinoSVG(colors[c++])}</div></div>${BUSH_SVG}`;
    } else {
      s.innerHTML = BUSH_SVG;
    }
    s.addEventListener('click', () => {
      if (s.classList.contains('found')) return;
      s.classList.remove('rustle'); void s.offsetWidth; s.classList.add('rustle');
      const tag = document.createElement('span');
      tag.className = 'tag';
      if (has) {
        s.classList.add('found');
        found++;
        $('#dinoCount').textContent = found;
        tag.textContent = '¡RAWR!';
        tag.style.fontFamily = 'var(--f-pixel)'; tag.style.fontSize = '11px';
        Sound.pop();
        if (found === 5) later(bigDino, 1000);
      } else {
        tag.textContent = pick(['🍃', '🐸', '🐛', '🍂']);
        Sound.soft();
      }
      s.appendChild(tag);
      setTimeout(() => tag.remove(), 1100);
    });
    stage.appendChild(s);
  });
};

function bigDino() {
  const layer = $('#bigDino'), walker = $('#walker'), tr = $('#translation');
  layer.hidden = false;
  walker.classList.remove('stopped');
  tr.classList.remove('show');
  walker.style.animation = 'none'; void walker.offsetWidth; walker.style.animation = '';
  Sound.stomps(7, 0.37);
  later(() => {
    walker.classList.add('stopped');
    Sound.roar();
    layer.classList.remove('shake'); void layer.offsetWidth; layer.classList.add('shake');
  }, 2600);
  later(() => { tr.classList.add('show'); Confetti.burst(140); Sound.chime(); }, 3900);
}

/* ---------- Carta ---------- */
function setupLetter() {
  ['.bg-letter', '.bg-gift'].forEach(sel => {
    const bg = $(sel);
    const colors = ['#ff7eb6', '#c77dff', '#ffb3d1', '#e0b3ff'];
    for (let i = 0; i < 10; i++) {
      const h = rand(50, 110);
      bg.insertAdjacentHTML('beforeend',
        `<svg class="float-tulip" style="left:${rand(0, 95)}%;height:${h}px;width:${h / 2}px;color:${pick(colors)};animation-duration:${rand(16, 30)}s;animation-delay:${-rand(0, 30)}s"><use href="#tulip"/></svg>`);
    }
  });

  setupGallery();

  $('#envelope').addEventListener('click', () => {
    const env = $('#envelope');
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    Sound.chime();
    later(() => {
      env.hidden = true;
      $('#envHint').hidden = true;
      const letter = $('#letter');
      const paras = CONFIG.letter.map(withName);
      const sign = CONFIG.from ? `Con cariño, ${CONFIG.from} 💜` : 'Con todo mi cariño 💜';
      letter.innerHTML = paras.map((p, i) => {
        const big = p.startsWith('*');
        return `<p class="${big ? 'big' : ''}" style="--i:${i}">${esc(big ? p.slice(1) : p)}</p>`;
      }).join('') + `<p class="sign" style="--i:${paras.length}">${esc(sign)}</p>`;
      letter.hidden = false;
      later(() => { $('#gallery').hidden = false; $('#oneLast').hidden = false; }, (paras.length + 1) * 850 + 900);
    }, 1100);
  });
  $('#giftBtn').addEventListener('click', () => { $('#hud').classList.remove('tucked'); show('gift'); });
  // al bajar por la carta, esconder los iconos del HUD para que no tapen el texto
  const letterScene = $('#scene-letter');
  letterScene.addEventListener('scroll', () => {
    $('#hud').classList.toggle('tucked', letterScene.scrollTop > 40);
  }, { passive: true });
}
/* ---------- Galería (carrusel + visor) ---------- */
const DOODLES = ['💜', '🌷', '✨', '🦖', '☁️', '🎵'];
let galleryGo = () => {};

function setupGallery() {
  const photos = CONFIG.gallery;
  const n = photos.length;
  const track = $('#galleryTrack'), thumbs = $('#galThumbs');
  track.innerHTML = photos.map((p, i) =>
    `<figure class="polaroid slide" data-i="${i}"><img src="${src(p)}" alt="Foto ${i + 1}" loading="lazy" draggable="false"><figcaption>${DOODLES[i % DOODLES.length]}</figcaption></figure>`).join('');
  thumbs.innerHTML = photos.map((p, i) =>
    `<button class="thumb" data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${src(p)}" alt="" loading="lazy" draggable="false"></button>`).join('');
  $('#galTotal').textContent = n;

  const slides = $$('.slide', track), thumbBtns = $$('.thumb', thumbs);
  let idx = -1;

  const center = (container, el) => el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2;
  galleryGo = (i, smooth = true) => {
    i = Math.max(0, Math.min(n - 1, i));
    track.scrollTo({ left: center(track, slides[i]), behavior: smooth && !reducedMotion ? 'smooth' : 'auto' });
  };
  const setActive = i => {
    if (i === idx) return;
    idx = i;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    thumbBtns.forEach((t, k) => t.classList.toggle('active', k === i));
    $('#galIndex').textContent = i + 1;
    $('#galPrev').disabled = i === 0;
    $('#galNext').disabled = i === n - 1;
    thumbs.scrollTo({ left: center(thumbs, thumbBtns[i]), behavior: 'smooth' });
  };
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      slides.forEach((s, k) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = k; }
      });
      setActive(best);
    });
  }, { passive: true });

  $('#galPrev').addEventListener('click', () => galleryGo(idx - 1));
  $('#galNext').addEventListener('click', () => galleryGo(idx + 1));
  thumbBtns.forEach((t, k) => t.addEventListener('click', () => galleryGo(k)));
  slides.forEach((s, k) => s.addEventListener('click', () => (k === idx ? Lightbox.open(k) : galleryGo(k))));
  setActive(0);
  Lightbox.init();
}

const Lightbox = {
  i: 0,
  init() {
    const lb = $('#lightbox'), stage = $('#lbStage'), img = $('#lbImg');
    $('#lbClose').addEventListener('click', () => this.close());
    $('#lbPrev').addEventListener('click', () => this.go(-1));
    $('#lbNext').addEventListener('click', () => this.go(1));
    // tocar fuera de la foto cierra
    stage.addEventListener('click', e => { if (e.target === stage) this.close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.go(-1);
      if (e.key === 'ArrowRight') this.go(1);
    });
    // deslizar con el dedo
    let x0 = null, dx = 0;
    img.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; img.classList.add('dragging'); try { img.setPointerCapture(e.pointerId); } catch {} });
    img.addEventListener('pointermove', e => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      img.style.transform = `translateX(${dx}px) rotate(${dx / 40}deg)`;
    });
    const end = () => {
      if (x0 === null) return;
      x0 = null;
      img.classList.remove('dragging');
      if (Math.abs(dx) > 60) this.go(dx < 0 ? 1 : -1);
      else img.style.transform = '';
    };
    img.addEventListener('pointerup', end);
    img.addEventListener('pointercancel', end);
  },
  open(i) {
    const lb = $('#lightbox');
    lb.hidden = false;
    void lb.offsetWidth;
    lb.classList.add('show');
    this.show(i, 0);
    Sound.pop();
  },
  close() {
    const lb = $('#lightbox');
    lb.classList.remove('show');
    setTimeout(() => { lb.hidden = true; }, 250);
    galleryGo(this.i, false);
  },
  go(d) {
    const n = CONFIG.gallery.length;
    this.show((this.i + d + n) % n, d);
  },
  show(i, dir) {
    const photos = CONFIG.gallery, n = photos.length, img = $('#lbImg');
    this.i = i;
    img.style.transition = 'none';
    img.style.opacity = '0';
    img.style.transform = `translateX(${dir * 70}px)`;
    img.src = src(photos[i]);
    $('#lbCaption').textContent = DOODLES[i % DOODLES.length];
    $('#lbCount').textContent = `${i + 1} / ${n}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      img.style.transition = '';
      img.style.opacity = '';
      img.style.transform = '';
    }));
    preload([photos[(i + 1) % n], photos[(i - 1 + n) % n]]);
  },
};

scenes.letter = () => {
  preload(CONFIG.gallery.slice(0, 3));
  const scene = $('#scene-letter');
  scene.scrollTop = 0;
  const env = $('#envelope');
  env.classList.remove('open');
  env.hidden = false;
  $('#envHint').hidden = false;
  $('#letter').hidden = true;
  $('#gallery').hidden = true;
  $('#oneLast').hidden = true;
};

/* ---------- Regalo ---------- */
function setupGift() {
  $('#giftBox').addEventListener('click', () => {
    const box = $('#giftBox');
    if (box.classList.contains('open')) return;
    box.classList.add('open');
    Sound.win();
    Confetti.burst(180);
    later(() => {
      box.hidden = true;
      $('#giftHint').hidden = true;
      $('#giftKicker').hidden = true;
      const g = CONFIG.gift;
      const card = $('#giftCard');
      card.innerHTML = `
        <p class="gc-label pixel">${esc(g.label)}</p>
        <h3 class="gc-title">${esc(g.title)}</h3>
        <hr class="gc-divider">
        ${g.photo ? `<img class="gc-photo" src="${src(g.photo)}" alt="">` : ''}
        <p class="gc-text">${esc(g.text)}</p>
        <p class="gc-detail">${esc(g.detail)}</p>
        <p class="gc-bday">${esc(g.greeting)}</p>
        <button class="btn btn-ghost btn-small" id="replayBtn">↺ Jugar otra vez</button>`;
      card.hidden = false;
      const divider = $('.gc-divider', card);
      card.style.setProperty('--notch', `${divider.offsetTop - 13}px`);
      $('#replayBtn').addEventListener('click', () => { store.clear(); location.reload(); });
      Confetti.burst(160, true);
    }, 850);
  });
}
scenes.gift = () => {
  const box = $('#giftBox');
  box.classList.remove('open');
  box.hidden = false;
  $('#giftHint').hidden = false;
  $('#giftKicker').hidden = false;
  $('#giftCard').hidden = true;
  if (CONFIG.gift.photo) preload([CONFIG.gift.photo]);
};

/* =====================================================================
   Arranque
   ===================================================================== */
$$('.js-name').forEach(el => { el.textContent = CONFIG.name; });
document.title = `Para ${CONFIG.name} 🌷`;

const muteBtn = $('#muteBtn');
Sound.setMuted(!!store.get().muted);
muteBtn.textContent = Sound.muted ? '🔇' : '🔊';
muteBtn.addEventListener('click', () => {
  Sound.setMuted(!Sound.muted);
  store.set({ muted: Sound.muted });
  muteBtn.textContent = Sound.muted ? '🔇' : '🔊';
  muteBtn.setAttribute('aria-label', Sound.muted ? 'Activar sonido' : 'Silenciar sonido');
});

FX.init();
setupIntro();
setupMusic();
setupRolls();
setupDino();
setupLetter();
setupGift();
show('intro');

})();
