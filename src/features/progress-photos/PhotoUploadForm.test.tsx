import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PHOTO_ANGLES, type PhotoAngle } from './types'
import { resizeImage } from './resizeImage'

// jsdom has no canvas or image decoder, and the resizing itself is not what
// these tests are about.
vi.mock('./resizeImage', () => ({
  resizeImage: vi.fn(async () => new Blob(['resized'], { type: 'image/jpeg' })),
}))

const resizeImageMock = vi.mocked(resizeImage)

function fileInput(angle: PhotoAngle) {
  return document.getElementById(`photo-${angle}`) as HTMLInputElement
}

async function selectAllPhotos() {
  for (const angle of PHOTO_ANGLES) {
    fireEvent.change(fileInput(angle), {
      target: { files: [new File(['raw'], `${angle}.jpg`, { type: 'image/jpeg' })] },
    })
  }
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Add photos' })).toBeEnabled()
  })
}

const selectedCount = () => screen.getAllByText(/✓/).length

beforeEach(() => {
  resizeImageMock.mockClear()
  resizeImageMock.mockImplementation(async () => new Blob(['resized'], { type: 'image/jpeg' }))
})

describe('PhotoUploadForm', () => {
  it('cannot be submitted until all four angles are selected', async () => {
    render(<PhotoUploadForm onAdd={vi.fn(async () => true)} />)

    expect(screen.getByRole('button', { name: 'Add photos' })).toBeDisabled()

    fireEvent.change(fileInput('front'), {
      target: { files: [new File(['raw'], 'front.jpg', { type: 'image/jpeg' })] },
    })
    await waitFor(() => expect(selectedCount()).toBe(1))

    expect(screen.getByRole('button', { name: 'Add photos' })).toBeDisabled()
  })

  it('clears the selection once the save has completed', async () => {
    const onAdd = vi.fn(async () => true)
    render(<PhotoUploadForm onAdd={onAdd} />)
    await selectAllPhotos()

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => expect(screen.queryAllByText(/✓/)).toHaveLength(0))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  /*
   * The original bug: the form called onAdd without awaiting it and cleared the
   * selection immediately, so when IndexedDB refused the write the photos were
   * gone from the form and never stored anywhere. Nothing told the user.
   */
  it('keeps the selected photos when the save is refused', async () => {
    render(<PhotoUploadForm onAdd={vi.fn(async () => false)} />)
    await selectAllPhotos()
    expect(selectedCount()).toBe(4)

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/not saved/i)
    })
    expect(selectedCount()).toBe(4)
    expect(screen.getByRole('button', { name: 'Add photos' })).toBeEnabled()
  })

  it('keeps the selected photos when the save throws', async () => {
    const onAdd = vi.fn(async () => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })
    render(<PhotoUploadForm onAdd={onAdd} />)
    await selectAllPhotos()

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/not saved/i))
    expect(selectedCount()).toBe(4)
  })

  it('does not clear the selection while the save is still running', async () => {
    let finishSave: (saved: boolean) => void = () => {}
    const onAdd = vi.fn(() => new Promise<boolean>((resolve) => (finishSave = resolve)))
    render(<PhotoUploadForm onAdd={onAdd} />)
    await selectAllPhotos()

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    // Mid-save: the button is busy and the photos are still held.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled())
    expect(selectedCount()).toBe(4)

    finishSave(true)
    await waitFor(() => expect(screen.queryAllByText(/✓/)).toHaveLength(0))
  })

  it('cannot be submitted twice while a save is in flight', async () => {
    const onAdd = vi.fn(() => new Promise<boolean>(() => {}))
    render(<PhotoUploadForm onAdd={onAdd} />)
    await selectAllPhotos()

    const button = screen.getByRole('button', { name: 'Add photos' })
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled())
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  /*
   * A failed resize used to leave `processingAngle` set forever and produced an
   * unhandled rejection, with no indication of which photo was the problem.
   */
  it('reports which photo failed to process and keeps the others', async () => {
    resizeImageMock.mockImplementation(async (file: File) => {
      if (file.name.startsWith('back')) throw new Error('unsupported format')
      return new Blob(['resized'], { type: 'image/jpeg' })
    })
    render(<PhotoUploadForm onAdd={vi.fn(async () => true)} />)

    for (const angle of PHOTO_ANGLES) {
      fireEvent.change(fileInput(angle), {
        target: { files: [new File(['raw'], `${angle}.jpg`, { type: 'image/jpeg' })] },
      })
    }

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/could not process this image/i)
    })
    // Three good photos survive the one failure.
    expect(selectedCount()).toBe(3)
    // And with an angle missing, the form refuses to submit a partial set.
    expect(screen.getByRole('button', { name: 'Add photos' })).toBeDisabled()
    expect(screen.queryByText(/processing…/)).not.toBeInTheDocument()
  })

  it('does not leave a stuck "processing…" label after a failure', async () => {
    resizeImageMock.mockImplementation(async () => {
      throw new Error('decode failed')
    })
    render(<PhotoUploadForm onAdd={vi.fn(async () => true)} />)

    fireEvent.change(fileInput('front'), {
      target: { files: [new File(['raw'], 'front.jpg', { type: 'image/jpeg' })] },
    })

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.queryByText(/processing…/)).not.toBeInTheDocument()
  })

  it('defaults the date to the local calendar day', () => {
    render(<PhotoUploadForm onAdd={vi.fn(async () => true)} />)

    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`

    expect(screen.getByLabelText('Date')).toHaveValue(expected)
  })
})
