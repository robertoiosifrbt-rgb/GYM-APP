# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-12 — redesign UI: home, body overview, tabbed interface, consistent headers

UI overhaul complete pentru a moderniza aplicația cu o interfață atractivă, consistentă și funcțional îmbunătățită. Toate testele trec, build-ul e clean.

- **HomePage redesign**: weekly progress ring cu procent workouts (0-5), today's workout card cu exercițiile și durata, quick actions 3-button grid, recent workouts list cu volume și status. Smooth integration cu workout data.
- **BodyPage cu tabs**: container cu tabs pentru Overview și Measurements. Styled seamless cu inherited content, tab underline indicator pe active tab.
- **BodyOverview component**: muscle group visualization cu 11 muscle groups, bar chart per group (width = sets proportion), gradient fills (#FF6B6B → #FFA500), legend cu color coding.
- **Consistent page headers**: all pages (Exercises, Measurements, Progress Photos, Workout Log) now have page-header showing title + count, section headers for form/list grouping. Visual consistency improved.
- **Type updates**: adăugat `endedAt` optional property pe `WorkoutSession` pentru session completion tracking.
- **CSS system**: comprehensive styling pentru cards, progress ring, grids, tabs, headers. CSS variables pentru light/dark theming, responsive mobile layout, proper spacing și visual hierarchy.
- **Tests fixed**: updated 3 tests to match new heading names (Workout Log, Body Measurements).
- **Branch**: `claude/chat-gpt-review-jlmm9c` — complete redesign, ready for review and merge to main.

## 2026-08-05 — stabilizare după audit tehnic

Nicio funcție nouă. Sesiune de reparații pe baza auditului (2 HIGH, 8 MEDIUM, 4 LOW), în ordinea recomandată acolo.

- **Pozele nu se mai pierd** (HIGH 1): `PhotoUploadForm` chiar așteaptă salvarea (`await onAdd`), golește selecția **doar după** confirmare, blochează butonul cât salvează și afișează eroarea. Dacă IndexedDB refuză, pozele rămân selectate și se poate reîncerca fără să le alegi din nou.
- **Publicarea e pusă pe o poartă, nu închisă** (HIGH 2): `deploy.yml` rulează lint + test **înainte** de build, deci un push cu teste picate nu publică nimic; `cancel-in-progress: false`, ca două publicări să nu se anuleze reciproc. Am închis mai întâi publicarea din `claude/**`, cum cerea auditul — dar asta a lăsat aplicația nepublicabilă, pentru că `main` e gol. Decizie de proprietar: se publică din ramura de lucru, cu poarta de verificări. Ramura pe care faci push e ramura live.
- **Persistență apărată** (MEDIUM 1+2): tot `localStorage` trece prin `src/shared/storage.ts` + `usePersistedState`. Citire cu `try/catch` și validare per-intrare; scrierea se face **înainte** de a muta starea React, deci o scriere refuzată nu mai arată ca succes. Valoarea coruptă originală se copiază în `<cheie>:corrupt` și nu se șterge niciodată.
- **Valori imposibile refuzate** (MEDIUM 3): limite per câmp (`MEASUREMENT_BOUNDS`, `SET_VALUE_BOUNDS`), validare în JS pe lângă `min`/`max` din HTML, respinge `NaN`/`Infinity` și tratează câmpul gol ca gol (nu ca 0).
- **Data locală, nu UTC** (MEDIUM 4): `src/shared/localDate.ts`; `toISOString()` punea antrenamentele de după miezul nopții pe ziua precedentă în BST.
- **Restul**: procesare poze per unghi cu `finally` (MEDIUM 5); o singură sursă de adevăr pentru tipurile de câmp, transmise ca props (MEDIUM 6); confirmare la ștergerea unui exercițiu, care spune explicit că istoricul se păstrează (MEDIUM 7); `createdAt` ca departajare pentru intrări din aceeași zi (LOW 2); container cu scroll orizontal la tabelul de măsurători (LOW 4).
- **Teste** (MEDIUM 8): `vitest` + `@testing-library/react`, 99 de teste, `npm test`. Fiecare reparație a fost verificată prin reintroducerea defectului — toate 8 mutații testate au picat suita, deci testele chiar prind regresia, nu doar trec.
- **Nereproductibil**: LOW 3 (favicon). Vite rescrie deja `/favicon.svg` → `/GYM-APP/favicon.svg` în `dist/index.html`, deci nu e 404 pe Pages. `index.html` a rămas neschimbat.
- **Rămas de decis** (LOW 1 / etapa 6): `main` e încă gol. Codul verificat trebuie mutat pe ramura stabilă — decizie de proprietar, nu s-a atins nimic.

## 2026-08-05

- Șters tot codul vechi (`main` + branch de lucru), repornit de la zero: scaffold React + TypeScript + Vite curat, plus documentele de continuitate (`CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DEV_LOG.md` cu regula de rotație de mai sus).
- Modul **măsurători corporale**: height, greutate, % grăsime, neck/chest/waist/hips, arms/thighs separat stânga-dreapta. Persistat în `localStorage`.
- Modul **poze de progres**: un set de 4 poze/dată (front/back/left/right), comprimate automat la selectare, persistate în `IndexedDB`.
- Deploy static pe **GitHub Pages**: https://robertoiosifrbt-rgb.github.io/GYM-APP/. Detectare automată de versiune nouă (`useVersionCheck.ts`) — rezolvă cache-ul aplicației salvate pe ecranul principal (iOS). `ErrorBoundary.tsx` ca erorile să apară pe ecran, nu ca gol/negru.
- Module **exercises** (bibliotecă goală, completată de utilizator: nume, category, difficulty, equipment, muscles, instructions, tracks configurabile — extensibile de utilizator) + **workout-log**, organizat pe **sesiuni** (dată + nume opțional), editabile. UI final pentru sesiuni, după câteva iterații (dropdown → chips → simplu): **`SessionCard`** — o listă de carduri, un card per sesiune, apăsat se deschide separat (accordion) cu exercițiile ei, editare și formular de adăugare. Fără `<select>`/chips cu toate sesiunile (nescalabil la sute).
- Design: sistem de culori pe variabile CSS (light/dark), layout de aplicație mobilă (header sticky + bottom tab bar), carduri rotunjite, `viewport-fit=cover` pentru iOS.
- Log e prima pagină (tab Home, nu placeholder). Corecție: am restructurat și tab-ul Workout fără să fie cerut (mutat Log de acolo, redenumit în Exercises) — revenit la structura corectă: 3 tab-uri Home/Body/Workout, Workout păstrează Log + Exercises cu `SubNav`, ca înainte. Doar Home s-a schimbat.
- Home nu mai duplică tot conținutul Log-ului — e doar un buton "Start workout" (`HomePage.tsx`), care navighează la tab-ul Workout, pe sub-pagina Log.
