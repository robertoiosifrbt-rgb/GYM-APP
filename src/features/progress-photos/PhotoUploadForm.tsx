import { useState } from 'react'

interface PhotoUploadFormProps {
  onAdd: (date: string, file: File) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function PhotoUploadForm({ onAdd }: PhotoUploadFormProps) {
  const [date, setDate] = useState(today())
  const [file, setFile] = useState<File | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file) return
    onAdd(date, file)
    setFile(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="photo-date">Date</label>
        <input
          id="photo-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="photo-file">Photo</label>
        <input
          id="photo-file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>

      <button type="submit">Add photo</button>
    </form>
  )
}
