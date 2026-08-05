export function UpdateBanner() {
  return (
    <div className="update-banner">
      <span>A new version is available.</span>
      <button type="button" onClick={() => location.reload()}>
        Reload
      </button>
    </div>
  )
}
