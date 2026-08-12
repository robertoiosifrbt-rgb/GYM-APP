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

const BODY_FILL = '#e6eaf1'

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
  { cx: 23, cy: 64, rx: 7, ry: 21 },
  { cx: 77, cy: 64, rx: 7, ry: 21 },
  { cx: 18, cy: 101, rx: 5.5, ry: 19 },
  { cx: 82, cy: 101, rx: 5.5, ry: 19 },
  { cx: 16.5, cy: 124, rx: 4.5, ry: 6 },
  { cx: 83.5, cy: 124, rx: 4.5, ry: 6 },
  { cx: 41, cy: 148, rx: 9.5, ry: 30 },
  { cx: 59, cy: 148, rx: 9.5, ry: 30 },
  { cx: 40, cy: 197, rx: 7, ry: 26 },
  { cx: 60, cy: 197, rx: 7, ry: 26 },
  { cx: 39, cy: 226, rx: 6, ry: 5 },
  { cx: 61, cy: 226, rx: 6, ry: 5 },
]

const NECK = { x: 45, y: 26, width: 10, height: 11, rx: 4 }
/*
 * Widest across the chest, narrowest at the waist, flaring again at the hips.
 * The first version was widest at the waist, which is what made the figure
 * read as a barrel rather than a torso.
 */
const TORSO = [
  'M 32 37',
  'Q 50 33 68 37',
  'C 72 40 73 46 73.5 54',
  'C 74 64 71 74 69 84',
  'C 68 92 69 100 70.5 110',
  'C 71 117 62 124 50 124',
  'C 38 124 29 117 29.5 110',
  'C 31 100 32 92 31 84',
  'C 29 74 26 64 26.5 54',
  'C 27 46 28 40 32 37',
  'Z',
].join(' ')

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
  ...pair('shoulders', { cx: 27.5, cy: 48, rx: 8.5, ry: 8.5 }),
  ...pair('chest', { cx: 40, cy: 59, rx: 10, ry: 8 }),
  { kind: 'rect', muscle: 'abs', x: 41.5, y: 70, width: 17, height: 29, rx: 7 },
  ...pair('obliques', { cx: 33.5, cy: 83, rx: 5, ry: 13 }),
  ...pair('biceps', { cx: 23.5, cy: 62, rx: 6.5, ry: 15 }),
  ...pair('forearms', { cx: 18.5, cy: 100, rx: 5.2, ry: 16 }),
  ...pair('quads', { cx: 41, cy: 145, rx: 9, ry: 26 }),
  ...pair('calves', { cx: 40, cy: 194, rx: 6.5, ry: 21 }),
]

const BACK: Shape[] = [
  { kind: 'rect', muscle: 'traps', x: 34, y: 38, width: 32, height: 15, rx: 7 },
  ...pair('shoulders', { cx: 27.5, cy: 48, rx: 8.5, ry: 8.5 }),
  ...pair('lats', { cx: 38.5, cy: 68, rx: 11, ry: 16 }),
  { kind: 'rect', muscle: 'lowerBack', x: 43, y: 87, width: 14, height: 20, rx: 6 },
  ...pair('triceps', { cx: 23.5, cy: 62, rx: 6.5, ry: 15 }),
  ...pair('forearms', { cx: 18.5, cy: 100, rx: 5.2, ry: 16 }),
  ...pair('glutes', { cx: 42.5, cy: 117, rx: 8, ry: 8.5 }),
  ...pair('hamstrings', { cx: 41, cy: 150, rx: 8.5, ry: 24 }),
  ...pair('calves', { cx: 40, cy: 194, rx: 6.5, ry: 21 }),
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
        {/* The muscles are clipped to the outline, so a shape that runs past
            the edge of an arm or a hip is trimmed instead of floating over the
            background. It is what stops the figure reading as stuck-on blobs. */}
        <defs>
          <clipPath id={`body-clip-${view}`}>
            <rect {...NECK} />
            <path d={TORSO} />
            {BODY.map((shape, index) => (
              <ellipse key={index} {...shape} />
            ))}
          </clipPath>
        </defs>
        <g fill={BODY_FILL}>
          <rect {...NECK} />
          <path d={TORSO} />
          {BODY.map((shape, index) => (
            <ellipse key={index} {...shape} />
          ))}
        </g>
        <g clipPath={`url(#body-clip-${view})`}>
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
