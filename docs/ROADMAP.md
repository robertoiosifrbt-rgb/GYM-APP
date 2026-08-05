# Roadmap

## Fundație

- [x] Scaffold proiect (React + TypeScript + Vite)
- [x] Structură de documentație și jurnal pentru continuitate între sesiuni
- [x] Convenție de module (`src/features/<nume>`)

## Stabilizare (audit tehnic, 2026-08-05)

Reparații, nu funcții noi. Etapele 1–5 din audit sunt gata și verificate (`npm run lint`, `npm test`, `npm run build` trec).

- [x] Salvarea pozelor e așteptată; selecția rămâne dacă IndexedDB refuză
- [x] Deploy live numai din `main`; ramurile `claude/**` doar CI (lint + test + build)
- [x] Citire/scriere `localStorage` protejată și validată; copie de siguranță pentru date corupte
- [x] Limite pentru valorile numerice (fără negative, `NaN`, `Infinity`)
- [x] Data implicită în fusul local, nu UTC
- [x] `createdAt` pentru ordonarea intrărilor din aceeași zi
- [x] O singură sursă pentru tipurile de câmp personalizate
- [x] Confirmare la ștergerea unui exercițiu (istoricul se păstrează)
- [x] Tabelul de măsurători derulează orizontal pe telefon
- [x] Suită de teste (`npm test`), obligatorie înainte de deploy
- [ ] **Etapa 6 — ramura stabilă**: `main` e gol. De mutat codul verificat pe el și de păstrat ramurile `claude/**` doar ca lucru temporar (decizie de proprietar)

## Funcționalități

- [x] Măsurători corporale (greutate, % grăsime, circumferințe) + istoric
- [x] Poze de progres (set de 4 unghiuri pe dată, galerie)
- [x] Lista de exerciții (biblioteca, câmpuri configurabile per exercițiu)
- [x] Jurnal de antrenament pe sesiuni (nume + dată, exerciții multiple per sesiune, ultimul log per exercițiu)
- [ ] Planuri de antrenament

_(lista se completează pe măsură ce decidem împreună următorii pași)_
