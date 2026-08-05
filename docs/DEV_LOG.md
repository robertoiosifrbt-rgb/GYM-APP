# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-05

- Șters tot codul vechi (`main` + branch de lucru), repornit de la zero: scaffold React + TypeScript + Vite curat, plus documentele de continuitate (`CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md` cu regula de rotație de mai sus).
- Modul **măsurători corporale**: height, greutate, % grăsime, neck/chest/waist/hips, arms/thighs separat stânga-dreapta. Persistat în `localStorage`.
- Modul **poze de progres**: un set de 4 poze/dată (front/back/left/right), comprimate automat la selectare, persistate în `IndexedDB`.
- Deploy static pe **GitHub Pages**: https://robertoiosifrbt-rgb.github.io/GYM-APP/. Detectare automată de versiune nouă (`useVersionCheck.ts`) — rezolvă cache-ul aplicației salvate pe ecranul principal (iOS). `ErrorBoundary.tsx` ca erorile să apară pe ecran, nu ca gol/negru.
- Module **exercises** (bibliotecă goală, completată de utilizator: nume, category, difficulty, equipment, muscles, instructions, tracks configurabile — extensibile de utilizator) + **workout-log**, organizat pe **sesiuni** (dată + nume opțional), editabile. UI final pentru sesiuni, după câteva iterații (dropdown → chips → simplu): **`SessionCard`** — o listă de carduri, un card per sesiune, apăsat se deschide separat (accordion) cu exercițiile ei, editare și formular de adăugare. Fără `<select>`/chips cu toate sesiunile (nescalabil la sute).
- Design: sistem de culori pe variabile CSS (light/dark), layout de aplicație mobilă (header sticky + bottom tab bar), carduri rotunjite, `viewport-fit=cover` pentru iOS.
- Nav final: **Log e prima pagină** (nu Home placeholder — era funcția cea mai folosită, ascunsă într-un tab). 3 tab-uri: Log, Body (Measurements/Photos cu `SubNav`), Exercises (singur, fără Log alături). Șters `HomePage.tsx`, neutilizat.
