import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const isReviewsActive = location.pathname === '/app' && location.search.includes('filter=needs-review')
  const isInboxActive = location.pathname.startsWith('/app') && !isReviewsActive

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-wordmark">
        pillioo
      </Link>
      <nav className="sidebar-nav" aria-label="Primary">
        <Link to="/app" className={`sidebar-nav-item ${isInboxActive ? 'is-active' : ''}`}>
          Inbox
        </Link>
        <Link
          to="/app?filter=needs-review"
          className={`sidebar-nav-item ${isReviewsActive ? 'is-active' : ''}`}
        >
          Reviews
        </Link>
        <span className="sidebar-nav-item is-disabled" aria-disabled="true" title="Not available yet">
          Reports
        </span>
      </nav>
    </aside>
  )
}

export default Sidebar
