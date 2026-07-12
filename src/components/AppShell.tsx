import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './AppShell.css'

interface AppShellProps {
  title: string
  children: ReactNode
}

function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-body">
        <TopBar title={title} />
        <main className="app-shell-main">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
