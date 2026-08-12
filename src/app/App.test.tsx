import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

function goTo(tab: string) {
  fireEvent.click(screen.getByRole('button', { name: tab }))
}

/*
 * No screen in the visual target has an app-name bar above it — every screen
 * carries its own title. The bar used to sit above all of them, and its
 * safe-area padding stacked with the content's, pushing everything down.
 */
describe('App shell', () => {
  it('has no global app-name bar', () => {
    const { container } = render(<App />)

    expect(screen.queryByText('Gym App')).not.toBeInTheDocument()
    expect(container.querySelector('.app-header')).toBeNull()
  })

  it('starts on Home, which opens with the greeting rather than a page title', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /Hey Roberto/ })).toBeInTheDocument()
  })

  it('gives every other tab exactly one top-level heading', () => {
    render(<App />)

    goTo('Body')
    expect(screen.getByRole('heading', { level: 1, name: 'Body Overview' })).toBeInTheDocument()

    goTo('Workout')
    expect(screen.getByRole('heading', { level: 1, name: 'Workout Log' })).toBeInTheDocument()

    goTo('Progress')
    expect(screen.getByRole('heading', { level: 1, name: 'Progress Photos' })).toBeInTheDocument()

    goTo('Settings')
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
  })

  it('titles the sub-pages too', () => {
    render(<App />)

    goTo('Workout')
    fireEvent.click(screen.getByRole('button', { name: 'Exercises' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Exercises' })).toBeInTheDocument()

    goTo('Body')
    fireEvent.click(screen.getByRole('tab', { name: 'Measurements' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Body Measurements' })).toBeInTheDocument()
  })

  /*
   * Two headings of the same rank on one screen is the shape the old markup
   * kept drifting into — a page title plus a leftover section title styled the
   * same. One h1 per screen keeps the hierarchy readable to a screen reader.
   */
  it('never shows two page titles at once', () => {
    render(<App />)

    for (const tab of ['Body', 'Workout', 'Progress', 'Settings']) {
      goTo(tab)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    }
  })
})
