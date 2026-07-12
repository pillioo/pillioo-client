import { Link, useLocation } from 'react-router-dom'
import './TopBar.css'

interface TopBarProps {
  title: string
}

// Visible only on mobile: the Sidebar (desktop) already carries the
// wordmark and primary nav, so this avoids duplicating them above 768px.
function TopBar({ title }: TopBarProps) {
  const location = useLocation()
  const isInboxActive = location.pathname.startsWith('/app')

  return (
    <header className="top-bar">
      <div className="top-bar-row">
        <Link to="/" className="top-bar-wordmark">
          pillioo
        </Link>
        <span className="top-bar-title">{title}</span>
      </div>
      <nav className="top-bar-nav" aria-label="Primary">
        <Link to="/app" className={`top-bar-nav-item ${isInboxActive ? 'is-active' : ''}`}>
          Inbox
        </Link>
      </nav>
    </header>
  )
}

export default TopBar
