# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-05

- Șters tot codul vechi (`main` + branch de lucru), repornit de la zero: scaffold React + TypeScript + Vite curat, plus documentele de continuitate (`CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md` cu regula de rotație de mai sus).
- Modul **măsurători corporale** (`src/features/measurements`): height, greutate, % grăsime, neck/chest/waist/hips, arms/thighs separat stânga-dreapta. Persistat în `localStorage`.
- Modul **poze de progres** (`src/features/progress-photos`): un set de 4 poze/dată (front/back/left/right), comprimate automat la selectare (`resizeImage.ts`) și persistate în `IndexedDB`. Debugging pe telefon: fixat crash de memorie (comprimare) și o intrare veche incompatibilă din IndexedDB (filtrare/ștergere automată, `isValidPhotoSet`). Adăugat `ErrorBoundary.tsx`, ca erorile viitoare să apară pe ecran, nu ca gol/negru.
- Deploy static pe **GitHub Pages** (workflow în `.github/workflows/deploy.yml`), repo făcut public (necesar pentru Pages gratuit): https://robertoiosifrbt-rgb.github.io/GYM-APP/. Adăugat detectare automată de versiune nouă (`useVersionCheck.ts` + `UpdateBanner.tsx`) — rezolvă problema aplicației salvate pe ecranul principal (iOS), care rămânea blocată pe cod vechi din cache.
- Pagină **Home** (placeholder) + meniu de navigare (`src/app/Nav.tsx`), prin state React (fără router).
- Module **exercises** + **workout-log**: bibliotecă de exerciții goală (completată de utilizator), fiecare cu detalii (category, difficulty, equipment, muscles, instructions) și seturi configurabile — implicit Reps/Weight/Time/Distance, extensibile de utilizator cu propriile categorii (`useFieldTypes`, sugestii de category extensibile la fel).
- Trecere de design (fără funcționalități noi): sistem de culori pe variabile CSS cu variantă light/dark, layout de aplicație mobilă (header sticky + bottom tab bar cu iconițe), carduri rotunjite, `viewport-fit=cover` + `theme-color` în `index.html` pentru zona sigură pe iOS.
- Jurnalul de antrenament refăcut pe **sesiuni** (`WorkoutSession`), nu exerciții izolate pe zi: alegi/continui o sesiune (dată + nume opțional), apoi adaugi exerciții în ea; istoricul se grupează pe sesiune. Migrare automată a intrărilor vechi (fără `sessionId`) în sesiuni reale, ca să poată fi continuate.
- `SessionPicker` nu mai e un `<select>` cu toate sesiunile (nescalabil la 100-200) — selectează automat sesiunea de azi dacă există, iar pentru alta se caută prin filtrare pe dată/nume, nu se scrolează o listă întreagă.
