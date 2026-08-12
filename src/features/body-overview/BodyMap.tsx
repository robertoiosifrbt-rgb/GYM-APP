import type { MuscleId } from './muscles'
import { LEVEL_COLORS, type MuscleLevel } from './muscleStats'

/**
 * Front and back silhouettes with one shape per muscle.
 *
 * Deliberately stylised rather than anatomical: built from ellipses and
 * rounded rectangles on a 100×240 grid, mirrored across the centre line. It
 * has to read at thumbnail size on a phone, not teach anatomy.
 *
 * Every muscle shape carries `data-muscle` and `data-level`, which is how the
 * colouring is tested — the drawing itself is the one part of this screen that
 * cannot be checked in text.
 */

const BODY_FILL = '#e9edf3'
const BODY_STROKE = '#dbe1ea'

interface Ellipse {
  cx: number
  cy: number
  rx: number
  ry: number
}

/** Same shape on the other side of the centre line. */
function mirror({ cx, ...rest }: Ellipse): Ellipse {
  return { cx: 100 - cx, ...rest }
}

/** The outline both views share: head, neck, torso and limbs. */
const BODY: Ellipse[] = [
  { cx: 50, cy: 17, rx: 10.5, ry: 12.5 },
  { cx: 21, cy: 64, rx: 6.5, ry: 20 },
  { cx: 79, cy: 64, rx: 6.5, ry: 20 },
  { cx: 16, cy: 101, rx: 5.5, ry: 19 },
  { cx: 84, cy: 101, rx: 5.5, ry: 19 },
  { cx: 14, cy: 124, rx: 4.5, ry: 6 },
  { cx: 86, cy: 124, rx: 4.5, ry: 6 },
  { cx: 41, cy: 148, rx: 9.5, ry: 30 },
  { cx: 59, cy: 148, rx: 9.5, ry: 30 },
  { cx: 40, cy: 197, rx: 7, ry: 26 },
  { cx: 60, cy: 197, rx: 7, ry: 26 },
  { cx: 39, cy: 226, rx: 6, ry: 5 },
  { cx: 61, cy: 226, rx: 6, ry: 5 },
]

const NECK = { x: 45, y: 26, width: 10, height: 11, rx: 4 }
const TORSO = 'M 31 37 Q 50 33 69 37 L 73 55 Q 75 78 70 96 L 67 118 Q 50 124 33 118 L 30 96 Q 25 78 27 55 Z'

type Shape =
  | { kind: 'ellipse'; muscle: MuscleId; shape: Ellipse }
  | { kind: 'rect'; muscle: MuscleId; x: number; y: number; width: number; height: number; rx: number }

function pair(muscle: MuscleId, shape: Ellipse): Shape[] {
  return [
    { kind: 'ellipse', muscle, shape },
    { kind: 'ellipse', muscle, shape: mirror(shape) },
  ]
}

const FRONT: Shape[] = [
  ...pair('shoulders', { cx: 27, cy: 44, rx: 8.5, ry: 8 }),
  ...pair('chest', { cx: 41, cy: 53, rx: 9, ry: 7.5 }),
  { kind: 'rect', muscle: 'abs', x: 42, y: 66, width: 16, height: 34, rx: 5 },
  ...pair('obliques', { cx: 35.5, cy: 83, rx: 4.5, ry: 13 }),
  ...pair('biceps', { cx: 21, cy: 62, rx: 6, ry: 14 }),
  ...pair('forearms', { cx: 16, cy: 100, rx: 5, ry: 16 }),
  ...pair('quads', { cx: 41, cy: 145, rx: 8.5, ry: 26 }),
  ...pair('calves', { cx: 40, cy: 196, rx: 6.5, ry: 22 }),
]

const BACK: Shape[] = [
  { kind: 'rect', muscle: 'traps', x: 35, y: 36, width: 30, height: 17, rx: 8 },
  ...pair('shoulders', { cx: 27, cy: 44, rx: 8.5, ry: 8 }),
  ...pair('lats', { cx: 39.5, cy: 68, rx: 10, ry: 15 }),
  { kind: 'rect', muscle: 'lowerBack', x: 43, y: 88, width: 14, height: 22, rx: 5 },
  ...pair('triceps', { cx: 21, cy: 62, rx: 6, ry: 14 }),
  ...pair('forearms', { cx: 16, cy: 100, rx: 5, ry: 16 }),
  ...pair('glutes', { cx: 42, cy: 121, rx: 9, ry: 9.5 }),
  ...pair('hamstrings', { cx: 41, cy: 152, rx: 8.5, ry: 24 }),
  ...pair('calves', { cx: 40, cy: 196, rx: 6.5, ry: 22 }),
]

interface FigureProps {
  view: 'front' | 'back'
  levelFor: (muscle: MuscleId) => MuscleLevel
}

function Figure({ view, levelFor }: FigureProps) {
  const shapes = view === 'front' ? FRONT : BACK

  return (
    <figure className="body-figure">
      <svg viewBox="0 0 100 240" role="presentation" focusable="false">
        <g fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8">
          <rect {...NECK} />
          <path d={TORSO} />
          {BODY.map((shape, index) => (
            <ellipse key={index} {...shape} />
          ))}
        </g>
        <g stroke="rgba(255,255,255,.65)" strokeWidth="0.7">
          {shapes.map((shape, index) => {
            const level = levelFor(shape.muscle)
            const common = {
              'data-muscle': shape.muscle,
              'data-level': level,
              'data-view': view,
              fill: LEVEL_COLORS[level],
            }
            return shape.kind === 'ellipse' ? (
              <ellipse key={index} {...shape.shape} {...common} />
            ) : (
              <rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                {...common}
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
