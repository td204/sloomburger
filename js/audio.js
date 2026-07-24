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

  api.unlock = function () { ac(); };

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
