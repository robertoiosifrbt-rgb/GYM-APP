# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-12 — etapa 2c: reparații pe Body Overview

Patru probleme raportate de proprietar dintr-o singură poză a ecranului.

- **Conținutul intra sub bara de status.** CSS-ul era corect (`env(safe-area-inset-top)` pe `.app-content`), dar valoarea ieșea ~0: `index.html` avea `apple-mobile-web-app-status-bar-style: black-translucent`, care îi spune explicit iOS-ului să deseneze pagina **sub** bara de status. Trecut pe `default`, plus `theme-color` schimbat din coral în fundalul paginii (`#f7f8fb`), ca zona barei să se contopească. Se vedea abia după etapa 1 — până atunci bara „Gym App" umplea spațiul din întâmplare.
- **Silueta arăta ca niște pete lipite pe fundal.** Formele de mușchi se revărsau peste conturul brațelor și șoldurilor. Rezolvat cu un `clipPath` care decupează stratul de mușchi la silueta corpului, plus forme mai mici și mai spre interior. E schimbarea care contează cel mai mult pentru cum se citește desenul.
- **„Arms 39 sets" era umflat.** Cardul Muscle Focus aduna și seturile secundare, iar un bench press trece tricepsul ca secundar — deci fiecare set de piept devenea și un set de brațe, iar brațele ieșeau pe primul loc în orice zi de împins. Focus numără acum **doar seturile primare**; munca secundară rămâne vizibilă pe hartă, în portocaliu.
- **Numărul de seturi cădea pe rândul de sub bară**, din auto-plasarea în grid. Fixat explicit pe rândul numelui.
- **Titlul apărea sub tab-uri**, iar ecranul avea două rânduri de tab-uri suprapuse. `BodyPage` deține acum titlul, care urmează tab-ul activ („Body Overview" / „Body Measurements"), iar copiii nu-și mai pun unul propriu — rămâne un singur `h1` per ecran.
- **Teste**: +2, plus 3 mutații (decuparea scoasă, focus care numără iar secundarele, titlul care nu mai urmează tab-ul) — toate au picat suita. Un test existent a fost reancorat: verifica supraviețuirea la date corupte prin titlul care s-a mutat la părinte.
- Verificat: `lint` ✅, 195 de teste ✅, `build` ✅.
- **Neverificabil de aici**: dacă silueta arată acum a om. Tot pe ecran se vede.

## 2026-08-12 — etapa 2b: Home, o singură foaie de stil

Semnalat de proprietar: Home nu arăta ca în mockup. Cauza s-a dovedit a fi exact tiparul pe care etapa 0 îl lăsase pentru mai târziu.

- **Dalele Quick Actions erau stivuite** (iconiță deasupra etichetei) în loc de rând (iconiță lângă etichetă). Cauza: `index.css` punea `flex-direction: column` pe `.target-quick-grid button`, iar `redesign.css` seta doar `display: flex` — nu și direcția. Coloana supraviețuia. Nimic nu era invalid, doar arăta greșit.
- **Home are acum o singură foaie proprie**, `src/app/HomePage.css`. Am șters **96 de reguli** din `index.css` și `redesign.css` (44 + 52). Fiecare selector al Home-ului are exact o definiție; zero `!important`. Numărătoarea globală de `!important` a scăzut de la 232 la **187**, iar CSS-ul total de la 72 KB la 68 KB.
- **Test nou de proprietate** (`HomePage.styles.test.ts`): fiecare clasă a Home-ului trebuie stilizată **într-un singur fișier**, foaia nu are voie să conțină `!important`, iar dalele trebuie să fie `flex-direction: row`. Verificat cu 3 mutații — o regulă Home readăugată în `index.css`, dalele întoarse pe coloană, un `!important` strecurat înapoi — toate au picat suita. Ăsta e modelul de urmat la fiecare ecran refăcut.
- **Aliniat la mockup**: butonul „Start Workout" are acum triunghiul de play, nu ganterele; inelul, spațierile și înălțimile dalelor urmează valorile din `DESIGN_TARGET.md`.
- **Rămas nerezolvat, de decis**: „Duration 14h 5m" pe Home. Durata e `endedAt − createdAt`, deci e reală — o sesiune deschisă dimineața și încheiată seara. Nu e un calcul greșit, dar nu e nici o durată de antrenament utilă. Variantă: să numărăm până la ultimul set logat, nu până când apeși „finish".
- Verificat: `lint` ✅, 193 de teste ✅, `build` ✅.

## 2026-08-12 — etapa 2: Body Overview cu hartă de mușchi

- **Bug de fond, reparat**: atribuirea mușchilor căuta numele mușchiului **în numele exercițiului** (`entry.exerciseName.includes('chest')`). „Barbell Bench Press" nu contribuia nimic la piept, oricât de atent completai câmpurile Primary/Secondary muscles — care erau pur și simplu ignorate. Acum se citesc din bibliotecă, cu revenire la numele exercițiului doar dacă sunt goale sau exercițiul a fost șters.
- **`muscles.ts`** — taxonomia: 14 mușchi grupați în 6 părți de corp, plus traducerea textului liber în mușchi. Potrivirea e **pe cuvinte întregi**, nu pe subșir: altfel „Hammer curl" ajungea la hamstrings, „Hip abduction" la abs, „Backpack carry" la spate. Frazele („lower back", „upper body") se verifică înaintea cuvintelor izolate. Cuvintele groase se extind — „Legs" → quads + hamstrings + calves.
- **`muscleStats.ts`** — seturi per mușchi într-o perioadă și nivelul de colorare. Cele patru niveluri din legenda mockup-ului au primit un înțeles: `primary` / `secondary` / `untargeted` (biblioteca îl poate antrena, dar n-ai făcut-o în perioada asta) / `notInvolved` (niciun exercițiu din bibliotecă nu-l numește). Distincția dintre ultimele două e cea care face harta utilă: „ai sărit peste" vs „n-ai cu ce".
- **`BodyMap.tsx`** — siluetele față și spate, construite din elipse și dreptunghiuri pe un caroiaj 100×240, oglindite față de axa centrală. Stilizate intenționat, nu anatomice: trebuie să se citească la dimensiune de miniatură pe telefon.
- **Ecranul**: tab-uri Muscles / Body Parts (a doua colorează regiuni întregi cu nivelul celui mai puternic mușchi din ele), legendă cu cele 4 stări, card Muscle Focus cu selector de perioadă (This Week / This Month / All Time) și bare per parte de corp.
- **`startOfWeekLocal` / `startOfMonthLocal`** mutate în `shared/localDate.ts` — calculul lunii era duplicat în `HomePage`.
- **Cum s-a verificat ce nu se poate vedea**: fiecare formă de mușchi poartă `data-muscle` și `data-level`, deci colorarea se testează în jsdom chiar dacă desenul nu. **+33 de teste**, validate cu **7 mutații** — revenirea la căutarea în numele exercițiului, potrivirea pe subșir, confundarea celor două niveluri „liniștite", ignorarea perioadei, frazele care nu mai bat cuvintele, Body Parts care nu mai grupează, ordinea nivelurilor inversată — toate au picat suita.
- **Nu am putut verifica**: dacă silueta *arată* a om. Asta rămâne de confirmat pe ecran.
- Verificat: `lint` ✅, 167 de teste ✅, `build` ✅.

## 2026-08-12 — etapa 1: shell fără header global

- **Scos header-ul global „Gym App"** din `App.tsx`. Niciun ecran din mockup nu are așa ceva — fiecare își poartă propriul titlu. Bara avea și `env(safe-area-inset-top)` propriu, care se aduna cu cel al lui `.app-content`, deci conținutul era împins în jos de două ori.
- **`src/shared/PageHeader.tsx`** — un singur titlu de ecran pentru toate paginile. Înlocuiește `.page-header` (index.css), `.target-settings-header` (settings-target.css) și `.body-overview-header` (BodyOverview.css): trei headere aproape identice, ajunse la trei mărimi diferite — 1.8rem, 1.34rem, 1.28rem. Acum 1.15rem centrat (norma din mockup) și 1.5rem la stânga pentru Exercises și Settings, singurele două ecrane cu titlu mare acolo. Are subtitlu opțional și o acțiune la dreapta (butonul `+` de la Progress Photos).
- **Șters CSS-ul rămas fără stăpân**: `.app-header`, `.app-title` (+ suprascrierea din `@media`), `.page-eyebrow` și `.app-shell.page-home .app-content` — ultimele două erau deja moarte, definite în CSS și nefolosite în niciun `.tsx`.
- **Aici aspectul se schimbă intenționat**, spre deosebire de etapa 0: titluri uniforme și mai mici, subtitluri de la 0.95rem la 0.75rem, tot conținutul urcă pe ecran. Deci plasa de siguranță nu mai e diff-ul de cascadă (aspectul *trebuie* să se schimbe), ci testele. Cascada a fost folosită doar ca să confirme că ștergerile au scos exact regulile moarte — printre ele un `justify-content: space-between` din `index.css` care încă se aplica peste noul header.
- **Teste**: +10 (5 pentru `PageHeader`, 5 pentru shell, inclusiv „un singur `h1` per ecran" — forma în care markup-ul vechi tot aluneca). Verificate cu 4 mutații: header-ul global readus, un ecran fără titlu, subtitlul randat când lipsește, `align` ignorat — toate au picat suita.
- Verificat: `lint` ✅, 134 de teste ✅, `build` ✅.

## 2026-08-12 — etapa 0: fundația CSS

Prima etapă din drumul spre target-ul vizual. Fără nicio schimbare de aspect în light mode — și, important, **dovedită**, nu presupusă.

- **Metoda de verificare**, fiindcă nu ne uităm la poze: se construiește (`npm run build`), se parsează `dist/assets/*.css` cu postcss și se scoate lista ordonată de `(media, selector, proprietate, valoare)` — adică exact declarațiile pe care le aplică browserul. Dacă lista e identică înainte și după, randarea e identică. Baseline: 2536 de declarații, 552 de selectori.
- **Ștearsă pagina duplicată** `features/measurements/BodyPage.tsx` — o a doua copie a ecranului Body, nerandată niciodată. Nu o importa nimeni, dar exportul din `index.ts` o trăgea în bundle, deci foaia ei de stil se încărca și restila pe furiș header-ul real din `features/body-overview`. Cu ea au plecat și `measurements-redesign.css` + `progress-photos-target.css`, care n-aveau niciun importator.
  - Instrumentul a prins imediat efectul secundar: din 183 de declarații schimbate, 4 atingeau clase vii. Două chiar contau (titlul creștea 1.28rem → 1.5rem, containerul pierdea `display:flex`) — mutate în `BodyOverview.css`, ca ecranul să arate identic. Celelalte două (`p`, `>button`) nu se potrivesc cu niciun element din markup-ul viu.
- **`src/styles/tokens.css`** — o singură sursă pentru paletă. Înainte: `index.css` o declara, `target-shell.css` o suprascria integral.
- **Light-only, explicit.** Dark mode-ul era deja anulat pe jumătate: blocul `prefers-color-scheme` din `target-shell.css` redeclara valorile *light*. Rămâneau doar `--color-danger` și cele două umbre în varianta închisă, peste o interfață altfel deschisă. Singura schimbare de aspect din toată etapa e aici, și e intenționată.
- **Cele 6 fișiere minificate pe un rând** (unul avea 7 KB fără niciun `\n`) re-scrise citibil cu un formator postcss: 10 → 3387 de linii, cascadă identică bit cu bit.
- **Ce NU s-a făcut, intenționat**: 232 de `!important` și 36 de selectori dubli. Un `!important` nu poate fi scos în siguranță cât timp regula concurentă există — se scoate odată cu ea, iar regulile concurente sunt straturile per ecran. Deci se curăță în etapele 1–6, per ecran, unde ștergerea e verificabilă. Forțarea acum ar însemna schimbări de aspect nedovedibile.
- Verificat: `lint` ✅, 124 de teste ✅, `build` ✅.
