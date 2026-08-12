import { dayLabel } from '../../shared/localDate'
import type { Measurement } from './types'
import { formatDelta, latestDate, measurementRows, type FieldSpec } from './measurementStats'

interface KeyMeasurementsProps {
  measurements: Measurement[]
  fields: FieldSpec[]
  title: string
  /** Shown when there is nothing measured yet for these fields. */
  emptyHint: string
}

/*
 * Un cerculeț cu inițiala. Mockup-ul are o iconiță per rând; a desena opt
 * pictograme distincte (piept, talie, șold, gât, braț, coapsă…) ar fi o
 * grămadă de SVG pentru foarte puțină informație — inițiala distinge rândurile
 * la fel de bine la dimensiunea asta, iar numele e oricum scris lângă.
 */
function RowIcon({ label }: { label: string }) {
  return <span className="key-measurement-icon" aria-hidden="true">{label.charAt(0)}</span>
}

/**
 * Ultima măsurătoare, cu cât s-a schimbat fiecare valoare față de cea dinainte.
 *
 * Delta e miezul cardului: în tabelul de istoric diferența trebuia calculată în
 * cap, uitându-te de la un rând la altul.
 *
 * **Săgeata arată direcția, nu o judecată.** Nu colorăm „bine" și „rău" pentru
 * că nu există un răspuns care să fie corect pentru toate rândurile: la talie
 * scăderea e de obicei ținta, la braț creșterea. Un verde pe tot ar spune că
 * orice schimbare e un progres, iar verde-sus/roșu-jos ar face din câțiva
 * centimetri pierduți în talie un eșec.
 */
export function KeyMeasurements({ measurements, fields, title, emptyHint }: KeyMeasurementsProps) {
  const rows = measurementRows(measurements, fields)
  const date = latestDate(measurements)

  return (
    <section className="key-measurements card">
      <div className="key-measurements-head">
        <h3>{title}</h3>
        {date && <span>{dayLabel(date)}</span>}
      </div>

      {rows.length === 0 ? (
        <p className="key-measurements-empty">{emptyHint}</p>
      ) : (
        <ul className="key-measurement-list">
          {rows.map((row) => (
            <li key={row.key}>
              <RowIcon label={row.label} />
              <span className="key-measurement-name">{row.label}</span>
              <strong className="key-measurement-value">
                {row.value}
                <small>{row.unit}</small>
              </strong>
              {row.delta === null ? (
                <span className="key-measurement-delta is-first">first</span>
              ) : row.delta === 0 ? (
                <span className="key-measurement-delta is-flat">no change</span>
              ) : (
                <span className="key-measurement-delta">
                  <span aria-hidden="true">{row.delta > 0 ? '▲' : '▼'}</span>
                  {formatDelta(row.delta)}
                  {row.unit}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
