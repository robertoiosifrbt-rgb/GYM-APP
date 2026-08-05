# Arhitectură

## Structura de foldere

- `src/app/` — componenta rădăcină (`App.tsx`), navigarea (`Nav.tsx`) și pagina Home (`HomePage.tsx`). Navigarea e simplă, prin state React (fără URL/rute) — dacă la un moment dat vom vrea adrese URL separate per pagină, trecem la `react-router-dom`.
- `src/features/<nume-modul>/` — câte un folder per funcționalitate (ex: `exercises`, `workouts`, `plans`). Fiecare modul e autonom: propriile componente, tipuri și logică.
- `src/shared/` — cod folosit de mai multe module (componente UI comune, utilitare). Se creează abia când apare o nevoie reală de partajare între module, nu în avans.

## Convenție pentru un modul nou

Când adăugăm o funcționalitate, creăm `src/features/<nume>/` cu, de regulă:

- `<Nume>.tsx` — componenta principală a modulului
- `types.ts` — tipurile de date ale modulului (dacă e cazul)
- alte fișiere pe măsură ce modulul crește (nu creăm structură goală în avans)

## Module existente

_(actualizat pe măsură ce le construim)_

- `src/features/measurements/` — măsurători corporale: height, greutate, % grăsime, neck/chest/waist/hips (o valoare), și arms/thighs separat pe stânga/dreapta (pentru simetrie). Persistență în `localStorage` prin hook-ul `useMeasurements`. Formular (`MeasurementForm`) + istoric (`MeasurementHistory`) combinate în `MeasurementsPage`.
- `src/features/progress-photos/` — poze de progres, o poză per dată. Persistență în `IndexedDB` (nu `localStorage` — pozele sunt prea mari) prin `db.ts` + hook-ul `usePhotos`. Formular de upload (`PhotoUploadForm`) + galerie (`PhotoGallery`) combinate în `ProgressPhotosPage`.

## Limbă

- Documentele de continuitate (`CLAUDE.md`, `docs/*`) sunt în română.
- Interfața aplicației (tot ce vede utilizatorul: texte, etichete, butoane) e în engleză.
