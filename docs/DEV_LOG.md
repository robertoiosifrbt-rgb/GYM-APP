# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-05

- Șters tot codul vechi (`main` + branch de lucru), repornit de la zero: scaffold React + TypeScript + Vite curat, plus documentele de continuitate (`CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md` cu regula de rotație de mai sus).
- Modul **măsurători corporale** (`src/features/measurements`): height, greutate, % grăsime, neck/chest/waist/hips, arms/thighs separat stânga-dreapta. Persistat în `localStorage`.
- Modul **poze de progres** (`src/features/progress-photos`): un set de 4 poze/dată (front/back/left/right), comprimate automat la selectare (`resizeImage.ts`) și persistate în `IndexedDB`.
- Deploy static pe **GitHub Pages** (workflow în `.github/workflows/deploy.yml`), repo făcut public (necesar pentru Pages gratuit): https://robertoiosifrbt-rgb.github.io/GYM-APP/
- Pagină **Home** (placeholder) + meniu de navigare (`src/app/Nav.tsx`) între Home / Measurements / Photos, prin state React (fără router).
- Debugging poze pe telefon: ecran negru cauzat de (1) memorie — fixat prin comprimare la selectare, și (2) o intrare veche în IndexedDB incompatibilă cu noul format — fixat prin filtrare/ștergere automată în `usePhotos` (`isValidPhotoSet`). Adăugat și `ErrorBoundary.tsx`, ca erorile viitoare să apară pe ecran, nu ca gol/negru.
- Adăugat detectare automată de versiune nouă (`useVersionCheck.ts` + `UpdateBanner.tsx`): rezolvă problema aplicației salvate pe ecranul principal (iOS), care rămânea blocată pe cod vechi din cache — acum arată un banner "Reload" când există un deploy mai nou.
- Modul nou **jurnal de antrenament** (`src/features/workout-log`): loghezi exercițiu + seturi (text liber, nu greutate/repetări fixe — merge și pentru plank/cardio). La completarea numelui exercițiului, formularul arată automat ultimul log salvat pentru acel exercițiu. Persistat în `localStorage`.
- Adăugat modul **exercises** (bibliotecă de exerciții, goală, completată de utilizator) — fiecare exercițiu bifează ce urmărește (Reps/Weight/Time/Distance). Refăcut `workout-log` să folosească exerciții reale (dropdown, nu text liber): formularul de log arată automat câmpurile potrivite exercițiului ales, în loc de un singur input de text pe set.
