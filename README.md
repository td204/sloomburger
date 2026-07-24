# Sloomburger 🦥🍔

Een HTML5-game gebaseerd op een echte kindertekening! Help **Sloom de luiaard** —
de sloomste luiaard van de jungle — zijn grote droom waar te maken: een eigen
**burger restaurant** openen.

Alle figuren komen uit de originele tekening: de hangende luiaard (hoofdpersoon),
de munten, de hoed, de kroon, het ?-mandje en het bord "burger restaurant".

## Het verhaal

Iedereen lacht Sloom uit: *"Een luiaard met een restaurant?! Jij bent veel te
langzaam!"* Maar Sloom geeft niet op. Langzaam maar zeker maakt hij zijn droom
waar — en jij helpt hem!

## De levels

| Level | Waar | Wat doe je | Beloning |
|-------|------|------------|----------|
| 1 | De Jungle | Lopen, springen en aan takken hangen, munten verzamelen | 🎩 de hoed |
| 2 | Naar de stad | Rennen en springen over stenen, ?-mandjes vol verrassingen openen | 🗝️ de sleutel |
| 3 | Het Burger Restaurant | Vang de goede ingrediënten en maak de burgers voor de klanten | 👑 de kroon |

Wie alle klanten blij maakt, wordt gekroond tot **Burgerkoning**!

## Besturing

- **Mobiel/tablet**: grote tik-knoppen op het scherm (◀ ▶ en springen).
  Level 2 is één-knops: tik ergens om te springen (twee keer tikken = extra sprong).
  In level 3 kun je Sloom ook gewoon met je vinger slepen.
- **Computer**: pijltjestoetsen (of A/D) om te lopen, spatie/pijl-omhoog om te springen.
- Er is **geen game-over**: foutjes maken mag, Sloom wordt hooguit even duizelig.

## Spelen

### Meteen lokaal proberen

Open `index.html` in een browser, of start een mini-servertje:

```bash
cd sloomburger
python3 -m http.server 8000
# open dan http://localhost:8000 op je telefoon of computer
```

### Online zetten met GitHub Pages (gratis)

1. Ga op GitHub naar **Settings → Pages** van deze repository.
2. Kies bij "Source" voor **Deploy from a branch**, kies de branch en map `/ (root)`.
3. Na een minuutje staat de game op `https://<gebruikersnaam>.github.io/sloomburger/`.
4. Open die link op een telefoon of tablet — houd het scherm liggend (landscape).
   Via "Zet op beginscherm" wordt het net een echte app.

## Techniek

- Puur HTML5 Canvas + JavaScript, **zonder frameworks en zonder internetverbinding** —
  alle figuren en geluiden worden door code getekend/gemaakt.
- Voortgang (sterren, munten, beloningen) wordt bewaard in de browser.
- Handig voor testen: `?scene=level2` achter de URL springt direct naar een level.

Veel speelplezier! 🎉
