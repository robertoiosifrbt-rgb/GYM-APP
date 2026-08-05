# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-05

- Șters tot codul vechi (din `main` și din branch-ul de lucru) — repornim de la zero.
- Scaffold nou: React + TypeScript + Vite, curățat de conținutul demo (fără logo-uri, contor etc.).
- Reorganizat `src/App.tsx` → `src/app/App.tsx`, ca punct de start pentru convenția de module.
- Adăugat documente de continuitate: `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md`.
- Stabilit regula de rotație de mai sus, ca jurnalul să rămână scurt.
- Construit primul modul: măsurători corporale (`src/features/measurements`) — formular + istoric, persistat în `localStorage`.
- Interfața aplicației e în engleză de acum; documentele de continuitate rămân în română.
- Arms și thighs împărțite pe stânga/dreapta (left/right), pentru a urmări simetria corpului. Formularul și tabelul de istoric au fost rescrise pe bază de config, ca să nu se repete cod la fiecare câmp nou.
- Adăugat deploy static pe GitHub Pages (`.github/workflows/deploy.yml` + `base: '/GYM-APP/'` în `vite.config.ts`), ca aplicația să fie accesibilă de pe telefon printr-un link permanent. Necesită un pas manual unic: în repo, Settings → Pages → Source → "GitHub Actions".
- Repo-ul a fost făcut public (Pages gratuit nu funcționează pe repo privat), iar restricția de branch a environment-ului `github-pages` a fost setată pe "No restrictions". Deploy funcțional: https://robertoiosifrbt-rgb.github.io/GYM-APP/
- Adăugat height și neck la măsurători corporale.
- Construit modul nou: poze de progres (`src/features/progress-photos`) — o poză per dată, stocate în IndexedDB (nu localStorage, prea mic pentru fișiere).
- Adăugat pagina Home (goală, placeholder) și un meniu de navigare (`src/app/Nav.tsx`) între Home / Measurements / Photos. Navigare simplă prin state React, fără router.
