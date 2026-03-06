// Pure JS — no React, no Supabase

const PHASE_DISTRIBUTIONS = {
  8:  [['Peak', 0.50], ['Taper', 0.50]],
  12: [['Build', 0.42], ['Peak', 0.33], ['Taper', 0.25]],
  16: [['Base', 0.37], ['Build', 0.31], ['Peak', 0.19], ['Taper', 0.13]],
  20: [['Base', 0.30], ['Build', 0.30], ['Build2', 0.15], ['Peak', 0.15], ['Taper', 0.10]],
  24: [['Base', 0.25], ['Base2', 0.17], ['Build', 0.25], ['Build2', 0.13], ['Peak', 0.13], ['Taper', 0.08]],
  32: [['Foundation', 0.09], ['Base', 0.22], ['Base2', 0.16], ['Build', 0.22], ['Build2', 0.12], ['Peak', 0.12], ['Taper', 0.07]],
  48: [['Foundation', 0.10], ['Base', 0.21], ['Base2', 0.13], ['Build', 0.21], ['Build2', 0.10], ['Peak', 0.15], ['Taper', 0.10]],
}

const PHASE_TSS = {
  Foundation: 300,
  Base: 400,
  Base2: 450,
  Build: 500,
  Build2: 520,
  Peak: 550,
  Recovery: 200,
}

// null = never insert cutback weeks
const CUTBACK_FREQUENCY = {
  Foundation: 4,
  Base: 4,
  Base2: 4,
  Build: 3,
  Build2: 3,
  Peak: 2,
  Taper: null,
  Recovery: null,
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// Returns the Monday on or before the given date
function getMondayOnOrBefore(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// Build an ordered array of phase names, length === totalWeeks
function buildPhaseList(totalWeeks, distribution) {
  const phases = []
  for (let i = 0; i < distribution.length; i++) {
    const [phase, pct] = distribution[i]
    let count
    if (i === distribution.length - 1) {
      count = totalWeeks - phases.length // remainder goes to last phase
    } else {
      count = Math.max(0, Math.round(totalWeeks * pct))
    }
    for (let j = 0; j < count; j++) phases.push(phase)
  }
  // Safety: clamp to totalWeeks
  while (phases.length < totalWeeks) phases.push(phases[phases.length - 1] || 'Recovery')
  return phases.slice(0, totalWeeks)
}

function getTaperTSS(positionInPhase) {
  if (positionInPhase === 1) return 385
  if (positionInPhase === 2) return 275
  // week 3+: each week is 85% of the previous
  return Math.round(275 * Math.pow(0.85, positionInPhase - 2))
}

// Returns grouped phase summary: [{ phase, weeks }, ...]
export function getPhaseDistribution(programmeWeeks) {
  const distribution = PHASE_DISTRIBUTIONS[programmeWeeks]
  if (!distribution) return []
  const phaseList = buildPhaseList(programmeWeeks, distribution)
  const result = []
  let current = null
  let count = 0
  for (const phase of phaseList) {
    if (phase !== current) {
      if (current) result.push({ phase: current, weeks: count })
      current = phase
      count = 1
    } else {
      count++
    }
  }
  if (current) result.push({ phase: current, weeks: count })
  return result
}

/**
 * generateProgramme({ targetEventDate, programmeWeeks, programmeName, targetEventName })
 * Returns { season, weeks[] }
 */
export function generateProgramme({ targetEventDate, programmeWeeks, programmeName, targetEventName }) {
  const distribution = PHASE_DISTRIBUTIONS[programmeWeeks]
  if (!distribution) throw new Error(`Unsupported programme length: ${programmeWeeks}`)

  const eventDate = new Date(targetEventDate + 'T00:00:00')
  const rawStart = addDays(eventDate, -(programmeWeeks * 7))
  const weekOneStart = getMondayOnOrBefore(rawStart)

  const phaseList = buildPhaseList(programmeWeeks, distribution)

  // Track position within each phase separately
  const phasePositions = {}

  const weeks = phaseList.map((phase, idx) => {
    phasePositions[phase] = (phasePositions[phase] || 0) + 1
    const posInPhase = phasePositions[phase]

    const freq = CUTBACK_FREQUENCY[phase]
    const is_cutback_week = freq ? posInPhase % freq === 0 : false

    let baseTSS
    if (phase === 'Taper') {
      baseTSS = getTaperTSS(posInPhase)
    } else {
      baseTSS = PHASE_TSS[phase] || 400
    }

    const week_tss_target = is_cutback_week ? Math.round(baseTSS * 0.6) : baseTSS
    const weekStart = addDays(weekOneStart, idx * 7)

    return {
      week_number: idx + 1,
      week_start_date: formatDate(weekStart),
      phase,
      is_cutback_week,
      is_race_week: false,
      week_tss_target,
      key_session: '',
      event_note: '',
    }
  })

  const season = {
    name: programmeName,
    target_event_name: targetEventName,
    target_event_date: targetEventDate,
    programme_weeks: programmeWeeks,
    start_date: formatDate(weekOneStart),
  }

  return { season, weeks }
}
