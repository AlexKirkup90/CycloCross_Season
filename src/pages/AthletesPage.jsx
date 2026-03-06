import { useState } from 'react'
import { useAthletes } from '../hooks/useAthletes'
import { supabase } from '../lib/supabase'

const DISCIPLINES = ['CX', 'Road', 'CX+Road', 'Gravel']
const EXPERIENCES = ['Beginner', 'Intermediate', 'Elite']

const DISCIPLINE_COLOURS = {
  CX: 'bg-orange-100 text-orange-700',
  Road: 'bg-blue-100 text-blue-700',
  'CX+Road': 'bg-purple-100 text-purple-700',
  Gravel: 'bg-green-100 text-green-700',
}

const EXPERIENCE_COLOURS = {
  Beginner: 'bg-gray-100 text-gray-600',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Elite: 'bg-red-100 text-red-700',
}

export default function AthletesPage() {
  const { athletes, loading, error, refetch } = useAthletes()

  const [form, setForm] = useState({
    name: '',
    email: '',
    discipline: 'CX',
    experience: 'Beginner',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setSaveError(null)
    const { error: err } = await supabase.from('athletes').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      discipline: form.discipline,
      experience: form.experience,
    })
    if (err) {
      setSaveError(err.message)
    } else {
      setForm({ name: '', email: '', discipline: 'CX', experience: 'Beginner' })
      refetch()
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Athletes</h1>
      <p className="text-text-secondary mb-6">Manage your athlete roster</p>

      {/* Athlete grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <div className="card mb-8 text-red-600 text-sm">{error}</div>
      ) : athletes.length === 0 ? (
        <div className="card mb-8 text-center py-10">
          <p className="text-text-muted text-sm">No athletes yet — add your first athlete below</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {athletes.map(athlete => (
            <div key={athlete.id} className="card flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {athlete.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{athlete.name}</p>
                {athlete.email && (
                  <p className="text-text-muted text-xs truncate">{athlete.email}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {athlete.discipline && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DISCIPLINE_COLOURS[athlete.discipline] || 'bg-gray-100 text-gray-600'}`}>
                      {athlete.discipline}
                    </span>
                  )}
                  {athlete.experience && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXPERIENCE_COLOURS[athlete.experience] || 'bg-gray-100 text-gray-600'}`}>
                      {athlete.experience}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Athlete form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Add Athlete</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name <span className="text-red-500">*</span></label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Athlete name"
              required
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="athlete@example.com"
            />
          </div>
          <div>
            <label className="form-label">Discipline</label>
            <div className="flex gap-3 flex-wrap mt-1">
              {DISCIPLINES.map(d => (
                <label key={d} className="flex items-center gap-1.5 cursor-pointer text-sm text-text-secondary">
                  <input
                    type="radio"
                    name="discipline"
                    value={d}
                    checked={form.discipline === d}
                    onChange={handleChange}
                    className="accent-navy"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Experience</label>
            <div className="flex gap-3 flex-wrap mt-1">
              {EXPERIENCES.map(ex => (
                <label key={ex} className="flex items-center gap-1.5 cursor-pointer text-sm text-text-secondary">
                  <input
                    type="radio"
                    name="experience"
                    value={ex}
                    checked={form.experience === ex}
                    onChange={handleChange}
                    className="accent-navy"
                  />
                  {ex}
                </label>
              ))}
            </div>
          </div>
          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding…' : 'Add Athlete'}
          </button>
        </form>
      </div>
    </div>
  )
}
