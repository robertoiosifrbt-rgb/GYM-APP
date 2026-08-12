# GYM APP — Visual Target Rebuild Plan

## Source of truth

The 9-screen reference image supplied by Roberto on 12 Aug 2026 is now the visual target for the app. The previous plan overstated completion because it measured incremental restyling, not fidelity to this target.

We keep the existing working data/storage logic where possible, but rebuild the presentation and user flows screen-by-screen to match the reference closely on iPhone.

## Progress

**Overall: 10% complete — target plan established; implementation starts with Home + global shell**

`[##------------------] 2 / 20`

Status legend:
- [ ] Not started
- [~] In progress
- [x] Done
- [!] Needs review/fix

## Phase A — Global visual system

- [x] 1. Lock the supplied 9-screen image as the visual target and reset progress honestly.
- [x] 2. Preserve existing data model, storage, Track history safety and working tests during the visual rebuild.
- [~] 3. Rebuild global iPhone shell: white/light background, compact headers, reference typography, card radius/shadows, coral accent, dark navy primary actions, safe areas.
- [ ] 4. Rebuild bottom navigation to visually match the reference: Home / Body / Workout / Progress / Settings, compact icons/labels, coral active state.

## Phase B — Home screen

Target: top-left screen in reference.

- [ ] 5. Header: greeting, subtitle and notification action.
- [ ] 6. Weekly Progress card: circular percentage plus Workouts / Volume / Duration metrics.
- [ ] 7. Today's Workout card: workout name, exercise/time summary and coral Start Workout CTA.
- [ ] 8. Quick Actions 2x2 cards: Log Workout / Exercises / Body Stats / Progress Photos.
- [ ] 9. Recent Workouts compact list with date, duration/volume and completion state.

## Phase C — Workout

Target: top-middle + middle-left screens.

- [ ] 10. Active Workout screen: dark navy header, elapsed timer, exercise progress, progress bar, current exercise card, set table, completion controls, next-exercise card.
- [ ] 11. Workout Log screen: real month calendar at top, selected-day state, workout cards underneath, totals aligned like reference.

## Phase D — Exercises

Target: middle-middle + middle-right screens.

- [ ] 12. Exercise Library: search, filter button, category chips, compact illustrated rows, favourite action, floating add button.
- [ ] 13. Exercise Detail: dark hero header, exercise visual area, muscle visual area, metadata cards, Instructions/Muscles tabs and Add to Workout CTA.
- [ ] 14. Exercise create/edit: retain all current editable fields and removable Tracks, but style the flow consistently with the target rather than exposing a large technical form by default.

## Phase E — Body

Target: top-right + bottom-left screens.

- [ ] 15. Body Overview: Muscles / Body Parts segmented control, front/back body visual, legend and muscle-focus bars.
- [ ] 16. Body Stats: Measurements / Composition / History tabs, key-measurement rows with icons and deltas, dark Add Measurements CTA.

## Phase F — Progress Photos

Target: bottom-middle screen.

- [ ] 17. Progress Photos: All Photos / Front / Side / Back filters, 3-column photo grid grouped by date, add-photo action.

## Phase G — Settings

Target: bottom-right screen.

- [ ] 18. Settings: profile/level card, Preferences grouped rows, Data rows, About section; preserve current Export/Restore/storage functionality behind this visual structure.

## Phase H — Fidelity + safety audit

- [ ] 19. Visual fidelity pass on iPhone: spacing, typography, icon sizing, card geometry, nav, sticky actions, overflow, light/dark behaviour and all empty/error states.
- [ ] 20. Regression gate: Track deletion/history safety, existing exercise/workout/body/photo data compatibility, full tests, lint, production build and successful GitHub Pages deploy.

## Non-negotiable functional rules

1. Existing workout history must remain readable.
2. Removing a Track must remove it from future/current exercise definitions without deleting historical logged values.
3. Exercise add/edit/delete and workout add/edit/delete remain functional.
4. Measurements, progress photos, export/restore and version banner remain functional.
5. No screen is marked complete merely because it uses similar colours; it must match the reference structure and hierarchy.
6. No phase is marked complete until its existing relevant tests pass.

## Implementation order

1. Global shell + bottom nav.
2. Home to high visual fidelity.
3. Active Workout + Workout Log calendar.
4. Exercise Library + Exercise Detail + editor.
5. Body Overview + Body Stats.
6. Progress Photos.
7. Settings.
8. Final fidelity and regression audit.

## Progress rule

Update this file after each completed target screen. Percentage is based on these 20 target tasks, not on the old restyle plan.
