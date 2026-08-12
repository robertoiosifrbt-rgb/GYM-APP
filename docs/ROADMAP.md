# Roadmap

## Fundație

- [x] Scaffold proiect (React + TypeScript + Vite)
- [x] Structură de documentație și jurnal pentru continuitate între sesiuni
- [x] Convenție de module (`src/features/<nume>`)

## Stabilizare (audit tehnic, 2026-08-05) + Redesign UI

Reparații și redesign. Etapele 1–5 din audit sunt gata și verificate (`npm run lint`, `npm test`, `npm run build` trec). Redesign UI aplicat pe ramura `claude/chat-gpt-review-jlmm9c`.

- [x] Salvarea pozelor e așteptată; selecția rămâne dacă IndexedDB refuză
- [x] Deploy gated: `lint` + `test` rulează înaintea build-ului, deci un push cu teste picate nu publică nimic
- [x] Citire/scriere `localStorage` protejată și validată; copie de siguranță pentru date corupte
- [x] Limite pentru valorile numerice (fără negative, `NaN`, `Infinity`)
- [x] Data implicită în fusul local, nu UTC
- [x] `createdAt` pentru ordonarea intrărilor din aceeași zi
- [x] O singură sursă pentru tipurile de câmp personalizate
- [x] Confirmare la ștergerea unui exercițiu (istoricul se păstrează)
- [x] Tabelul de măsurători derulează orizontal pe telefon
- [x] Suită de teste (`npm test`), obligatorie înainte de deploy
- [x] **Redesign Home**: weekly progress ring, today's workout, quick actions, recent workouts
- [x] **Body page tabs**: Overview (muscle groups) și Measurements
- [x] **Muscle visualization**: bar chart cu workout volume per muscle group
- [x] **Ecran de antrenament activ** (`workout-runner`): cronometru, progres pe exerciții, tabel de seturi cu bifă
- [x] **Ramura stabilă**: fluxul `dev` → `main` e în funcțiune; `main` e ramura live, publicată de `deploy.yml`

## Drumul până la target-ul vizual

Destinația e în `docs/DESIGN_TARGET.md` (+ mockup-ul în `docs/design/target-screens.png`).
Planul de mai jos e drumul până acolo, **o etapă per sesiune de lucru**.

Regula pentru fiecare etapă: nu se trece la următoarea până când `npm run lint`,
`npm test` și `npm run build` nu trec, iar etapa e promovată `dev` → `main`.

- [x] **Etapa 0 — fundația CSS** (fără nicio schimbare de aspect în light mode)
  - [x] `src/styles/tokens.css` — singura sursă pentru culori, raze, umbre, spațiere
  - [x] ștearsă pagina duplicată `features/measurements/BodyPage.tsx` + cele 3 foi de stil moarte
  - [x] cele 6 fișiere minificate pe un rând re-scrise citibil (10 → 3387 de linii)
  - [x] aplicația e explicit **light-only** — dark mode-ul era deja anulat pe jumătate
  - **Restul s-a mutat în etapele 1–6, intenționat** (vezi mai jos): 232 de `!important` și 36 de selectori definiți în mai multe fișiere (187 și, respectiv, mai puțini după etapele 1–2b).

  *De ce restul nu s-a făcut acum:* un `!important` nu poate fi scos în siguranță
  cât timp regula concurentă încă există — se scoate odată cu ea. Iar regulile
  concurente sunt exact straturile per ecran, care dispar când ecranul e refăcut.
  Deci `!important`-urile și selectorii dubli se curăță **per ecran**, în etapele
  de mai jos, unde ștergerea e verificabilă. A le forța acum ar însemna schimbări
  de aspect pe care nu le pot dovedi.
- [x] **Etapa 1 — shell**: scos header-ul global „Gym App" (nu există în niciun ecran din mockup) și
  `src/shared/PageHeader.tsx` ca titlu unic pentru toate ecranele — înlocuiește trei headere
  aproape identice care ajunseseră la trei mărimi de titlu diferite (1.8rem / 1.34rem / 1.28rem).
  Bara veche avea și `env(safe-area-inset-top)` propriu, care se aduna cu cel al conținutului.
- [x] **Etapa 2 — Body Overview**: siluetă față/spate cu mușchii colorați pe 4 niveluri, tab-uri
  Muscles/Body Parts, selector de perioadă (This Week / This Month / All Time), card Muscle Focus.
  Atribuirea mușchilor citește acum câmpurile **Primary/Secondary muscles** din bibliotecă —
  înainte căuta numele mușchiului în numele exercițiului, deci „Barbell Bench Press" nu contribuia
  nimic la piept.
- [x] **Etapa 2b — Home**: dalele Quick Actions erau stivuite (iconiță deasupra etichetei) pentru că
  `index.css` punea `flex-direction: column`, iar `redesign.css` seta doar `display: flex`. Home are
  acum o singură foaie proprie, `src/app/HomePage.css` — 96 de reguli șterse din fișierele comune,
  zero `!important`, plus un test care blochează revenirea la două surse.
- [x] **Etapa 3 — Workout Log**: calendar lunar cu zilele de antrenament marcate. Lista urmează
  luna de pe ecran (altfel calendarul și lista arătau lucruri diferite), iar apăsarea unei zile
  restrânge la ea. Se deschide pe luna ultimului antrenament, nu pe cea curentă.
- [ ] **Etapa 4 — Exercises**: căutare, thumbnail-uri, favorite, FAB
- [ ] **Etapa 5 — Body Stats**: tab-uri Measurements/Composition/History + „Key Measurements" cu delta față de măsurătoarea anterioară
- [ ] **Etapa 6 — Settings**: avatar, Units, Import Data (Level/XP și Rest Timer depind de deciziile din `DESIGN_TARGET.md` → „Întrebări deschise")

La fiecare etapă, pe lângă ecranul în sine:

- se șterg regulile vechi care îl vizau din `index.css` / `*-target.css` /
  `redesign.css`, iar `!important`-urile rămase fără concurent dispar odată cu
  ele — fiecare etapă scade numărătoarea (232 la început, 187 acum);
- se rescrie componenta atinsă ca să fie lizibilă (7 componente sunt încă scrise
  pe rânduri de până la 1168 de caractere).

Stratul de date (`src/shared/`, hooks, `types.ts`, parsere) și testele **nu** se
rescriu: sunt partea verificată prin audit și prin teste de mutație.

## Funcționalități

- [x] Măsurători corporale (greutate, % grăsime, circumferințe) + istoric
- [x] Poze de progres (set de 4 unghiuri pe dată, galerie)
- [x] Lista de exerciții (biblioteca, câmpuri configurabile per exercițiu)
- [x] Jurnal de antrenament pe sesiuni (nume + dată, exerciții multiple per sesiune, ultimul log per exercițiu)
- [ ] Planuri de antrenament

_(lista se completează pe măsură ce decidem împreună următorii pași)_
