interface HomePageProps {
  onStartWorkout: () => void
}

export function HomePage({ onStartWorkout }: HomePageProps) {
  return (
    <section>
      <h2>Gym App</h2>
      <button type="button" onClick={onStartWorkout}>
        Start workout
      </button>
    </section>
  )
}
