import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="notfound container">
        <span className="nf-flower">🌷</span>
        <h1>404</h1>
        <h2>This page wilted…</h2>
        <p>
          The page you're looking for has been picked, trimmed or moved. Let's get you back to somewhere blooming.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-choco">Back to Home</Link>
          <Link to="/shop" className="btn btn-outline">Browse the Shop</Link>
        </div>
      </div>
    </div>
  )
}