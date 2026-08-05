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
