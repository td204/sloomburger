/* Level 1 — De Jungle: lopen, springen en hangen aan takken, munten verzamelen.
   Beloning: de hoed! */
window.SCENES = window.SCENES || {};

(function () {
  const W = 960, H = 540;
  const GROUND = 470;
  const L = 3400; // lengte van de wereld

  const level1 = {
    enter: function () {
      this.t = 0;
      this.px = 120; this.py = GROUND;
      this.vy = 0;
      this.mode = 'ground'; // ground | air | hang
      this.facing = 1;
      this.walk = 0;
      this.coyote = 0;
      this.camX = 0;
      this.sessionCoins = 0;
      this.phase = 'spel'; // spel | win
      this.winT = 0;
      this.goalX = L - 160;

      this.platforms = [
        { x: 560, y: 372, w: 160 },
        { x: 790, y: 292, w: 150 },
        { x: 1450, y: 380, w: 150 },
        { x: 1660, y: 300, w: 140 },
        { x: 2450, y: 372, w: 160 },
        { x: 2660, y: 292, w: 150 }
      ];
      this.vines = [
        { x1: 900, x2: 1360, y: 168 },
        { x1: 1830, x2: 2320, y: 158 },
        { x1: 2830, x2: 3170, y: 168 }
      ];

      // munten neerleggen
      const coins = [];
      [230, 285, 340, 395].forEach(function (x) { coins.push({ x: x, y: 428 }); });
      this.platforms.forEach(function (p) {
        for (let i = 0; i < 3; i++) coins.push({ x: p.x + 30 + i * ((p.w - 60) / 2), y: p.y - 38 });
      });
      this.vines.forEach(function (v) {
        for (let x = v.x1 + 60; x <= v.x2 - 40; x += 85) coins.push({ x: x, y: v.y + 92 });
      });
      [2000, 2060, 2120].forEach(function (x) { coins.push({ x: x, y: 428 }); });
      [3230, 3290].forEach(function (x) { coins.push({ x: x, y: 428 }); });
      coins.forEach(function (cn) { cn.got = false; });
      this.coins = coins;
      this.totalCoins = coins.length;

      window.Input.pads = [
        { id: 'left', x: 84, y: 476, r: 42, label: '◀' },
        { id: 'right', x: 196, y: 476, r: 42, label: '▶' },
        { id: 'jump', x: 872, y: 470, r: 50, label: '⤒' }
      ];
    },

    update: function (dt) {
      this.t += dt;
      const I = window.Input;

      if (this.phase === 'win') {
        this.winT += dt;
        if (this.winT === dt) { /* eerste frame */ }
        return;
      }

      const SPEED = 215, HANGSPEED = 175;
      let dx = 0;
      if (I.left) dx -= 1;
      if (I.right) dx += 1;
      if (dx !== 0) this.facing = dx;

      if (this.mode === 'hang') {
        this.px += dx * HANGSPEED * dt;
        const v = this.vine;
        this.px = Math.max(v.x1 + 30, Math.min(v.x2 - 60, this.px));
        this.py = v.y + 108;
        this.walk += dx !== 0 ? dt : 0;
        if (I.jumpPressed) {
          this.mode = 'air';
          this.vy = 40;
          this.noGrab = 0.35; // even niet opnieuw vastpakken
          SND.jump();
        }
      } else {
        this.px += dx * SPEED * dt;
        this.px = Math.max(40, Math.min(L - 40, this.px));
        this.walk += dx !== 0 ? dt : 0;

        // zwaartekracht
        const wasAir = this.mode === 'air';
        this.vy += 1400 * dt;
        const prevY = this.py;
        this.py += this.vy * dt;

        // grond
        let landed = false;
        if (this.py >= GROUND) { this.py = GROUND; this.vy = 0; landed = true; }
        // takken-platforms (alleen van bovenaf)
        if (!landed && this.vy > 0) {
          for (let i = 0; i < this.platforms.length; i++) {
            const p = this.platforms[i];
            if (this.px > p.x - 8 && this.px < p.x + p.w + 8 &&
                prevY <= p.y + 6 && this.py >= p.y) {
              this.py = p.y; this.vy = 0; landed = true;
              break;
            }
          }
        }
        this.mode = landed ? 'ground' : 'air';
        if (landed) this.coyote = 0.12;
        else this.coyote -= dt;

        // springen
        if (I.jumpPressed && this.coyote > 0) {
          this.vy = -580;
          this.mode = 'air';
          this.coyote = 0;
          SND.jump();
        }

        // een tak grijpen als je er met je handen bij kan (ook al vallend — extra makkelijk)
        this.noGrab = Math.max(0, (this.noGrab || 0) - dt);
        if (this.mode === 'air' && this.noGrab <= 0) {
          const handsY = this.py - 132;
          for (let i = 0; i < this.vines.length; i++) {
            const v = this.vines[i];
            if (this.px > v.x1 + 20 && this.px < v.x2 - 40 &&
                Math.abs(handsY - v.y) < 30) {
              this.mode = 'hang';
              this.vine = v;
              this.vy = 0;
              this.py = v.y + 108;
              SND.grab();
              break;
            }
          }
        }
        if (wasAir && this.mode === 'ground') { /* zachte landing */ }
      }

      // munten pakken
      const cx = this.px, cy = this.py - (this.mode === 'hang' ? 40 : 75);
      for (let i = 0; i < this.coins.length; i++) {
        const cn = this.coins[i];
        if (cn.got) continue;
        const ddx = cn.x - cx, ddy = cn.y - cy;
        if (ddx * ddx + ddy * ddy < 55 * 55) {
          cn.got = true;
          this.sessionCoins++;
          SND.coin();
        }
      }

      // finish!
      if (this.px > this.goalX - 20) {
        this.phase = 'win';
        this.winT = 0;
        this.px = this.goalX;
        this.mode = 'ground';
        this.py = GROUND;
        const frac = this.sessionCoins / this.totalCoins;
        this.starsEarned = 1 + (frac >= 0.6 ? 1 : 0) + (frac >= 0.95 ? 1 : 0);
        window.Game.finishLevel(0, this.starsEarned, this.sessionCoins);
        window.Input.pads = [];
        SND.fanfare();
        window.Confetti.burst(this.px - this.camX, 260, 60);
      }

      // camera
      this.camX = Math.max(0, Math.min(L - W, this.px - 400));
    },

    pointerDown: function (x, y, onPad) {
      if (this.phase === 'win') {
        if (this.winT < 1) return;
        if (UI.hit(x, y, this.nextBtn)) { SND.click(); window.Game.go('level2'); return; }
        if (UI.hit(x, y, this.menuBtn)) { SND.click(); window.Game.go('menu'); return; }
        return;
      }
      if (UI.hudTap(x, y)) return;
    },

    draw: function (c) {
      const t = this.t, cam = this.camX;
      ART.skyGrad(c, '#bfe8ff', '#e8f7d9');
      ART.sun(c, 90, 80);
      ART.cloudPuff(c, ((900 - cam * 0.2) % (W + 300)) - 100, 90, 1);
      ART.cloudPuff(c, ((400 - cam * 0.2) % (W + 300)) + 100, 150, 0.75);

      // verre bomen (parallax)
      c.save();
      c.translate(-cam * 0.45, 0);
      for (let x = 100; x < L * 0.6 + W; x += 260) {
        ART.tree(c, x, GROUND + 14, 0.9, true);
      }
      c.restore();

      ART.ground(c, GROUND);

      c.save();
      c.translate(-cam, 0);

      // bomen + struiken
      for (let x = 60; x < L; x += 420) ART.tree(c, x + (x % 840 ? 40 : 0), GROUND, 1.05 + (x % 3) * 0.06);
      for (let x = 260; x < L; x += 380) ART.bush(c, x, GROUND, 0.85);

      // hangtakken
      const self = this;
      this.vines.forEach(function (v) {
        ART.branch(c, v.x1, v.x2, v.y, true);
      });
      // platforms
      this.platforms.forEach(function (p) {
        ART.platform(c, p.x, p.y, p.w);
      });

      // lesbordjes
      ART.sign(c, 240, 300, 210, 54, '◀ ▶ lopen  ⤒ springen', 18);
      ART.sign(c, 950, 300, 250, 54, 'spring naar de tak', 19);
      c.save();
      ART.font(c, 26);
      c.textAlign = 'center';
      c.fillStyle = ART.OUT;
      c.fillText('👆', 950, 250);
      c.restore();

      // munten
      this.coins.forEach(function (cn) {
        if (!cn.got) ART.coin(c, cn.x, cn.y + Math.sin(t * 3 + cn.x) * 3, 15, t * 2.5 + cn.x * 0.01);
      });

      // finish: sokkel met de hoed
      const gx = this.goalX;
      ART.rr(c, gx - 40, GROUND - 60, 80, 60, 8);
      c.fillStyle = '#d9cdb2';
      c.fill();
      ART.pen(c, 4);
      c.stroke();
      if (this.phase !== 'win') {
        ART.hat(c, gx, GROUND - 70 + Math.sin(t * 2) * 4, 0.9);
        ART.sign(c, gx, GROUND - 160, 150, 44, 'de hoed!', 20);
      }

      // Sloom zelf
      if (this.phase === 'win') {
        const hatDrop = Math.min(1, this.winT / 0.8);
        const hatY = GROUND - 160; // bovenop zijn hoofd
        ART.slothStand(c, gx, GROUND, { t: t, mood: 'juich', arms: 'omhoog' });
        const hy = -40 + (hatY + 40) * (1 - Math.pow(1 - hatDrop, 3));
        ART.hat(c, gx, hy, 0.8);
      } else if (this.mode === 'hang') {
        ART.slothHang(c, this.px, this.vine.y, { t: t, mood: 'blij', flip: this.facing < 0 });
      } else {
        ART.slothStand(c, this.px, this.py, {
          t: t, mood: this.mode === 'air' ? 'wow' : 'blij',
          flip: this.facing < 0,
          walk: this.mode === 'ground' && (window.Input.left || window.Input.right) ? this.walk : 0
        });
      }

      c.restore();

      // HUD
      UI.hud(c, this.sessionCoins);
      c.save();
      c.fillStyle = ART.OUT;
      ART.font(c, 17);
      c.textAlign = 'center';
      c.fillText('Level 1 — De Jungle', W / 2, 30);
      c.restore();
      UI.drawPads(c);

      // winpaneel
      if (this.phase === 'win' && this.winT >= 1) {
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
        c.fillText('Hoera! 🎉', W / 2, 160);
        c.fillStyle = ART.OUT;
        ART.font(c, 22);
        c.fillText('Sloom heeft zijn hoed verdiend!', W / 2, 200);
        ART.hat(c, W / 2, 260, 1);
        UI.stars(c, W / 2, 300, this.starsEarned, 22);
        ART.font(c, 19);
        c.fillText('Munten: ' + this.sessionCoins + ' van ' + this.totalCoins, W / 2, 345);
        this.nextBtn = { x: W / 2 + 10, y: 368, w: 220, h: 52, label: 'Verder  ▶', size: 24, fill: '#ffd94d' };
        this.menuBtn = { x: W / 2 - 230, y: 368, w: 220, h: 52, label: '🏠 Menu', size: 24 };
        UI.button(c, this.nextBtn);
        UI.button(c, this.menuBtn);
        c.restore();
      }
    }
  };

  window.SCENES.level1 = level1;
})();
