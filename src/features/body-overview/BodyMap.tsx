import type { MuscleId } from './muscles'
import { LEVEL_COLORS, type MuscleLevel } from './muscleStats'
import {
  ANTERIOR,
  BACK_VIEW_BOX,
  FRONT_VIEW_BOX,
  POSTERIOR,
  type BodyRegion,
  type BodyShape,
} from './bodyPolygons'

/**
 * Front and back body maps.
 *
 * The outlines are anatomical shapes (see `bodyPolygons.ts`), not something
 * assembled by hand — the hand-built version read as a snowman however much
 * its coordinates were nudged. Every region is a shape, hands and feet
 * included, so together they are the figure; there is no separate silhouette
 * to keep in step.
 *
 * Muscle polygons carry `data-muscle` and `data-level`, which is how the
 * colouring is tested. The drawing itself is checked by rendering it, not by a
 * test — see `docs/ARCHITECTURE.md`.
 */

/** Parts of the body that are not one of the muscles we track. */
const BODY_FILL = '#dfe4ec'
/** Outline around every region, so neighbouring muscles stay legible. */
const OUTLINE = '#9aa5b5'

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
  deltoids: 'shoulders',
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
  // Structural, or muscles this app does not track: drawn, never coloured by
  // training. `tibialis` is the shin, the opposite of the calf, so it is not
  // folded into it.
  tibialis: undefined,
  adductors: undefined,
  knees: undefined,
  ankles: undefined,
  feet: undefined,
  hands: undefined,
  neck: undefined,
  head: undefined,
  hair: undefined,
}

interface FigureProps {
  view: 'front' | 'back'
  levelFor: (muscle: MuscleId) => MuscleLevel
}

function Figure({ view, levelFor }: FigureProps) {
  const shapes: BodyShape[] = view === 'front' ? ANTERIOR : POSTERIOR

  return (
    <figure className="body-figure">
      <svg
        viewBox={view === 'front' ? FRONT_VIEW_BOX : BACK_VIEW_BOX}
        role="presentation"
        focusable="false"
      >
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          {shapes.map((shape, index) => {
            const muscle = REGION_TO_MUSCLE[shape.region]
            if (!muscle) {
              return <path key={index} d={shape.d} fill={BODY_FILL} />
            }
            const level = levelFor(muscle)
            return (
              <path
                key={index}
                d={shape.d}
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
