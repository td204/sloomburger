/* Einde — Sloom wordt gekroond tot Burgerkoning! */
window.SCENES = window.SCENES || {};

(function () {
  const W = 960, H = 540;
  const GROUND = 470;

  const einde = {
    enter: function () {
      this.t = 0;
      this.confettiT = 0;
      window.Input.pads = [];
      SND.muziek('feest');
      SND.yay();
    },

    update: function (dt) {
      this.t += dt;
      this.confettiT -= dt;
      if (this.confettiT <= 0 && this.t < 8) {
        this.confettiT = 0.9;
        window.Confetti.burst(120 + Math.random() * (W - 240), 120, 26);
      }
    },

    pointerDown: function (x, y) {
      if (this.t < 1.5) return;
      if (UI.hit(x, y, this.menuBtn)) { SND.click(); window.Game.go('menu'); return; }
      if (UI.hit(x, y, this.againBtn)) { SND.click(); window.Game.go('level1'); return; }
    },

    draw: function (c) {
      const t = this.t;
      const st = window.Game.state;
      ART.skyGrad(c, '#ffd9a0', '#ffe9c9');
      ART.sun(c, 90, 80);
      ART.ground(c, GROUND);

      // het restaurant is nu open!
      ART.restaurant(c, W / 2, GROUND, 0.95, true);

      // vriendjes die juichen
      const hop = Math.abs(Math.sin(t * 5)) * 10;
      ART.animalHead(c, 'aap', 150, 400 - hop, 1.1, 'lach', t);
      ART.animalHead(c, 'toekan', 250, 420 - Math.abs(Math.sin(t * 5 + 1)) * 10, 1, 'lach', t);
      ART.animalHead(c, 'kikker', 810, 410 - Math.abs(Math.sin(t * 5 + 2)) * 10, 1.05, 'lach', t);

      // Sloom (vooraan) met hoed én kroon
      const FEET = 534;
      const crownDrop = Math.min(1, t / 1.2);
      ART.slothStand(c, W / 2, FEET, { t: t, mood: 'juich', arms: 'omhoog', hat: 'hoed' });
      const crownTarget = FEET - 186; // bovenop de hoge hoed
      const crownY = -40 + (crownTarget + 40) * (1 - Math.pow(1 - crownDrop, 3));
      ART.crown(c, W / 2, crownY, 0.8);

      // banner
      c.save();
      ART.rr(c, W / 2 - 300, 26, 600, 74, 18);
      c.fillStyle = '#fffbe8';
      c.fill();
      ART.pen(c, 5);
      c.stroke();
      c.fillStyle = '#e2554f';
      ART.font(c, 34);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('👑 Sloom is de BURGERKONING! 👑', W / 2, 60);
      c.restore();

      // verhaaltje + score
      if (t >= 1.5) {
        c.save();
        ART.rr(c, W / 2 - 280, 118, 560, 122, 16);
        c.fillStyle = 'rgba(255,251,232,.94)';
        c.fill();
        ART.pen(c, 4);
        c.stroke();
        c.fillStyle = ART.OUT;
        ART.font(c, 19);
        c.textAlign = 'center';
        c.fillText('Langzaam maar zeker heeft Sloom zijn droom waargemaakt.', W / 2, 148);
        const totStars = st.stars[0] + st.stars[1] + st.stars[2];
        c.fillText('Jij hielp hem! Munten: ' + st.coins + '  •  Sterren: ' + totStars + ' van 9', W / 2, 180);
        c.fillStyle = '#e2554f';
        ART.font(c, 22);
        c.fillText('⭐ Game by Sofie ⭐', W / 2, 216);
        c.restore();

        this.againBtn = { x: 40, y: H - 76, w: 250, h: 56, label: '↺ Speel opnieuw', size: 22, fill: '#ffd94d' };
        this.menuBtn = { x: W - 250, y: H - 76, w: 210, h: 56, label: '🏠 Menu', size: 22 };
        UI.button(c, this.againBtn);
        UI.button(c, this.menuBtn);
      }
    }
  };

  window.SCENES.einde = einde;
})();
