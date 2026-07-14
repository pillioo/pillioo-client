import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const isGuideActive = location.pathname.startsWith('/app/guide')
  const isInboxActive = location.pathname.startsWith('/app')

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-wordmark">
        pillioo
      </Link>
      <nav className="sidebar-nav" aria-label="Primary">
        <Link to="/app" className={`sidebar-nav-item ${isInboxActive ? 'is-active' : ''}`}>
          Inbox
        </Link>
        <Link to="/app/guide" className={`sidebar-nav-item ${isGuideActive ? 'is-active' : ''}`}>
          Guide
        </Link>
        {/* <span className="sidebar-nav-item is-disabled" aria-disabled="true" title="Not available yet">
          Reports
        </span> */}
      </nav>
    </aside>
  )
}

export default Sidebar
