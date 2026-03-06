import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAthleteProfile } from '../hooks/useAthleteProfile'

const DISCIPLINES = ['CX', 'Road', 'CX+Road', 'Gravel']
const EXPERIENCES = ['Beginner', 'Intermediate', 'Elite']
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const DURATION_OPTIONS = [30, 60, 90, 120, 180]

function buildInitialForm(athlete, profile) {
  return {
    discipline: athlete?.discipline || 'CX',
    experience: athlete?.experience || 'Beginner',
    has_turbo: profile?.has_turbo || false,
    has_wattbike: profile?.has_wattbike || false,
    has_outdoor_road: profile?.has_outdoor_road || false,
    has_outdoor_cx: profile?.has_outdoor_cx || false,
    available_days: profile?.available_days || [],
    max_sessions_week: profile?.max_sessions_week ?? 5,
    max_session_mins: profile?.max_session_mins ?? 60,
  }
}

export default function AthleteProfile({ athlete, onUpdate }) {
  const { profile, loading, updateProfile } = useAthleteProfile(athlete?.id)

  const [form, setForm] = useState(() => buildInitialForm(athlete, null))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Populate form once profile loads
  useEffect(() => {
    if (!loading) {
      setForm(buildInitialForm(athlete, profile))
    }
  }, [loading, profile, athlete])

  function toggleDay(day) {
    setForm(f => {
      const days = f.available_days.includes(day)
        ? f.available_days.filter(d => d !== day)
        : [...f.available_days, day]
      return { ...f, available_days: days }
    })
  }

  function stepSessions(delta) {
    setForm(f => ({
      ...f,
      max_sessions_week: Math.min(14, Math.max(1, f.max_sessions_week + delta)),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      // Upsert athlete_profiles
      await updateProfile({
        has_turbo: form.has_turbo,
        has_wattbike: form.has_wattbike,
        has_outdoor_road: form.has_outdoor_road,
        has_outdoor_cx: form.has_outdoor_cx,
        available_days: form.available_days,
        max_sessions_week: form.max_sessions_week,
        max_session_mins: form.max_session_mins,
      })

      // Update athletes table: discipline + experience
      const { error: athErr } = await supabase
        .from('athletes')
        .update({ discipline: form.discipline, experience: form.experience })
        .eq('id', athlete.id)
      if (athErr) throw athErr

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (onUpdate) onUpdate()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasBenchmarks =
    profile?.current_ftp || profile?.current_vo2_power || profile?.current_peak_power

  const wPerKg =
    profile?.current_ftp && profile?.current_weight
      ? (profile.current_ftp / profile.current_weight).toFixed(1)
      : null

  if (loading) {
    return (
      <div className="py-6 text-center text-text-muted text-sm animate-pulse">
        Loading profile…
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">

      {/* Section 1 — Discipline */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Discipline
        </h3>
        <div className="flex gap-4 flex-wrap">
          {DISCIPLINES.map(d => (
            <label key={d} className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
              <input
                type="radio"
                name={`discipline-${athlete.id}`}
                value={d}
                checked={form.discipline === d}
                onChange={() => setForm(f => ({ ...f, discipline: d }))}
                className="accent-sky-500"
              />
              {d}
            </label>
          ))}
        </div>
      </section>

      {/* Section 2 — Indoor Equipment */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Indoor Equipment
        </h3>
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.has_turbo}
              onChange={e => setForm(f => ({ ...f, has_turbo: e.target.checked }))}
              className="accent-sky-500"
            />
            Turbo Trainer
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.has_wattbike}
              onChange={e => setForm(f => ({ ...f, has_wattbike: e.target.checked }))}
              className="accent-sky-500"
            />
            WattBike
          </label>
        </div>
      </section>

      {/* Section 3 — Outdoor Access */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Outdoor Access
        </h3>
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.has_outdoor_road}
              onChange={e => setForm(f => ({ ...f, has_outdoor_road: e.target.checked }))}
              className="accent-sky-500"
            />
            Road riding
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.has_outdoor_cx}
              onChange={e => setForm(f => ({ ...f, has_outdoor_cx: e.target.checked }))}
              className="accent-sky-500"
            />
            CX terrain
          </label>
        </div>
      </section>

      {/* Section 4 — Available Training Days */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Available Training Days
        </h3>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(day => {
            const active = form.available_days.includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-11 h-11 rounded-lg text-sm font-semibold transition-colors cursor-pointer border ${
                  active
                    ? 'bg-sky text-white border-sky-dark'
                    : 'bg-surface-tertiary text-text-muted border-border'
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            )
          })}
        </div>
      </section>

      {/* Section 5 — Session Limits */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Session Limits
        </h3>
        <div className="flex gap-8 flex-wrap items-end">
          {/* Stepper */}
          <div>
            <label className="form-label">Max sessions per week</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => stepSessions(-1)}
                disabled={form.max_sessions_week <= 1}
                className="w-8 h-8 rounded-lg bg-surface-tertiary border border-border text-text-primary font-bold text-lg disabled:opacity-40 cursor-pointer hover:bg-border transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-text-primary">
                {form.max_sessions_week}
              </span>
              <button
                type="button"
                onClick={() => stepSessions(1)}
                disabled={form.max_sessions_week >= 14}
                className="w-8 h-8 rounded-lg bg-surface-tertiary border border-border text-text-primary font-bold text-lg disabled:opacity-40 cursor-pointer hover:bg-border transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Duration select */}
          <div>
            <label className="form-label">Max session duration</label>
            <select
              value={form.max_session_mins}
              onChange={e => setForm(f => ({ ...f, max_session_mins: Number(e.target.value) }))}
              className="form-input mt-1 w-40"
            >
              {DURATION_OPTIONS.map(mins => (
                <option key={mins} value={mins}>
                  {mins === 180 ? '180+ mins' : `${mins} mins`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 6 — Experience Level */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Experience Level
        </h3>
        <div className="flex gap-4 flex-wrap">
          {EXPERIENCES.map(ex => (
            <label key={ex} className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
              <input
                type="radio"
                name={`experience-${athlete.id}`}
                value={ex}
                checked={form.experience === ex}
                onChange={() => setForm(f => ({ ...f, experience: ex }))}
                className="accent-sky-500"
              />
              {ex}
            </label>
          ))}
        </div>
      </section>

      {/* Section 7 — Current Benchmarks (read-only) */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
          Current Benchmarks
        </h3>
        {hasBenchmarks ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
              <div className="bg-surface-tertiary rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">FTP</p>
                <p className="font-bold text-text-primary">
                  {profile.current_ftp ? `${profile.current_ftp} W` : '—'}
                </p>
              </div>
              <div className="bg-surface-tertiary rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">W/kg</p>
                <p className="font-bold text-text-primary">
                  {wPerKg ? wPerKg : '—'}
                </p>
              </div>
              <div className="bg-surface-tertiary rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">VO2 Power</p>
                <p className="font-bold text-text-primary">
                  {profile.current_vo2_power ? `${profile.current_vo2_power} W` : '—'}
                </p>
              </div>
              <div className="bg-surface-tertiary rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Peak Power</p>
                <p className="font-bold text-text-primary">
                  {profile.current_peak_power ? `${profile.current_peak_power} W` : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-muted italic">
              Auto-updated from Benchmark sessions
            </p>
          </>
        ) : (
          <p className="text-sm text-text-muted italic">
            No benchmark data — log a Benchmark session
          </p>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Profile saved ✓</span>
        )}
        {saveError && (
          <span className="text-sm text-red-600">{saveError}</span>
        )}
      </div>
    </div>
  )
}
