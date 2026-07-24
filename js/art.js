/* Sloomburger — alle figuren uit de tekening, getekend met canvas-code
   Stijl: dikke bruine outlines, vrolijke kleuren, een beetje wiebelig zoals een kindertekening */
window.ART = (function () {
  const W = 960, H = 540;
  const OUT = '#54402c';        // outline-kleur (warm donkerbruin, potlood-achtig)
  const FONT = '"Chalkboard SE","Comic Sans MS","Segoe Print",sans-serif';

  function pen(ctx, w, c) {
    ctx.lineWidth = w || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = c || OUT;
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function font(ctx, size, weight) {
    ctx.font = (weight || 700) + ' ' + size + 'px ' + FONT;
  }

  /* ---------- kleine props ---------- */

  // Munt: rondje met een streepje erin, precies zoals op de tekening
  function coin(ctx, x, y, r, spin) {
    r = r || 16;
    const sx = spin === undefined ? 1 : Math.abs(Math.cos(spin));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.max(0.15, sx), 1);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd94d';
    ctx.fill();
    pen(ctx, 3.5, '#b8811b');
    ctx.stroke();
    pen(ctx, 3.5, '#e0a92c');
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.45);
    ctx.lineTo(0, r * 0.45);
    ctx.stroke();
    ctx.restore();
  }

  // Hoge hoed ("hoed" op de tekening)
  function hat(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    // rand
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3d3b49';
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    // bol
    rr(ctx, -20, -40, 40, 42, 5);
    ctx.fillStyle = '#4a4757';
    ctx.fill();
    ctx.stroke();
    // band
    ctx.fillStyle = '#e2554f';
    ctx.fillRect(-20, -12, 40, 8);
    pen(ctx, 2.5);
    ctx.strokeRect(-20, -12, 40, 8);
    ctx.restore();
  }

  // Kroon ("kroon" op de tekening: klein kroontje met bolletjes)
  function crown(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-26, 10);
    ctx.lineTo(-30, -16);
    ctx.lineTo(-14, -2);
    ctx.lineTo(0, -22);
    ctx.lineTo(14, -2);
    ctx.lineTo(30, -16);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fillStyle = '#f6c445';
    ctx.fill();
    pen(ctx, 3.5, '#b8811b');
    ctx.stroke();
    // bolletjes zoals in de tekening
    ctx.fillStyle = '#e2554f';
    [-13, 0, 13].forEach(function (bx) {
      ctx.beginPath();
      ctx.arc(bx, 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Mandje met vraagteken (het verrassingsmandje van de tekening)
  function basket(ctx, x, y, s, open, t) {
    s = s || 1;
    t = t || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const wob = open ? 0 : Math.sin(t * 3) * 0.05;
    ctx.rotate(wob);
    // hengsel
    pen(ctx, 5, '#7a5230');
    ctx.beginPath();
    ctx.arc(0, -18, 26, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    // mand met vlechtwerk
    ctx.beginPath();
    ctx.moveTo(-30, -14);
    ctx.lineTo(30, -14);
    ctx.lineTo(22, 22);
    ctx.quadraticCurveTo(0, 28, -22, 22);
    ctx.closePath();
    ctx.fillStyle = '#c98d4b';
    ctx.fill();
    pen(ctx, 4, '#7a5230');
    ctx.stroke();
    pen(ctx, 2, '#8f6134');
    ctx.beginPath();
    ctx.moveTo(-27, 0); ctx.lineTo(27, 0);
    ctx.moveTo(-24, 12); ctx.lineTo(24, 12);
    ctx.moveTo(-15, -14); ctx.lineTo(-8, 24);
    ctx.moveTo(0, -14); ctx.lineTo(0, 26);
    ctx.moveTo(15, -14); ctx.lineTo(8, 24);
    ctx.stroke();
    // vraagteken-kaartje
    if (!open) {
      ctx.fillStyle = '#fffbe8';
      ctx.beginPath();
      ctx.arc(0, -22, 14, 0, Math.PI * 2);
      ctx.fill();
      pen(ctx, 3, '#7a5230');
      ctx.stroke();
      ctx.fillStyle = '#e2554f';
      font(ctx, 20);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, -21);
    }
    ctx.restore();
  }

  // Houten bord met wiebelige rand (zoals "burger restaurant" op de tekening)
  function sign(ctx, x, y, w, h, text, size, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.03);
    rr(ctx, -w / 2, -h / 2, w, h, 14);
    ctx.fillStyle = fill || '#fff6d8';
    ctx.fill();
    pen(ctx, 5);
    ctx.stroke();
    ctx.fillStyle = OUT;
    font(ctx, size || 28);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 2);
    ctx.restore();
  }

  // Denkwolkje (de droom van Sloom!)
  function thoughtCloud(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    const R = 46;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const bx = Math.cos(a) * R * 1.35;
      const by = Math.sin(a) * R * 0.85;
      ctx.moveTo(bx, by);
      ctx.arc(bx, by, 20, 0, Math.PI * 2);
    }
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.5, R, 0, 0, Math.PI * 2);
    ctx.fill();
    pen(ctx, 3.5);
    // bolletjes eronder
    ctx.beginPath(); ctx.arc(30, R + 22, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(44, R + 40, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // Sleutel van het restaurant
  function key(ctx, x, y, s, rot) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(s, s);
    pen(ctx, 6, '#b8811b');
    ctx.beginPath();
    ctx.arc(-18, 0, 12, 0, Math.PI * 2);
    ctx.moveTo(-6, 0);
    ctx.lineTo(28, 0);
    ctx.moveTo(18, 0); ctx.lineTo(18, 10);
    ctx.moveTo(26, 0); ctx.lineTo(26, 12);
    ctx.stroke();
    pen(ctx, 3, '#f6c445');
    ctx.beginPath();
    ctx.arc(-18, 0, 12, 0, Math.PI * 2);
    ctx.moveTo(-6, 0);
    ctx.lineTo(28, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Ster (voor de beloningen)
  function star(ctx, x, y, r, filled) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.45;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = filled ? '#ffd94d' : '#d9cdb2';
    ctx.fill();
    pen(ctx, 3, filled ? '#b8811b' : '#a89b7d');
    ctx.stroke();
    ctx.restore();
  }

  // Slotje voor levels die nog dicht zijn
  function lock(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    pen(ctx, 5, '#6b6455');
    ctx.beginPath();
    ctx.arc(0, -8, 10, Math.PI, 0);
    ctx.stroke();
    rr(ctx, -14, -8, 28, 22, 5);
    ctx.fillStyle = '#8c8574';
    ctx.fill();
    pen(ctx, 3, '#6b6455');
    ctx.stroke();
    ctx.fillStyle = '#5d5749';
    ctx.beginPath();
    ctx.arc(0, 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ---------- burger-ingrediënten ---------- */

  function ingredient(ctx, type, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    pen(ctx, 3.5);
    if (type === 'bodem') {
      ctx.beginPath();
      ctx.moveTo(-30, -6);
      ctx.quadraticCurveTo(0, 4, 30, -6);
      ctx.lineTo(28, 4);
      ctx.quadraticCurveTo(0, 12, -28, 4);
      ctx.closePath();
      ctx.fillStyle = '#f0b25e';
      ctx.fill(); ctx.stroke();
    } else if (type === 'burger') {
      rr(ctx, -30, -9, 60, 18, 9);
      ctx.fillStyle = '#8a5430';
      ctx.fill(); ctx.stroke();
    } else if (type === 'kaas') {
      ctx.beginPath();
      ctx.moveTo(-32, -6);
      ctx.lineTo(32, -6);
      ctx.lineTo(24, 8);
      ctx.lineTo(10, 2);
      ctx.lineTo(-6, 9);
      ctx.lineTo(-20, 3);
      ctx.closePath();
      ctx.fillStyle = '#ffcf3f';
      ctx.fill(); ctx.stroke();
    } else if (type === 'sla') {
      ctx.beginPath();
      ctx.moveTo(-32, 2);
      for (let i = -32; i <= 32; i += 8) {
        ctx.quadraticCurveTo(i + 4, i % 16 === 0 ? -10 : 10, i + 8, 0);
      }
      ctx.quadraticCurveTo(0, 12, -32, 2);
      ctx.fillStyle = '#7fc94a';
      ctx.fill(); ctx.stroke();
    } else if (type === 'tomaat') {
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e2554f';
      ctx.fill(); ctx.stroke();
      pen(ctx, 2, '#b03e39');
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'top') {
      ctx.beginPath();
      ctx.moveTo(-30, 6);
      ctx.quadraticCurveTo(-30, -18, 0, -18);
      ctx.quadraticCurveTo(30, -18, 30, 6);
      ctx.closePath();
      ctx.fillStyle = '#f0b25e';
      ctx.fill(); ctx.stroke();
      // sesamzaadjes
      ctx.fillStyle = '#fff3d6';
      [[-14, -6], [0, -10], [14, -6], [-6, -1], [8, -2]].forEach(function (p) {
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], 2.5, 1.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  // Complete kleine burger (voor menu/versiering)
  function burger(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ingredient(ctx, 'bodem', 0, 16, 1);
    ingredient(ctx, 'burger', 0, 8, 1);
    ingredient(ctx, 'kaas', 0, 0, 1);
    ingredient(ctx, 'sla', 0, -6, 1);
    ingredient(ctx, 'top', 0, -14, 1);
    ctx.restore();
  }

  /* ---------- de hoofdpersoon: Sloom de luiaard ---------- */

  // Gezichtje: licht snoetje, donkere vlekken om de ogen, glimlach — net als de tekening
  function slothFace(ctx, mood, t) {
    mood = mood || 'blij';
    // snoet
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 21, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f0e3c3';
    ctx.fill();
    pen(ctx, 3);
    ctx.stroke();
    // oogvlekken
    ctx.fillStyle = '#8a6a44';
    [-1, 1].forEach(function (side) {
      ctx.save();
      ctx.translate(side * 11, -4);
      ctx.rotate(side * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // ogen
    if (mood === 'slaap') {
      pen(ctx, 2.5, '#241c12');
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.arc(side * 11, -4, 4, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      });
    } else if (mood === 'duizelig') {
      pen(ctx, 2, '#241c12');
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        const a0 = (t || 0) * 6;
        ctx.arc(side * 11, -4, 4.5, a0, a0 + Math.PI * 1.6);
        ctx.stroke();
      });
    } else {
      ctx.fillStyle = '#241c12';
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.arc(side * 11, -4, 4.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#ffffff';
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.arc(side * 11 + 1.4, -5.4, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // neusje
    ctx.fillStyle = '#3a2c1c';
    ctx.beginPath();
    ctx.ellipse(0, 4, 3.6, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // mond
    pen(ctx, 2.5, '#3a2c1c');
    ctx.beginPath();
    if (mood === 'wow' || mood === 'juich') {
      ctx.ellipse(0, 11, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8c4a3c';
      ctx.fill();
      ctx.stroke();
    } else if (mood === 'sip') {
      ctx.arc(0, 15, 6, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.arc(0, 8, 7, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  }

  function claw(ctx, x, y, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    pen(ctx, 2.5, '#3a2c1c');
    ctx.beginPath();
    for (let i = -1; i <= 1; i++) {
      ctx.moveTo(i * 4, 0);
      ctx.lineTo(i * 4 + i, 8);
    }
    ctx.stroke();
    ctx.restore();
  }

  // vachtstreepjes
  function fur(ctx, cx, cy, rx, ry, n) {
    pen(ctx, 2, '#8a6a44');
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.15 + (0.7 * i) / (n - 1));
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7);
    }
    ctx.stroke();
  }

  /* Sloom, hangend aan een tak (x, y = punt op de tak).
     o: {t, mood, hat: 'hoed'|'kroon'|null, flip} */
  function slothHang(ctx, x, y, o) {
    o = o || {};
    const t = o.t || 0;
    ctx.save();
    ctx.translate(x, y);
    if (o.flip) ctx.scale(-1, 1);
    ctx.rotate(Math.sin(t * 1.3) * 0.04);

    const BODY = '#bd9d6f';
    // armen omhoog naar de tak
    pen(ctx, 13, BODY);
    ctx.beginPath();
    ctx.moveTo(-18, 2); ctx.lineTo(-30, 46);
    ctx.moveTo(46, 2); ctx.lineTo(52, 44);
    ctx.stroke();
    pen(ctx, 8, '#d5b485');
    ctx.beginPath();
    ctx.moveTo(-18, 4); ctx.lineTo(-29, 42);
    ctx.moveTo(46, 4); ctx.lineTo(51, 40);
    ctx.stroke();
    // klauwtjes om de tak
    claw(ctx, -18, -4, Math.PI);
    claw(ctx, 46, -4, Math.PI);

    // lijf (hangt onder de tak)
    ctx.beginPath();
    ctx.ellipse(12, 62, 58, 32, 0.06, 0, Math.PI * 2);
    ctx.fillStyle = BODY;
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    fur(ctx, 12, 62, 56, 30, 8);

    // achterpootje dat lui bungelt
    pen(ctx, 11, BODY);
    ctx.beginPath();
    ctx.moveTo(58, 74);
    ctx.quadraticCurveTo(64, 92 + Math.sin(t * 2) * 3, 56, 100 + Math.sin(t * 2) * 4);
    ctx.stroke();
    claw(ctx, 55, 102 + Math.sin(t * 2) * 4, 0.2);

    // kop vooraan
    ctx.beginPath();
    ctx.arc(-34, 58, 30, 0, Math.PI * 2);
    ctx.fillStyle = BODY;
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    ctx.save();
    ctx.translate(-34, 58);
    if (o.flip) { ctx.scale(-1, 1); }
    slothFace(ctx, o.mood, t);
    ctx.restore();

    // eventueel hoofddeksel (ondersteboven hangend zit hij ónder het hoofd... nee: gewoon er bovenop)
    if (o.hat === 'hoed') hat(ctx, -34, 28, 0.75);
    if (o.hat === 'kroon') crown(ctx, -34, 26, 0.7);
    ctx.restore();
  }

  /* Sloom rechtop (x, y = voeten op de grond).
     o: {t, mood, hat, flip, walk (0..n loopfase), arms:'omhoog'|'vast'|null, item} */
  function slothStand(ctx, x, y, o) {
    o = o || {};
    const t = o.t || 0;
    const wk = o.walk || 0;
    ctx.save();
    ctx.translate(x, y);
    if (o.flip) ctx.scale(-1, 1);

    const BODY = '#bd9d6f';
    const legSwing = Math.sin(wk * 10) * (o.walk ? 8 : 0);

    // beentjes
    pen(ctx, 12, BODY);
    ctx.beginPath();
    ctx.moveTo(-13, -38); ctx.lineTo(-14 + legSwing * 0.6, -6);
    ctx.moveTo(13, -38); ctx.lineTo(14 - legSwing * 0.6, -6);
    ctx.stroke();
    claw(ctx, -14 + legSwing * 0.6, -8, 0);
    claw(ctx, 14 - legSwing * 0.6, -8, 0);

    // lijf
    ctx.beginPath();
    ctx.ellipse(0, -62, 34, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = BODY;
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    fur(ctx, 0, -58, 32, 36, 7);
    // buikje
    ctx.beginPath();
    ctx.ellipse(0, -56, 20, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d5b485';
    ctx.fill();

    // armen
    const bob = Math.sin(t * 2) * 2;
    if (o.arms === 'omhoog') {
      pen(ctx, 11, BODY);
      ctx.beginPath();
      ctx.moveTo(-24, -80); ctx.lineTo(-40, -116 - bob);
      ctx.moveTo(24, -80); ctx.lineTo(40, -116 - bob);
      ctx.stroke();
      claw(ctx, -40, -124 - bob, Math.PI);
      claw(ctx, 40, -124 - bob, Math.PI);
    } else if (o.arms === 'bord') {
      // houdt een bordje hoog boven zijn hoofd (voor het restaurant)
      pen(ctx, 11, BODY);
      ctx.beginPath();
      ctx.moveTo(-24, -80); ctx.lineTo(-44, -178);
      ctx.moveTo(24, -80); ctx.lineTo(44, -178);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -190, 50, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#eef1f4';
      ctx.fill();
      pen(ctx, 3);
      ctx.stroke();
    } else {
      pen(ctx, 11, BODY);
      ctx.beginPath();
      ctx.moveTo(-24, -76); ctx.lineTo(-30 - legSwing * 0.4, -44);
      ctx.moveTo(24, -76); ctx.lineTo(30 + legSwing * 0.4, -44);
      ctx.stroke();
      claw(ctx, -30 - legSwing * 0.4, -46, 0);
      claw(ctx, 30 + legSwing * 0.4, -46, 0);
    }

    // kop
    const headY = -112 + Math.sin(t * 2) * 2;
    ctx.beginPath();
    ctx.arc(0, headY, 30, 0, Math.PI * 2);
    ctx.fillStyle = BODY;
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    ctx.save();
    ctx.translate(0, headY);
    slothFace(ctx, o.mood, t);
    ctx.restore();

    if (o.hat === 'hoed') hat(ctx, 0, headY - 24, 0.8);
    if (o.hat === 'kroon') crown(ctx, 0, headY - 30, 0.75);
    if (o.hat === 'hoedkroon') { hat(ctx, 0, headY - 24, 0.8); crown(ctx, 0, headY - 62, 0.6); }
    ctx.restore();
  }

  /* ---------- dieren (de klanten en vriendjes) ---------- */

  function animalHead(ctx, type, x, y, s, mood, t) {
    s = s || 1;
    t = t || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    pen(ctx, 3.5);
    if (type === 'aap') {
      ctx.fillStyle = '#9b7247';
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.arc(side * 24, -2, 10, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 5, 16, 13, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e8cfa6';
      ctx.fill();
    } else if (type === 'toekan') {
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#3d3b49';
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-3, 9, 11, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fffbe8';
      ctx.fill();
      // snavel
      ctx.beginPath();
      ctx.moveTo(12, -4);
      ctx.quadraticCurveTo(46, -8, 44, 4);
      ctx.quadraticCurveTo(30, 12, 12, 8);
      ctx.closePath();
      ctx.fillStyle = '#ffa22e';
      ctx.fill(); ctx.stroke();
    } else if (type === 'kikker') {
      ctx.fillStyle = '#7fc94a';
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.arc(side * 13, -18, 9, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      });
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    // ogen + mond
    const eyeY = type === 'kikker' ? -18 : -6;
    const eyeDX = type === 'kikker' ? 13 : 9;
    ctx.fillStyle = '#241c12';
    [-1, 1].forEach(function (side) {
      ctx.beginPath();
      ctx.arc(side * eyeDX, eyeY, 3.4, 0, Math.PI * 2);
      ctx.fill();
    });
    pen(ctx, 2.5, '#241c12');
    ctx.beginPath();
    if (mood === 'wacht') {
      ctx.moveTo(-6, 10); ctx.lineTo(6, 10);
    } else if (mood === 'lach') {
      ctx.ellipse(0, 9, 5, 6, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 6, 7, 0.2 * Math.PI, 0.8 * Math.PI);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- decor ---------- */

  function skyGrad(ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function sun(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe38a';
    ctx.fill();
    pen(ctx, 3, '#f2bd3a');
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.moveTo(x + Math.cos(a) * 42, y + Math.sin(a) * 42);
      ctx.lineTo(x + Math.cos(a) * 52, y + Math.sin(a) * 52);
    }
    ctx.stroke();
  }

  function cloudPuff(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(-24, 0, 16, 0, Math.PI * 2);
    ctx.arc(0, -8, 20, 0, Math.PI * 2);
    ctx.arc(24, 0, 15, 0, Math.PI * 2);
    ctx.arc(0, 5, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.fill();
    ctx.restore();
  }

  function tree(ctx, x, groundY, s, shade) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(s, s);
    ctx.fillStyle = shade ? '#8a6a44' : '#9b7247';
    rr(ctx, -12, -130, 24, 132, 8);
    ctx.fill();
    if (!shade) { pen(ctx, 3); ctx.stroke(); }
    const leaf = shade ? '#5ba172' : '#67b57e';
    ctx.fillStyle = leaf;
    ctx.beginPath();
    ctx.arc(-30, -150, 34, 0, Math.PI * 2);
    ctx.arc(30, -150, 34, 0, Math.PI * 2);
    ctx.arc(0, -178, 40, 0, Math.PI * 2);
    ctx.arc(0, -136, 36, 0, Math.PI * 2);
    ctx.fill();
    if (!shade) {
      ctx.fillStyle = '#7fc94a';
      ctx.beginPath();
      ctx.arc(-18, -168, 16, 0, Math.PI * 2);
      ctx.arc(12, -186, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function bush(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(-20, 0, 16, Math.PI, 0);
    ctx.arc(0, -8, 20, Math.PI, 0);
    ctx.arc(20, 0, 16, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = '#67b57e';
    ctx.fill();
    pen(ctx, 3, '#3f7a54');
    ctx.stroke();
    ctx.restore();
  }

  // Tak om aan te hangen
  function branch(ctx, x1, x2, y, withLeaves) {
    pen(ctx, 12, '#7a5230');
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo((x1 + x2) / 2, y + 6, x2, y);
    ctx.stroke();
    pen(ctx, 5, '#9b7247');
    ctx.beginPath();
    ctx.moveTo(x1 + 4, y - 1);
    ctx.quadraticCurveTo((x1 + x2) / 2, y + 4, x2 - 4, y - 1);
    ctx.stroke();
    if (withLeaves) {
      ctx.fillStyle = '#67b57e';
      for (let lx = x1 + 20; lx < x2 - 10; lx += 55) {
        ctx.beginPath();
        ctx.ellipse(lx, y - 10, 12, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Platform-tak (om op te staan)
  function platform(ctx, x, y, w) {
    ctx.fillStyle = '#9b7247';
    rr(ctx, x, y, w, 16, 8);
    ctx.fill();
    pen(ctx, 3.5);
    ctx.stroke();
    ctx.fillStyle = '#67b57e';
    for (let lx = x + 14; lx < x + w - 10; lx += 46) {
      ctx.beginPath();
      ctx.ellipse(lx, y - 4, 11, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ground(ctx, y, color, edge) {
    ctx.fillStyle = color || '#7fc94a';
    ctx.fillRect(0, y, W, H - y);
    pen(ctx, 4, edge || '#3f7a54');
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Het restaurant-gebouwtje met het bord uit de tekening
  function restaurant(ctx, x, groundY, s, open) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(s, s);
    // gebouw
    rr(ctx, -110, -150, 220, 150, 10);
    ctx.fillStyle = '#ffd9a0';
    ctx.fill();
    pen(ctx, 4);
    ctx.stroke();
    // dak
    ctx.beginPath();
    ctx.moveTo(-126, -150);
    ctx.lineTo(0, -205);
    ctx.lineTo(126, -150);
    ctx.closePath();
    ctx.fillStyle = '#e2554f';
    ctx.fill();
    ctx.stroke();
    // deur
    rr(ctx, -30, -80, 60, 80, 8);
    ctx.fillStyle = open ? '#fff3d6' : '#9b7247';
    ctx.fill();
    ctx.stroke();
    if (!open) {
      ctx.fillStyle = '#f6c445';
      ctx.beginPath();
      ctx.arc(16, -40, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // raampjes
    [-70, 70].forEach(function (wx) {
      ctx.beginPath();
      ctx.arc(wx, -100, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#bfe8ff';
      ctx.fill();
      pen(ctx, 3.5);
      ctx.stroke();
    });
    // het bord: "burger restaurant"
    sign(ctx, 0, -172, 190, 42, 'burger restaurant', 21);
    ctx.restore();
  }

  // Steen/rots (obstakel)
  function rock(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.quadraticCurveTo(-24, -26, -4, -30);
    ctx.quadraticCurveTo(20, -32, 26, -10);
    ctx.quadraticCurveTo(30, 0, 26, 0);
    ctx.closePath();
    ctx.fillStyle = '#a9a294';
    ctx.fill();
    pen(ctx, 3.5, '#6b6455');
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.lineTo(-2, -12);
    ctx.stroke();
    ctx.restore();
  }

  // Modderplas (obstakel dat je slooom maakt)
  function puddle(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8a6a44';
    ctx.fill();
    pen(ctx, 2.5, '#5e4527');
    ctx.stroke();
    ctx.fillStyle = '#a3835b';
    ctx.beginPath();
    ctx.ellipse(-8, -1, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Groen blaadje (power-up: supersnel!)
  function leaf(ctx, x, y, s, rot) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || -0.5);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(16, -8, 0, 16);
    ctx.quadraticCurveTo(-16, -8, 0, -16);
    ctx.fillStyle = '#7fc94a';
    ctx.fill();
    pen(ctx, 3, '#3f7a54');
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.restore();
  }

  // Schildbelletje (power-up)
  function bubble(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(140,200,255,.25)';
    ctx.fill();
    pen(ctx, 3, 'rgba(90,160,230,.8)');
    ctx.stroke();
    pen(ctx, 2.5, 'rgba(255,255,255,.8)');
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.3, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  }

  return {
    W: W, H: H, OUT: OUT, FONT: FONT,
    pen: pen, rr: rr, font: font,
    coin: coin, hat: hat, crown: crown, basket: basket, sign: sign,
    thoughtCloud: thoughtCloud, key: key, star: star, lock: lock,
    ingredient: ingredient, burger: burger,
    slothHang: slothHang, slothStand: slothStand, animalHead: animalHead,
    skyGrad: skyGrad, sun: sun, cloudPuff: cloudPuff, tree: tree, bush: bush,
    branch: branch, platform: platform, ground: ground, restaurant: restaurant,
    rock: rock, puddle: puddle, leaf: leaf, bubble: bubble
  };
})();
