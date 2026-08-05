# Arhitectură

## Structura de foldere

- `src/app/` — componenta rădăcină (`App.tsx`), navigarea (`Nav.tsx`), pagina Home (`HomePage.tsx`) și un `ErrorBoundary.tsx` care prinde erorile de randare din pagina curentă și le arată pe ecran (în loc de ecran alb/negru gol) — util mai ales pe mobil, unde nu avem acces la consola browser-ului. Navigarea e simplă, prin state React (fără URL/rute) — dacă la un moment dat vom vrea adrese URL separate per pagină, trecem la `react-router-dom`.
- **Detectare versiune nouă** (`useVersionCheck.ts` + `UpdateBanner.tsx`): la build, workflow-ul de deploy scrie SHA-ul commit-ului în `public/version.txt` și îl injectează în bundle ca `__APP_VERSION__` (vezi `vite.config.ts` → `define`, declarat în `src/app/global.d.ts`). Aplicația verifică periodic (la 60s) dacă `version.txt` de pe server diferă de `__APP_VERSION__` din bundle-ul curent și arată un banner "Reload" dacă da. Rezolvă problema aplicațiilor salvate pe ecranul principal (iOS "Add to Home Screen"), care altfel rămân blocate pe o versiune veche din cache la nesfârșit.
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
- `src/features/progress-photos/` — poze de progres: un set de 4 poze per dată (front/back/left/right, toate obligatorii la adăugare). Fiecare poză e redimensionată/comprimată (`resizeImage.ts`, max 1280px, JPEG) imediat la selectare — pozele brute de telefon (12MP+) pot face tab-ul browserului să crape din lipsă de memorie. Persistență în `IndexedDB` (nu `localStorage` — pozele sunt prea mari) prin `db.ts` + hook-ul `usePhotos`. Formular de upload (`PhotoUploadForm`) + galerie grupată pe dată (`PhotoGallery`) combinate în `ProgressPhotosPage`.
- `src/features/workout-log/` — jurnal zilnic de antrenament: o intrare = un exercițiu + o listă de seturi. Fiecare set e text liber (nu greutate/repetări fixe), ca să meargă și pentru exerciții non-standard (plank, cardio etc). La completarea numelui exercițiului (cu autocomplete din exercițiile deja folosite, prin `<datalist>`), formularul arată automat ultimul log salvat pentru acel exercițiu (`getLastEntry` în `useWorkoutLog`), ca reper pentru progres. Persistență în `localStorage`. Istoric grupat pe dată în `WorkoutHistory`.

## Limbă

- Documentele de continuitate (`CLAUDE.md`, `docs/*`) sunt în română.
- Interfața aplicației (tot ce vede utilizatorul: texte, etichete, butoane) e în engleză.
