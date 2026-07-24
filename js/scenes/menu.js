/* Sloomburger — titelscherm en verhaal-intro */
window.SCENES = window.SCENES || {};

(function () {
  const W = 960, H = 540;

  /* ---------- titelscherm ---------- */
  const menu = {
    t: 0,
    btns: {},
    enter: function () {
      this.t = 0;
      const st = window.Game.state;
      this.btns.play = { x: W / 2 - 130, y: 328, w: 260, h: 64, label: '▶  Spelen', size: 30, fill: '#ffd94d' };
      this.btns.levels = [];
      for (let i = 0; i < 3; i++) {
        this.btns.levels.push({
          x: W / 2 - 150 + i * 110, y: 416, w: 90, h: 76,
          label: String(i + 1), size: 34, idx: i
        });
      }
      this.btns.snd = { x: W - 62, y: 12, w: 46, h: 42, label: st.muted ? '🔇' : '🔊', size: 20 };
    },
    update: function (dt) { this.t += dt; },
    pointerDown: function (x, y) {
      const G = window.Game, UIh = window.UI;
      if (UIh.hit(x, y, this.btns.snd)) {
        G.state.muted = !G.state.muted;
        SND.muted = G.state.muted;
        this.btns.snd.label = G.state.muted ? '🔇' : '🔊';
        G.save();
        SND.click();
        return;
      }
      if (UIh.hit(x, y, this.btns.play)) {
        SND.click();
        if (!G.state.seenIntro) G.go('intro');
        else G.go('level' + Math.min(G.state.unlocked, 3));
        return;
      }
      for (let i = 0; i < 3; i++) {
        const b = this.btns.levels[i];
        if (UIh.hit(x, y, b)) {
          if (i < G.state.unlocked) {
            SND.click();
            G.go('level' + (i + 1));
          } else {
            SND.wrong();
            this.shakeLock = i;
            this.shakeT = 0.5;
          }
          return;
        }
      }
    },
    draw: function (c) {
      const t = this.t;
      const st = window.Game.state;
      ART.skyGrad(c, '#bfe8ff', '#e8f7d9');
      ART.sun(c, 80, 84);
      ART.cloudPuff(c, 700 + Math.sin(t * 0.3) * 20, 90, 1.1);
      ART.cloudPuff(c, 260, 140, 0.8);
      ART.ground(c, 470);
      ART.tree(c, 130, 470, 1.15);
      ART.tree(c, 830, 470, 1.05);
      ART.bush(c, 320, 470, 1);
      ART.bush(c, 650, 470, 0.8);

      // tak met hangende Sloom + denkwolkje met zijn droom
      ART.branch(c, 470, 890, 96, true);
      ART.slothHang(c, 620, 96, { t: t, mood: 'blij', hat: st.items.kroon ? 'kroon' : null });
      ART.thoughtCloud(c, 420, 90, 0.95);
      ART.burger(c, 400, 82, 0.62);
      c.save();
      ART.font(c, 15);
      c.fillStyle = ART.OUT;
      c.textAlign = 'center';
      c.fillText('mijn droom!', 452, 128);
      c.restore();

      // titelbord
      ART.sign(c, W / 2 - 190, 232, 400, 92, '', 30);
      c.save();
      c.translate(W / 2 - 190, 232);
      c.rotate(-0.03);
      c.fillStyle = '#e2554f';
      ART.font(c, 56);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('Sloomburger', 0, -6);
      c.fillStyle = ART.OUT;
      ART.font(c, 17);
      c.fillText('het spel van Sloom de luiaard 🦥', 0, 30);
      c.restore();

      // knoppen
      UI.button(c, this.btns.play);
      for (let i = 0; i < 3; i++) {
        const b = this.btns.levels[i];
        const locked = i >= st.unlocked;
        c.save();
        if (this.shakeT > 0 && this.shakeLock === i) {
          c.translate(Math.sin(this.t * 60) * 3, 0);
        }
        UI.button(c, {
          x: b.x, y: b.y, w: b.w, h: b.h, label: '',
          fill: locked ? '#e5dcc3' : '#fff6d8'
        });
        if (locked) {
          ART.lock(c, b.x + b.w / 2, b.y + 34, 1);
        } else {
          c.fillStyle = ART.OUT;
          ART.font(c, 30);
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(String(i + 1), b.x + b.w / 2, b.y + 26);
          for (let s = 0; s < 3; s++) {
            ART.star(c, b.x + b.w / 2 + (s - 1) * 22, b.y + 58, 9, s < st.stars[i]);
          }
        }
        c.restore();
      }
      if (this.shakeT > 0) this.shakeT -= 1 / 60;

      // beloningen-plankje
      c.save();
      c.globalAlpha = 0.95;
      ART.rr(c, 14, 12, 150, 46, 14);
      c.fillStyle = '#fff6d8';
      c.fill();
      ART.pen(c, 3.5);
      c.stroke();
      c.globalAlpha = st.items.hoed ? 1 : 0.22;
      ART.hat(c, 46, 46, 0.55);
      c.globalAlpha = st.items.sleutel ? 1 : 0.22;
      ART.key(c, 90, 34, 0.75);
      c.globalAlpha = st.items.kroon ? 1 : 0.22;
      ART.crown(c, 138, 38, 0.55);
      c.restore();

      UI.button(c, this.btns.snd);
    }
  };

  /* ---------- verhaal-intro (3 plaatjes, tik om verder te gaan) ---------- */
  const intro = {
    page: 0,
    t: 0,
    enter: function () { this.page = 0; this.t = 0; },
    update: function (dt) { this.t += dt; },
    pointerDown: function () {
      SND.click();
      this.page++;
      if (this.page > 2) {
        window.Game.state.seenIntro = true;
        window.Game.save();
        window.Game.go('level1');
      }
    },
    draw: function (c) {
      const t = this.t;
      ART.skyGrad(c, '#bfe8ff', '#e8f7d9');
      ART.ground(c, 470);

      if (this.page === 0) {
        ART.tree(c, 140, 470, 1.1);
        ART.tree(c, 820, 470, 1.1);
        ART.branch(c, 320, 760, 150, true);
        ART.slothHang(c, 520, 150, { t: t, mood: 'blij' });
        ART.thoughtCloud(c, 330, 130, 1.05);
        ART.burger(c, 310, 122, 0.62);
        c.fillStyle = ART.OUT;
        ART.font(c, 15);
        c.textAlign = 'center';
        c.fillText('burger restaurant', 362, 172);
        this.text(c, 'Dit is Sloom, de sloomste luiaard van de jungle.',
          'Hij heeft één grote droom: zijn eigen burger restaurant!');
      } else if (this.page === 1) {
        ART.tree(c, 480, 470, 1.2);
        ART.slothStand(c, 330, 470, { t: t, mood: 'sip' });
        ART.animalHead(c, 'aap', 620, 380, 1.1, 'lach', t);
        ART.animalHead(c, 'toekan', 730, 400, 1, 'lach', t);
        c.save();
        ART.font(c, 22);
        c.fillStyle = ART.OUT;
        c.textAlign = 'center';
        c.fillText('Haha!', 620, 320);
        c.fillText('Een luiaard', 745, 330);
        c.fillText('met een restaurant?!', 762, 356);
        c.restore();
        this.text(c, 'Alle dieren moeten lachen. "Jij bent veel te langzaam!"',
          'Maar Sloom geeft niet op...');
      } else {
        ART.slothStand(c, W / 2, 470, { t: t, mood: 'juich', arms: 'omhoog' });
        ART.coin(c, 380, 300, 18, t * 3);
        ART.coin(c, 580, 280, 18, t * 3 + 1);
        ART.hat(c, 300, 380, 0.8);
        ART.crown(c, 660, 370, 0.8);
        this.text(c, 'Help jij Sloom zijn droom waar te maken?',
          'Verzamel munten, de hoed, de sleutel... en word Burgerkoning!');
      }

      // tekstbord onderaan
      c.save();
      c.fillStyle = '#fffbe8';
      ART.rr(c, 90, H - 118, W - 180, 92, 16);
      c.fill();
      ART.pen(c, 4);
      c.stroke();
      c.fillStyle = ART.OUT;
      ART.font(c, 21);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(this._l1 || '', W / 2, H - 90);
      c.fillText(this._l2 || '', W / 2, H - 60);
      // tik-hint
      c.globalAlpha = 0.6 + Math.sin(t * 4) * 0.4;
      ART.font(c, 16);
      c.fillText('👆 tik om verder te gaan  (' + (this.page + 1) + '/3)', W / 2, H - 14);
      c.restore();
    },
    text: function (c, l1, l2) { this._l1 = l1; this._l2 = l2; }
  };

  window.SCENES.menu = menu;
  window.SCENES.intro = intro;
})();
