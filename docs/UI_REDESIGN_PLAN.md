# UI Redesign Plan

## Goal

Refacem complet interfața aplicației de sală, fără să aruncăm logica și datele existente. Păstrăm funcționalitatea actuală (exerciții, workout log, measurements, progress photos, settings, local storage, IndexedDB, version banner), dar schimbăm modul în care aplicația arată și se folosește pe telefon.

Ținta este o aplicație mobilă coerentă, rapidă și clară, cu mai puține formulare tehnice și mai mult focus pe acțiunile reale din sală.

## Progress

**Overall: 20% complete — Phase 2 and 3 in progress**

`[####----------------] 4 / 20`

Status legend:
- [ ] Not started
- [~] In progress
- [x] Done
- [!] Needs review/fix

## Phase 1 — Design foundation

- [x] 1. Define new visual system: spacing, typography, radii, shadows, buttons, inputs, cards, states.
- [x] 2. Rebuild global mobile shell: safe areas, sticky/fixed navigation, scroll behaviour, page padding.
- [x] 3. Replace current top header with contextual page headers.
- [x] 4. Redesign bottom navigation for Home / Body / Workout / Progress / Settings.

Phase 1 passed lint, tests, build and GitHub Pages deployment successfully.

## Phase 2 — Home

- [~] 5. Replace current Home with dashboard layout.
- [~] 6. Add Today's Workout card and primary Start Workout action.
- [~] 7. Add useful quick actions: Log Workout, Exercises, Body Stats, Progress Photos.
- [~] 8. Add recent workout / progress summary using existing data where available.

Implementation now includes the dashboard hero, quick-action grid, direct navigation to the main modules, and live summary cards using the existing workout-session and measurement data. These stay `[~]` until the newest deployment finishes successfully.

## Phase 3 — Workout experience

- [~] 9. Redesign workout/session list as compact mobile cards instead of form-heavy blocks.
- [ ] 10. Redesign active exercise logging: clear set rows, track columns, add/remove set, fast numeric entry.
- [ ] 11. Preserve edit/delete for logged exercises, but make actions safer and less visually noisy.
- [ ] 12. Redesign exercise library: search/filter-ready list, compact cards, clearer edit/add flow.
- [ ] 13. Redesign exercise details/edit screen so Category / Equipment / Muscles / Instructions / Tracks are grouped and easier to scan.

Session-card markup has been rebuilt with compact date/name/exercise-count headers, clearer logged-exercise blocks, separated actions, and a dedicated add-exercise area. Styling and deployment verification are still in progress.

## Phase 4 — Tracks data safety

- [ ] 14. Fix Track deletion so removing a Track from future use does not make historical logged values disappear.
- [ ] 15. Clean removed Track references from current exercise definitions safely.
- [ ] 16. Add tests for Track deletion, historical values, and existing exercises.

## Phase 5 — Body / Progress

- [ ] 17. Redesign Measurements as a body-stats dashboard plus clean add/edit flow.
- [ ] 18. Redesign Progress Photos as a mobile gallery grouped by date, with clearer front/side/back views.

## Phase 6 — Settings / polish

- [ ] 19. Redesign Settings into grouped mobile rows/cards; keep export/backup warnings clear.
- [ ] 20. Final consistency pass: responsive iPhone layout, accessibility, destructive confirmations, empty states, loading/error states, dark mode, tests, lint, build and deploy verification.

## Navigation target

Main bottom navigation:

- Home
- Body
- Workout
- Progress
- Settings

Body contains measurements/body statistics.

Workout contains workout log and exercise library.

Progress contains progress photos and later progress analytics if added.

## UX rules

1. The main screen of each module should be an overview/action screen, not a large configuration form.
2. Configuration fields appear only when creating or editing something.
3. Primary actions must be obvious and thumb-friendly on mobile.
4. Destructive actions must be secondary and confirmed where data could be lost.
5. Historical workout data must never become unreadable because a current exercise or Track was deleted.
6. Existing user data must remain compatible through the redesign.
7. No redesign step is considered done until lint, tests and build pass.

## Data we are keeping

The redesign must preserve the current storage model unless a migration is explicitly required:

- Exercises and their details
- Custom Track types
- Workout sessions
- Logged exercise entries and sets
- Measurements
- Progress photos in IndexedDB
- Settings / export behaviour
- Version update banner logic

## Implementation strategy

Work incrementally on `main`, with small deployable changes. Do not replace the whole app in one commit. Each phase should leave the app usable and should reuse existing hooks/data logic where possible.

When a task above is completed, update this document immediately:

- change `[ ]` to `[x]`
- increase the `Overall` percentage
- update the ASCII progress bar and completed count

This file is the source of truth for the redesign until the project is complete.
