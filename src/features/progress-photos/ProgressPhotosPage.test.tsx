import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ProgressPhotosPage } from './ProgressPhotosPage'
import { PHOTO_ANGLES, type PhotoAngle } from './types'
import { getAllPhotoSets, savePhotoSet } from './db'

// jsdom has neither IndexedDB nor a canvas, so the storage layer and the
// resizer are stubbed and driven directly — including their failure modes.
vi.mock('./db', () => ({
  getAllPhotoSets: vi.fn(async () => []),
  savePhotoSet: vi.fn(async () => undefined),
}))

vi.mock('./resizeImage', () => ({
  resizeImage: vi.fn(async () => new Blob(['resized'], { type: 'image/jpeg' })),
}))

const getAllMock = vi.mocked(getAllPhotoSets)
const saveMock = vi.mocked(savePhotoSet)

function fileInput(angle: PhotoAngle) {
  return document.getElementById(`photo-${angle}`) as HTMLInputElement
}

async function selectAllPhotos() {
  for (const angle of PHOTO_ANGLES) {
    fireEvent.change(fileInput(angle), {
      target: { files: [new File(['raw'], `${angle}.jpg`, { type: 'image/jpeg' })] },
    })
  }
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add photos' })).toBeEnabled())
}

beforeEach(() => {
  getAllMock.mockReset().mockImplementation(async () => [])
  saveMock.mockReset().mockImplementation(async () => undefined)
})

describe('ProgressPhotosPage', () => {
  /*
   * The whole point of HIGH 1: when IndexedDB refuses the write, the photos
   * must still be in the form and the user must be told. Before the fix the
   * selection was cleared before the save even finished.
   */
  it('keeps the photos and explains itself when IndexedDB refuses the write', async () => {
    saveMock.mockRejectedValue(new DOMException('exceeded', 'QuotaExceededError'))
    render(<ProgressPhotosPage />)
    await selectAllPhotos()

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => {
      expect(screen.getByText(/out of storage space/i)).toBeInTheDocument()
    })
    expect(screen.getAllByText(/✓/)).toHaveLength(4)
    // Nothing was added to the gallery.
    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })

  it('lets the same photos be saved on a second attempt once storage frees up', async () => {
    saveMock.mockRejectedValueOnce(new DOMException('exceeded', 'QuotaExceededError'))
    render(<ProgressPhotosPage />)
    await selectAllPhotos()

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))
    await waitFor(() => expect(screen.getByText(/out of storage space/i)).toBeInTheDocument())

    // Same selection, no re-picking of files.
    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => expect(screen.queryAllByText(/✓/)).toHaveLength(0))
    expect(saveMock).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('No photos yet.')).not.toBeInTheDocument()
  })

  it('saves a complete set of four images with the chosen date', async () => {
    render(<ProgressPhotosPage />)
    await selectAllPhotos()
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-15' } })

    fireEvent.click(screen.getByRole('button', { name: 'Add photos' }))

    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(1))
    const saved = saveMock.mock.calls[0][0]
    expect(saved.date).toBe('2026-07-15')
    expect(Object.keys(saved.photos).sort()).toEqual(['back', 'front', 'left', 'right'])
  })

  it('reports a failure to open the database instead of showing an empty gallery', async () => {
    getAllMock.mockRejectedValue(new Error('database is not available'))
    render(<ProgressPhotosPage />)

    await waitFor(() => {
      expect(screen.getByText(/could not load photos: database is not available/i)).toBeInTheDocument()
    })
  })

  /*
   * Unreadable sets used to be deleted on sight. They still cannot be shown,
   * but destroying the record is not something the app should do silently.
   */
  it('skips unreadable photo sets without deleting them, and says so', async () => {
    getAllMock.mockResolvedValue([
      { id: 'good', date: '2026-07-15', photos: Object.fromEntries(PHOTO_ANGLES.map((a) => [a, new Blob(['x'])])) },
      { id: 'broken', date: '2026-07-10', photos: {} },
    ] as never)
    render(<ProgressPhotosPage />)

    await waitFor(() => {
      expect(screen.getByText(/1 saved photo set could not be read/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/nothing was deleted/i)).toBeInTheDocument()
    expect(screen.getByText('2026-07-15')).toBeInTheDocument()
  })
})
