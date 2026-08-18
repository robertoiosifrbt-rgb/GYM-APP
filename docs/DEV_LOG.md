# Jurnal de dezvoltare

> Regulă: aici stau doar ultimele 5 intrări. Când se adaugă a 6-a, cea mai veche
> se mută în `docs/archive/dev-log/<an>-<luna>.md` (ex: `2026-08.md`). Așa fișierul
> nu crește la nesfârșit și rămâne rapid de citit la începutul unei sesiuni noi.

## 2026-08-18 — în runner nu se vedea ce ai ridicat data trecută

Semnalat de proprietar, cu ecranul de sesiune activă deschis: „aici nu îmi arată
ultimul exercițiu". Pe pagina Workout Log, formularul de intrare arată de mult
rândul „Last time (dată): ..." (`ExerciseEntryForm`). În runner, ultimul log era
citit **doar** ca să decidă câte rânduri goale apar în tabel — nu se vedea nicăieri.

- Cardul exercițiului are acum, între harta de mușchi și tabelul de seturi, un
  bloc „LAST TIME · 10 July 2026" cu o pastilă per set (`1  8 reps · 60kg`). Stă
  **deasupra** tabelului fiindcă e reperul după care completezi tabelul.
- **Ultimul log exclude sesiunea de pe ecran**: `getLastEntry(exerciseId, excludeSessionId?)`.
  Fără asta, după „Finish Exercise" + „Previous exercise", blocul ar fi arătat
  exact seturile din tabelul de deasupra lui — și-ar fi răspuns la propria
  întrebare. Excluderea se aplică și numărului de seturi de pe cardul „Next".
- Etichetele vin din `allFieldTypes` (inclusiv tipurile arhivate), ca la istoricul
  din Workout Log — altfel un log vechi pe un track șters ar fi rămas fără unitate.
- Data se scrie cu `dayLabel` („10 July 2026"), nu ISO.
- 4 teste noi în `WorkoutRunnerScreen.test.tsx`, verificate prin mutație: cu blocul
  scos pică două, cu excluderea sesiunii scoasă pică cel care cere ca sesiunea
  curentă să nu se citeze pe ea însăși.
- Verificat: `lint` ✅, 449 de teste ✅, `build` ✅.

## 2026-08-12 — tab-urile Log / Exercises stăteau deasupra titlului

Semnalat de proprietar. Pe ecranul Workout, rândul „Log | Exercises" era
randat în `App.tsx`, **înaintea** paginii — deci apărea deasupra titlului
„Workout Log". Arăta ca o a doua bară globală, exact forma scoasă în etapa 1,
și contrazicea regula din target: fiecare ecran începe cu propriul titlu.

- Tab-urile intră acum **în** ecran, sub titlu, ca la Body. Shell-ul le
  construiește în continuare (el ține starea), dar le trimite ca `tabs` către
  `WorkoutLogPage` și `ExercisesPage`, care le randează imediat sub
  `PageHeader`.
- **De ce nu am mutat titlul în shell**, varianta mai scurtă: subtitlul e
  dependent de date (`6 sessions recorded`, `24 exercises in your library`),
  iar numărătoarea trăiește în pagină. Ridicat în shell, ar fi trebuit ridicate
  și hook-urile care îl calculează.
- Spațierea a rămas aceeași: `.page-header` și `.sub-nav` au amândouă
  `margin-bottom: 14px`, deci inversarea ordinii nu mișcă nimic.
- Gardă în `App.test.tsx`: pe ambele tab-uri, rândul trebuie să vină **după**
  `h1` în ordinea din DOM. Verificată prin mutație — cu tab-urile puse înapoi
  deasupra, testul pică.
- Verificat: `lint` ✅, 420 de teste ✅, `build` ✅.

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
