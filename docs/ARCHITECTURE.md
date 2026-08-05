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
- `src/features/exercises/` — biblioteca de exerciții, goală la început, completată de utilizator. Fiecare exercițiu are: nume, category, difficulty (Beginner/Intermediate/Advanced), equipment, primary/secondary muscles, instructions (`ExerciseDetails` în `types.ts`) — toate opționale, afișate compact în listă printr-un `<details>` expandabil. Plus ce urmărește la seturi — implicit `Reps / Weight (kg) / Time (s) / Distance (m)` (`DEFAULT_FIELD_TYPES`), extensibil de utilizator prin butonul "+ Add" din `ExerciseForm`, persistat prin `useFieldTypes`. Combinație liberă per exercițiu — plank are doar Time, un exercițiu de forță are Reps + Weight. `ExerciseForm` e reutilizabil pentru creare **și editare** (`initial` + `submitLabel` + `onSubmit`/`onCancel`) — `ExerciseList` îl randează inline peste un exercițiu existent când apeși "Edit". Persistență în `localStorage` (`useExercises` pentru exerciții — `addExercise`/`updateExercise`/`deleteExercise` —, `useFieldTypes` pentru categoriile disponibile).
- `src/features/workout-log/` — jurnal de antrenament, organizat pe **sesiuni**, nu direct pe exerciții izolate. O sesiune (`WorkoutSession` în `types.ts`, `useWorkoutSessions`) are o dată și un nume opțional (ex: "Push Day"). `SessionPicker` selectează automat sesiunea de azi dacă există; altfel arată direct formularul de creare. Nu folosește un `<select>` cu toate sesiunile (nu scalează la sute) — butonul "Switch" deschide o căutare (filtrare pe dată/nume) care afișează doar rezultatele relevante. Exercițiile se adaugă în sesiunea curentă (`ExerciseEntryForm` — alegi exercițiul din `exercises`, câmpurile de set se adaptează automat la ce urmărește acel exercițiu). La selectarea exercițiului apare automat ultimul log salvat pentru el (`getLastEntry` în `useWorkoutLog`), ca reper de progres. Formatarea seturilor e centralizată în `formatSet.ts`. Persistență în `localStorage` (sesiuni și intrări separat). Istoric grupat pe sesiune în `WorkoutHistory`.

## Limbă

- Documentele de continuitate (`CLAUDE.md`, `docs/*`) sunt în română.
- Interfața aplicației (tot ce vede utilizatorul: texte, etichete, butoane) e în engleză.

## Design

- `src/index.css` conține un mic sistem de design pe variabile CSS (`--color-*`, `--radius-*`, `--shadow-card`), cu variantă light/dark automată (`prefers-color-scheme`). Orice culoare/colț rotunjit nou ar trebui să folosească variabilele existente, nu valori hardcodate.
- Layout de aplicație mobilă: `.app-shell` (header sticky sus + conținut scrollabil + bottom nav fix), definit în `App.tsx`/`Nav.tsx`. Fiecare pagină e un `<section>` la rădăcină — stilat generic ca "card" prin `.app-content > section`, fără să fie nevoie de o clasă separată per pagină.
- `index.html` are `viewport-fit=cover` + `theme-color`, pentru zona sigură (notch) pe iOS.
