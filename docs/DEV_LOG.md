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
- Module **exercises** + **workout-log**: bibliotecă de exerciții goală (completată de utilizator), fiecare cu detalii (category, difficulty, equipment, muscles, instructions) și seturi configurabile — implicit Reps/Weight/Time/Distance, extensibile de utilizator cu propriile categorii (`useFieldTypes`). Jurnalul zilnic alege exercițiul dintr-un dropdown și adaptează automat câmpurile formularului la ce urmărește acel exercițiu, plus arată ultimul log salvat ca reper de progres.
- Category la exerciții: sugestiile din datalist nu mai sunt fixe — orice categorie nouă scrisă la un exercițiu devine automat sugestie pentru viitor (combinată cu `DEFAULT_CATEGORIES`).
- Trecere de design (fără funcționalități noi): sistem de culori pe variabile CSS cu variantă light/dark, layout de aplicație mobilă (header sticky + bottom tab bar cu iconițe, în loc de nav orizontal sus), carduri rotunjite pentru fiecare pagină, `viewport-fit=cover` + `theme-color` în `index.html` pentru zona sigură pe iOS.
- Jurnalul de antrenament a fost refăcut pe **sesiuni** (`WorkoutSession`), nu doar exerciții izolate pe zi: alegi/continui o sesiune (dată + nume opțional) din `SessionPicker`, apoi adaugi exerciții în ea. Istoricul se grupează pe sesiune, nu pe dată brută.
- Bug: intrările vechi (de dinainte de sesiuni) nu au `sessionId`, iar gruparea nouă le arunca pe toate într-un singur grup, cu data greșită. Fix: intrările fără `sessionId` se grupează după propria dată (`legacy:<date>`), ca înainte.
