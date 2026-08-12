import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * Guards for a batch of layout faults the owner reported from five screens.
 *
 * Every one of them was silent: nothing threw, no test failed, the CSS was
 * valid. They were only visible on the screen. So each fix is pinned here by
 * the property that was actually wrong — a rule that never matched, a token
 * that was never defined, a form dropped into a 28px grid column.
 *
 * These are file-level checks on purpose. jsdom has no layout engine, so it
 * cannot tell you a select came out 26px wide; what it can tell you is that
 * the rule which caused it is still gone.
 */

const read = (file: string) => readFileSync(file, 'utf8')

function stylesheets(dir = 'src'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const path = join(dir, item.name)
    if (item.isDirectory()) return stylesheets(path)
    return item.name.endsWith('.css') ? [path] : []
  })
}

function sources(dir = 'src'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const path = join(dir, item.name)
    if (item.isDirectory()) return sources(path)
    return /\.tsx?$/.test(item.name) && !item.name.includes('.test.') ? [path] : []
  })
}

const allCss = () => stylesheets().map(read).join('\n')
const allTsx = () => sources().map(read).join('\n')

/** Every class a stylesheet writes rules for. */
function classesStyled(file: string): string[] {
  const withoutComments = read(file).replace(/\/\*[\s\S]*?\*\//g, '')
  const selectors = [...withoutComments.matchAll(/([^{}]+)\{/g)].map((m) => m[1])
  return [...new Set(selectors.flatMap((s) => [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])))]
}

describe('stylesheet integrity', () => {
  /*
   * `redesign.css` carried an unterminated comment for months. It swallowed
   * everything up to the next closing sequence — 16 rules, silently inert,
   * among them `.danger-action`, which is why the Delete buttons on the
   * exercise cards were black instead of red.
   *
   * Nothing could catch it: an unclosed comment is not a parse error, the
   * build succeeded, and the rules simply were not there. Counting the
   * delimiters is crude, but it is the check that would have caught it.
   */
  it.each(stylesheets())('%s closes every comment it opens', (file) => {
    const css = read(file)

    expect((css.match(/\/\*/g) ?? []).length).toBe((css.match(/\*\//g) ?? []).length)
  })
})

describe('CSS custom properties', () => {
  /*
   * `border-radius: var(--radius-full)` on the category chips resolved to
   * nothing, because the token was used once and defined never. An undefined
   * custom property is not a CSS error — the declaration is simply dropped, so
   * the chips rendered as squares and nothing complained.
   */
  it('defines every token the stylesheets reference without a fallback', () => {
    const css = allCss()
    const defined = new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))

    /*
     * `var(--x, 4)` is exempt: those are the handful of properties set from a
     * component's inline style (`--track-count`, `--runner-columns`), and the
     * fallback is what the stylesheet is meant to use when they are not. A
     * `var()` with no fallback is a promise the token exists.
     */
    const used = [...css.matchAll(/var\((--[\w-]+)\s*([,)])/g)]
      .filter(([, , next]) => next === ')')
      .map(([, token]) => token)

    const missing = [...new Set(used)].filter((token) => !defined.has(token))

    expect(missing).toEqual([])
  })
})

describe('rules that can never match', () => {
  /*
   * The whole Exercises card design was written as `.target-exercise-library
   * .exercise-card …` — a container class that appears in no TSX file. Ten
   * rules, none of them ever applied: the Tracks pills fell back to bare
   * inline spans and read as "RepsWeight (kg)".
   */
  it('scopes rules only to classes the app actually renders', () => {
    const tsx = allTsx()
    /*
     * Class names are not always written out whole: `PageHeader` builds one as
     * `page-header-${align}`. Treat the literal part before an interpolation as
     * a prefix, so `page-header-left` counts as rendered.
     */
    const prefixes = [...tsx.matchAll(/([a-zA-Z][\w-]*-)\$\{/g)].map((m) => m[1])
    const isRendered = (cssClass: string) =>
      new RegExp(`\\b${cssClass}\\b`).test(tsx) || prefixes.some((p) => cssClass.startsWith(p))

    const orphans: string[] = []
    for (const file of stylesheets()) {
      const withoutComments = read(file).replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [, selector] of withoutComments.matchAll(/([^{}]+)\{/g)) {
        // Only descendant selectors matter here: a leading class that is never
        // rendered makes everything after it dead, which is the trap we hit.
        const leading = selector.trim().match(/^\.([a-zA-Z][\w-]*)\s+\./)
        if (!leading) continue
        if (!isRendered(leading[1])) orphans.push(`${file}: ${selector.trim()}`)
      }
    }

    expect(orphans).toEqual([])
  })
})

describe('forms', () => {
  /*
   * `index.css` styles the bare `form` element as a wrapping flex row. That is
   * a sensible default for a row of inputs, but it is a trap for any form with
   * block-level children: they become flex items sized to their content.
   *
   * Two forms had no rules of their own and paid for it. `.measurement-form`
   * put its `<details class="measurement-more">` beside the main section, so
   * "More measurements" appeared top-right next to the Date field with its own
   * column of inputs. `.exercise-editor-form` let its sections shrink to about
   * 60% and left the rest of the card blank.
   *
   * A form that names itself in the markup has a layout in mind. This asks it
   * to say what that layout is.
   */
  it('gives every classed form its own rule', () => {
    const classed = [...new Set([...allTsx().matchAll(/<form className="([a-z][\w-]*)"/g)].map((m) => m[1]))]
    const css = allCss().replace(/\/\*[\s\S]*?\*\//g, '')

    const unstyled = classed.filter((cssClass) => !new RegExp(`\\.${cssClass}\\b[^{}]*\\{`).test(css))

    expect(unstyled).toEqual([])
  })
})

describe('Exercises screen', () => {
  const EXERCISES_STYLESHEET = 'src/exercises-target.css'

  /*
   * `<span>Basics</span><small>Name and classification</small>` with no rule
   * at all: both inline, both on the same line, reading as one word.
   */
  it('gives the form section heading a rule that stacks its two lines', () => {
    const css = read(EXERCISES_STYLESHEET)
    const rule = css.match(/\.exercise-form-section-heading \{([^}]*)\}/)

    expect(rule?.[1]).toContain('flex-direction: column')
  })

  it('styles the Tracks pills without needing a wrapper class', () => {
    expect(classesStyled('src/exercises-target.css')).toContain('track-pills')
    expect(read('src/exercises-target.css')).toMatch(/^\.track-pills span \{/m)
  })

  /*
   * The section header is `display: flex; justify-content: space-between`, so
   * eight category chips were squeezed into whatever width the title left
   * over, and "Your Exercises" wrapped onto two lines in a narrow column.
   */
  it('drops the category chips onto their own row', () => {
    const rule = read('src/index.css').match(/\.section-header:has\(\.exercise-category-filter\) \{([^}]*)\}/)

    expect(rule?.[1]).toContain('flex-direction: column')
  })
})

describe('Workout Log', () => {
  /*
   * `.target-logged-exercise` is a `28px | 1fr | auto` grid for the read-only
   * row. Editing replaces all three children with a single form, which landed
   * in the 28px column — the exercise select came out 26 pixels wide.
   */
  it('lets the edit form span the whole logged-exercise row', () => {
    const rule = read('src/workout-target.css').match(/\.target-logged-exercise > form \{([^}]*)\}/)

    expect(rule?.[1]).toContain('grid-column: 1/-1')
  })
})

describe('form fields', () => {
  /*
   * A flex item defaults to `min-width: auto`, so it will not shrink below its
   * content's minimum. iOS gives `input[type=date]` and `input[type=file]` a
   * far wider intrinsic size than Chromium does, so the field overflowed its
   * card on the phone and nowhere else — including in every test we run.
   */
  it('lets a field shrink below its control&apos;s intrinsic width', () => {
    const rule = read('src/index.css').match(/^\.field \{([^}]*)\}/m)

    expect(rule?.[1]).toContain('min-width: 0')
  })

  it('caps native controls at the width of their container', () => {
    // `input, select, textarea` appears twice in index.css — the reset near the
    // top and the real styling further down. Match the block that sizes them.
    const blocks = [...read('src/index.css').matchAll(/^input,\nselect,\ntextarea \{([^}]*)\}/gm)]

    expect(blocks.map((b) => b[1]).join()).toContain('max-width: 100%')
  })
})
