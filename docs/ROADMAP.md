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

## Restul target-ului vizual

Ecranele din mockup care încă nu arată ca acolo, în ordinea impactului:

- [ ] **Body Overview**: silueta anatomică față/spate cu mușchii colorați, tabs Muscles/Body Parts, selector de perioadă („This Week")
- [ ] **Workout Log**: calendar lunar sus, cu zilele de antrenament marcate
- [ ] **Exercises**: bară de căutare, thumbnail-uri, favorite (steluță), buton rotund „+"
- [ ] **Body Stats**: tabs Measurements/Composition/History + card „Key Measurements" cu delta față de măsurătoarea anterioară
- [ ] **Settings**: avatar, Level + bară XP, Units / Workout Reminders / Rest Timer / Default Rest Time, Import Data

## Funcționalități

- [x] Măsurători corporale (greutate, % grăsime, circumferințe) + istoric
- [x] Poze de progres (set de 4 unghiuri pe dată, galerie)
- [x] Lista de exerciții (biblioteca, câmpuri configurabile per exercițiu)
- [x] Jurnal de antrenament pe sesiuni (nume + dată, exerciții multiple per sesiune, ultimul log per exercițiu)
- [ ] Planuri de antrenament

_(lista se completează pe măsură ce decidem împreună următorii pași)_
