/* Level 2 — De weg naar de stad: rennen, springen, ?-mandjes vol verrassingen.
   Eén knop: tik = springen (dubbel springen mag!). Beloning: de sleutel! */
window.SCENES = window.SCENES || {};

(function () {
  const W = 960, H = 540;
  const GROUND = 470;
  const D = 10500;      // af te leggen afstand
  const SX = 250;       // Sloom staat altijd op dit schermpunt

  const level2 = {
    enter: function () {
      this.t = 0;
      SND.muziek('stad');
      this.d = 0;
      this.py = GROUND;
      this.vy = 0;
      this.airJumps = 1;
      this.sessionCoins = 0;
      this.bumps = 0;
      this.dizzy = 0;
      this.boost = 0;
      this.shield = false;
      this.phase = 'spel'; // spel | win
      this.winT = 0;
      this.sparkles = [];

      // parcours
      this.obstacles = [];
      const obTypes = ['rock', 'puddle', 'rock', 'rock', 'puddle'];
      let x = 1000, i = 0;
      while (x < D - 800) {
        this.obstacles.push({ x: x, type: obTypes[i % obTypes.length], hit: false });
        x += 520 + (i % 3) * 210;
        i++;
      }

      const prizes = ['munten', 'blad', 'schild', 'munten', 'blad', 'munten'];
      this.baskets = [1550, 3100, 4800, 6500, 8100, 9400].map(function (bx, bi) {
        return { x: bx, y: 330, opened: false, prize: prizes[bi], popT: 0 };
      });

      this.coins = [];
      const self = this;
      function coinArc(cx0) {
        for (let k = 0; k < 5; k++) {
          self.coins.push({ x: cx0 + k * 55, y: 420 - Math.sin((k / 4) * Math.PI) * 90, got: false });
        }
      }
      for (let cx = 700; cx < D - 600; cx += 1250) coinArc(cx);
      this.totalCoins = this.coins.length;

      window.Input.pads = []; // hele scherm = springen
    },

    jump: function () {
      if (this.phase !== 'spel') return;
      if (this.py >= GROUND - 1) {
        this.vy = -600;
        this.airJumps = 1;
        SND.jump();
      } else if (this.airJumps > 0) {
        this.airJumps--;
        this.vy = -520;
        SND.jump();
      }
    },

    update: function (dt) {
      this.t += dt;
      const I = window.Input;

      if (this.phase === 'win') {
        this.winT += dt;
        return;
      }

      if (I.jumpPressed) this.jump();

      // snelheid: normaal, sloom (na botsing) of supersnel (blaadje)
      let v = 265;
      if (this.dizzy > 0) { v = 120; this.dizzy -= dt; }
      if (this.boost > 0) { v = 430; this.boost -= dt; }
      this.d += v * dt;

      // springen/vallen
      this.vy += 1500 * dt;
      this.py += this.vy * dt;
      if (this.py >= GROUND) { this.py = GROUND; this.vy = 0; this.airJumps = 1; }

      const feetX = this.d + SX;

      // botsen met obstakels (alleen op de grond, en niet met blaadjes-boost)
      if (this.boost <= 0) {
        for (let i = 0; i < this.obstacles.length; i++) {
          const ob = this.obstacles[i];
          if (ob.hit) continue;
          if (Math.abs(ob.x - feetX) < 42 && this.py > GROUND - 46) {
            ob.hit = true;
            if (this.shield) {
              this.shield = false;
              SND.pop();
            } else {
              this.bumps++;
              this.dizzy = 1.1;
              SND.bump();
            }
          }
        }
      }

      // ?-mandjes openspringen
      for (let i = 0; i < this.baskets.length; i++) {
        const b = this.baskets[i];
        if (b.opened) { b.popT += dt; continue; }
        const bodyY = this.py - 70;
        if (Math.abs(b.x - feetX) < 52 && Math.abs(b.y - bodyY) < 60) {
          b.opened = true;
          b.popT = 0;
          SND.surprise();
          window.Confetti.burst(b.x - this.d, b.y, 18);
          if (b.prize === 'munten') {
            this.sessionCoins += 5;
            SND.coin();
          } else if (b.prize === 'blad') {
            this.boost = 4;
          } else if (b.prize === 'schild') {
            this.shield = true;
          }
        }
      }

      // munten
      for (let i = 0; i < this.coins.length; i++) {
        const cn = this.coins[i];
        if (cn.got) continue;
        const dx = cn.x - feetX, dy = cn.y - (this.py - 70);
        if (dx * dx + dy * dy < 58 * 58) {
          cn.got = true;
          this.sessionCoins++;
          SND.coin();
        }
      }

      // glittertjes bij boost
      if (this.boost > 0 && Math.random() < 0.5) {
        this.sparkles.push({ x: SX - 30, y: this.py - 60 + (Math.random() - 0.5) * 80, life: 0.5 });
      }
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const s = this.sparkles[i];
        s.x -= 250 * dt;
        s.life -= dt;
        if (s.life <= 0) this.sparkles.splice(i, 1);
      }

      // finish
      if (this.d >= D) {
        this.phase = 'win';
        this.winT = 0;
        const frac = this.sessionCoins / (this.totalCoins + 15);
        this.starsEarned = 1 + (frac >= 0.55 ? 1 : 0) + (this.bumps <= 2 ? 1 : 0);
        window.Game.finishLevel(1, this.starsEarned, this.sessionCoins);
        SND.fanfare();
        window.Confetti.burst(W / 2, 200, 70);
      }
    },

    pointerDown: function (x, y, onPad) {
      if (this.phase === 'win') {
        if (this.winT < 1) return;
        if (UI.hit(x, y, this.nextBtn)) { SND.click(); window.Game.go('level3'); return; }
        if (UI.hit(x, y, this.menuBtn)) { SND.click(); window.Game.go('menu'); return; }
        return;
      }
      if (UI.hudTap(x, y)) return;
      this.jump();
    },

    draw: function (c) {
      const t = this.t, d = this.d;
      const prog = Math.min(1, d / D);

      ART.skyGrad(c, '#bfe8ff', prog > 0.7 ? '#ffe9c9' : '#e8f7d9');
      ART.sun(c, 860, 80);
      ART.cloudPuff(c, ((600 - d * 0.1) % (W + 300) + W + 300) % (W + 300) - 150, 100, 1);
      ART.cloudPuff(c, ((200 - d * 0.12) % (W + 300) + W + 300) % (W + 300) - 150, 160, 0.7);

      // verte: eerst jungle, bij de stad huisjes
      c.save();
      c.translate(-(d * 0.35) % 520, 0);
      for (let x = -100; x < W + 600; x += 260) {
        ART.tree(c, x, GROUND + 16, 0.85, true);
      }
      c.restore();
      if (prog > 0.6) {
        const a = Math.min(1, (prog - 0.6) / 0.3);
        c.save();
        c.globalAlpha = a;
        c.translate(-(d * 0.5) % 400, 0);
        for (let x = -100; x < W + 500; x += 200) {
          c.fillStyle = '#d9a86b';
          ART.rr(c, x, GROUND - 120, 110, 120, 6);
          c.fill();
          ART.pen(c, 3);
          c.stroke();
          c.fillStyle = '#bfe8ff';
          c.fillRect(x + 18, GROUND - 100, 24, 24);
          c.fillRect(x + 66, GROUND - 100, 24, 24);
        }
        c.restore();
      }

      // zandpad
      ART.ground(c, GROUND, '#e8c98c', '#b8944f');
      c.save();
      c.fillStyle = '#d9b06b';
      for (let x = -((d * 0.9) % 140); x < W; x += 140) {
        c.beginPath();
        c.ellipse(x, GROUND + 34, 30, 7, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      c.save();
      c.translate(-d, 0);

      // struiken langs het pad
      for (let x = Math.floor(d / 300) * 300 - 300; x < d + W + 300; x += 300) {
        if ((x / 300) % 3 === 0) ART.bush(c, x, GROUND, 0.7);
      }

      // obstakels
      this.obstacles.forEach(function (ob) {
        if (ob.type === 'rock') ART.rock(c, ob.x, GROUND, 1);
        else ART.puddle(c, ob.x, GROUND + 8, 1);
      });

      // ?-mandjes
      this.baskets.forEach(function (b) {
        if (!b.opened) {
          ART.basket(c, b.x, b.y + Math.sin(t * 2.5 + b.x) * 5, 1, false, t);
        } else if (b.popT < 0.9) {
          ART.basket(c, b.x, b.y, 1, true, t);
          const rise = b.popT * 60;
          if (b.prize === 'munten') ART.coin(c, b.x, b.y - 40 - rise, 15);
          if (b.prize === 'blad') ART.leaf(c, b.x, b.y - 40 - rise, 1.1);
          if (b.prize === 'schild') ART.bubble(c, b.x, b.y - 40 - rise, 16);
        }
      });

      // munten
      this.coins.forEach(function (cn) {
        if (!cn.got) ART.coin(c, cn.x, cn.y + Math.sin(t * 3 + cn.x) * 3, 15, t * 2.5 + cn.x * 0.01);
      });

      // finish: het restaurant (nog dicht)
      ART.restaurant(c, D + SX + 260, GROUND, 1, false);
      ART.sign(c, D + SX + 30, GROUND - 120, 130, 70, 'finish', 24);

      c.restore();

      // glitters
      c.save();
      this.sparkles.forEach(function (s) {
        c.globalAlpha = s.life * 2;
        ART.star(c, s.x, s.y, 6, true);
      });
      c.restore();

      // Sloom rent (of is even duizelig)
      const mood = this.dizzy > 0 ? 'duizelig' : (this.boost > 0 ? 'wow' : 'blij');
      ART.slothStand(c, SX, this.py, {
        t: t, mood: mood, hat: 'hoed',
        walk: this.py >= GROUND - 1 ? t * (this.boost > 0 ? 2 : 1.2) : 0
      });
      if (this.shield) ART.bubble(c, SX, this.py - 70, 74);
      if (this.dizzy > 0) {
        c.save();
        for (let i = 0; i < 3; i++) {
          const a = t * 5 + (i * Math.PI * 2) / 3;
          ART.star(c, SX + Math.cos(a) * 34, this.py - 150 + Math.sin(a) * 10, 7, true);
        }
        c.restore();
      }

      // voortgangsbalk
      c.save();
      ART.rr(c, 210, 16, 540, 22, 11);
      c.fillStyle = 'rgba(255,251,232,.85)';
      c.fill();
      ART.pen(c, 3);
      c.stroke();
      ART.rr(c, 213, 19, Math.max(12, 534 * prog), 16, 8);
      c.fillStyle = '#7fc94a';
      c.fill();
      ART.font(c, 20);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🌴', 200, 28);
      c.fillText('🍔', 764, 28);
      // loopicoontje
      c.beginPath();
      c.arc(213 + 534 * prog, 27, 10, 0, Math.PI * 2);
      c.fillStyle = '#bd9d6f';
      c.fill();
      ART.pen(c, 2.5);
      c.stroke();
      c.restore();

      // HUD
      UI.hud(c, this.sessionCoins);
      c.save();
      c.fillStyle = ART.OUT;
      ART.font(c, 17);
      c.textAlign = 'center';
      c.fillText('Level 2 — Naar de stad', W / 2, 58);
      if (t < 4 && this.phase === 'spel') {
        c.globalAlpha = 0.7 + Math.sin(t * 4) * 0.3;
        ART.font(c, 24);
        c.fillText('👆 Tik om te springen! (2x tikken = extra sprong)', W / 2, 130);
      }
      c.restore();

      // winpaneel: de sleutel!
      if (this.phase === 'win') {
        const wt = this.winT;
        if (wt >= 1) {
          c.save();
          c.fillStyle = 'rgba(0,0,0,.25)';
          c.fillRect(0, 0, W, H);
          ART.rr(c, W / 2 - 250, 110, 500, 320, 22);
          c.fillStyle = '#fffbe8';
          c.fill();
          ART.pen(c, 5);
          c.stroke();
          c.fillStyle = '#e2554f';
          ART.font(c, 34);
          c.textAlign = 'center';
          c.fillText('Gehaald! 🎉', W / 2, 160);
          c.fillStyle = ART.OUT;
          ART.font(c, 22);
          c.fillText('Sloom krijgt de sleutel van het restaurant!', W / 2, 200);
          ART.key(c, W / 2, 255, 1.6, Math.sin(this.t) * 0.2);
          UI.stars(c, W / 2, 305, this.starsEarned, 22);
          ART.font(c, 19);
          c.fillText('Munten: ' + this.sessionCoins + '   Botsingen: ' + this.bumps, W / 2, 345);
          this.nextBtn = { x: W / 2 + 10, y: 368, w: 220, h: 52, label: 'Verder  ▶', size: 24, fill: '#ffd94d' };
          this.menuBtn = { x: W / 2 - 230, y: 368, w: 220, h: 52, label: '🏠 Menu', size: 24 };
          UI.button(c, this.nextBtn);
          UI.button(c, this.menuBtn);
          c.restore();
        }
      }
    }
  };

  window.SCENES.level2 = level2;
})();
