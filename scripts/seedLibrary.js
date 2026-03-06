import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env file manually (no dotenv dependency required)
function loadEnv() {
  const __dir = dirname(fileURLToPath(import.meta.url))
  const envPath = resolve(__dir, '../.env')
  try {
    const contents = readFileSync(envPath, 'utf8')
    for (const line of contents.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // No .env file — rely on process.env already being set
  }
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const __dirname = dirname(fileURLToPath(import.meta.url))
const { sessionLibrarySeed } = await import(
  resolve(__dirname, '../src/lib/sessionLibrarySeed.js')
)

async function seed() {
  console.log(`Checking sessions_library...`)

  // Schema probe — logs actual column names so mismatches are immediately visible
  const { data: sample } = await supabase.from('sessions_library').select('*').limit(1)
  console.log('Table columns check - inserting test row to see schema error details')
  if (sample && sample.length > 0) {
    console.log('Existing columns:', Object.keys(sample[0]).join(', '))
  }

  const { count, error: countErr } = await supabase
    .from('sessions_library')
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    console.error('ERROR checking table:', countErr.message)
    process.exit(1)
  }

  if (count > 0) {
    console.log(`sessions_library already has ${count} rows — skipping insert.`)
    process.exit(0)
  }

  console.log(`Table is empty. Inserting ${sessionLibrarySeed.length} sessions...`)

  const BATCH_SIZE = 20
  let inserted = 0

  for (let i = 0; i < sessionLibrarySeed.length; i += BATCH_SIZE) {
    const batch = sessionLibrarySeed.slice(i, i + BATCH_SIZE)
    const { error: insertErr } = await supabase
      .from('sessions_library')
      .insert(batch)

    if (insertErr) {
      console.error(`ERROR inserting batch starting at index ${i}:`, insertErr.message)
      process.exit(1)
    }

    inserted += batch.length
    console.log(`  Inserted ${inserted} / ${sessionLibrarySeed.length}`)
  }

  console.log(`Done. ${inserted} sessions inserted into sessions_library.`)
}

seed()
