# Arhitectură

## Structura de foldere

- `src/app/` — componenta rădăcină (`App.tsx`), navigarea (`Nav.tsx`) și un `ErrorBoundary.tsx` care prinde erorile de randare din pagina curentă și le arată pe ecran (în loc de ecran alb/negru gol) — util mai ales pe mobil, unde nu avem acces la consola browser-ului. Navigarea e simplă, prin state React (fără URL/rute) — dacă la un moment dat vom vrea adrese URL separate per pagină, trecem la `react-router-dom`. Bottom nav-ul are 3 tab-uri: **Home** (`HomePage.tsx` — doar un buton "Start workout", care navighează la tab-ul Workout, pe sub-pagina Log; nu duplică conținutul), **Body** (Measurements/Photos, cu `SubNav`), **Workout** (Log/Exercises, cu propriul `SubNav`). Gruparea Body/Workout e doar la nivel de `App.tsx` — modulele rămân separate, fiecare cu propriul `<section>` (deci propriul card, per `.app-content > section`).
- **Detectare versiune nouă** (`useVersionCheck.ts` + `UpdateBanner.tsx`): la build, workflow-ul de deploy scrie SHA-ul commit-ului în `public/version.txt` și îl injectează în bundle ca `__APP_VERSION__` (vezi `vite.config.ts` → `define`, declarat în `src/app/global.d.ts`). Aplicația verifică periodic (la 60s) dacă `version.txt` de pe server diferă de `__APP_VERSION__` din bundle-ul curent și arată un banner "Reload" dacă da. Rezolvă problema aplicațiilor salvate pe ecranul principal (iOS "Add to Home Screen"), care altfel rămân blocate pe o versiune veche din cache la nesfârșit.
- `src/features/<nume-modul>/` — câte un folder per funcționalitate (ex: `exercises`, `workouts`, `plans`). Fiecare modul e autonom: propriile componente, tipuri și logică.
- `src/shared/` — cod folosit de mai multe module (componente UI comune, utilitare). Se creează abia când apare o nevoie reală de partajare între module, nu în avans. Conține acum:
  - `storage.ts` — **singurul** loc prin care se citește și se scrie `localStorage`. `readJson` nu lasă un `JSON.parse` să dărâme pagina și validează fiecare intrare printr-o funcție `recover` dată de modul; `writeJson` prinde erorile (quota depășită, storage blocat) și le întoarce ca rezultat, nu ca excepție. Când o valoare stocată nu poate fi folosită ca-i, originalul se copiază în `<cheie>:corrupt` și **nu** se șterge niciodată — o copie existentă nu e suprascrisă de una mai deteriorată.
  - `usePersistedState.ts` — state React ținut în `localStorage`, cu o regulă importantă: **scrie prima, mută starea după**. `update` întoarce `false` dacă scrierea a fost refuzată, ca formularele să-și păstreze valorile în loc să se golească. (Înainte se scria într-un `useEffect` de după `setState`, deci o scriere refuzată arăta ca succes până la următorul reload.)
  - `localDate.ts` — `todayLocal()`, data calendaristică **locală**. `new Date().toISOString().slice(0, 10)` dă ziua UTC, care în BST e ziua precedentă între 00:00 și 00:59 — un antrenament de după miezul nopții ajungea pe ziua greșită.
  - `numbers.ts` — `parseBounded`/`withinBounds`: limite per câmp, refuză `NaN`/`Infinity` și tratează câmpul gol ca gol (`Number('')` e 0). Validarea stă în JS pe lângă `min`/`max` din HTML, pentru că atributele sunt verificate doar de browser la submit și se ocolesc ușor.
  - `validate.ts` — type guards mici (`isRecord`, `isCalendarDate`, …) folosite de funcțiile de recuperare per modul.
  - `StorageNotice.tsx` — mesajul de eroare pentru salvări/citiri eșuate. Nu dispare singur: pe telefon nu există consolă, deci o scriere refuzată trebuie să fie vizibilă.
- `src/test/setup.ts` — pregătirea mediului de test (golește `localStorage` între teste, matchers `jest-dom`, `URL.createObjectURL` care lipsește din jsdom).

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
- `src/features/workout-log/` — jurnal de antrenament, organizat pe **sesiuni**, nu direct pe exerciții izolate. O sesiune (`WorkoutSession` în `types.ts`, `useWorkoutSessions`) are o dată și un nume opțional (ex: "Push Day"). UI: o listă de **`SessionCard`** — un card per sesiune, cu titlu apăsabil; apăsat, se deschide/expandează separat (accordion, un singur card deschis la un moment dat), arătând exercițiile logate, buton "✏️ Edit session" (deschide `SessionForm` inline) și `ExerciseEntryForm` ca să adaugi exerciții noi. Sesiunea de azi se deschide automat dacă există. `WorkoutLogPage` randează lista + un buton "+ New session" care arată `SessionForm` (creare/editare, un singur component reutilizat). Nu există `<select>`/chips cu toate sesiunile (nescalabil la sute) — fiecare sesiune e propriul rând, clic = deschidere separată. Exercițiile se adaugă direct în sesiunea deschisă — la selectarea exercițiului apare automat ultimul log salvat pentru el (`getLastEntry` în `useWorkoutLog`), ca reper de progres. Formatarea seturilor e centralizată în `formatSet.ts`. Editarea unei sesiuni sincronizează data pe toate intrările ei (`updateEntriesDate`). Persistență în `localStorage` (sesiuni și intrări separat).

## Teste

`npm test` (`vitest` + `@testing-library/react`, jsdom). Testele stau lângă codul testat, ca `*.test.ts`/`*.test.tsx`.

Suita e orientată pe **pierderea datelor**, nu pe acoperire: ce se întâmplă când `localStorage` refuză scrierea, când JSON-ul salvat e corupt, când IndexedDB refuză pozele, când data se schimbă la miezul nopții, când două sesiuni cad în aceeași zi. Un test care doar confirmă că un buton randează nu merită întreținut aici.

Suita rulează cu `TZ=Europe/London` (`vitest.config.ts`) — altfel testele de dată locală ar trece din întâmplare.

Un test nou ar trebui să pice dacă reintroduci defectul pe care îl păzește. Cele existente au fost verificate așa, prin reintroducerea celor 8 defecte principale.

## Publicare

- `.github/workflows/deploy.yml` — `main` **și** `claude/**`: rulează `lint` + `test`, apoi `build`, apoi publică pe GitHub Pages. Verificările rulează **înaintea** artefactului, deci un push cu teste picate nu publică absolut nimic. `cancel-in-progress: false`, ca două publicări să nu se anuleze reciproc.
- `.github/workflows/ci.yml` — PR-uri și ramuri care nu publică: aceleași `lint` + `test` + `build`, fără deploy. `main` și `claude/**` sunt excluse aici ca să nu ruleze totul de două ori la fiecare push.

**Decizie de proprietar**, contrar recomandării auditului: auditul cerea ca `claude/**` să nu mai publice (o versiune neterminată putea ajunge live). S-a păstrat publicarea din ramura de lucru — pentru o aplicație de o persoană, să ai nevoie de merge ca să ajungă aplicația pe telefon costă mai mult decât protejează.

Ce înlocuiește protecția: poarta de `lint` + `test` de dinaintea build-ului. Acoperă riscul real — cod stricat care ajunge live. Ce **nu** acoperă: două ramuri împinse aproape simultan publică în ordinea în care termină, deci ramura pe care faci push e ramura live.

## Limbă

- Documentele de continuitate (`CLAUDE.md`, `docs/*`) sunt în română.
- Interfața aplicației (tot ce vede utilizatorul: texte, etichete, butoane) e în engleză.

## Design

- `src/index.css` conține un mic sistem de design pe variabile CSS (`--color-*`, `--radius-*`, `--shadow-card`), cu variantă light/dark automată (`prefers-color-scheme`). Orice culoare/colț rotunjit nou ar trebui să folosească variabilele existente, nu valori hardcodate.
- Layout de aplicație mobilă: `.app-shell` (header sticky sus + conținut scrollabil + bottom nav fix), definit în `App.tsx`/`Nav.tsx`. Fiecare pagină e un `<section>` la rădăcină — stilat generic ca "card" prin `.app-content > section`, fără să fie nevoie de o clasă separată per pagină.
- `index.html` are `viewport-fit=cover` + `theme-color`, pentru zona sigură (notch) pe iOS.
