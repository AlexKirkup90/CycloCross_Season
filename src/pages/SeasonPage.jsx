import { useState, useEffect, useMemo } from 'react'
import { useSeasons } from '../hooks/useSeasons'
import { useSeasonWeeks } from '../hooks/useSeasonWeeks'
import { generateProgramme, getPhaseDistribution } from '../lib/programmeGenerator'

const PHASE_COLORS = {
  Foundation: '#8B5CF6',
  Base: '#3B82F6',
  Base2: '#60A5FA',
  Build: '#F97316',
  Build2: '#FB923C',
  Peak: '#EF4444',
  Taper: '#22C55E',
  Recovery: '#6B7280',
}

const PHASE_OPTIONS = ['Foundation', 'Base', 'Base2', 'Build', 'Build2', 'Peak', 'Taper', 'Recovery']
const PROGRAMME_LENGTHS = [8, 12, 16, 20, 24, 32, 48]

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatSeasonLabel(s) {
  const d = new Date(s.target_event_date + 'T00:00:00')
  const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${s.programme_name} — ${s.programme_weeks}wk — ${dateStr}`
}

function isCurrentWeek(weekStartDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(weekStartDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return today >= start && today < end
}

function getPhaseSummary(weeks) {
  const result = []
  let current = null
  let count = 0
  for (const w of weeks) {
    if (w.phase !== current) {
      if (current) result.push({ phase: current, weeks: count })
      current = w.phase
      count = 1
    } else {
      count++
    }
  }
  if (current) result.push({ phase: current, weeks: count })
  return result
}

const EMPTY_NP_FORM = {
  programmeName: '',
  targetEventName: '',
  targetEventDate: '',
  programmeWeeks: 16,
}

export default function SeasonPage({ selectedAthleteId }) {
  const { seasons, loading: seasonsLoading, createSeason } = useSeasons(selectedAthleteId)

  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [selectedWeekId, setSelectedWeekId] = useState(null)
  const [showNewProgramme, setShowNewProgramme] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')

  const [npForm, setNpForm] = useState(EMPTY_NP_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [weekForm, setWeekForm] = useState(null)
  const [weekSaving, setWeekSaving] = useState(false)
  const [weekSaved, setWeekSaved] = useState(false)

  const { weeks, loading: weeksLoading, updateWeek } = useSeasonWeeks(selectedSeasonId)

  // Reset UI when athlete changes
  useEffect(() => {
    setSelectedSeasonId(null)
    setSelectedWeekId(null)
    setShowNewProgramme(false)
    setWeekForm(null)
  }, [selectedAthleteId])

  // Auto-select first season when list loads
  useEffect(() => {
    if (!seasonsLoading && seasons.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasons[0].id)
    }
    if (!seasonsLoading && seasons.length === 0) {
      setSelectedSeasonId(null)
    }
  }, [seasons, seasonsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Populate week edit form when selection changes
  useEffect(() => {
    if (!selectedWeekId) { setWeekForm(null); return }
    const w = weeks.find(wk => wk.id === selectedWeekId)
    if (w) {
      setWeekForm({
        phase: w.phase,
        key_session: w.key_session || '',
        event_note: w.event_note || '',
        week_tss_target: w.week_tss_target,
        is_race_week: w.is_race_week || false,
        is_cutback_week: w.is_cutback_week || false,
      })
      setWeekSaved(false)
    }
  }, [selectedWeekId, weeks])

  const selectedWeek = weeks.find(w => w.id === selectedWeekId)
  const phaseSummary = useMemo(() => getPhaseSummary(weeks), [weeks])
  const phasePreview = useMemo(() => getPhaseDistribution(npForm.programmeWeeks), [npForm.programmeWeeks])

  async function handleCreateProgramme() {
    if (!npForm.programmeName.trim() || !npForm.targetEventDate) return
    setCreating(true)
    setCreateError(null)
    try {
      const { season, weeks: generatedWeeks } = generateProgramme({
        targetEventDate: npForm.targetEventDate,
        programmeWeeks: npForm.programmeWeeks,
        programmeName: npForm.programmeName.trim(),
        targetEventName: npForm.targetEventName.trim(),
      })
      const newSeason = await createSeason(season, generatedWeeks)
      setSelectedSeasonId(newSeason.id)
      setSelectedWeekId(null)
      setShowNewProgramme(false)
      setNpForm(EMPTY_NP_FORM)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveWeek() {
    if (!selectedWeekId || !weekForm) return
    setWeekSaving(true)
    setWeekSaved(false)
    try {
      await updateWeek(selectedWeekId, weekForm)
      setWeekSaved(true)
      setTimeout(() => setWeekSaved(false), 3000)
    } catch (err) {
      console.error('Week save error:', err)
    } finally {
      setWeekSaving(false)
    }
  }

  if (!selectedAthleteId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Season Map</h1>
        <p className="text-text-secondary mb-6">Build and manage training programmes</p>
        <div className="card text-center py-12">
          <p className="text-text-muted">Select an athlete from the top bar to view their season map</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Season Map</h1>
      <p className="text-text-secondary mb-4">Build and manage training programmes</p>

      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          className="form-input w-auto"
          style={{ minWidth: '260px' }}
          value={selectedSeasonId || ''}
          onChange={e => {
            setSelectedSeasonId(e.target.value || null)
            setSelectedWeekId(null)
            setShowNewProgramme(false)
          }}
        >
          {seasons.length === 0
            ? <option value="">No programmes yet — create one</option>
            : seasons.map(s => (
                <option key={s.id} value={s.id}>{formatSeasonLabel(s)}</option>
              ))
          }
        </select>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setShowNewProgramme(v => !v)
            setSelectedWeekId(null)
          }}
        >
          {showNewProgramme ? '✕ Cancel' : '+ New Programme'}
        </button>
      </div>

      {/* Phase pills */}
      {phaseSummary.length > 0 && !weeksLoading && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {phaseSummary.map((p, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: PHASE_COLORS[p.phase] || '#6B7280' }}
              >
                {p.phase} · {p.weeks}w
              </span>
              {i < phaseSummary.length - 1 && (
                <span className="text-text-muted text-xs">→</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Main two-panel layout */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* LEFT — Compact week grid (fixed 240px on desktop) */}
        <div className="md:w-60 flex-shrink-0">
          {weeksLoading ? (
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : weeks.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5">
              {weeks.map(week => {
                const isCurrent = isCurrentWeek(week.week_start_date)
                const isSelected = week.id === selectedWeekId
                return (
                  <button
                    key={week.id}
                    type="button"
                    onClick={() => {
                      setSelectedWeekId(prev => prev === week.id ? null : week.id)
                      setShowNewProgramme(false)
                      setActiveTab('edit')
                    }}
                    className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky bg-sky/10'
                        : isCurrent
                        ? 'border-sky/50 bg-sky/5'
                        : 'border-border bg-white hover:border-border-strong'
                    } ${isCurrent ? 'ring-2 ring-sky ring-offset-1' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-text-muted leading-none">
                        W{week.week_number}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PHASE_COLORS[week.phase] || '#6B7280' }}
                      />
                    </div>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {formatShortDate(week.week_start_date)}
                    </p>
                    <p className="text-[10px] font-semibold text-text-primary mt-0.5 leading-tight">
                      {week.week_tss_target}
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {week.is_cutback_week && <span className="text-[9px]">⚡</span>}
                      {week.is_race_week && <span className="text-[9px]">🏁</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : !showNewProgramme ? (
            <div className="card text-center py-8">
              <p className="text-text-muted text-sm">No weeks yet</p>
            </div>
          ) : null}
        </div>

        {/* RIGHT — New Programme form / Week detail / empty state */}
        <div className="flex-1 min-w-0">

          {showNewProgramme ? (
            /* New Programme Form */
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-5">New Programme</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Programme Name</label>
                  <input
                    className="form-input"
                    value={npForm.programmeName}
                    onChange={e => setNpForm(f => ({ ...f, programmeName: e.target.value }))}
                    placeholder="e.g. National CX Season 2026"
                  />
                </div>
                <div>
                  <label className="form-label">Target Event Name</label>
                  <input
                    className="form-input"
                    value={npForm.targetEventName}
                    onChange={e => setNpForm(f => ({ ...f, targetEventName: e.target.value }))}
                    placeholder="e.g. National Championships"
                  />
                </div>
                <div>
                  <label className="form-label">Target Event Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={npForm.targetEventDate}
                    onChange={e => setNpForm(f => ({ ...f, targetEventDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Programme Length</label>
                  <select
                    className="form-input"
                    value={npForm.programmeWeeks}
                    onChange={e => setNpForm(f => ({ ...f, programmeWeeks: Number(e.target.value) }))}
                  >
                    {PROGRAMME_LENGTHS.map(n => (
                      <option key={n} value={n}>{n} weeks</option>
                    ))}
                  </select>
                </div>

                {/* Phase preview */}
                {phasePreview.length > 0 && (
                  <div>
                    <p className="form-label">Phase Preview</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {phasePreview.map((p, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: PHASE_COLORS[p.phase] || '#6B7280' }}
                          >
                            {p.phase} · {p.weeks}w
                          </span>
                          {i < phasePreview.length - 1 && (
                            <span className="text-text-muted text-xs">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {createError && <p className="text-red-600 text-sm">{createError}</p>}

                <button
                  type="button"
                  onClick={handleCreateProgramme}
                  disabled={creating || !npForm.programmeName.trim() || !npForm.targetEventDate}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating…' : 'Create Programme'}
                </button>
              </div>
            </div>

          ) : selectedWeek && weekForm ? (
            /* Week Detail */
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Week {selectedWeek.week_number}
                  </h2>
                  <p className="text-sm text-text-muted">
                    {formatShortDate(selectedWeek.week_start_date)}
                    {' · '}
                    <span
                      className="font-semibold"
                      style={{ color: PHASE_COLORS[selectedWeek.phase] || '#6B7280' }}
                    >
                      {selectedWeek.phase}
                    </span>
                    {selectedWeek.is_cutback_week && ' · ⚡ Cutback'}
                    {selectedWeek.is_race_week && ' · 🏁 Race'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWeekId(null)}
                  className="btn-ghost text-sm px-3 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 mb-5 border-b border-border">
                {['edit', 'sessions'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'border-sky text-sky-dark'
                        : 'border-transparent text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {tab === 'edit' ? 'Edit Week' : 'Plan Sessions'}
                  </button>
                ))}
              </div>

              {activeTab === 'edit' ? (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Phase</label>
                    <select
                      className="form-input"
                      value={weekForm.phase}
                      onChange={e => setWeekForm(f => ({ ...f, phase: e.target.value }))}
                    >
                      {PHASE_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Key Session</label>
                    <input
                      className="form-input"
                      value={weekForm.key_session}
                      onChange={e => setWeekForm(f => ({ ...f, key_session: e.target.value }))}
                      placeholder="e.g. 3×10min threshold intervals"
                    />
                  </div>
                  <div>
                    <label className="form-label">Event Note</label>
                    <input
                      className="form-input"
                      value={weekForm.event_note}
                      onChange={e => setWeekForm(f => ({ ...f, event_note: e.target.value }))}
                      placeholder="e.g. Local CX race Saturday"
                    />
                  </div>
                  <div>
                    <label className="form-label">TSS Target</label>
                    <input
                      type="number"
                      className="form-input"
                      value={weekForm.week_tss_target}
                      min={0}
                      max={1000}
                      onChange={e => setWeekForm(f => ({ ...f, week_tss_target: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex gap-6 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={weekForm.is_race_week}
                        onChange={e => setWeekForm(f => ({ ...f, is_race_week: e.target.checked }))}
                        className="accent-sky-500"
                      />
                      Race Week 🏁
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={weekForm.is_cutback_week}
                        onChange={e => setWeekForm(f => ({ ...f, is_cutback_week: e.target.checked }))}
                        className="accent-sky-500"
                      />
                      Cutback Week ⚡
                    </label>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveWeek}
                      disabled={weekSaving}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {weekSaving ? 'Saving…' : 'Save Week'}
                    </button>
                    {weekSaved && (
                      <span className="text-sm text-green-600 font-medium">Saved ✓</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-text-muted text-sm italic">
                    Plan Sessions — Coming in Phase 5
                  </p>
                </div>
              )}
            </div>

          ) : !seasonsLoading && seasons.length === 0 ? (
            /* No seasons yet */
            <div className="card text-center py-12">
              <p className="text-text-muted mb-4">No programmes yet for this athlete</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowNewProgramme(true)}
              >
                + New Programme
              </button>
            </div>

          ) : weeks.length > 0 ? (
            /* Weeks loaded but none selected */
            <div className="card text-center py-12">
              <p className="text-text-muted text-sm">Select a week to view and edit details</p>
            </div>

          ) : null}
        </div>
      </div>
    </div>
  )
}
