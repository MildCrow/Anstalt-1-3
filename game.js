(() => {
'use strict';
const TAU = Math.PI * 2, W = 480, H = 270, N = 10, S = N * 2 + 1, PL = 0.75;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rngSeed = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

const view = $('view'), ctx = view.getContext('2d');
view.width = W; view.height = H;
const scv = $('scare'), sctx = scv.getContext('2d');
scv.width = 960; scv.height = 540;
const stage = $('stage');
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
const tmp = mk(W, H, () => {}); const tctx = tmp.getContext('2d');

/* ---------- textures ---------- */
const tr = rngSeed(1337);
function speck(g, n, w, h) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = tr() < 0.7 ? 'rgba(0,0,0,' + (0.1 + tr() * 0.2) + ')' : 'rgba(255,255,255,' + (0.03 + tr() * 0.05) + ')';
    g.fillRect(tr() * w | 0, tr() * h | 0, 1 + (tr() * 2 | 0), 1);
  }
}
function tiles(g, base) {
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath(); g.moveTo(i + .5, 0); g.lineTo(i + .5, 64); g.stroke();
    g.beginPath(); g.moveTo(0, i + .5); g.lineTo(64, i + .5); g.stroke();
  }
  speck(g, 260, 64, 64);
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,10,0,.55)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
}
const WT = [
  mk(64, 64, g => tiles(g, '#5b6254')),
  mk(64, 64, g => {
    g.fillStyle = '#4d473d'; g.fillRect(0, 0, 64, 64); speck(g, 320, 64, 64);
    g.strokeStyle = 'rgba(15,10,5,.7)'; g.lineWidth = 1;
    for (let k = 0; k < 3; k++) { let x = tr() * 64, y = 0; g.beginPath(); g.moveTo(x, y); while (y < 64) { x += (tr() - .5) * 8; y += 4 + tr() * 6; g.lineTo(x, y); } g.stroke(); }
    const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(25,12,0,.5)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }),
  mk(64, 64, g => {
    tiles(g, '#565b4f');
    for (let i = 0; i < 7; i++) {
      const x = tr() * 64, len = 14 + tr() * 40, w = 1 + tr() * 3;
      const gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, '#7a0b0b'); gr.addColorStop(1, '#3a0505');
      g.fillStyle = gr; g.fillRect(x, 0, w, len); g.beginPath(); g.arc(x + w / 2, len, w * .8, 0, TAU); g.fill();
    }
    g.fillStyle = 'rgba(110,8,8,.55)'; g.beginPath(); g.ellipse(32, 36, 17, 9, .5, 0, TAU); g.fill();
    g.fillStyle = 'rgba(90,6,6,.8)';
    for (let f = 0; f < 4; f++) { g.beginPath(); g.ellipse(24 + f * 5, 20, 1.8, 6, (f - 1.5) * .12, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(32, 28, 8, 6, 0, 0, TAU); g.fill();
  }),
  mk(64, 64, g => {
    g.fillStyle = '#3b403c'; g.fillRect(0, 0, 64, 64); speck(g, 200, 64, 64);
    g.strokeStyle = '#1a1d1b'; g.lineWidth = 2; g.strokeRect(6, 4, 52, 58);
    g.fillStyle = '#050606'; g.fillRect(22, 10, 20, 16);
    g.strokeStyle = '#55584f'; g.lineWidth = 1;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(25 + i * 4, 10); g.lineTo(25 + i * 4, 26); g.stroke(); }
    g.fillStyle = '#8b1313'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText('13', 32, 44);
    g.fillStyle = 'rgba(120,50,10,.35)';
    for (let i = 0; i < 5; i++) g.fillRect(8 + tr() * 48, 30 + tr() * 30, 2, 8 + tr() * 18);
    g.fillStyle = '#6d6f66'; g.beginPath(); g.arc(50, 38, 2.4, 0, TAU); g.fill();
  })
];

/* ---------- sprites ---------- */
const SP = {};
SP.monster = mk(128, 256, g => {
  g.fillStyle = '#0b0909';
  g.beginPath(); g.moveTo(46, 84); g.lineTo(82, 84); g.lineTo(92, 172); g.lineTo(80, 252); g.lineTo(48, 252); g.lineTo(36, 172); g.closePath(); g.fill();
  g.strokeStyle = '#0b0909'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(44, 92); g.quadraticCurveTo(8, 150, 18, 228); g.stroke();
  g.beginPath(); g.moveTo(84, 92); g.quadraticCurveTo(120, 150, 110, 228); g.stroke();
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    g.beginPath(); g.moveTo(18, 228); g.lineTo(8 + i * 5, 254); g.stroke();
    g.beginPath(); g.moveTo(110, 228); g.lineTo(102 + i * 5, 254); g.stroke();
  }
  g.fillStyle = '#16110f'; g.fillRect(56, 68, 16, 24);
  const hg = g.createRadialGradient(58, 40, 4, 64, 50, 40); hg.addColorStop(0, '#ece5d4'); hg.addColorStop(1, '#7c7465');
  g.fillStyle = hg; g.beginPath(); g.ellipse(64, 50, 26, 36, 0, 0, TAU); g.fill();
  g.fillStyle = '#060303';
  g.beginPath(); g.ellipse(53, 44, 8, 12, .2, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(75, 44, 8, 12, -.2, 0, TAU); g.fill();
  g.fillStyle = '#ff2a1a'; g.fillRect(52, 47, 2, 2); g.fillRect(74, 47, 2, 2);
  g.fillStyle = '#060303';
  g.beginPath(); g.moveTo(44, 64); g.quadraticCurveTo(64, 58, 84, 64); g.quadraticCurveTo(80, 92, 64, 92); g.quadraticCurveTo(48, 92, 44, 64); g.fill();
  g.fillStyle = '#e8e0c8';
  for (let i = 0; i < 8; i++) { const x = 47 + i * 4.6; g.beginPath(); g.moveTo(x - 2, 64); g.lineTo(x + 2, 64); g.lineTo(x, 72 + (i % 2) * 3); g.fill(); }
  g.strokeStyle = 'rgba(30,20,10,.6)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(64, 16); g.lineTo(60, 28); g.lineTo(63, 34); g.stroke();
});
SP.ghost = mk(64, 128, g => {
  const gr = g.createLinearGradient(0, 40, 0, 128); gr.addColorStop(0, '#d9d4c6'); gr.addColorStop(1, 'rgba(120,115,100,.2)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(24, 46); g.lineTo(40, 46); g.lineTo(54, 126); g.lineTo(10, 126); g.closePath(); g.fill();
  g.strokeStyle = '#cfc9ba'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(24, 52); g.lineTo(14, 96); g.stroke(); g.beginPath(); g.moveTo(40, 52); g.lineTo(50, 96); g.stroke();
  g.fillStyle = '#cfc9ba'; g.beginPath(); g.ellipse(32, 30, 11, 15, 0, 0, TAU); g.fill();
  g.fillStyle = '#020101'; g.beginPath(); g.moveTo(18, 22); g.quadraticCurveTo(32, 8, 46, 22); g.lineTo(52, 100); g.lineTo(44, 60); g.lineTo(38, 32); g.lineTo(26, 32); g.lineTo(20, 60); g.lineTo(12, 100); g.closePath(); g.fill();
  g.fillStyle = '#140808'; g.fillRect(28, 38, 8, 5);
});
SP.key = mk(32, 64, g => {
  const gl = g.createRadialGradient(16, 32, 2, 16, 32, 16); gl.addColorStop(0, 'rgba(255,190,80,.7)'); gl.addColorStop(1, 'rgba(255,190,80,0)');
  g.fillStyle = gl; g.fillRect(0, 16, 32, 32);
  g.fillStyle = '#8a8579'; g.fillRect(10, 18, 12, 5); g.fillRect(10, 41, 12, 5);
  g.fillStyle = 'rgba(255,200,90,.85)'; g.fillRect(11, 23, 10, 18);
  g.strokeStyle = '#fff3c4'; g.lineWidth = 1; g.beginPath(); g.moveTo(16, 24); g.lineTo(16, 40); g.stroke();
});
SP.bat = mk(32, 32, g => {
  g.fillStyle = '#233a22'; g.fillRect(8, 8, 16, 18); g.fillStyle = '#8fb08a'; g.fillRect(8, 8, 16, 4); g.fillStyle = '#aaa'; g.fillRect(13, 4, 6, 4);
  g.fillStyle = '#d8ffd0'; g.fillRect(14, 15, 4, 7);
});
SP.exit = mk(64, 128, g => {
  g.fillStyle = '#1c231d'; g.fillRect(4, 10, 56, 118);
  g.fillStyle = '#2a362b'; g.fillRect(8, 14, 48, 114);
  g.fillStyle = '#050806'; g.fillRect(20, 26, 24, 22);
  g.fillStyle = '#18ff6a'; g.fillRect(10, 2, 44, 9);
  g.fillStyle = '#021a0a'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('AUSGANG', 32, 9.5);
  g.fillStyle = '#7e8a7c'; g.beginPath(); g.arc(50, 78, 3, 0, TAU); g.fill();
});
const noiseC = mk(64, 64, g => { const d = g.createImageData(64, 64); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); });
const vig = mk(W, H, g => {
  const gr = g.createRadialGradient(W / 2, H / 2, H * .1, W / 2, H / 2, W * .62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.55, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,.92)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});

/* ---------- audio ---------- */
const A = {
  ctx: null, master: null, nbuf: null, curve: null, vol: 0.6,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = this.vol;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 8; comp.attack.value = 0.002; comp.release.value = 0.2;
    this.master.connect(comp); comp.connect(c.destination);
    const len = c.sampleRate * 2; this.nbuf = c.createBuffer(1, len, c.sampleRate);
    const d = this.nbuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const k = 2048, cv = new Float32Array(k); for (let i = 0; i < k; i++) { const x = i / (k / 2) - 1; cv[i] = Math.tanh(x * 6); } this.curve = cv;
    this.startAmbient();
  },
  setVol(v) { this.vol = v; if (this.master) this.master.gain.value = v; },
  startAmbient() {
    const c = this.ctx;
    this.droneGain = c.createGain(); this.droneGain.gain.value = 0.12;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140; this.droneLP = lp;
    [41, 43.2, 82.6].forEach((f, i) => { const o = c.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); });
    lp.connect(this.droneGain); this.droneGain.connect(this.master);
    this.tenGain = c.createGain(); this.tenGain.gain.value = 0;
    [233, 329.6, 466.5].forEach(f => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(this.tenGain); o.start(); });
    this.tenGain.connect(this.master);
    const src = c.createBufferSource(); src.buffer = this.nbuf; src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.8;
    this.windGain = c.createGain(); this.windGain.gain.value = 0.05;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.13; const lg = c.createGain(); lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(this.windGain.gain);
    src.connect(bp); bp.connect(this.windGain); this.windGain.connect(this.master); src.start(); lfo.start();
  },
  amb(on) { if (!this.ctx) return; const t = this.ctx.currentTime; this.droneGain.gain.setTargetAtTime(on ? 0.12 : 0, t, 0.15); this.windGain.gain.setTargetAtTime(on ? 0.05 : 0.01, t, 0.15); if (!on) this.tenGain.gain.setTargetAtTime(0, t, 0.1); },
  tension(v) { if (!this.ctx) return; const t = this.ctx.currentTime; this.tenGain.gain.setTargetAtTime(v * 0.05, t, 0.3); this.droneLP.frequency.setTargetAtTime(110 + v * 260, t, 0.5); },
  dest(o) { const c = this.ctx; if (o.pan !== undefined && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); p.connect(this.master); return p; } return this.master; },
  tone(f, d, type = 'sine', g = 0.2, o = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const os = c.createOscillator(), ga = c.createGain();
    os.type = type; os.frequency.setValueAtTime(f, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(1, o.slide), t + d);
    ga.gain.setValueAtTime(0.0001, t); ga.gain.exponentialRampToValueAtTime(Math.max(0.0002, g), t + (o.att || 0.01)); ga.gain.exponentialRampToValueAtTime(0.0001, t + d);
    os.connect(ga); let out = ga;
    if (o.filter) { const fl = c.createBiquadFilter(); fl.type = o.filter.type; fl.frequency.value = o.filter.f; fl.Q.value = o.filter.q || 1; ga.connect(fl); out = fl; }
    out.connect(this.dest(o)); os.start(t); os.stop(t + d + 0.05);
  },
  noise(d, g = 0.2, o = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const src = c.createBufferSource(); src.buffer = this.nbuf; src.loop = true;
    const fl = c.createBiquadFilter(); fl.type = o.type || 'lowpass'; fl.frequency.setValueAtTime(o.f || 800, t);
    if (o.sweep) fl.frequency.exponentialRampToValueAtTime(o.sweep, t + d);
    fl.Q.value = o.q || 0.7;
    const ga = c.createGain(); ga.gain.setValueAtTime(0.0001, t); ga.gain.exponentialRampToValueAtTime(Math.max(0.0002, g), t + (o.att || 0.01)); ga.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(fl); fl.connect(ga); ga.connect(this.dest(o)); src.start(t, Math.random()); src.stop(t + d + 0.05);
  },
  beat(i) { this.tone(58, 0.16, 'sine', 0.55 * i + 0.1, { slide: 36 }); this.tone(50, 0.14, 'sine', 0.38 * i + 0.08, { slide: 32, delay: 0.17 }); },
  step(sprint) { this.noise(0.09, sprint ? 0.1 : 0.06, { f: 420, sweep: 160 }); this.tone(sprint ? 80 : 64, 0.08, 'sine', 0.07, { slide: 40 }); },
  chime() { this.tone(880, 0.9, 'sine', 0.12); this.tone(1318, 1.1, 'sine', 0.08, { delay: 0.08 }); this.tone(1760, 1.2, 'sine', 0.04, { delay: 0.16 }); },
  pickup() { this.tone(520, 0.25, 'triangle', 0.12, { slide: 880 }); },
  growl(pan, g) {
    this.tone(52, 1.1, 'sawtooth', 0.35 * g, { slide: 34, att: 0.15, pan, filter: { type: 'lowpass', f: 320, q: 4 } });
    this.noise(1.0, 0.18 * g, { f: 260, sweep: 120, pan, att: 0.2 });
  },
  whisper(pan) {
    for (let i = 0; i < 7; i++) this.noise(0.2, 0.09, { type: 'bandpass', f: 2600 + Math.random() * 1800, q: 4, delay: i * 0.21, pan, att: 0.05 });
  },
  bang() { this.noise(0.5, 0.9, { f: 1200, sweep: 80, att: 0.002 }); this.tone(42, 0.7, 'sine', 1, { slide: 24 }); },
  sting(g = 0.6) {
    [220, 233, 330, 349, 466, 622].forEach((f, i) => this.tone(f * (1 + i * 0.003), 0.9, 'sawtooth', g * 0.15, { slide: f * 0.7, att: 0.005, filter: { type: 'lowpass', f: 3000 } }));
    this.noise(0.5, g * 0.6, { type: 'highpass', f: 2000, att: 0.003 });
    this.tone(45, 0.5, 'sine', g * 0.9, { slide: 25 });
  },
  riser(d) { this.noise(d, 0.22, { type: 'bandpass', f: 400, sweep: 5000, q: 2, att: d * 0.8 }); this.tone(120, d, 'sawtooth', 0.12, { slide: 900, att: d * 0.8, filter: { type: 'lowpass', f: 2000 } }); },
  scream(d = 1.4, g = 0.8) {
    const c = this.ctx; if (!c) return; const t = c.currentTime;
    const ws = c.createWaveShaper(); ws.curve = this.curve; ws.oversample = '2x';
    const out = c.createGain(); out.gain.value = g; ws.connect(out); out.connect(this.master);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 1.2; bp.connect(ws);
    [0, 1, 2].forEach(i => {
      const o = c.createOscillator(); o.type = i === 1 ? 'square' : 'sawtooth';
      const base = 520 + i * 140;
      o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * 1.9, t + 0.15); o.frequency.linearRampToValueAtTime(base * 1.5, t + d);
      const lfo = c.createOscillator(); lfo.frequency.value = 28 + i * 7; const lg = c.createGain(); lg.gain.value = 60;
      lfo.connect(lg); lg.connect(o.frequency);
      const ga = c.createGain(); ga.gain.setValueAtTime(0.0001, t); ga.gain.exponentialRampToValueAtTime(0.5, t + 0.03); ga.gain.setValueAtTime(0.5, t + d * 0.6); ga.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(ga); ga.connect(bp); o.start(t); lfo.start(t); o.stop(t + d + 0.1); lfo.stop(t + d + 0.1);
    });
    this.noise(d, 0.6, { type: 'bandpass', f: 2400, q: 0.5, att: 0.02 });
    this.tone(60, 0.6, 'sine', 0.9, { slide: 30 });
  },
  alarm() {
    const c = this.ctx; if (!c) return; const t = c.currentTime;
    const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 700;
    const l = c.createOscillator(); l.frequency.value = 1.6; const lg = c.createGain(); lg.gain.value = 200; l.connect(lg); lg.connect(o.frequency);
    const ga = c.createGain(); ga.gain.setValueAtTime(0.0001, t); ga.gain.exponentialRampToValueAtTime(0.08, t + 0.2); ga.gain.setValueAtTime(0.08, t + 4); ga.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
    o.connect(ga); ga.connect(lp); lp.connect(this.master); o.start(t); l.start(t); o.stop(t + 5.1); l.stop(t + 5.1);
  },
  windOut() { this.noise(4, 0.15, { f: 500, sweep: 900, q: 0.6, att: 1.5 }); }
};

/* ---------- state ---------- */
let map = null, things = [], M = null, ghost = null, exitC = null, openCells = [];
let px = 1.5, py = 1.5, pa = 0, look = 0;
let state = 'menu';
let timers = [];
let scare = null;
const G = { keys: 0, need: 5, battery: 1, stamina: 1, tired: false, time: 0, scareT: 40, moving: false, sprinting: false, bob: 0, stepT: 0, beatT: 0, growlT: 5, pdist: null, pdT: 0, mdist: 99, exitMsgT: 0, lowMsg: false };
const FL = { on: true, kill: 0, flick: 0, power: 1, range: 11, eff: true };
const inp = { f: false, b: false, l: false, r: false, sl: false, sr: false, sprint: false, sx: 0, sy: 0 };
let calm = false;
const zBuf = new Float32Array(W);
const colAng = new Float32Array(W);
for (let x = 0; x < W; x++) colAng[x] = Math.atan((2 * x / W - 1) * PL);
const shadeCache = []; for (let i = 0; i <= 50; i++) shadeCache.push('rgba(3,0,0,' + (i / 50).toFixed(2) + ')');
const shade = a => shadeCache[Math.round(clamp(a, 0, 1) * 50)];

function later(sec, fn) { timers.push({ t: sec, fn }); }
const subEl = $('sub'); let subT = 0;
function msg(t, ms = 3600) { subEl.textContent = t; subEl.classList.add('on'); clearTimeout(subT); subT = setTimeout(() => subEl.classList.remove('on'), ms); }

/* ---------- maze ---------- */
const solid = (x, y) => { const mx = Math.floor(x), my = Math.floor(y); return mx < 0 || my < 0 || mx >= S || my >= S || map[my * S + mx] === 1; };
const PR = 0.22;
const blocked = (x, y) => solid(x - PR, y - PR) || solid(x + PR, y - PR) || solid(x - PR, y + PR) || solid(x + PR, y + PR);
function hasLOS(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy), n = Math.ceil(d / 0.15);
  for (let i = 1; i < n; i++) { if (solid(x0 + dx * i / n, y0 + dy * i / n)) return false; }
  return true;
}
function genMaze(rnd) {
  map = new Uint8Array(S * S).fill(1);
  const vis = new Uint8Array(N * N); const st = [[0, 0]]; vis[0] = 1; map[1 * S + 1] = 0;
  while (st.length) {
    const [cx, cy] = st[st.length - 1]; const nb = [];
    DIRS.forEach(([dx, dy]) => { const nx = cx + dx, ny = cy + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && !vis[ny * N + nx]) nb.push([nx, ny, dx, dy]); });
    if (!nb.length) { st.pop(); continue; }
    const [nx, ny, dx, dy] = nb[(rnd() * nb.length) | 0];
    vis[ny * N + nx] = 1;
    map[(cy * 2 + 1 + dy) * S + (cx * 2 + 1 + dx)] = 0;
    map[(ny * 2 + 1) * S + (nx * 2 + 1)] = 0;
    st.push([nx, ny]);
  }
  for (let i = 0; i < 34; i++) {
    const x = 1 + ((rnd() * (S - 2)) | 0), y = 1 + ((rnd() * (S - 2)) | 0);
    if (map[y * S + x] === 1 && ((x % 2 === 0) !== (y % 2 === 0))) {
      if (x % 2 === 0) { if (!map[y * S + x - 1] && !map[y * S + x + 1]) map[y * S + x] = 0; }
      else { if (!map[(y - 1) * S + x] && !map[(y + 1) * S + x]) map[y * S + x] = 0; }
    }
  }
  for (let r = 0; r < 4; r++) {
    const rx = 2 + ((rnd() * (S - 6)) | 0), ry = 2 + ((rnd() * (S - 6)) | 0);
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) map[(ry + dy) * S + rx + dx] = 0;
  }
}
function bfs(sx, sy) {
  const d = new Int16Array(S * S).fill(-1); const q = [sy * S + sx]; d[q[0]] = 0;
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % S, y = (c / S) | 0;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue;
      const n = ny * S + nx; if (map[n] || d[n] >= 0) continue; d[n] = d[c] + 1; q.push(n);
    }
  }
  return d;
}
function newGame() {
  const rnd = rngSeed((Math.random() * 1e9) | 0);
  genMaze(rnd);
  const ds = bfs(1, 1);
  openCells = [];
  let far = { x: 1, y: 1, d: 0 };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = y * S + x; if (!map[i]) { const c = { x, y, d: ds[i] }; openCells.push(c); if (c.d > far.d) far = c; } }
  exitC = far;
  const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const sh = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const cand = sh(openCells.filter(c => c.d >= 9 && md(c, exitC) >= 4));
  let chosen = [];
  for (const gap of [7, 5, 3, 0]) {
    chosen = [];
    for (const c of cand) { if (chosen.every(o => md(c, o) >= gap)) { chosen.push(c); if (chosen.length === G.need) break; } }
    if (chosen.length === G.need) break;
  }
  things = chosen.map(c => ({ type: 'key', x: c.x + 0.5, y: c.y + 0.5 }));
  const bc = sh(openCells.filter(c => c.d >= 3 && !chosen.includes(c) && md(c, exitC) >= 2)).slice(0, 5);
  bc.forEach(c => things.push({ type: 'bat', x: c.x + 0.5, y: c.y + 0.5 }));
  const mc = sh(openCells.filter(c => c.d >= 16)); const m0 = mc[0] || far;
  M = { x: m0.x + 0.5, y: m0.y + 0.5, mode: 'roam', los: false, lose: 0, nx: -1, ny: -1, tdist: null, losT: 0 };
  px = 1.5; py = 1.5; pa = map[1 * S + 2] ? Math.PI / 2 : 0;
  ghost = null; timers = []; look = 0;
  Object.assign(G, { keys: 0, battery: 1, stamina: 1, tired: false, time: 0, scareT: 38 + rnd() * 12, moving: false, sprinting: false, bob: 0, stepT: 0, beatT: 0, growlT: 6, pdist: null, pdT: 0, mdist: 99, exitMsgT: 0, lowMsg: false });
  Object.assign(FL, { on: true, kill: 0, flick: 0, eff: true });
  pickRoamTarget();
  $('hFuse').textContent = '0/' + G.need;
  state = 'playing';
  A.amb(true);
  msg('Finde 5 Sicherungen. Sei leise.', 5000);
  later(6, () => msg('Taschenlampe: F · Rennen: Shift', 4000));
}

/* ---------- monster ---------- */
function pickRoamTarget() {
  let c = null;
  if (Math.random() < 0.4) c = { x: px | 0, y: py | 0 };
  else for (let i = 0; i < 25; i++) { c = openCells[(Math.random() * openCells.length) | 0]; if (Math.hypot(c.x - M.x, c.y - M.y) >= 6) break; }
  M.tdist = bfs(c.x, c.y); M.nx = -1;
}
function monsterUpdate(dt) {
  const dist = Math.hypot(M.x - px, M.y - py); G.mdist = dist;
  M.losT -= dt; if (M.losT <= 0) { M.losT = 0.12; M.los = hasLOS(M.x, M.y, px, py); }
  const range = FL.eff ? 13 : 8;
  if (M.los && dist < range) { if (M.mode !== 'hunt') A.growl(Math.sin(Math.atan2(M.y - py, M.x - px) - pa), 1); M.mode = 'hunt'; M.lose = 0; }
  else if (dist < (G.sprinting ? 6 : 3.2)) { M.mode = 'hunt'; M.lose = 0; }
  if (M.mode === 'hunt' && !M.los && dist > 3) { M.lose += dt; if (M.lose > 7) { M.mode = 'roam'; pickRoamTarget(); } }
  const pcx = px | 0, pcy = py | 0;
  G.pdT -= dt;
  if (M.mode === 'hunt' && (G.pdT <= 0 || !G.pdist)) { G.pdT = 0.25; G.pdist = bfs(pcx, pcy); }
  const spd = M.mode === 'hunt' ? 2.55 + 0.12 * G.keys : 1.4;
  const d = M.mode === 'hunt' ? G.pdist : M.tdist;
  const cx = Math.floor(M.x), cy = Math.floor(M.y);
  let tx, ty, moved = false;
  if (M.mode === 'hunt' && ((cx === pcx && cy === pcy) || (M.los && dist < 2.2))) { tx = px; ty = py; moved = true; }
  else {
    if (M.nx < 0 || Math.hypot(M.x - M.nx, M.y - M.ny) < 0.08) {
      const cur = d[cy * S + cx]; let best = null, bd = cur;
      for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (map[ny * S + nx]) continue; const v = d[ny * S + nx]; if (v >= 0 && v < bd) { bd = v; best = [nx, ny]; } }
      if (best) { M.nx = best[0] + 0.5; M.ny = best[1] + 0.5; }
      else { if (M.mode === 'roam') pickRoamTarget(); M.nx = -1; return; }
    }
    tx = M.nx; ty = M.ny; moved = true;
  }
  if (moved) {
    const ddx = tx - M.x, ddy = ty - M.y, dd = Math.hypot(ddx, ddy) || 1, step = Math.min(dd, spd * dt);
    M.x += ddx / dd * step; M.y += ddy / dd * step;
  }
}

/* ---------- scare events ---------- */
function evGhost() {
  for (let d = 7; d >= 3; d -= 0.5) {
    const gx = px + Math.cos(pa) * d, gy = py + Math.sin(pa) * d;
    if (!solid(gx, gy) && hasLOS(px, py, gx, gy)) { ghost = { x: gx, y: gy, t: 0, st: 0 }; A.tone(90, 1, 'sine', 0.15, { slide: 160 }); return true; }
  }
  return false;
}
function evBlackout(hunt) {
  A.bang(); FL.kill = 2.6; msg('...', 2400);
  later(0.9, () => A.whisper(0.9)); later(1.7, () => A.whisper(-0.9));
  if (hunt) { M.mode = 'hunt'; M.lose = 3; }
}
function evWhisper() {
  const lines = ['Hinter dir.', 'Sie sind hier.', 'Lauf.', 'Dreh dich nicht um.'];
  A.whisper(Math.random() < 0.5 ? -1 : 1); msg(lines[(Math.random() * lines.length) | 0], 2600);
}
function evFlash() { startScare('flash'); FL.flick = 0.8; }
function director() {
  const r = Math.random();
  if (r < 0.4) { if (!evGhost()) evBlackout(false); }
  else if (r < 0.65) evFlash();
  else if (r < 0.85) evBlackout(Math.random() < 0.4);
  else evWhisper();
}
function pickKey() {
  G.keys++; A.chime(); const k = G.keys;
  $('hFuse').textContent = k + '/' + G.need;
  msg('Sicherung ' + k + ' von ' + G.need);
  if (k === 1) { later(2, () => A.whisper(-0.8)); later(3.2, () => msg('Hast du das gehört?', 2600)); }
  else if (k === 2) { FL.flick = 1.6; A.sting(0.25); later(1.8, () => { if (!evGhost()) evBlackout(false); }); }
  else if (k === 3) { evBlackout(true); }
  else if (k === 4) { later(0.6, () => { FL.kill = 0.5; startScare('pop'); }); }
  else if (k === 5) { A.alarm(); msg('Der Ausgang ist offen! LAUF!', 5200); M.mode = 'hunt'; M.lose = 0; }
}
function win() {
  if (state !== 'playing') return;
  state = 'ending'; A.amb(false); A.windOut();
  showOverlay('Frische Luft.', 'Die Tür ist offen. Du bist draußen. Es ist vorbei.', '', false, true);
  setTimeout(() => { if (state === 'ending') startScare('final'); }, 5200);
}
function die() { if (state !== 'playing') return; state = 'dead'; A.amb(false); startScare('death'); }

/* ---------- jumpscare rendering ---------- */
function hr(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function drawFace(g, s, t) {
  const u = s / 100;
  g.strokeStyle = '#040202'; g.lineWidth = Math.max(1, 0.9 * u);
  for (let i = 0; i < 40; i++) {
    const a = Math.PI * (1.05 + 0.9 * hr(i)); const sx = Math.cos(a) * 30 * u, sy = Math.sin(a) * 42 * u;
    const ex = Math.cos(a) * (46 + hr(i + 9) * 26) * u, ey = sy + (20 + hr(i + 3) * 70) * u;
    g.beginPath(); g.moveTo(sx, sy); g.bezierCurveTo(sx * 1.3, sy - 8 * u, ex * 1.15, ey * 0.4, ex, ey); g.stroke();
  }
  g.fillStyle = '#0a0606';
  g.beginPath(); g.moveTo(-18 * u, 36 * u); g.lineTo(18 * u, 36 * u); g.lineTo(60 * u, 120 * u); g.lineTo(-60 * u, 120 * u); g.closePath(); g.fill();
  const hg = g.createRadialGradient(-8 * u, -18 * u, 4 * u, 0, 0, 56 * u);
  hg.addColorStop(0, '#f1ead9'); hg.addColorStop(0.6, '#b9b09b'); hg.addColorStop(1, '#554d40');
  g.fillStyle = hg; g.beginPath(); g.ellipse(0, 0, 36 * u, 48 * u, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(20,10,5,.35)';
  g.beginPath(); g.ellipse(-24 * u, 12 * u, 8 * u, 16 * u, 0.2, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(24 * u, 12 * u, 8 * u, 16 * u, -0.2, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(30,20,12,.7)'; g.lineWidth = Math.max(1, 0.7 * u);
  for (let i = 0; i < 6; i++) { let x = (hr(i + 60) - 0.5) * 50 * u, y = -46 * u; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (hr(i * 7 + k) - 0.5) * 10 * u; y += 8 * u; g.lineTo(x, y); } g.stroke(); }
  for (const sd of [-1, 1]) {
    g.save(); g.translate(sd * 15 * u, -12 * u); g.rotate(sd * 0.22);
    g.fillStyle = '#030101'; g.beginPath(); g.ellipse(0, 0, 10.5 * u, 15 * u, 0, 0, TAU); g.fill();
    const j = (hr(Math.floor(t * 40) + sd) - 0.5) * 1.5 * u;
    g.fillStyle = '#ff3a24'; g.beginPath(); g.arc(j, 2 * u, 1.9 * u, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(j - 0.6 * u, 1.4 * u, 0.7 * u, 0, TAU); g.fill();
    g.restore();
  }
  g.fillStyle = '#1a0c08';
  g.beginPath(); g.ellipse(-3 * u, 8 * u, 1.4 * u, 3 * u, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(3 * u, 8 * u, 1.4 * u, 3 * u, 0, 0, TAU); g.fill();
  const o = 0.75 + 0.25 * Math.sin(t * 45), y0 = 18 * u, yb = y0 + o * 36 * u;
  g.fillStyle = '#0d0000';
  g.beginPath(); g.moveTo(-27 * u, y0); g.quadraticCurveTo(0, y0 - 5 * u, 27 * u, y0); g.bezierCurveTo(26 * u, yb, -26 * u, yb, -27 * u, y0); g.fill();
  g.fillStyle = '#4a0a0a'; g.beginPath(); g.ellipse(0, yb - 8 * u, 12 * u, 7 * u, 0, 0, TAU); g.fill();
  g.fillStyle = '#e9e1c8';
  for (let i = 0; i <= 10; i++) {
    const x = (-24 + i * 4.8) * u;
    g.beginPath(); g.moveTo(x - 2.2 * u, y0); g.lineTo(x + 2.2 * u, y0); g.lineTo(x, y0 + (6 + hr(i) * 5) * u); g.fill();
    const yl = y0 + (yb - y0) * 0.75 * (1 - (x * x) / (27 * u * 27 * u));
    g.beginPath(); g.moveTo(x - 2 * u, yl); g.lineTo(x + 2 * u, yl); g.lineTo(x, yl - (5 + hr(i + 20) * 5) * u); g.fill();
  }
  g.fillStyle = '#8a0a0a';
  for (let i = 0; i < 5; i++) g.fillRect((-20 + i * 10) * u, yb * 0.9, 1.2 * u, (12 + hr(i + 40) * 30) * u);
}
function startScare(kind) {
  scare = { kind, t: 0, dur: kind === 'death' ? 1.9 : kind === 'final' ? 2.1 : kind === 'pop' ? 0.55 : 0.35, side: Math.random() < 0.5 ? -1 : 1 };
  scv.style.opacity = '1';
  if (kind === 'death') { A.scream(1.5, 0.95); A.sting(0.8); }
  else if (kind === 'final') { A.scream(1.7, 1); A.sting(0.9); }
  else if (kind === 'pop') { A.scream(0.7, 0.7); A.sting(0.7); }
  else A.sting(0.45);
}
function tickScare(dt) {
  scare.t += dt;
  const k = scare.kind, t = scare.t, p = t / scare.dur, g = sctx;
  g.clearRect(0, 0, 960, 540);
  if (p >= 1) {
    scv.style.opacity = '0'; scare = null;
    if (k === 'death') showOverlay('Es hat dich.', 'Sicherungen: ' + G.keys + '/' + G.need + ' · Zeit: ' + fmt(G.time), 'Nochmal', false);
    else if (k === 'final') showOverlay('Es war nie ein Ausgang.', 'Zeit: ' + fmt(G.time), 'Nochmal', false);
    return;
  }
  let size, cx = 480, cy = 280, shake;
  const big = k === 'death' || k === 'final';
  if (big) { const e = Math.min(1, t / 0.14); size = lerp(150, 560, 1 - Math.pow(1 - e, 3)) + p * 130; shake = 14 + p * 22; }
  else if (k === 'pop') { size = lerp(300, 520, Math.min(1, t / 0.1)); shake = 14; }
  else { size = 240; cx = scare.side > 0 ? 790 : 170; cy = 300; shake = 5; }
  if (k !== 'flash') {
    const flick = Math.floor(t * 30) % 2;
    g.fillStyle = (t < 0.06 && !calm) ? '#ffffff' : (flick && !calm ? '#220000' : '#0c0000');
    g.fillRect(0, 0, 960, 540);
  } else { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, 960, 540); }
  g.save();
  g.translate(cx + (Math.random() - .5) * shake * 2, cy + (Math.random() - .5) * shake * 2);
  g.rotate((Math.random() - .5) * 0.05 * (big ? 2 : 1));
  if (k === 'flash') g.globalAlpha = 0.9;
  drawFace(g, size, t);
  g.restore();
  if (!calm) {
    for (let i = 0; i < 6; i++) { const y = Math.random() * 520, h = 6 + Math.random() * 30, off = (Math.random() - .5) * 70; g.drawImage(scv, 0, y, 960, h, off, y, 960, h); }
  }
  g.fillStyle = 'rgba(180,0,0,' + (0.12 + Math.random() * 0.22) + ')'; g.fillRect(0, 0, 960, 540);
  g.globalAlpha = 0.22; g.drawImage(noiseC, 0, 0, 960, 540); g.globalAlpha = 1;
}

/* ---------- update ---------- */
function update(dt) {
  G.time += dt;
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
  pa += ((inp.r ? 1 : 0) - (inp.l ? 1 : 0)) * 2.2 * dt + look; look = 0;
  let fwd = (inp.f ? 1 : 0) - (inp.b ? 1 : 0) - inp.sy, str = (inp.sr ? 1 : 0) - (inp.sl ? 1 : 0) + inp.sx;
  const len = Math.hypot(fwd, str); if (len > 1) { fwd /= len; str /= len; }
  const want = inp.sprint && len > 0.1 && G.stamina > 0.02 && !G.tired;
  if (want) { G.stamina -= dt / 5; if (G.stamina <= 0) { G.stamina = 0; G.tired = true; } }
  else { G.stamina = Math.min(1, G.stamina + dt / 7); if (G.tired && G.stamina > 0.3) G.tired = false; }
  G.sprinting = want; G.moving = len > 0.1;
  const spd = want ? 4.1 : 2.4;
  const dx = (Math.cos(pa) * fwd - Math.sin(pa) * str) * spd * dt, dy = (Math.sin(pa) * fwd + Math.cos(pa) * str) * spd * dt;
  if (!blocked(px + dx, py)) px += dx;
  if (!blocked(px, py + dy)) py += dy;
  if (G.moving) {
    G.bob += dt * (want ? 11 : 7);
    G.stepT -= dt; if (G.stepT <= 0) { A.step(want); G.stepT = want ? 0.28 : 0.46; }
  }
  // flashlight
  FL.kill = Math.max(0, FL.kill - dt);
  FL.eff = FL.on && G.battery > 0 && FL.kill <= 0;
  if (FL.eff) G.battery = Math.max(0, G.battery - dt / 130);
  if (G.battery <= 0 && !G.lowMsg) { G.lowMsg = true; msg('Die Batterie ist leer.', 3000); }
  if (G.battery > 0.3) G.lowMsg = false;
  let pw = 1;
  if (G.battery < 0.2) pw = Math.max(0.15, G.battery * 5) * (Math.random() < 0.15 ? 0.2 : 1);
  if (M && G.mdist < 7 && M.los && Math.random() < 0.36 * (1 - G.mdist / 7)) pw *= 0.1;
  if (FL.flick > 0) { FL.flick -= dt; if (!calm && Math.random() < 0.5) pw *= 0.05; else if (calm) pw *= 0.4; }
  FL.power = pw; FL.range = 6 + 6 * clamp(G.battery * 2, 0, 1);
  // pickups
  for (const th of things) {
    if (th.got) continue;
    if (Math.hypot(th.x - px, th.y - py) < 0.7) {
      th.got = true;
      if (th.type === 'key') pickKey();
      else { G.battery = Math.min(1, G.battery + 0.45); A.pickup(); msg('Batterie gefunden.', 2200); }
    }
  }
  // exit
  G.exitMsgT -= dt;
  if (Math.hypot(exitC.x + 0.5 - px, exitC.y + 0.5 - py) < 0.9) {
    if (G.keys >= G.need) win();
    else if (G.exitMsgT <= 0) { msg('Die Tür ist verriegelt. Sicherungen: ' + G.keys + '/' + G.need, 3000); G.exitMsgT = 3.5; }
  }
  // monster
  monsterUpdate(dt);
  if (G.mdist < 0.8) { die(); return; }
  const prox = clamp(1 - G.mdist / 12, 0, 1) * (M.mode === 'hunt' ? 1 : 0.55);
  A.tension(prox);
  if (prox > 0.08) { G.beatT -= dt; if (G.beatT <= 0) { A.beat(prox); G.beatT = lerp(1.15, 0.38, prox); } }
  if (G.mdist < 14) {
    G.growlT -= dt;
    if (G.growlT <= 0) {
      A.growl(Math.sin(Math.atan2(M.y - py, M.x - px) - pa), clamp(1 - G.mdist / 14, 0.15, 1));
      G.growlT = (3 + Math.random() * 4) * (M.mode === 'hunt' ? 0.5 : 1);
    }
  }
  // ghost
  if (ghost) {
    ghost.t += dt;
    if (ghost.st === 0 && ghost.t > 0.9) { ghost.st = 1; A.riser(0.7); }
    if (ghost.st === 1) {
      const gx = px - ghost.x, gy = py - ghost.y, gd = Math.hypot(gx, gy) || 1;
      const stp = Math.min(gd, 8 * dt); ghost.x += gx / gd * stp; ghost.y += gy / gd * stp;
      if (gd < 1.1) { ghost = null; FL.kill = 1.2; startScare('pop'); }
    }
  }
  // director
  if (!scare && !ghost) {
    G.scareT -= dt;
    if (G.scareT <= 0) { director(); G.scareT = (24 + Math.random() * 24) * (1 - 0.07 * G.keys); }
  }
  // hud
  $('bBat').style.width = (G.battery * 100) + '%'; $('bBat').className = G.battery < 0.2 ? 'low' : '';
  $('bSta').style.width = (G.stamina * 100) + '%'; $('bSta').className = G.tired ? 'low' : '';
}

/* ---------- render ---------- */
function lightAt(dist, ang) {
  const amb = FL.kill > 0 ? 0.01 : 0.045;
  let l = amb + Math.max(0, 1 - dist / 5) * (FL.kill > 0 ? 0.02 : 0.10);
  if (FL.eff) {
    const b = Math.max(0, 1 - Math.abs(ang) / 0.42);
    l += FL.power * Math.pow(b, 0.6) * Math.max(0, 1 - dist / FL.range);
  }
  return Math.min(1, l);
}
let hz = H / 2, dirX = 1, dirY = 0, planeX = 0, planeY = PL;
function drawSprite(sx, sy, tex, f, lift, emit, isMon) {
  const rx = sx - px, ry = sy - py, invDet = -1 / PL;
  const tX = invDet * (dirY * rx - dirX * ry), tY = invDet * (-planeY * rx + planeX * ry);
  if (tY < 0.15) return;
  const screenX = (W / 2) * (1 + tX / tY), wallH = H / tY, sh = wallH * f, sw = sh * (tex.width / tex.height);
  const bottom = hz + wallH / 2 - lift * wallH, top = bottom - sh;
  const x0 = Math.floor(screenX - sw / 2), x1 = Math.floor(screenX + sw / 2);
  if (x1 < 0 || x0 >= W) return;
  const bx = Math.max(0, x0), bx1 = Math.min(W - 1, x1), bw = bx1 - bx + 1;
  tctx.clearRect(bx, 0, bw, H);
  const span = Math.max(1, x1 - x0);
  for (let x = bx; x <= bx1; x++) {
    if (tY >= zBuf[x]) continue;
    const tx = Math.min(tex.width - 1, Math.floor((x - x0) / span * tex.width));
    tctx.drawImage(tex, tx, 0, 1, tex.height, x, top, 1, sh);
  }
  const l = Math.max(lightAt(tY, Math.atan2(tX, tY)), emit);
  tctx.globalCompositeOperation = 'source-atop'; tctx.fillStyle = shade(1 - l); tctx.fillRect(bx, 0, bw, H); tctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(tmp, bx, 0, bw, H, bx, 0, bw, H);
  if (isMon) {
    const cxp = clamp(Math.floor(screenX), 0, W - 1);
    if (tY < zBuf[cxp] && tY < 16) {
      const es = Math.max(1, sw * 0.022), ey = top + sh * 0.18;
      ctx.fillStyle = '#ff2a1a';
      ctx.fillRect(x0 + sw * (52 / 128), ey, es, es); ctx.fillRect(x0 + sw * (74 / 128), ey, es, es);
    }
  }
}
function render() {
  if (!map) return;
  const bob = G.moving ? Math.sin(G.bob) * (G.sprinting ? 3 : 2) : 0;
  hz = H / 2 + bob;
  dirX = Math.cos(pa); dirY = Math.sin(pa); planeX = -dirY * PL; planeY = dirX * PL;
  const g1 = ctx.createLinearGradient(0, 0, 0, hz); g1.addColorStop(0, '#030303'); g1.addColorStop(1, '#0d0b0a');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, hz);
  const g2 = ctx.createLinearGradient(0, hz, 0, H); g2.addColorStop(0, '#0a0807'); g2.addColorStop(1, '#1c1712');
  ctx.fillStyle = g2; ctx.fillRect(0, hz, W, H - hz);
  for (let x = 0; x < W; x++) {
    const camX = 2 * x / W - 1, rdx = dirX + planeX * camX, rdy = dirY + planeY * camX;
    let mx = Math.floor(px), my = Math.floor(py);
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx), ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    let stX, stY, sdx, sdy;
    if (rdx < 0) { stX = -1; sdx = (px - mx) * ddx; } else { stX = 1; sdx = (mx + 1 - px) * ddx; }
    if (rdy < 0) { stY = -1; sdy = (py - my) * ddy; } else { stY = 1; sdy = (my + 1 - py) * ddy; }
    let side = 0, hit = 0, n = 0;
    while (!hit && n++ < 60) {
      if (sdx < sdy) { sdx += ddx; mx += stX; side = 0; } else { sdy += ddy; my += stY; side = 1; }
      if (mx < 0 || my < 0 || mx >= S || my >= S || map[my * S + mx]) hit = 1;
    }
    let perp = side === 0 ? sdx - ddx : sdy - ddy; if (perp < 0.05) perp = 0.05;
    zBuf[x] = perp;
    let wx = side === 0 ? py + perp * rdy : px + perp * rdx; wx -= Math.floor(wx);
    let tx = Math.floor(wx * 64); if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = 63 - tx;
    const lh = H / perp, ds = hz - lh / 2;
    const hsh = (((mx * 73856093) ^ (my * 19349663)) >>> 0) % 12;
    const tex = WT[hsh < 5 ? 0 : hsh < 9 ? 1 : hsh < 11 ? 2 : 3];
    ctx.drawImage(tex, tx, 0, 1, 64, x, ds, 1, lh);
    const l = lightAt(perp, colAng[x]) * (side ? 0.72 : 1);
    ctx.fillStyle = shade(1 - l); ctx.fillRect(x, ds, 1, lh);
  }
  const list = [];
  for (const th of things) if (!th.got) list.push({ x: th.x, y: th.y, tex: th.type === 'key' ? SP.key : SP.bat, f: th.type === 'key' ? 0.2 : 0.14, lift: th.type === 'key' ? 0.32 : 0.02, emit: th.type === 'key' ? 0.75 : 0.35, m: false });
  list.push({ x: exitC.x + 0.5, y: exitC.y + 0.5, tex: SP.exit, f: 0.95, lift: 0, emit: 0.5, m: false });
  if (M) list.push({ x: M.x, y: M.y, tex: SP.monster, f: 1.1, lift: 0, emit: 0, m: true });
  if (ghost) list.push({ x: ghost.x, y: ghost.y, tex: SP.ghost, f: 0.95, lift: 0, emit: 0.25, m: false });
  for (const s of list) s.d = (s.x - px) * (s.x - px) + (s.y - py) * (s.y - py);
  list.sort((a, b) => b.d - a.d);
  for (const s of list) drawSprite(s.x, s.y, s.tex, s.f, s.lift, s.emit, s.m);
  ctx.globalAlpha = FL.eff ? 0.95 : 0.55; ctx.drawImage(vig, 0, 0); ctx.globalAlpha = 1;
  const prox = G.mdist < 99 ? clamp(1 - G.mdist / 10, 0, 1) : 0;
  if (prox > 0 && state === 'playing') { ctx.fillStyle = 'rgba(120,0,0,' + (prox * 0.16 * (0.6 + 0.4 * Math.sin(G.time * 9))).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
  ctx.globalAlpha = 0.05; ctx.drawImage(noiseC, (Math.random() * 32) | 0, (Math.random() * 32) | 0, W, H); ctx.globalAlpha = 1;
  if (state === 'playing' && prox > 0.5) {
    const sh = (prox - 0.5) * 3;
    stage.style.transform = 'translate(' + ((Math.random() - .5) * sh).toFixed(1) + 'px,' + ((Math.random() - .5) * sh).toFixed(1) + 'px)';
  } else if (stage.style.transform) stage.style.transform = '';
}

/* ---------- overlay & flow ---------- */
const ov = $('ov');
function showOverlay(title, text, btn, menu, noBtn) {
  $('ttl').textContent = title; $('txt').textContent = text;
  $('warn').hidden = !menu; $('ctrl').hidden = !menu && btn !== 'Weiter'; $('opts').hidden = !menu;
  const go = $('go'); go.hidden = !!noBtn; go.textContent = btn || '';
  ov.hidden = false;
  try { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* ignore */ }
  if (!noBtn) go.focus({ preventScroll: true });
}
function lockPointer() { try { const r = view.requestPointerLock && view.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* ignore */ } }
function startGame() {
  calm = $('calm').checked;
  A.setVol(+$('vol').value / 100); A.init();
  if (state === 'paused') { state = 'playing'; ov.hidden = true; A.amb(true); lockPointer(); last = performance.now(); return; }
  ov.hidden = true; newGame(); lockPointer(); last = performance.now();
}
function pause() {
  if (state !== 'playing') return;
  state = 'paused'; A.amb(false);
  showOverlay('Pause', 'Es wartet.', 'Weiter', false);
  for (const k in inp) inp[k] = typeof inp[k] === 'number' ? 0 : false;
}
$('go').addEventListener('click', startGame);
$('vol').addEventListener('input', e => A.setVol(+e.target.value / 100));

/* ---------- input ---------- */
const KEYMAP = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'sl', KeyD: 'sr', ArrowLeft: 'l', ArrowRight: 'r', ShiftLeft: 'sprint', ShiftRight: 'sprint' };
window.addEventListener('keydown', e => {
  if (e.code in KEYMAP) { inp[KEYMAP[e.code]] = true; if (state === 'playing') e.preventDefault(); }
  if (e.repeat) return;
  if (e.code === 'KeyF' && state === 'playing') { FL.on = !FL.on; A.tone(1800, 0.04, 'square', 0.05); }
  if ((e.code === 'KeyP' || e.code === 'Escape') && state === 'playing') pause();
});
window.addEventListener('keyup', e => { if (e.code in KEYMAP) inp[KEYMAP[e.code]] = false; });
window.addEventListener('blur', () => { for (const k in inp) inp[k] = typeof inp[k] === 'number' ? 0 : false; pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && state === 'playing') pause(); });
let dragging = false;
stage.addEventListener('mousedown', e => { if (state === 'playing' && !e.target.closest('#tbtns')) { dragging = true; if (!document.pointerLockElement) lockPointer(); } });
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', e => {
  if (state !== 'playing') return;
  if (document.pointerLockElement === view || dragging) look += e.movementX * 0.0035;
});
const touches = new Map();
stage.addEventListener('touchstart', e => {
  if (e.target.closest('#tbtns,.overlay')) return;
  const r = stage.getBoundingClientRect();
  for (const t of e.changedTouches) touches.set(t.identifier, { left: (t.clientX - r.left) < r.width / 2, x0: t.clientX, y0: t.clientY, x: t.clientX });
  e.preventDefault();
}, { passive: false });
stage.addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    const o = touches.get(t.identifier); if (!o) continue;
    if (o.left) { inp.sx = clamp((t.clientX - o.x0) / 40, -1, 1); inp.sy = clamp((t.clientY - o.y0) / 40, -1, 1); }
    else { look += (t.clientX - o.x) * 0.006; o.x = t.clientX; }
  }
  e.preventDefault();
}, { passive: false });
const endTouch = e => { for (const t of e.changedTouches) { const o = touches.get(t.identifier); if (o && o.left) { inp.sx = 0; inp.sy = 0; } touches.delete(t.identifier); } };
stage.addEventListener('touchend', endTouch); stage.addEventListener('touchcancel', endTouch);
$('tLight').addEventListener('click', () => { if (state === 'playing') FL.on = !FL.on; });
const runB = $('tRun');
runB.addEventListener('pointerdown', () => { inp.sprint = true; });
['pointerup', 'pointerleave', 'pointercancel'].forEach(n => runB.addEventListener(n, () => { inp.sprint = false; }));

/* ---------- loop ---------- */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (state === 'playing') update(dt);
  if (map) render();
  if (scare) tickScare(dt);
}
requestAnimationFrame(loop);
showOverlay('ANSTALT 13', 'Du bist in einer verlassenen Heilanstalt eingesperrt. Finde fünf Sicherungen und öffne den Ausgang. Etwas wandert durch die Gänge.', 'Spiel starten', true);
})();
