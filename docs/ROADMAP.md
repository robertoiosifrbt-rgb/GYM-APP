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
- [ ] **Etapa 6 — ramura stabilă**: review și merge în `main` când e gata

## Drumul până la target-ul vizual

Destinația e în `docs/DESIGN_TARGET.md` (+ mockup-ul în `docs/design/target-screens.png`).
Planul de mai jos e drumul până acolo, **o etapă per sesiune de lucru**.

Regula pentru fiecare etapă: nu se trece la următoarea până când `npm run lint`,
`npm test` și `npm run build` nu trec, iar etapa e promovată `dev` → `main`.

- [ ] **Etapa 0 — fundația CSS** (fără nicio schimbare de funcționalitate)
  - un singur fișier de token-uri, cu valorile din `DESIGN_TARGET.md`
  - desființate cele 13 fișiere CSS actuale (~78 KB, 289 `!important`, 41 de selectori definiți în mai multe fișiere)
  - șters CSS-ul mort (`measurements-redesign.css`, `progress-photos-target.css`) și pagina duplicată `features/measurements/BodyPage.tsx`
  - CSS colocat per modul, ca la `workout-runner`
  - *De ce prima:* bug-uri ca inelul de progres (două implementări care se băteau) vin din stratul ăsta și vor tot reapărea până nu e curățat.
- [ ] **Etapa 1 — shell**: scos header-ul global „Gym App" (nu există în mockup), titluri per ecran
- [ ] **Etapa 2 — Body Overview**: siluetă anatomică față/spate cu mușchii colorați, tab-uri Muscles/Body Parts, selector de perioadă
- [ ] **Etapa 3 — Workout Log**: calendar lunar cu zilele de antrenament marcate
- [ ] **Etapa 4 — Exercises**: căutare, thumbnail-uri, favorite, FAB
- [ ] **Etapa 5 — Body Stats**: tab-uri Measurements/Composition/History + „Key Measurements" cu delta față de măsurătoarea anterioară
- [ ] **Etapa 6 — Settings**: avatar, Units, Import Data (Level/XP și Rest Timer depind de deciziile din `DESIGN_TARGET.md` → „Întrebări deschise")

La fiecare etapă se rescrie și componenta atinsă ca să fie lizibilă — 7 componente
sunt încă scrise pe rânduri de până la 1168 de caractere. Stratul de date
(`src/shared/`, hooks, `types.ts`, parsere) și testele **nu** se rescriu: sunt
partea verificată prin audit și prin teste de mutație.

## Funcționalități

- [x] Măsurători corporale (greutate, % grăsime, circumferințe) + istoric
- [x] Poze de progres (set de 4 unghiuri pe dată, galerie)
- [x] Lista de exerciții (biblioteca, câmpuri configurabile per exercițiu)
- [x] Jurnal de antrenament pe sesiuni (nume + dată, exerciții multiple per sesiune, ultimul log per exercițiu)
- [ ] Planuri de antrenament

_(lista se completează pe măsură ce decidem împreună următorii pași)_
