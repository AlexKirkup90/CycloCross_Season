import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useAthletes from '../hooks/useAthletes'

const SESSION_TYPES = ['Z2_Base', 'Intervals', 'Race_Sim', 'Benchmark', 'Monthly_Review']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogSession({ selectedAthleteId, onSessionSaved }) {
  const { athletes } = useAthletes()
  const [athleteId, setAthleteId] = useState(selectedAthleteId || '')
  const [date, setDate] = useState(todayIso())
  const [sessionType, setSessionType] = useState('Z2_Base')
  const [duration, setDuration] = useState('')
  const [rpe, setRpe] = useState('')
  const [ratio, setRatio] = useState('N/A')
  const [intervalPower, setIntervalPower] = useState('')
  const [bodyWeight, setBodyWeight] = useState('')
  const [ftp, setFtp] = useState('')
  const [vo2, setVo2] = useState('')
  const [peak, setPeak] = useState('')
  const [isIndoor, setIsIndoor] = useState(false)
  const [readinessBody, setReadinessBody] = useState('Green')
  const [readinessLife, setReadinessLife] = useState('Low')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setAthleteId(selectedAthleteId || '')
  }, [selectedAthleteId])

  function resetFields() {
    setDuration('')
    setRpe('')
    setRatio('N/A')
    setIntervalPower('')
    setBodyWeight('')
    setFtp('')
    setVo2('')
    setPeak('')
    setIsIndoor(false)
    setReadinessBody('Green')
    setReadinessLife('Low')
    setNotes('')
  }

  async function handleSave(e) {
    e.preventDefault()

    if (!athleteId) {
      setError('Please select an athlete')
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    const payload = {
      athlete_id: athleteId,
      date,
      session_type: sessionType,
      metric1: duration ? Number(duration) : null,
      metric2: rpe ? Number(rpe) : null,
      notes: notes || null,
      bw: bodyWeight ? Number(bodyWeight) : null,
      ftp: ftp ? Number(ftp) : null,
      vo2: vo2 ? Number(vo2) : null,
      peak: peak ? Number(peak) : null,
      is_indoor: sessionType === 'Benchmark' ? isIndoor : null,
      ratio: sessionType === 'Intervals' ? ratio : null,
      interval_power: sessionType === 'Intervals' && intervalPower ? Number(intervalPower) : null,
      readiness_body: sessionType === 'Monthly_Review' ? readinessBody : null,
      readiness_life: sessionType === 'Monthly_Review' ? readinessLife : null,
    }

    const { error: insertError } = await supabase.from('sessions').insert(payload)

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    if (sessionType === 'Benchmark') {
      const { error: upsertError } = await supabase
        .from('athlete_profiles')
        .upsert(
          {
            athlete_id: athleteId,
            current_ftp: ftp ? Number(ftp) : null,
            current_weight: bodyWeight ? Number(bodyWeight) : null,
            current_vo2_power: vo2 ? Number(vo2) : null,
            current_peak_power: peak ? Number(peak) : null,
          },
          { onConflict: 'athlete_id' },
        )

      if (upsertError) {
        setError(upsertError.message)
        setSaving(false)
        return
      }
    }

    setMessage('Session saved ✓')
    resetFields()
    setSaving(false)
    if (onSessionSaved) onSessionSaved()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">{message}</div>}
      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

      <div>
        <label className="form-label">Athlete selector</label>
        <select className="form-input" value={athleteId} onChange={e => setAthleteId(e.target.value)} required>
          <option value="">Select athlete</option>
          {athletes.map(athlete => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Session type</label>
          <select className="form-input" value={sessionType} onChange={e => setSessionType(e.target.value)}>
            {SESSION_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(sessionType === 'Z2_Base' || sessionType === 'Intervals' || sessionType === 'Race_Sim') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Duration (minutes)</label>
            <input type="number" min="0" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="form-label">RPE (1–10)</label>
            <input type="number" min="1" max="10" className="form-input" value={rpe} onChange={e => setRpe(e.target.value)} />
          </div>
        </div>
      )}

      {sessionType === 'Intervals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nordic Ratio</label>
            <select className="form-input" value={ratio} onChange={e => setRatio(e.target.value)}>
              <option value="1:0.5">1:0.5</option>
              <option value="1:0.75">1:0.75</option>
              <option value="1:1">1:1</option>
              <option value="1:1.5">1:1.5</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
          <div>
            <label className="form-label">Average Interval Power (watts)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={intervalPower}
              onChange={e => setIntervalPower(e.target.value)}
            />
          </div>
        </div>
      )}

      {sessionType === 'Benchmark' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Body Weight (kg)</label>
              <input type="number" min="0" step="0.1" className="form-input" value={bodyWeight} onChange={e => setBodyWeight(e.target.value)} />
            </div>
            <div>
              <label className="form-label">FTP (watts)</label>
              <input type="number" min="0" className="form-input" value={ftp} onChange={e => setFtp(e.target.value)} />
            </div>
            <div>
              <label className="form-label">3-min Max Power (watts)</label>
              <input type="number" min="0" className="form-input" value={vo2} onChange={e => setVo2(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Peak Power / Sprint (watts)</label>
              <input type="number" min="0" className="form-input" value={peak} onChange={e => setPeak(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={isIndoor} onChange={e => setIsIndoor(e.target.checked)} />
            Indoor session
          </label>
        </>
      )}

      {sessionType === 'Monthly_Review' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Leg Freshness</label>
            <div className="flex gap-4 text-sm text-text-secondary">
              {['Green', 'Amber', 'Red'].map(option => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="readiness_body"
                    value={option}
                    checked={readinessBody === option}
                    onChange={e => setReadinessBody(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Life Stress</label>
            <div className="flex gap-4 text-sm text-text-secondary">
              {['Low', 'Medium', 'High'].map(option => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="readiness_life"
                    value={option}
                    checked={readinessLife === option}
                    onChange={e => setReadinessLife(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">Notes</label>
        <textarea className="form-input min-h-24" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <button type="submit" className="btn-navy" disabled={saving}>
        {saving ? 'Saving...' : 'Save Session'}
      </button>
    </form>
  )
}
