# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-05

- Șters tot codul vechi (`main` + branch de lucru), repornit de la zero: scaffold React + TypeScript + Vite curat, plus documentele de continuitate (`CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md` cu regula de rotație de mai sus).
- Modul **măsurători corporale** (`src/features/measurements`): height, greutate, % grăsime, neck/chest/waist/hips, arms/thighs separat stânga-dreapta. Persistat în `localStorage`.
- Modul **poze de progres** (`src/features/progress-photos`): un set de 4 poze/dată (front/back/left/right), comprimate automat la selectare, persistate în `IndexedDB`. Debugging pe telefon: crash de memorie (fixat prin comprimare) și date vechi incompatibile (filtrare/ștergere automată). Adăugat `ErrorBoundary.tsx`.
- Deploy static pe **GitHub Pages**: https://robertoiosifrbt-rgb.github.io/GYM-APP/. Detectare automată de versiune nouă (`useVersionCheck.ts` + `UpdateBanner.tsx`) — rezolvă cache-ul aplicației salvate pe ecranul principal (iOS).
- Pagină **Home** + meniu de navigare, prin state React (fără router). Trecere de design: sistem de culori pe variabile CSS (light/dark), layout de aplicație mobilă (header sticky + bottom tab bar), carduri rotunjite, `viewport-fit=cover` pentru iOS.
- Module **exercises** + **workout-log**: bibliotecă de exerciții goală (nume, category, difficulty, equipment, muscles, instructions) cu seturi configurabile — implicit Reps/Weight/Time/Distance, extensibile de utilizator (`useFieldTypes`). Jurnalul e organizat pe **sesiuni** (`WorkoutSession`, dată + nume opțional), nu exerciții izolate pe zi — `SessionPicker` selectează automat sesiunea de azi sau caută prin filtrare (nu un `<select>` cu toate, nescalabil la sute). Migrare automată a intrărilor vechi în sesiuni reale.
- Exerciții și sesiuni sunt acum **editabile** după creare (nu doar ștergere) — `ExerciseForm` reutilizabil pentru add/edit; editarea unei sesiuni sincronizează data pe intrările ei (`updateEntriesDate`), ca istoricul să rămână corect.
