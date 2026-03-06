import { useState } from 'react'
import { useAthletes } from '../hooks/useAthletes'
import { supabase } from '../lib/supabase'

const SESSION_TYPES = ['Z2_Base', 'Intervals', 'Race_Sim', 'Benchmark', 'Monthly_Review']

const NORDIC_RATIOS = ['1:0.5', '1:0.75', '1:1', '1:1.5', 'N/A']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogSession({ selectedAthleteId, onSessionSaved }) {
  const { athletes } = useAthletes()

  const [athleteId, setAthleteId] = useState(selectedAthleteId || '')
  const [date, setDate] = useState(todayISO())
  const [sessionType, setSessionType] = useState('Z2_Base')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Shared fields
  const [duration, setDuration] = useState('')
  const [rpe, setRpe] = useState('')
  const [notes, setNotes] = useState('')

  // Intervals-specific
  const [nordicRatio, setNordicRatio] = useState('N/A')
  const [avgIntervalPower, setAvgIntervalPower] = useState('')

  // Benchmark-specific
  const [bodyWeight, setBodyWeight] = useState('')
  const [ftp, setFtp] = useState('')
  const [threeMinPower, setThreeMinPower] = useState('')
  const [peakPower, setPeakPower] = useState('')
  const [indoor, setIndoor] = useState(false)

  // Monthly Review-specific
  const [legFreshness, setLegFreshness] = useState('Green')
  const [lifeStress, setLifeStress] = useState('Low')

  // Sync athleteId when prop changes
  if (selectedAthleteId && selectedAthleteId !== athleteId) {
    setAthleteId(selectedAthleteId)
  }

  function resetForm() {
    setDuration('')
    setRpe('')
    setNotes('')
    setNordicRatio('N/A')
    setAvgIntervalPower('')
    setBodyWeight('')
    setFtp('')
    setThreeMinPower('')
    setPeakPower('')
    setIndoor(false)
    setLegFreshness('Green')
    setLifeStress('Low')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!athleteId) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const sessionData = {
      athlete_id: athleteId,
      date,
      session_type: sessionType,
      duration_mins: duration ? parseInt(duration) : null,
      rpe: rpe ? parseInt(rpe) : null,
      notes: notes.trim() || null,
    }

    if (sessionType === 'Intervals') {
      sessionData.nordic_ratio = nordicRatio !== 'N/A' ? nordicRatio : null
      sessionData.avg_interval_power = avgIntervalPower ? parseInt(avgIntervalPower) : null
    }

    if (sessionType === 'Benchmark') {
      sessionData.body_weight = bodyWeight ? parseFloat(bodyWeight) : null
      sessionData.ftp = ftp ? parseInt(ftp) : null
      sessionData.three_min_power = threeMinPower ? parseInt(threeMinPower) : null
      sessionData.peak_power = peakPower ? parseInt(peakPower) : null
      sessionData.indoor = indoor
    }

    if (sessionType === 'Monthly_Review') {
      sessionData.readiness_body = legFreshness
      sessionData.readiness_life = lifeStress
    }

    const { error: err } = await supabase.from('sessions').insert(sessionData)
    if (err) {
      setSaveError(err.message)
      setSaving(false)
      return
    }

    // If Benchmark: upsert athlete_profiles
    if (sessionType === 'Benchmark') {
      const profileData = {}
      if (ftp) profileData.current_ftp = parseInt(ftp)
      if (bodyWeight) profileData.current_weight = parseFloat(bodyWeight)
      if (threeMinPower) profileData.current_vo2_power = parseInt(threeMinPower)
      if (peakPower) profileData.current_peak_power = parseInt(peakPower)

      if (Object.keys(profileData).length > 0) {
        await supabase
          .from('athlete_profiles')
          .upsert({ athlete_id: athleteId, ...profileData }, { onConflict: 'athlete_id' })
      }
    }

    setSaving(false)
    setSaved(true)
    resetForm()
    if (onSessionSaved) onSessionSaved()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Top controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="form-label">Athlete</label>
          <select
            className="form-input"
            value={athleteId}
            onChange={e => setAthleteId(e.target.value)}
            required
          >
            <option value="">Select athlete…</option>
            {athletes.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Session Type</label>
          <select
            className="form-input"
            value={sessionType}
            onChange={e => setSessionType(e.target.value)}
          >
            {SESSION_TYPES.map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Z2_Base */}
      {sessionType === 'Z2_Base' && (
        <SessionFields
          duration={duration} setDuration={setDuration}
          rpe={rpe} setRpe={setRpe}
          notes={notes} setNotes={setNotes}
        />
      )}

      {/* Intervals */}
      {sessionType === 'Intervals' && (
        <>
          <SessionFields
            duration={duration} setDuration={setDuration}
            rpe={rpe} setRpe={setRpe}
            notes={notes} setNotes={setNotes}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Nordic Ratio</label>
              <select className="form-input" value={nordicRatio} onChange={e => setNordicRatio(e.target.value)}>
                {NORDIC_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Avg Interval Power (watts)</label>
              <input type="number" className="form-input" value={avgIntervalPower} onChange={e => setAvgIntervalPower(e.target.value)} placeholder="e.g. 280" min="0" />
            </div>
          </div>
        </>
      )}

      {/* Race_Sim */}
      {sessionType === 'Race_Sim' && (
        <SessionFields
          duration={duration} setDuration={setDuration}
          rpe={rpe} setRpe={setRpe}
          notes={notes} setNotes={setNotes}
        />
      )}

      {/* Benchmark */}
      {sessionType === 'Benchmark' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Body Weight (kg)</label>
              <input type="number" step="0.1" className="form-input" value={bodyWeight} onChange={e => setBodyWeight(e.target.value)} placeholder="e.g. 72.5" min="0" />
            </div>
            <div>
              <label className="form-label">FTP (watts)</label>
              <input type="number" className="form-input" value={ftp} onChange={e => setFtp(e.target.value)} placeholder="e.g. 265" min="0" />
            </div>
            <div>
              <label className="form-label">3-min Max Power (watts)</label>
              <input type="number" className="form-input" value={threeMinPower} onChange={e => setThreeMinPower(e.target.value)} placeholder="e.g. 340" min="0" />
            </div>
            <div>
              <label className="form-label">Peak / Sprint Power (watts)</label>
              <input type="number" className="form-input" value={peakPower} onChange={e => setPeakPower(e.target.value)} placeholder="e.g. 900" min="0" />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
              <input type="checkbox" checked={indoor} onChange={e => setIndoor(e.target.checked)} className="accent-navy" />
              Indoor test
            </label>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>
        </>
      )}

      {/* Monthly_Review */}
      {sessionType === 'Monthly_Review' && (
        <>
          <div>
            <label className="form-label">Leg Freshness</label>
            <div className="flex gap-4 mt-1">
              {['Green', 'Amber', 'Red'].map(v => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-text-secondary">
                  <input type="radio" name="legFreshness" value={v} checked={legFreshness === v} onChange={() => setLegFreshness(v)} className="accent-navy" />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Life Stress</label>
            <div className="flex gap-4 mt-1">
              {['Low', 'Medium', 'High'].map(v => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-text-secondary">
                  <input type="radio" name="lifeStress" value={v} checked={lifeStress === v} onChange={() => setLifeStress(v)} className="accent-navy" />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
          </div>
        </>
      )}

      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
      {saved && <p className="text-green-600 text-sm font-medium">Session saved ✓</p>}

      <button
        type="submit"
        disabled={saving || !athleteId}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Save Session'}
      </button>
    </form>
  )
}

function SessionFields({ duration, setDuration, rpe, setRpe, notes, setNotes }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Duration (mins)</label>
          <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 90" min="0" />
        </div>
        <div>
          <label className="form-label">RPE (1–10)</label>
          <input type="number" className="form-input" value={rpe} onChange={e => setRpe(e.target.value)} placeholder="e.g. 7" min="1" max="10" />
        </div>
      </div>
      <div>
        <label className="form-label">Notes</label>
        <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
      </div>
    </>
  )
}
