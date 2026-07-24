/* Level 3 — Het Burger Restaurant: vang de ingrediënten en maak de burgers
   precies zoals de klanten ze willen. Beloning: de kroon! */
window.SCENES = window.SCENES || {};

(function () {
  const W = 960, H = 540;
  const FLOOR = 500;
  const TYPES = ['burger', 'kaas', 'sla', 'tomaat'];
  const CUSTOMERS = ['aap', 'toekan', 'kikker', 'aap', 'toekan'];
  const NAMES = { aap: 'Aap', toekan: 'Toekan', kikker: 'Kikker' };

  const level3 = {
    enter: function () {
      this.t = 0;
      this.px = W / 2;
      this.targetX = null;
      this.sessionCoins = 0;
      this.served = 0;
      this.missed = 0;
      this.items = [];
      this.spawnT = 1;
      this.phase = 'spel'; // spel | serve | win
      this.serveT = 0;
      this.winT = 0;
      this.newCustomer(0);

      window.Input.pads = [
        { id: 'left', x: 84, y: 480, r: 42, label: '◀' },
        { id: 'right', x: 876, y: 480, r: 42, label: '▶' }
      ];
    },

    newCustomer: function (idx) {
      this.custIdx = idx;
      this.customer = CUSTOMERS[idx];
      const n = 2 + (idx % 3); // bestelling wordt steeds iets groter
      const order = [];
      for (let i = 0; i < n; i++) order.push(TYPES[(idx + i * 2 + (idx % 2)) % TYPES.length]);
      order.push('top');
      this.order = order;
      this.stack = ['bodem'];
      this.orderIdx = 0;
    },

    needed: function () { return this.order[this.orderIdx]; },

    update: function (dt) {
      this.t += dt;
      const I = window.Input;

      if (this.phase === 'win') { this.winT += dt; return; }

      if (this.phase === 'serve') {
        this.serveT += dt;
        if (this.serveT > 1.4) {
          if (this.served >= CUSTOMERS.length) {
            this.phase = 'win';
            this.winT = 0;
            this.starsEarned = 1 + (this.missed <= 4 ? 1 : 0) + (this.missed <= 1 ? 1 : 0);
            window.Game.finishLevel(2, this.starsEarned, this.sessionCoins);
            SND.fanfare();
          } else {
            this.newCustomer(this.served);
            this.phase = 'spel';
            this.items = [];
            this.spawnT = 0.8;
          }
        }
        return;
      }

      // bewegen: knoppen of vinger volgen
      const SPEED = 380;
      let dx = 0;
      if (I.left) dx -= 1;
      if (I.right) dx += 1;
      if (dx === 0 && this.targetX !== null) {
        const diff = this.targetX - this.px;
        if (Math.abs(diff) > 10) dx = diff > 0 ? 1 : -1;
      }
      this.px += dx * SPEED * dt;
      this.px = Math.max(150, Math.min(W - 150, this.px));

      // nieuwe vallende dingen
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = 0.85;
        let type;
        const r = Math.random();
        if (r < 0.5) type = this.needed();
        else if (r < 0.62) type = 'munt';
        else type = TYPES[(Math.random() * TYPES.length) | 0];
        if (type === 'top' && Math.random() < 0.5 && this.orderIdx < this.order.length - 1) {
          type = TYPES[(Math.random() * TYPES.length) | 0];
        }
        this.items.push({
          type: type,
          x: 160 + Math.random() * (W - 320),
          y: -30,
          vy: 150 + Math.random() * 70,
          vx: 0,
          rot: 0
        });
      }

      // plate-hoogte: bordje + stapel
      const plateY = FLOOR - 194 - (this.stack.length - 1) * 13;

      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        it.y += it.vy * dt;
        it.x += it.vx * dt;
        it.rot += it.vx * 0.004 * dt * 60;

        // vangen?
        if (it.vx === 0 && it.y > plateY - 12 && it.y < plateY + 20 &&
            Math.abs(it.x - this.px) < 52) {
          if (it.type === 'munt') {
            this.sessionCoins++;
            SND.coin();
            this.items.splice(i, 1);
            continue;
          }
          if (it.type === this.needed()) {
            this.stack.push(it.type);
            this.orderIdx++;
            SND.pop();
            this.items.splice(i, 1);
            if (this.orderIdx >= this.order.length) {
              // bestelling klaar → serveren!
              this.served++;
              this.sessionCoins += 8;
              this.phase = 'serve';
              this.serveT = 0;
              SND.serve();
              window.Confetti.burst(this.px, plateY, 26);
            }
            continue;
          }
          // verkeerd ingrediënt: stuitert er grappig af (geen straf)
          it.vx = it.x < this.px ? -220 : 220;
          it.vy = -160;
          SND.wrong();
          continue;
        }
        if (it.vx !== 0) it.vy += 900 * dt;

        // gemist
        if (it.y > H + 40) {
          if (it.type === this.needed() && it.vx === 0) this.missed++;
          this.items.splice(i, 1);
        }
      }
    },

    pointerDown: function (x, y, onPad) {
      if (this.phase === 'win') {
        if (this.winT < 1) return;
        if (UI.hit(x, y, this.nextBtn)) { SND.click(); window.Game.go('einde'); return; }
        return;
      }
      if (UI.hudTap(x, y)) return;
      if (!onPad && y > 120) this.targetX = x;
    },

    pointerUp: function () { this.targetX = null; },

    draw: function (c) {
      const t = this.t;
      // restaurant-binnenkant
      ART.skyGrad(c, '#ffe9c9', '#ffd9a0');
      // raam met uitzicht
      c.save();
      ART.rr(c, W / 2 - 110, 60, 220, 120, 14);
      c.fillStyle = '#bfe8ff';
      c.fill();
      ART.pen(c, 4);
      c.stroke();
      ART.cloudPuff(c, W / 2 - 40 + Math.sin(t * 0.4) * 15, 100, 0.5);
      c.fillStyle = '#7fc94a';
      c.fillRect(W / 2 - 106, 150, 212, 26);
      c.restore();
      // bord aan de muur
      ART.sign(c, W / 2, 32, 300, 46, 'burger restaurant', 22);

      // geblokte vloer
      c.fillStyle = '#f2e3c3';
      c.fillRect(0, FLOOR, W, H - FLOOR);
      for (let x = 0; x < W; x += 48) {
        for (let y = FLOOR; y < H; y += 24) {
          if (((x / 48) + ((y - FLOOR) / 24)) % 2 === 0) {
            c.fillStyle = '#e2c89a';
            c.fillRect(x, y, 48, 24);
          }
        }
      }
      ART.pen(c, 3.5);
      c.beginPath();
      c.moveTo(0, FLOOR);
      c.lineTo(W, FLOOR);
      c.stroke();

      // klant + bestelling
      if (this.phase !== 'win') {
        const hop = this.phase === 'serve' ? Math.abs(Math.sin(this.serveT * 8)) * 14 : 0;
        ART.animalHead(c, this.customer, 96, 300 - hop, 1.25,
          this.phase === 'serve' ? 'lach' : 'wacht', t);
        // bestelbord
        c.save();
        ART.rr(c, 30, 60, 150, 176, 14);
        c.fillStyle = '#fffbe8';
        c.fill();
        ART.pen(c, 4);
        c.stroke();
        c.fillStyle = ART.OUT;
        ART.font(c, 16);
        c.textAlign = 'center';
        c.fillText(NAMES[this.customer] + ' wil:', 105, 82);
        // de bestelling als burger-plaatje, van onder naar boven
        const full = ['bodem'].concat(this.order);
        for (let i = 0; i < full.length; i++) {
          const iy = 216 - i * 20;
          c.globalAlpha = i <= this.orderIdx ? 1 : 0.85;
          ART.ingredient(c, full[i], 105, iy, 0.72);
          if (i === this.orderIdx + 1) {
            // pijltje bij wat nu nodig is
            c.fillStyle = '#e2554f';
            ART.font(c, 18);
            c.fillText('➜', 44, iy + 2);
          }
        }
        c.globalAlpha = 1;
        c.restore();
        // vinkjes voor klaar
        if (this.phase === 'serve') {
          c.save();
          c.fillStyle = '#3f7a54';
          ART.font(c, 30);
          c.textAlign = 'center';
          c.fillText('Mmm! 😋', 105, 380);
          c.restore();
        }
      }

      // klanten-teller
      c.save();
      ART.rr(c, W - 172, 60, 150, 46, 14);
      c.fillStyle = '#fffbe8';
      c.fill();
      ART.pen(c, 3.5);
      c.stroke();
      c.fillStyle = ART.OUT;
      ART.font(c, 20);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('klanten: ' + this.served + '/' + CUSTOMERS.length, W - 97, 84);
      c.restore();

      // vallende dingen
      this.items.forEach(function (it) {
        c.save();
        c.translate(it.x, it.y);
        c.rotate(it.rot);
        if (it.type === 'munt') ART.coin(c, 0, 0, 15, t * 3);
        else ART.ingredient(c, it.type, 0, 0, 1);
        c.restore();
      });

      // Sloom met bord + stapel
      const plateBase = FLOOR - 190;
      ART.slothStand(c, this.px, FLOOR, {
        t: t, mood: this.phase === 'serve' ? 'juich' : 'blij',
        hat: 'hoed', arms: 'bord'
      });
      for (let i = 0; i < this.stack.length; i++) {
        ART.ingredient(c, this.stack[i], this.px, plateBase - 8 - i * 13, 1);
      }

      // HUD
      UI.hud(c, this.sessionCoins);
      c.save();
      c.fillStyle = ART.OUT;
      ART.font(c, 17);
      c.textAlign = 'center';
      c.fillText('Level 3 — Het Burger Restaurant', W / 2, 208);
      if (t < 5 && this.phase === 'spel' && this.custIdx === 0) {
        c.globalAlpha = 0.7 + Math.sin(t * 4) * 0.3;
        ART.font(c, 20);
        c.fillText('Vang wat de klant wil — kijk naar het pijltje! 👆 sleep of gebruik ◀ ▶', W / 2, 250);
      }
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
        ART.font(c, 32);
        c.textAlign = 'center';
        c.fillText('Alle klanten zijn blij! 🎉', W / 2, 162);
        c.fillStyle = ART.OUT;
        ART.font(c, 22);
        c.fillText('En dan gebeurt er iets bijzonders...', W / 2, 204);
        ART.crown(c, W / 2, 262, 1.4);
        UI.stars(c, W / 2, 316, this.starsEarned, 22);
        this.nextBtn = { x: W / 2 - 130, y: 356, w: 260, h: 56, label: 'Wat dan? ✨', size: 24, fill: '#ffd94d' };
        UI.button(c, this.nextBtn);
        c.restore();
      }
    }
  };

  window.SCENES.level3 = level3;
})();
