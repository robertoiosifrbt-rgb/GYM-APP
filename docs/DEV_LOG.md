# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.
## 2026-08-12 — reparații pe cinci ecrane, raportate de proprietar

Cauza comună a aproape tuturor: **CSS valid care nu se aplica**. Nimic nu arunca
erori, build-ul trecea, testele treceau — regulile pur și simplu nu existau.
De-asta niciunul nu fusese prins până acum.

- **Un comentariu nedeschis corect în `redesign.css`** înghițea **16 reguli**,
  de la linia 3 până la primul marcaj de închidere, la linia 96. Printre ele
  `.danger-action` — de aceea butonul „Delete" de pe cardurile de exercițiu era
  negru, nu roșu. Am păstrat cele patru reguli folosite (`.empty-state`,
  `.danger-action`, `.form-actions`) și am șters restul, în loc să le reactivez:
  bara de jos e descrisă complet în `target-shell.css`, iar reactivarea ar fi
  crescut-o de la 51px la 58px — o schimbare de aspect pe care n-a cerut-o nimeni.
- **Două containere care nu sunt randate nicăieri** — `.target-exercise-library`
  și `.target-workout-log` — sub care erau scrise 14 reguli. Toate moarte. De
  aceea pill-urile de Tracks se citeau „RepsWeight (kg)": nu erau pastile, erau
  `<span>`-uri inline fără nicio regulă. Regulile sunt acum pe clasele lor.
- **Două token-uri care nu există**: `--radius-full` (chips-urile de categorie
  ieșeau pătrate) și `--color-surface-secondary` (chips-urile inactive rămâneau
  fără fundal; token-ul real e `--color-surface-alt`). Un `var()` nedefinit nu e
  eroare de CSS — declarația e ignorată în tăcere.
- **`.exercise-form-section-heading` n-avea nicio regulă.** `<span>` și `<small>`
  sunt amândouă inline, deci se citea „BasicsName and classification".
- **Formularul de editare din Workout Log ieșea 26px lățime.**
  `.target-logged-exercise` e un grid `28px | 1fr | auto` pentru rândul citit
  (număr | nume | butoane). La Edit, cardul are un singur copil — formularul —
  care cădea în coloana de 28px. Acum ține tot rândul.
- **Câmpurile ieșeau din card pe iOS, dar nu în Chromium.** Un flex item are
  implicit `min-width: auto`, deci nu se micșorează sub lățimea minimă a
  conținutului; `input[type=date]` și `input[type=file]` au pe iOS o lățime
  intrinsecă mult mai mare. `min-width: 0` pe `.field`, plafon `max-width: 100%`
  pe controale. **Nu se poate reproduce de aici** — fixul e argumentat, nu văzut.
- **Chips-urile de categorie stăteau lângă titlu**, într-un antet
  `justify-content: space-between`: „Your Exercises" se strângea pe două rânduri
  într-o coloană îngustă. Acum sunt pe rândul lor.
- **Data brută `2026-07-15` din galeria de poze** → `15 July 2026`. `dayLabel`
  s-a mutat din `workout-log/calendarMonth.ts` în `shared/localDate.ts`, ca
  galeria să nu importe din alt modul de funcționalitate. `PhotoGallery.tsx`
  rescris lizibil (era pe un rând), cum cere regula pentru orice componentă atinsă.

**Cum s-a verificat ce nu se vede de aici.** Am condus aplicația într-un browser
headless la 430×932 (dimensiunea din capturi), cu date realiste, și am măsurat
geometria ca **text**: ce iese din ecran, ce se suprapune, ce control e strivit.
Așa s-a confirmat `select`-ul de 26px înainte și 350px după, pill-urile ca
`display:inline radius:0` înainte și `radius:999px` cu fundal după, „Delete" la
`rgb(220,67,56)` față de `rgb(23,27,37)` la „Edit". Instrumentul a stat în afara
proiectului — n-a intrat nicio dependență nouă în `package.json`.

**Teste**: +22 în `src/styles/screenRepairs.test.ts`, plus reancorarea unui test
existent care verifica data brută. Două dintre gărzi sunt generale, nu punctuale:
una cere ca fiecare `var()` fără fallback să aibă token-ul definit, alta ca niciun
selector descendent să nu pornească de la o clasă nerandată — **a doua a găsit
singură `.target-workout-log`, pe care nu-l reparasem.** Validate cu **7 mutații**
(token șters, reguli rescopate sub containerul mort, antetul revenit inline,
formularul întors în coloana de 28px, comentariu lăsat neînchis, `min-width`
scos, token fantomă reintrodus) — toate au picat suita.

- Verificat: `lint` ✅, **254 de teste** ✅, `build` ✅.
- **Nerezolvat, de decis de proprietar**: „Workout duration 14:04:57". Durata e
  `endedAt − createdAt`, deci e reală — o sesiune deschisă dimineața și încheiată
  seara. Nu e un calcul greșit, dar nu e nici o durată de antrenament utilă. E
  aceeași întrebare rămasă deschisă de la etapa 2b.
- **Nu e bug**: „Add photos" apare palid pentru că e `disabled` până alegi toate
  cele patru poze.

## 2026-08-12 — etapa 3: calendar în Workout Log

- **`calendarMonth.ts`** — logica pură a grilei, deci complet testabilă. O lună e un șir `YYYY-MM`, o zi `YYYY-MM-DD`: aceeași formă în care sunt salvate sesiunile, deci potrivirea e egalitate de șiruri, fără `Date` și fără fus orar la mijloc. Săptămâna începe **luni** (`getDay()` numără de duminică — e off-by-one-ul clasic al calendarelor scrise de mână, acoperit de test: o lună care începe duminica are nevoie de șase zile de umplutură în față, nu de zero). Grila are doar câte săptămâni atinge luna, nu șase fixe.
- **`WorkoutCalendar.tsx`** — zilele antrenate pline cu accent, azi cu inel, ziua selectată închisă. Zilele din lunile vecine sunt afișate dar **nu se pot apăsa**: ar muta luna de sub deget.
- **Lista urmează calendarul.** Altfel cele două ar arăta lucruri diferite. Apăsarea unei zile restrânge la ea, reapăsarea revine la lună.
- **Două comportamente descoperite prin teste, nu prin gândire**: pagina se deschidea pe luna curentă, deci o sesiune veche nu se vedea deloc (acum se deschide pe luna ultimului antrenament); iar dacă schimbai data unei sesiuni în altă lună, ea dispărea în clipa salvării (acum vederea o urmează). Primul a fost semnalat de un test existent care a picat.
- **Etichete de zi citibile** (`15 July 2026`, nu `2026-07-15`): mai bune pentru cititorul de ecran și, în plus, nu se mai ciocnesc cu datele brute de pe cardurile de sesiune.
- **Teste**: +24 (14 pentru logica de grilă, 10 pentru pagină), validate cu **7 mutații** — săptămâna pornită duminica, grila fixată la 6 săptămâni, zilele lucrate nemarcate, lista care nu mai urmează luna, deschiderea forțată pe luna curentă, sesiunea mutată neurmărită, zilele din afara lunii devenite apăsabile — toate au picat suita.
- **CSS**: `workout-log.css` lângă modul, fără `!important`. Calendarul randat local ca să-i verific așezarea.
- Verificat: `lint` ✅, 227 de teste ✅, `build` ✅.

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
