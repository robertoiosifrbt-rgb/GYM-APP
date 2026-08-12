# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-12 — etapa 6: Settings. Unitățile sunt reale, importul există.

Ultimul dintre cele 9 ecrane. Rândurile care doar arătau a setări au devenit
setări; ce nu se poate face fără o decizie a proprietarului a rămas afară, nu
prefăcut.

### Units: metric / imperial, prin toată aplicația

- **Ce se salvează nu se schimbă niciodată.** În `localStorage` greutatea rămâne
  în kg și circumferința în cm, oricare ar fi setarea; conversia trăiește la
  marginea ecranului — la afișare și la citirea din formular. Altfel o apăsare
  pe „Imperial" ar trebui să rescrie tot istoricul, iar rotunjirea făcută acolo
  s-ar aduna la fiecare comutare.
- **Context, nu un hook per ecran** (`shared/UnitsProvider.tsx`). Cu
  `usePersistedState` chemat în fiecare ecran, fiecare ar fi avut copia lui:
  apeși „Imperial" în Settings, treci la Body și tot kg scrie, pentru că
  evenimentul `storage` al browserului se trimite doar **între file**. Testul
  care traversează ecranele (`App.test.tsx`) e acolo exact pentru asta.
- **Limitele afișate se strâng, nu se lărgesc.** `1 kg` convertit în afară ar fi
  `2.2 lb`, iar `2.2 lb` scris înapoi e `0.998 kg` — sub minim. Formularul ar fi
  acceptat valoarea, iar `parseMeasurement` ar fi aruncat măsurătoarea la
  următoarea citire: dispărea după reîncărcare. Minimul urcă, maximul coboară.
- **Ce nu se convertește**: track-ul „Weight (kg)" din antrenamente. E o coloană
  definită de utilizator, cu eticheta și unitatea alese de el — aplicația nu i-o
  poate rescrie. Volumul calculat din ea, în schimb, se convertește peste tot
  (Home, Workout Log), fiindcă acolo unitatea o punem noi.
- Două liste de câmpuri au devenit una: formularul și tabelul de istoric aveau
  fiecare copia lor, cu unitatea lipită în etichetă („Neck (cm)") — ar fi rămas
  în centimetri pentru totdeauna.

### Import Data

- **Doi pași, cu o confirmare la mijloc**: întâi citește fișierul și spune ce e
  în el, abia apoi scrie. Importul **înlocuiește**, nu adaugă — scris pe ecran
  înainte de apăsare, nu după.
- Fișierul trece prin **aceleași** funcții de parsare ca datele din storage: ce
  n-ar fi acceptat la citire nu intră nici pe ușa asta, iar câte intrări au fost
  refuzate se spune înainte de scriere.
- **Ori toate secțiunile, ori niciuna.** `localStorage` n-are tranzacții și o
  scriere poate fi refuzată la mijloc (memoria plină, cazul real pe telefon).
  Fără revenire, ar fi rămas exercițiile din fișierul nou lângă antrenamentele
  vechi — o bază de date pe care n-a avut-o nimeni. Revenirea e ea însăși
  best-effort, în `try`: dacă tocmai o scriere refuzată ne-a adus acolo, poate
  fi refuzată și repunerea, iar o excepție aruncată de acolo ar ieși din import
  exact când datele sunt la jumătate.
- Un JSON care nu conține **niciuna** din secțiunile cunoscute e refuzat. Altfel
  importul unui fișier străin ar fi „reușit" scriind liste goale peste tot.

### Profil

Numele și avatarul erau scrise în cod. Acum se editează, iar salutul de pe Home
citește același nume — fără el, îți schimbai numele în Settings și Home tot
„Hey Roberto" spunea. Poza se redimensionează la 192px înainte de salvare:
avatarul stă în `localStorage`, unde tot spațiul e câteva megabyte pentru toată
aplicația. Un avatar care nu e `data:` URL e ignorat la citire — un `http://…`
pus de altcineva ar fi o cerere către un server străin la fiecare deschidere.

### Rânduri care nu mai mint

- **„Appearance — System default" a dispărut.** Aplicația e light-only din etapa
  0, deci rândul spunea ceva neadevărat și nu ducea nicăieri.
- **Chevronul promite un ecran.** „Storage", „Progress photos" și „GYM APP" nu
  au unul, deci l-au pierdut. Un test blochează revenirea: orice chevron de pe
  ecran trebuie să fie într-un buton.
- Singurul „Soon" rămas e Workout Reminders — chiar nu e construit (întrebarea
  deschisă 4). Level/XP și Rest Timer nu apar deloc: sunt decizii, nu muncă.

### Curățenie

- `settings-target.css` a plecat din `main.tsx` în `features/settings/
  settings.css`, al treilea ecran cu foaie proprie după Home și Exercises.
  Regulile moarte din `index.css` și `redesign.css` au dispărut cu tot cu cele
  6 `!important` ale lor; pe ecran au rămas 3, toate resetând stilul general de
  buton, și un test le numără.
- `.visually-hidden` s-a mutat din `BodyOverview.css` în `index.css`: de când o
  folosesc două module, e unealtă comună.
- Verificat: `lint` ✅, 419 de teste ✅ (+46), `build` ✅.

## 2026-08-12 — etapa 5: Body Stats, plus rândul de sesiune. Design-ul e închis.

Cu asta, opt din nouă ecrane din `DESIGN_TARGET.md` sunt făcute. Al nouălea
(Settings) e cât se poate face fără deciziile proprietarului.

### Rândul de sesiune din Workout Log

Arăta `2026-08-12 | Legs | 6 exercises` — deci nimic despre cât de greu a fost
antrenamentul. Acum poartă tot ce cere mockup-ul: data scrisă („12 August
2026"), `6 exercises · 1h 10m`, volumul (`7,661 kg`), și o bară colorată la
stânga pe sesiunea deschisă.

- `sessionVolume` și `sessionDurationSeconds` erau în `HomePage.tsx`, unde le
  folosea lista „Recent Workouts". S-au mutat în `features/workout-log/
  sessionStats.ts`, lângă datele pe care le citesc. A doua copie ar fi însemnat
  două definiții ale „volumului", care se pot despărți pe tăcute.
- **Bara e un pseudo-element, nu un `border-left`**: un chenar ar fi mutat
  conținutul cu 4px la fiecare deschidere, iar cardul ar fi tresărit sub deget.
- **Efect secundar de accesibilitate, semnalat de un test care a picat**: de
  când rândul scrie „15 July 2026", eticheta lui se potrivește cu a zilei din
  calendar. Testul îl caută acum după numele sesiunii.

### Body Stats

- **Patru tab-uri pe un rând, nu două rânduri imbricate.** Ecranele 3 și 7 din
  target trăiesc amândouă sub tab-ul Body. Cele trei tab-uri ale lui Body Stats
  s-au alăturat lui „Overview": imbricate, drumul s-ar fi citit
  „Body › Measurements › Measurements".
- **Cardul „Key Measurements"**: ultima măsurătoare, cu diferența față de cea
  dinainte. Asta e miezul — în tabelul de istoric diferența trebuia calculată în
  cap, uitându-te de la un rând la altul.
- **Delta nu e colorată în verde**, deși mockup-ul o arată așa. Săgeata arată
  direcția, nu dă un verdict: la talie scăderea e de obicei ținta, la braț
  creșterea. Verde pe tot ar spune că orice schimbare e progres; verde-sus /
  roșu-jos ar face dintr-un centimetru pierdut în talie un eșec. **De răsturnat
  dacă proprietarul vrea altfel** — e o alegere, nu o limitare.
- **Rotunjire simetrică**, găsită de un test pe care îl scrisesem greșit:
  `Math.round` rotunjește jumătățile mereu spre plus infinit, deci `+1.25` →
  `+1.3` dar `−1.25` → `−1.2`. Aceeași schimbare, de mărime egală, afișată
  diferit după cum ai crescut sau ai scăzut. Se rotunjește acum mărimea, apoi se
  pune semnul înapoi.
- **Fără delte inventate**: prima măsurătoare scrie „first", nu „0"; un câmp
  lăsat gol data trecută n-are față de ce, deci apare fără deltă. Un câmp
  necompletat acum nu apare deloc — un rând cu „—" ocupă loc și nu spune nimic.
- **Ordonare după dată, nu după ordinea din storage**: se poate adăuga o
  măsurătoare veche, uitată, iar „ultima" trebuie să rămână cea mai recentă din
  calendar.
- **Formularul a trecut în spatele butonului „+ Add Measurements".** Are
  unsprezece câmpuri și era primul lucru pe ecran, deci cifrele pe care veneai
  să le citești începeau sub un formular pe care nu-l completai.

- **Teste**: +49 (14 pure pentru delte și ordonare, 7 pe cardul de sumar, 5 pe
  rândul de sesiune, restul adaptate la noua structură), validate cu **7
  mutații** — ordonare crescătoare, delta 0 la prima măsurătoare, rotunjire
  asimetrică, formularul care nu se mai închide, un câmp scos din listă, rândul
  fără volum, rândul revenit la data brută — toate au picat suita.
- Verificat: `lint` ✅, **360 de teste** ✅, `build` ✅. Măsurat în browser la
  430px: patru tab-uri pe un rând (102px fiecare), cardul cu „1 August 2026" și
  rândurile `Waist 86cm ▼−2cm`, `Weight 77.1kg ▼−1.1kg`, `Height 181cm no
  change`; zero derulare orizontală.

## 2026-08-12 — durata nu se putea modifica, iar selectorul de Tracks era rupt

Două probleme raportate din capturi. A doua e o regresie a mea din tura de
reparații de mai devreme.

### „Nu mă lasă să modific timpul" — două defecte suprapuse

- **Formatul cerut era imposibil de tastat.** Câmpul cerea `HH:MM:SS` și avea
  `inputMode="numeric"` — iar keypad-ul numeric al iOS-ului **nu are două
  puncte**. Nu era o validare prea strictă, era o validare pe care n-aveai cum
  s-o treci pe singurul dispozitiv pe care rulează aplicația. Acum separatoarele
  le pune câmpul, în timp ce tastezi: cifrele se grupează de la dreapta
  (`011023` → `01:10:23`), ca la introducerea unei ore pe bancomat. Sub câmp
  scrie ce s-a înțeles, în cuvinte — „1h 10m 23s" nu se poate citi greșit cum se
  poate `01:10:23`.
- **Sub asta, pagina arunca valoarea.** `onUpdateSession={(date, name) => …}`
  ignora al treilea argument, deci chiar și o durată scrisă corect nu ajungea
  nicăieri. `updateSession` din hook știa de mult s-o aplice. **Dacă reparam
  doar tastatura, ar fi ieșit un câmp care acceptă ce scrii și tot nu schimbă
  nimic** — de-asta merită spus că erau două, nu unul.
- **Revenirea la eroare era și ea incompletă.** Dacă a doua scriere (datele de
  pe intrări) eșuează, prima se anula cu `updateSession(id, date, name)` — care,
  fără `durationSeconds`, lasă pe loc noul `endedAt`. Adică revenea data și
  numele, dar păstra durata nouă. Hook-ul are acum `restoreSession(original)`,
  care pune sesiunea înapoi întreagă.

### Selectorul de Tracks, rupt pe verticală

- Checkbox-ul ieșea **246px lățime**, iar etichetei („Weight (kg)") îi rămâneau
  27 — deci se rupea literă cu literă, pe verticală, pe marginea rândului.
  Cauza: regula globală `input { width: 100% }` se aplică și checkbox-urilor.
  Erau excluse acum explicit, plus o dimensiune proprie de 22px.
- **Partea care e greșeala mea**: fixul de acum două ture (`min-width: 0` pe
  span, `overflow-wrap: anywhere` pe nume) n-a cauzat lățimea greșită, dar a
  transformat simptomul din „textul iese din chenar" în „textul se rupe pe
  verticală". `anywhere` rupe orice cuvânt de îndată ce spațiul se strânge;
  acum e `break-word`, care rupe doar ce chiar nu încape. Reparasem simptomul
  fără să văd că lățimea în sine era absurdă.

- **Teste**: +30 (16 pure pentru parsarea și formatarea duratei, 6 pe ecran
  pentru salvare, restul gărzi), validate cu **5 mutații** — pagina care aruncă
  iar durata, câmpul fără separatoare, parserul fără cifre lipite, limita de 59
  scoasă, checkbox-urile întoarse la `width: 100%` — toate au picat suita.
- Verificat: `lint` ✅, **333 de teste** ✅, `build` ✅. Măsurat în browser,
  tastând cifră cu cifră ca pe keypad: câmpul ajunge la `01:10:23`, ajutorul
  spune „1h 10m 23s", iar după salvare cardul arată `01:10:23` în loc de
  `14:05:00`. Etichetele Tracks: fiecare pe un rând, checkbox 22px.

## 2026-08-12 — etapa 4: Exercises

- **Căutare care caută unde trebuie.** `searchExercises.ts`, funcții pure.
  Termenii se potrivesc peste nume, categorie, echipament și cele două câmpuri de
  mușchi — nu doar peste nume. Motivul concret: „quads" trebuie să găsească Leg
  Press, al cărui nume nu conține cuvântul. **Toți** termenii trebuie să se
  potrivească, dar nu în același câmp: „dumbbell arms" găsește un exercițiu cu
  gantere din categoria Arms. Potrivire pe subșir, fiindcă un cuvânt pe jumătate
  scris e starea normală a unei căutări — „ben" arată deja Bench Press.
- **Chips-urile derulează orizontal**, pe un singur rând, ca în mockup. Înainte se
  împachetau pe două rânduri și împingeau lista în jos la fiecare categorie nouă.
  Verificat: 8 chips, 534px de conținut în 406px vizibili, un singur rând.
- **Favorite.** Câmp nou pe exercițiu, scris doar când e pornit — un exercițiu care
  n-a fost niciodată stelat și unul stelat apoi destelat se stochează la fel.
  Favoritele **urcă în capul listei**: o steluță care schimbă doar o iconiță nu
  merită o apăsare. Butonul de filtru de lângă căutare le izolează.
- **Thumbnail** în fiecare rând: harta de mușchi, la dimensiune de rând. Mockup-ul
  are fotografie; noi n-avem poze, iar harta duce exact informația pe care ar fi
  dat-o poza dintr-o privire. Când exercițiul nu numește niciun mușchi nu
  randează nimic, iar rândul se strânge la loc (`:empty`).
- **FAB** coral, jos-dreapta, în locul butonului din antet. Se ascunde cât
  formularul e deschis — altfel ar fi existat două butoane „Add exercise" pe
  ecran, unul care deschide și unul care salvează.
- **Rezervă pentru categoria dispărută**: ștergi ultimul exercițiu din Chest și
  chip-ul dispare cât timp e încă selectat — ecranul rămânea gol, fără niciun chip
  de apăsat ca să ieși din el. **Bug găsit de propriul test**: calculam rezerva
  dar filtram tot după selecția veche.
- **Un ecran, o foaie.** `exercises-target.css` → `features/exercises/exercises.css`,
  plus regulile lui din `index.css` (chips-urile vechi, lista moartă
  `.exercise-list`, `.exercise-details`, `.new-field-row` definit de două ori cu
  alte coloane) și din `redesign.css` (formularul, selectorul de Tracks). 23 de
  clase au acum exact o definiție, blocat de test ca la Home. `index.css` a
  scăzut cu ~2100 de caractere.
- `ExerciseList.tsx` rescris lizibil (era pe un rând), iar iconițele au ieșit
  într-un modul propriu ca să nu facă import circular cu pagina.
- **Teste**: +31 (16 pure pentru căutare/filtrare/categorii, 15 pe ecran),
  validate cu **7 mutații** — căutare doar în nume, favoritele ne-urcate,
  `every`→`some`, rezerva scoasă, favoritul necitit din storage, steluță care nu
  se mai stinge, FAB rămas peste formular — toate au picat suita.
- Verificat: `lint` ✅, **310 teste** ✅, `build` ✅. Măsurat în browser la 430px:
  toate cele șapte elemente noi așezate corect, zero derulare orizontală a paginii
  (chips-urile ies doar în containerul lor derulabil, cum trebuie), căutarea
  „quads" → 7 din 25, steluța la `rgb(245,179,1)`.

## 2026-08-12 — reparații pe cinci ecrane, raportate de proprietar

Cauza comună a aproape tuturor: **CSS valid care nu se aplica**. Nimic nu arunca
erori, build-ul trecea, testele treceau — regulile pur și simplu nu existau.
De-asta niciunul nu fusese prins până acum.

- **Un comentariu nedeschis corect în `redesign.css`** înghițea **16 reguli**,
  de la linia 3 până la primul marcaj de închidere, la linia 96. Printre ele
  `.danger-action` — de aceea butonul „Delete" de pe cardurile de exercițiu era
  negru, nu roșu. Am păstrat cele patru reguli folosite (`.empty-state`,
  `.danger-action`, `.form-actions`) și am șters restul, în loc să le reactivez:
  bara de jos e descrisă complet în `target-shell.css`, iar reactivarea ar fi
  crescut-o de la 51px la 58px — o schimbare de aspect pe care n-a cerut-o nimeni.
- **Două containere care nu sunt randate nicăieri** — `.target-exercise-library`
  și `.target-workout-log` — sub care erau scrise 14 reguli. Toate moarte. De
  aceea pill-urile de Tracks se citeau „RepsWeight (kg)": nu erau pastile, erau
  `<span>`-uri inline fără nicio regulă. Regulile sunt acum pe clasele lor.
- **Două token-uri care nu există**: `--radius-full` (chips-urile de categorie
  ieșeau pătrate) și `--color-surface-secondary` (chips-urile inactive rămâneau
  fără fundal; token-ul real e `--color-surface-alt`). Un `var()` nedefinit nu e
  eroare de CSS — declarația e ignorată în tăcere.
- **`.exercise-form-section-heading` n-avea nicio regulă.** `<span>` și `<small>`
  sunt amândouă inline, deci se citea „BasicsName and classification".
- **Formularul de editare din Workout Log ieșea 26px lățime.**
  `.target-logged-exercise` e un grid `28px | 1fr | auto` pentru rândul citit
  (număr | nume | butoane). La Edit, cardul are un singur copil — formularul —
  care cădea în coloana de 28px. Acum ține tot rândul.
- **Câmpurile ieșeau din card pe iOS, dar nu în Chromium.** Un flex item are
  implicit `min-width: auto`, deci nu se micșorează sub lățimea minimă a
  conținutului; `input[type=date]` și `input[type=file]` au pe iOS o lățime
  intrinsecă mult mai mare. `min-width: 0` pe `.field`, plafon `max-width: 100%`
  pe controale. **Nu se poate reproduce de aici** — fixul e argumentat, nu văzut.
- **Chips-urile de categorie stăteau lângă titlu**, într-un antet
  `justify-content: space-between`: „Your Exercises" se strângea pe două rânduri
  într-o coloană îngustă. Acum sunt pe rândul lor.
- **Data brută `2026-07-15` din galeria de poze** → `15 July 2026`. `dayLabel`
  s-a mutat din `workout-log/calendarMonth.ts` în `shared/localDate.ts`, ca
  galeria să nu importe din alt modul de funcționalitate. `PhotoGallery.tsx`
  rescris lizibil (era pe un rând), cum cere regula pentru orice componentă atinsă.

**Cum s-a verificat ce nu se vede de aici.** Am condus aplicația într-un browser
headless la 430×932 (dimensiunea din capturi), cu date realiste, și am măsurat
geometria ca **text**: ce iese din ecran, ce se suprapune, ce control e strivit.
Așa s-a confirmat `select`-ul de 26px înainte și 350px după, pill-urile ca
`display:inline radius:0` înainte și `radius:999px` cu fundal după, „Delete" la
`rgb(220,67,56)` față de `rgb(23,27,37)` la „Edit". Instrumentul a stat în afara
proiectului — n-a intrat nicio dependență nouă în `package.json`.

**Teste**: +22 în `src/styles/screenRepairs.test.ts`, plus reancorarea unui test
existent care verifica data brută. Două dintre gărzi sunt generale, nu punctuale:
una cere ca fiecare `var()` fără fallback să aibă token-ul definit, alta ca niciun
selector descendent să nu pornească de la o clasă nerandată — **a doua a găsit
singură `.target-workout-log`, pe care nu-l reparasem.** Validate cu **7 mutații**
(token șters, reguli rescopate sub containerul mort, antetul revenit inline,
formularul întors în coloana de 28px, comentariu lăsat neînchis, `min-width`
scos, token fantomă reintrodus) — toate au picat suita.

- Verificat: `lint` ✅, **254 de teste** ✅, `build` ✅.
- **Nerezolvat, de decis de proprietar**: „Workout duration 14:04:57". Durata e
  `endedAt − createdAt`, deci e reală — o sesiune deschisă dimineața și încheiată
  seara. Nu e un calcul greșit, dar nu e nici o durată de antrenament utilă. E
  aceeași întrebare rămasă deschisă de la etapa 2b.
- **Nu e bug**: „Add photos" apare palid pentru că e `disabled` până alegi toate
  cele patru poze.

### Al doilea tur, din încă două capturi

- **Două formulare n-aveau nicio regulă CSS** — `.measurement-form` și
  `.exercise-editor-form`, șapte clase cu totul. Cădeau pe regula generică din
  `index.css`, `form { display: flex; flex-wrap: wrap }`, deci deveneau rânduri
  care se împachetează. La Body, `<details class="measurement-more">` ajungea
  flex item lângă secțiunea principală: „More measurements" apărea **sus-dreapta,
  în dreptul câmpului Date**, cu propria coloană de câmpuri sub el — nu era o
  secțiune care se desface, erau două coloane fără legătură. La Exercises,
  secțiunile se strângeau la lățimea conținutului și lăsau ~40% din card gol.
  Măsurătorile au acum foaia lor, `features/measurements/measurements.css`.
- **Conținutul derula pe sub bara de status.** `viewport-fit=cover` întinde
  pagina sub ceas; padding-ul cu `env(safe-area-inset-top)` ține conținutul
  dedesubt doar cât ești în capul paginii. La derulare, titlul „Exercises" urca
  peste „20:56". Padding-ul nu putea rezolva asta — el mută conținutul, nu-l
  acoperă. Acum e o bandă fixă opacă (`.app-shell::before`) exact cât inset-ul,
  deci pe un ecran fără crestătură are înălțime 0 și nu schimbă nimic.
  Verificat: `z-index` 10, sub bara de jos, care e pe 20.
- **Gardă nouă, generală**: orice `<form>` care își dă o clasă în markup trebuie
  să aibă reguli proprii. Un formular care se numește are o intenție de așezare;
  testul îi cere s-o scrie, în loc s-o lase pe seama regulii generice. Validată
  cu 2 mutații.
- Verificat: `lint` ✅, **256 de teste** ✅, `build` ✅. Măsurat în browser:
  secțiunile formularului de exerciții umplu acum exact cutia de conținut
  (376px din 376px, față de ~60% înainte); `details` e sub secțiunea principală
  (top 656 vs 642), pe aceeași lățime, iar câmpurile secundare se desfac în
  două coloane.
