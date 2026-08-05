# Arhitectură

## Structura de foldere

- `src/app/` — componenta rădăcină a aplicației (`App.tsx`) și configurația generală (layout, routing, când va fi nevoie).
- `src/features/<nume-modul>/` — câte un folder per funcționalitate (ex: `exercises`, `workouts`, `plans`). Fiecare modul e autonom: propriile componente, tipuri și logică.
- `src/shared/` — cod folosit de mai multe module (componente UI comune, utilitare). Se creează abia când apare o nevoie reală de partajare între module, nu în avans.

## Convenție pentru un modul nou

Când adăugăm o funcționalitate, creăm `src/features/<nume>/` cu, de regulă:

- `<Nume>.tsx` — componenta principală a modulului
- `types.ts` — tipurile de date ale modulului (dacă e cazul)
- alte fișiere pe măsură ce modulul crește (nu creăm structură goală în avans)

## Module existente

_(actualizat pe măsură ce le construim)_

- `src/features/measurements/` — măsurători corporale: greutate, % grăsime, chest/waist/hips (o valoare), și arms/thighs separat pe stânga/dreapta (pentru simetrie). Persistență în `localStorage` prin hook-ul `useMeasurements`. Formular (`MeasurementForm`) + istoric (`MeasurementHistory`) combinate în `MeasurementsPage`.

## Limbă

- Documentele de continuitate (`CLAUDE.md`, `docs/*`) sunt în română.
- Interfața aplicației (tot ce vede utilizatorul: texte, etichete, butoane) e în engleză.
