export default function SetupNotice() {
  return (
    <div className="placeholder-banner" role="status">
      <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
      <h2 style={{ fontSize: 28 }}>Connect your Supabase project</h2>
      <p>
        This section needs the live database. Copy <code>.env.example</code> to <code>.env</code> and set your{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>. Then run the SQL in{' '}
        <code>supabase/schema.sql</code> and <code>supabase/seed.sql</code> from the Supabase SQL Editor.
      </p>
      <button
        className="btn btn-choco"
        onClick={() => window.open('https://supabase.com/dashboard', '_blank', 'noopener')}
      >
        Open Supabase Dashboard
      </button>
    </div>
  )
}