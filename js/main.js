/* Sloomburger — game-loop, invoer (touch + toetsenbord), scenes en opslag */
(function () {
  const W = 960, H = 540;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let scale = 1, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    canvas.style.width = W * scale + 'px';
    canvas.style.height = H * scale + 'px';
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
  resize();

  /* ---------- opslag ---------- */
  const SAVE_KEY = 'sloomburger-save-v1';
  function defaultState() {
    return {
      coins: 0,
      stars: [0, 0, 0],
      unlocked: 1,
      items: { hoed: false, sleutel: false, kroon: false },
      seenIntro: false,
      muted: false
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* opslag niet beschikbaar: geen probleem */ }
    return defaultState();
  }

  /* ---------- invoer ---------- */
  const Input = {
    left: false, right: false,
    jumpHeld: false, jumpPressed: false,
    pointers: new Map(),      // pointerId -> {x, y}
    pads: []                  // door de scene gezette touch-knoppen
  };
  window.Input = Input;

  const keyMap = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right'
  };
  const jumpKeys = { ' ': 1, ArrowUp: 1, w: 1, W: 1 };
  const keys = {};

  window.addEventListener('keydown', function (e) {
    if (keyMap[e.key]) { keys[keyMap[e.key]] = true; e.preventDefault(); }
    if (jumpKeys[e.key]) {
      if (!e.repeat) Input.jumpPressed = true;
      keys.jump = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', function (e) {
    if (keyMap[e.key]) keys[keyMap[e.key]] = false;
    if (jumpKeys[e.key]) keys.jump = false;
  });

  function toLogical(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  }

  function padAt(x, y) {
    for (let i = 0; i < Input.pads.length; i++) {
      const p = Input.pads[i];
      const dx = x - p.x, dy = y - p.y;
      if (dx * dx + dy * dy <= p.r * p.r * 1.45) return p; // ruime hitbox voor kindervingers
    }
    return null;
  }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    SND.unlock();
    const pos = toLogical(e);
    Input.pointers.set(e.pointerId, pos);
    const pad = padAt(pos.x, pos.y);
    if (pad && pad.id === 'jump') Input.jumpPressed = true;
    if (Game.scene && Game.scene.pointerDown) Game.scene.pointerDown(pos.x, pos.y, !!pad);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!Input.pointers.has(e.pointerId)) return;
    Input.pointers.set(e.pointerId, toLogical(e));
  });
  function releasePointer(e) {
    Input.pointers.delete(e.pointerId);
    if (Game.scene && Game.scene.pointerUp) {
      const pos = toLogical(e);
      Game.scene.pointerUp(pos.x, pos.y);
    }
  }
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // Elke frame: welke pads worden ingedrukt door vingers?
  function updatePadInput() {
    let left = keys.left || false;
    let right = keys.right || false;
    let jumpHeld = keys.jump || false;
    Input.pointers.forEach(function (pos) {
      const pad = padAt(pos.x, pos.y);
      if (!pad) return;
      if (pad.id === 'left') left = true;
      if (pad.id === 'right') right = true;
      if (pad.id === 'jump') jumpHeld = true;
    });
    Input.left = left;
    Input.right = right;
    Input.jumpHeld = jumpHeld;
  }

  /* ---------- UI-helpers ---------- */
  const UI = {
    // knop: {x, y, w, h, label, icon}
    button: function (c, b, active) {
      c.save();
      c.translate(b.x + b.w / 2, b.y + b.h / 2);
      c.rotate(-0.015);
      if (active) c.scale(1.05, 1.05);
      ART.rr(c, -b.w / 2, -b.h / 2 + 4, b.w, b.h, 16);
      c.fillStyle = 'rgba(0,0,0,.18)';
      c.fill();
      ART.rr(c, -b.w / 2, -b.h / 2, b.w, b.h, 16);
      c.fillStyle = b.fill || '#fff6d8';
      c.fill();
      ART.pen(c, 4.5);
      c.stroke();
      c.fillStyle = b.color || ART.OUT;
      ART.font(c, b.size || 26);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(b.label, 0, 2);
      c.restore();
    },
    hit: function (px, py, b) {
      return px >= b.x - 8 && px <= b.x + b.w + 8 && py >= b.y - 8 && py <= b.y + b.h + 8;
    },
    // touch-pads onder in beeld tekenen
    drawPads: function (c) {
      Input.pads.forEach(function (p) {
        c.save();
        c.globalAlpha = 0.55;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fillStyle = '#fff6d8';
        c.fill();
        ART.pen(c, 4);
        c.stroke();
        c.fillStyle = ART.OUT;
        ART.font(c, p.r * 0.9);
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(p.label, p.x, p.y + 2);
        c.restore();
      });
    },
    // muntenteller + home/geluid-knopjes
    hud: function (c, sessionCoins, opts) {
      opts = opts || {};
      // munten linksboven
      c.save();
      ART.rr(c, 14, 12, 118, 42, 21);
      c.fillStyle = 'rgba(255,251,232,.85)';
      c.fill();
      ART.pen(c, 3.5);
      c.stroke();
      ART.coin(c, 40, 33, 14);
      c.fillStyle = ART.OUT;
      ART.font(c, 24);
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(String(sessionCoins), 62, 35);
      c.restore();
      // home + geluid rechtsboven
      UI.homeBtn = { x: W - 118, y: 12, w: 46, h: 42, label: '🏠', size: 22 };
      UI.sndBtn = { x: W - 62, y: 12, w: 46, h: 42, label: Game.state.muted ? '🔇' : '🔊', size: 20 };
      if (!opts.noHome) UI.button(c, UI.homeBtn);
      UI.button(c, UI.sndBtn);
    },
    // true als een HUD-knop de tik afving
    hudTap: function (x, y, opts) {
      opts = opts || {};
      if (UI.sndBtn && UI.hit(x, y, UI.sndBtn)) {
        Game.state.muted = !Game.state.muted;
        SND.muted = Game.state.muted;
        Game.save();
        SND.click();
        return true;
      }
      if (!opts.noHome && UI.homeBtn && UI.hit(x, y, UI.homeBtn)) {
        SND.click();
        Game.go('menu');
        return true;
      }
      return false;
    },
    // sterren tonen (n van de 3)
    stars: function (c, x, y, n, r) {
      r = r || 20;
      for (let i = 0; i < 3; i++) {
        ART.star(c, x + (i - 1) * (r * 2.6), y, r, i < n);
      }
    }
  };
  window.UI = UI;

  /* ---------- confetti (voor feestjes) ---------- */
  const Confetti = {
    parts: [],
    burst: function (x, y, n) {
      const colors = ['#e2554f', '#f6c445', '#7fc94a', '#5aa0e6', '#c98d4b', '#ff9ecb'];
      for (let i = 0; i < (n || 40); i++) {
        this.parts.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 420,
          vy: -Math.random() * 420 - 120,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 10,
          c: colors[(Math.random() * colors.length) | 0],
          life: 2.2 + Math.random()
        });
      }
    },
    update: function (dt) {
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.vy += 700 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.life -= dt;
        if (p.life <= 0 || p.y > H + 30) this.parts.splice(i, 1);
      }
    },
    draw: function (c) {
      this.parts.forEach(function (p) {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.c;
        c.fillRect(-5, -3, 10, 6);
        c.restore();
      });
    }
  };
  window.Confetti = Confetti;

  /* ---------- scene-beheer ---------- */
  const Game = {
    state: load(),
    scene: null,
    sceneName: '',
    save: function () {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.state)); } catch (e) { /* ok */ }
    },
    go: function (name, opts) {
      const s = window.SCENES[name];
      if (!s) return;
      Input.pads = [];
      Game.scene = s;
      Game.sceneName = name;
      if (s.enter) s.enter(opts || {});
    },
    // een level is klaar: sterren + munten bijschrijven
    finishLevel: function (levelIdx, stars, coinsEarned) {
      const st = Game.state;
      st.stars[levelIdx] = Math.max(st.stars[levelIdx], stars);
      st.coins += coinsEarned;
      st.unlocked = Math.max(st.unlocked, Math.min(3, levelIdx + 2));
      if (levelIdx === 0) st.items.hoed = true;
      if (levelIdx === 1) st.items.sleutel = true;
      if (levelIdx === 2) st.items.kroon = true;
      Game.save();
    }
  };
  window.Game = Game;
  SND.muted = Game.state.muted;

  /* ---------- hoofdloop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    updatePadInput();
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    if (Game.scene) {
      Game.scene.update(dt);
      Game.scene.draw(ctx);
    }
    Confetti.update(dt);
    Confetti.draw(ctx);
    Input.jumpPressed = false;
    requestAnimationFrame(frame);
  }

  // ?scene=level1 om direct in een level te springen (handig voor testen)
  const startScene = new URLSearchParams(location.search).get('scene') || 'menu';
  Game.go(window.SCENES[startScene] ? startScene : 'menu');
  requestAnimationFrame(frame);
})();
