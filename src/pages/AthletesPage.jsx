import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useAthletes from '../hooks/useAthletes'

const disciplines = ['CX', 'Road', 'CX+Road', 'Gravel']
const levels = ['Beginner', 'Intermediate', 'Elite']

export default function AthletesPage() {
  const { athletes, loading, error, refetch } = useAthletes()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [discipline, setDiscipline] = useState('CX')
  const [experience, setExperience] = useState('Beginner')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Name is required')
      return
    }

    setSaving(true)
    setFormError('')

    const { error: insertError } = await supabase.from('athletes').insert({
      name: name.trim(),
      email: email.trim() || null,
      discipline,
      experience_level: experience,
    })

    if (insertError) {
      setFormError(insertError.message)
      setSaving(false)
      return
    }

    setName('')
    setEmail('')
    setDiscipline('CX')
    setExperience('Beginner')
    setSaving(false)
    refetch()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Athletes</h1>
      <p className="text-text-secondary mb-6">Profiles and management — coming in Phase 3</p>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map(item => (
            <div key={item} className="card h-28 animate-pulse bg-surface-tertiary" />
          ))}
        </div>
      ) : athletes.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {athletes.map(athlete => (
            <div key={athlete.id} className="card">
              <h3 className="font-bold text-text-primary text-lg">{athlete.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="phase-badge bg-sky-light text-navy">{athlete.discipline || 'N/A'}</span>
                <span className="phase-badge bg-surface-tertiary text-text-secondary">
                  {athlete.experience_level || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mb-6">
          <p className="text-text-muted text-sm">No athletes yet — add your first athlete below</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-bold text-text-primary mb-4">Add Athlete</h2>
        {formError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Discipline</label>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              {disciplines.map(option => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="discipline"
                    value={option}
                    checked={discipline === option}
                    onChange={e => setDiscipline(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Experience</label>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              {levels.map(option => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="experience"
                    value={option}
                    checked={experience === option}
                    onChange={e => setExperience(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding...' : 'Add Athlete'}
          </button>
        </form>
      </div>
    </div>
  )
}
