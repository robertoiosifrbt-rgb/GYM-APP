# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-12 — etapa 0: fundația CSS

Prima etapă din drumul spre target-ul vizual. Fără nicio schimbare de aspect în light mode — și, important, **dovedită**, nu presupusă.

- **Metoda de verificare**, fiindcă nu ne uităm la poze: se construiește (`npm run build`), se parsează `dist/assets/*.css` cu postcss și se scoate lista ordonată de `(media, selector, proprietate, valoare)` — adică exact declarațiile pe care le aplică browserul. Dacă lista e identică înainte și după, randarea e identică. Baseline: 2536 de declarații, 552 de selectori.
- **Ștearsă pagina duplicată** `features/measurements/BodyPage.tsx` — o a doua copie a ecranului Body, nerandată niciodată. Nu o importa nimeni, dar exportul din `index.ts` o trăgea în bundle, deci foaia ei de stil se încărca și restila pe furiș header-ul real din `features/body-overview`. Cu ea au plecat și `measurements-redesign.css` + `progress-photos-target.css`, care n-aveau niciun importator.
  - Instrumentul a prins imediat efectul secundar: din 183 de declarații schimbate, 4 atingeau clase vii. Două chiar contau (titlul creștea 1.28rem → 1.5rem, containerul pierdea `display:flex`) — mutate în `BodyOverview.css`, ca ecranul să arate identic. Celelalte două (`p`, `>button`) nu se potrivesc cu niciun element din markup-ul viu.
- **`src/styles/tokens.css`** — o singură sursă pentru paletă. Înainte: `index.css` o declara, `target-shell.css` o suprascria integral.
- **Light-only, explicit.** Dark mode-ul era deja anulat pe jumătate: blocul `prefers-color-scheme` din `target-shell.css` redeclara valorile *light*. Rămâneau doar `--color-danger` și cele două umbre în varianta închisă, peste o interfață altfel deschisă. Singura schimbare de aspect din toată etapa e aici, și e intenționată.
- **Cele 6 fișiere minificate pe un rând** (unul avea 7 KB fără niciun `\n`) re-scrise citibil cu un formator postcss: 10 → 3387 de linii, cascadă identică bit cu bit.
- **Ce NU s-a făcut, intenționat**: 232 de `!important` și 36 de selectori dubli. Un `!important` nu poate fi scos în siguranță cât timp regula concurentă există — se scoate odată cu ea, iar regulile concurente sunt straturile per ecran. Deci se curăță în etapele 1–6, per ecran, unde ștergerea e verificabilă. Forțarea acum ar însemna schimbări de aspect nedovedibile.
- Verificat: `lint` ✅, 124 de teste ✅, `build` ✅.

## 2026-08-12 — destinația vizuală, documentată + plan pe etape

Fără cod. Sesiune de decizii, ca să nu se mai reconstruiască contextul la fiecare pornire.

- **Întrebare de proprietar**: „rescriem toată aplicația pe module, inspirată din mockup?" **Răspuns: nu.** Măsurat întâi: datoria e în stratul de prezentare, nu în module — 13 fișiere CSS (~78 KB), **289** de `!important`, **41** de selectori definiți în mai multe fișiere, ~10 KB de CSS mort, o pagină duplicată (`features/measurements/BodyPage.tsx`), 7 componente scrise pe rânduri de până la 1168 de caractere. Stratul de date (`src/shared/`, hooks, parsere — 1085 de linii) plus cele 124 de teste sunt partea verificată prin audit; rescrise de la zero, se reintroduc bug-urile deja reparate. Precedent: rescrierea totală din 5 august a produs auditul cu 2 HIGH + 8 MEDIUM.
- **Decizie**: rescriere doar a stratului de prezentare, pe etape, un ecran per sesiune.
- **`docs/DESIGN_TARGET.md`** — document nou, destinația fixă: token-uri de design citite din mockup (culori, raze, spațiere, tipografie, shell) + cele 9 ecrane, fiecare cu ce conține și ce lipsește + 4 întrebări deschise (poze la exerciții, Level/XP, Rest Timer, notificări).
- **`docs/design/target-screens.png`** — mockup-ul salvat în repo ca reper. Regula scrisă explicit: poza e reper de **aspect**, verificarea rămâne în text.
- **`docs/ROADMAP.md`** — planul: Etapa 0 (fundația CSS, fără schimbări funcționale) → shell → Body Overview → Workout Log → Exercises → Body Stats → Settings.
- **`CLAUDE.md`** — trimite acum la `DESIGN_TARGET.md` la începutul fiecărei sesiuni, ca destinația să fie mereu cunoscută.
- **Ramura `claude/ajutor-80fxuy`** ștearsă local; pe GitHub nu s-a putut (proxy-ul de git din mediu respinge push-urile de ștergere), rămasă în seama proprietarului.

## 2026-08-12 — ecran de antrenament activ (`workout-runner`)

Primul pas din target-ul vizual complet (mockup-ul cu 9 ecrane). S-a construit ecranul care lipsea de tot — sesiunea activă — plus două reparații găsite pe drum. `lint`, 120 de teste și `build` trec.

- **Modul nou `src/features/workout-runner/`**: `WorkoutRunnerScreen` (container cu hook-urile) → `ExercisePicker` (alegi exercițiile, ordinea atingerii = ordinea antrenamentului) → `WorkoutRunner` (cronometru, bară „N of M exercises" + procent, tabel de seturi cu bifă per set, − / Add Set / repetă-ultimul-set, „Finish Exercise", card cu exercițiul următor, meniu `···`).
- **Runner-ul ia tot ecranul**: `App.tsx` randează doar runner-ul cât timp e deschis, fără header și fără bottom nav. La ieșire paginile de dedesubt se remontează și recitesc din storage — motivul pentru care runner-ul își ține singur hook-urile în loc de state global (două `usePersistedState` pe aceeași cheie nu se văd în același tab).
- **Model**: `WorkoutSession.plannedExerciseIds?` — coada runner-ului, opțională, cu parsare tolerantă (ids invalide se aruncă și se raportează ca reparație, sesiunea se păstrează).
- **BUG reparat — `endedAt` se pierdea la fiecare reload**: `parseWorkoutSession` nu citea câmpul, deci „finish session" îl scria și următoarea încărcare îl arunca. Efect vizibil: sesiunile terminate reveneau ca „în desfășurare" și durata dispărea din Home.
- **BUG reparat — pagina de poze randată de două ori**: `App.tsx` avea `page === 'progress' && <ProgressPhotosPage />` de două ori.
- **Decizii de comportament**: exercițiu necompletat = „Skip Exercise", nu intrare goală; exercițiu deja logat se redeschide cu seturile lui și se actualizează, nu se duplică; reluarea sare la primul exercițiu nelogat; exercițiile șterse din bibliotecă ies din coadă, dar seturile logate rămân în jurnal.
- **`formatClock` mutat în `src/shared/`**, folosit și de `WorkoutTimer` (era duplicat).
- **Teste**: +18 (14 pentru runner, 4 pentru parser). Verificate prin **7 mutații** — endedAt aruncat, plan cu gunoi acceptat, ordine inversată, duplicat la reeditare, Skip pierdut, reluare de la zero, exercițiu gol salvat — toate au picat suita.
- **Ramură**: construit pe `claude/ajutor-80fxuy`, mutat apoi pe **`dev`** — decizie de proprietar: se revine la fluxul `dev` → `main`. Corectat și `docs/ARCHITECTURE.md`, care descria o regulă de publicare care nu mai era adevărată: `deploy.yml` publică **doar din `main`**, nu și din `claude/**`.

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
