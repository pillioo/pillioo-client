import { Link } from 'react-router-dom'
import { LANDING_PREVIEW_TICKETS, LANDING_WORKFLOW_STEPS } from '../data/landingPreview'
import './ProductEntrance.css'

function ProductEntrance() {
  return (
    <div className="entrance">
      <header className="entrance-nav">
        <div className="entrance-container entrance-nav-inner">
          <span className="entrance-wordmark">pillioo</span>
          <nav className="entrance-nav-links" aria-label="Primary">
            <a href="#workflow">How it works</a>
            <Link className="entrance-nav-cta" to="/app">
              Enter Pillioo
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="entrance-hero">
          <div className="entrance-container entrance-hero-inner">
            <h1>
              From drug safety signals
              <br />
              to pharmacist-ready decisions.
            </h1>
            <p className="entrance-hero-description">
              의약품 안전 이벤트를 감지하고,
              <br />
              재고 영향과 근거를 분석해
              <br />
              약사의 검토 가능한 결정으로 연결합니다.
            </p>
            <div className="entrance-hero-actions">
              <Link className="entrance-btn entrance-btn-primary" to="/app">
                Enter Pillioo
              </Link>
              <a className="entrance-btn entrance-btn-secondary" href="#workflow">
                Explore the workflow
              </a>
            </div>
          </div>

          <div className="entrance-container">
            <div className="entrance-preview" aria-label="Safety Inbox preview">
              <div className="entrance-preview-header">
                <span className="entrance-preview-title">Safety Inbox</span>
                <span className="entrance-preview-tag">Preview</span>
              </div>
              <ul className="entrance-preview-list">
                {LANDING_PREVIEW_TICKETS.map((ticket) => (
                  <li className="entrance-preview-row" key={ticket.ticketId}>
                    <div className="entrance-preview-row-main">
                      <span className="entrance-preview-drug">{ticket.drugName}</span>
                      <span className="entrance-preview-meta">
                        {ticket.eventType} · <span className="entrance-mono">{ticket.ticketId}</span>
                      </span>
                    </div>
                    <span className={`entrance-badge entrance-badge-${ticket.tone}`}>
                      {ticket.statusLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="workflow" className="entrance-workflow">
          <div className="entrance-container">
            <h2>Detect, analyze, review — one connected workflow.</h2>
            <ol className="entrance-workflow-steps">
              {LANDING_WORKFLOW_STEPS.map((step) => (
                <li key={step.title}>
                  <span className="entrance-workflow-step-index">{step.index}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="entrance-final-cta">
          <div className="entrance-container">
            <h2>Ready to see how a case moves through Pillioo?</h2>
            <Link className="entrance-btn entrance-btn-primary" to="/app">
              Enter Pillioo
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProductEntrance
