/* Sloomburger — vrolijke bliepjes via WebAudio, geen geluidsbestanden nodig */
window.SND = (function () {
  let ctx = null;
  const api = { muted: false };

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Eén nootje met een zachte envelope
  function tone(freq, dur, delay, type, vol, slideTo) {
    if (api.muted) return;
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  api.unlock = function () { ac(); startMusic(); };

  /* ---------- 8-bit muziek: een klein stappen-sequencertje ---------- */
  // Het Sloomburger-deuntje (midi-nootnummers, 4 maten van 8 achtsten)
  const MELODIE = [
    72, 76, 79, 76, 81, 79, 76, 72,
    74, 77, 81, 77, 79, 77, 74, 71,
    72, 76, 79, 76, 81, 79, 76, 72,
    79, 81, 83, 84, 79, 76, 74, 72
  ];
  const BASROOT = [48, 53, 48, 43]; // C, F, C, G — één grondtoon per maat

  // sfeer per plek in het spel
  const STIJLEN = {
    menu:   { bpm: 104, trans: 0,  golf: 'square',   vol: 0.10 },
    jungle: { bpm: 112, trans: 0,  golf: 'square',   vol: 0.10 },
    stad:   { bpm: 138, trans: 2,  golf: 'square',   vol: 0.11 },
    keuken: { bpm: 118, trans: -2, golf: 'triangle', vol: 0.13 },
    feest:  { bpm: 126, trans: 4,  golf: 'square',   vol: 0.11 }
  };

  let stijl = null;        // huidige stijl (of null = stil)
  let timer = null;
  let stap = 0;
  let volgende = 0;        // audiotijd van de volgende stap
  let ruisBuf = null;

  function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function ruis(c) {
    if (!ruisBuf) {
      ruisBuf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
      const d = ruisBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ruisBuf;
  }

  function noot(c, f, t0, dur, type, vol) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  function plan() {
    const c = ctx;
    if (!c || !stijl) return;
    const s = STIJLEN[stijl];
    const stapDur = 60 / s.bpm / 2; // achtste noten
    while (volgende < c.currentTime + 0.3) {
      if (!api.muted) {
        const i = stap % 32;
        // melodie
        noot(c, freq(MELODIE[i] + s.trans), volgende, stapDur * 0.85, s.golf, s.vol);
        // bas: bonk op de tellen, om en om grondtoon en kwint
        if (i % 2 === 0) {
          const root = BASROOT[(i / 8) | 0] + s.trans;
          noot(c, freq(i % 4 === 0 ? root : root + 7), volgende, stapDur * 0.9, 'triangle', 0.14);
        }
        // hi-hatje van ruis op de offbeats
        if (i % 2 === 1) {
          const src = c.createBufferSource();
          const g = c.createGain();
          src.buffer = ruis(c);
          g.gain.setValueAtTime(0.03, volgende);
          g.gain.exponentialRampToValueAtTime(0.0001, volgende + 0.03);
          src.connect(g).connect(c.destination);
          src.start(volgende);
        }
      }
      volgende += stapDur;
      stap++;
    }
  }

  function startMusic() {
    if (!stijl || !ctx || timer) return;
    stap = 0;
    volgende = ctx.currentTime + 0.05;
    timer = setInterval(plan, 100);
  }

  // muziek(naam) wisselt van deuntje; muziek(null) zet hem uit
  api.muziek = function (naam) {
    if (naam === stijl) return;
    stijl = naam || null;
    if (!stijl) {
      if (timer) { clearInterval(timer); timer = null; }
      return;
    }
    stap = 0;
    if (ctx && !timer) startMusic();
    else if (ctx) volgende = Math.max(volgende, ctx.currentTime + 0.05);
  };

  api.click = function () { tone(600, 0.07, 0, 'square', 0.08); };
  api.coin = function () {
    tone(988, 0.07, 0, 'square', 0.12);
    tone(1319, 0.12, 0.07, 'square', 0.12);
  };
  api.jump = function () { tone(300, 0.18, 0, 'square', 0.1, 620); };
  api.grab = function () { tone(500, 0.1, 0, 'triangle', 0.14, 700); };
  api.pop = function () { tone(420, 0.09, 0, 'triangle', 0.16, 900); };
  api.bump = function () {
    tone(200, 0.2, 0, 'sawtooth', 0.12, 90);
  };
  api.wrong = function () { tone(260, 0.12, 0, 'square', 0.08, 180); };
  api.serve = function () {
    tone(660, 0.09, 0, 'triangle', 0.14);
    tone(880, 0.09, 0.09, 'triangle', 0.14);
    tone(1100, 0.16, 0.18, 'triangle', 0.14);
  };
  api.yay = function () {
    [523, 659, 784, 1047].forEach(function (f, i) {
      tone(f, 0.14, i * 0.09, 'triangle', 0.15);
    });
  };
  api.fanfare = function () {
    [523, 523, 659, 784, 659, 784, 1047].forEach(function (f, i) {
      tone(f, 0.18, i * 0.14, 'triangle', 0.16);
    });
    tone(1319, 0.5, 7 * 0.14, 'triangle', 0.16);
  };
  api.surprise = function () {
    [700, 900, 1200].forEach(function (f, i) { tone(f, 0.08, i * 0.06, 'square', 0.1); });
  };

  return api;
})();
