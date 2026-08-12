import type { MuscleId } from './muscles'
import { LEVEL_COLORS, type MuscleLevel } from './muscleStats'
import { ANTERIOR, POSTERIOR, type BodyPolygon, type BodyRegion } from './bodyPolygons'

/**
 * Front and back body maps.
 *
 * The outlines are anatomical polygons (see `bodyPolygons.ts`), not shapes
 * assembled by hand — the hand-built version read as a snowman however much
 * the coordinates were nudged. Every region is a polygon, so the union of them
 * is the body; there is no separate silhouette to keep in step.
 *
 * Muscle polygons carry `data-muscle` and `data-level`, which is how the
 * colouring is tested. The drawing itself is checked by rendering it, not by a
 * test — see `docs/ARCHITECTURE.md`.
 */

/** Parts of the body that are not one of the muscles we track. */
const BODY_FILL = '#dfe4ec'
/** Thin gap between neighbouring regions, so they read as separate muscles. */
const SEPARATOR = '#f4f6fa'

/**
 * The source names regions its own way, and splits some of ours in two: front
 * and back deltoids are both our shoulders, and the soleus is part of the
 * calf. Regions with no muscle of ours — head, neck, knees, the
 * adductor/abductor bands — are structural: drawn, but never coloured by
 * training.
 */
const REGION_TO_MUSCLE: Record<BodyRegion, MuscleId | undefined> = {
  chest: 'chest',
  abs: 'abs',
  obliques: 'obliques',
  'front-deltoids': 'shoulders',
  'back-deltoids': 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  forearm: 'forearms',
  trapezius: 'traps',
  'upper-back': 'lats',
  'lower-back': 'lowerBack',
  gluteal: 'glutes',
  quadriceps: 'quads',
  hamstring: 'hamstrings',
  calves: 'calves',
  'left-soleus': 'calves',
  'right-soleus': 'calves',
  head: undefined,
  neck: undefined,
  knees: undefined,
  abductors: undefined,
  adductor: undefined,
}

interface FigureProps {
  view: 'front' | 'back'
  levelFor: (muscle: MuscleId) => MuscleLevel
}

function Figure({ view, levelFor }: FigureProps) {
  const polygons: BodyPolygon[] = view === 'front' ? ANTERIOR : POSTERIOR

  return (
    <figure className="body-figure">
      <svg viewBox="0 0 100 200" role="presentation" focusable="false">
        <g stroke={SEPARATOR} strokeWidth="0.4">
          {polygons.map((polygon, index) => {
            const muscle = REGION_TO_MUSCLE[polygon.region]
            if (!muscle) {
              return <polygon key={index} points={polygon.points} fill={BODY_FILL} />
            }
            const level = levelFor(muscle)
            return (
              <polygon
                key={index}
                points={polygon.points}
                fill={LEVEL_COLORS[level]}
                data-muscle={muscle}
                data-level={level}
                data-view={view}
              />
            )
          })}
        </g>
      </svg>
      <figcaption>{view === 'front' ? 'Front' : 'Back'}</figcaption>
    </figure>
  )
}

interface BodyMapProps {
  levelFor: (muscle: MuscleId) => MuscleLevel
  /** Read out to a screen reader, which cannot use the drawing. */
  summary: string
}

export function BodyMap({ levelFor, summary }: BodyMapProps) {
  return (
    <div className="body-map" role="img" aria-label={summary}>
      <Figure view="front" levelFor={levelFor} />
      <Figure view="back" levelFor={levelFor} />
    </div>
  )
}
