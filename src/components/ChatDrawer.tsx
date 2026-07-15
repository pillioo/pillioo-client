import type { FormEvent } from 'react'
import { useState } from 'react'
import { submitChatQuery } from '../api/chat'
import { ApiError } from '../api/client'
import type { ChatCitation } from '../api/types'
import './ChatDrawer.css'

interface ChatDrawerProps {
  ticketId: string
}

interface UIMessage {
  key: string
  role: 'user' | 'assistant'
  content: string
  sources: ChatCitation[]
  status: 'succeeded' | 'failed'
  supportLevel: string | null
}

let messageKeySeq = 0
function nextMessageKey(): string {
  messageKeySeq += 1
  return `m${messageKeySeq}`
}

function isLowSupport(level: string | null): boolean {
  return level === 'none' || level === 'partial'
}

// The chat panel renders plain text, not Markdown, so strip the raw
// **, __, #, and ` tokens the LLM answer may contain instead of showing
// them literally to the user.
function stripMarkdown(text: string): string {
  return text
    .replace(/```[a-zA-Z0-9]*\n?([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
}

function SourceList({ sources }: { sources: ChatCitation[] }) {
  if (sources.length === 0) return null
  return (
    <ul className="chat-source-list">
      {sources.map((source, index) => (
        <li key={`${source.source}-${index}`} className="chat-source-item">
          {source.source} · {source.section} · {Math.round(source.score * 100)}% match
        </li>
      ))}
    </ul>
  )
}

function MessageBubble({ message }: { message: UIMessage }) {
  const lowSupport = message.role === 'assistant' && isLowSupport(message.supportLevel)
  return (
    <div className={`chat-message chat-message-${message.role}`}>
      <p className="chat-message-text">{stripMarkdown(message.content)}</p>
      {message.status === 'failed' && (
        <p className="chat-message-flag chat-message-flag-danger">Couldn't process this message.</p>
      )}
      {message.status === 'succeeded' && lowSupport && (
        <p className="chat-message-flag chat-message-flag-warning">Limited evidence support for this answer.</p>
      )}
      <SourceList sources={message.sources} />
    </div>
  )
}

// Ticket-scoped chat. Deliberately does not fetch or render prior chat
// history on open (see docs: frontend-only chat session exposure control) --
// only messages sent during the current browser session are shown. Relies
// on the parent Ticket Workspace being remounted with key={ticketId} (see
// useTicketPreview.ts) so message/session state starts fresh per ticket.
function ChatDrawer({ ticketId }: ChatDrawerProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  function handleOpen() {
    setOpen(true)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (sending) return
    const query = draft.trim()
    if (!query) return

    setSending(true)
    setDraft('')
    setMessages((prev) => [
      ...prev,
      { key: nextMessageKey(), role: 'user', content: query, sources: [], status: 'succeeded', supportLevel: null },
    ])

    submitChatQuery(ticketId, { user_query: query, session_id: sessionId })
      .then((response) => {
        setSessionId(response.session_id)
        setMessages((prev) => [
          ...prev,
          {
            key: nextMessageKey(),
            role: 'assistant',
            content: response.answer,
            sources: response.sources,
            status: 'succeeded',
            supportLevel: response.answer_support_level,
          },
        ])
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError && error.message ? error.message : "Couldn't reach chat."
        setMessages((prev) => [
          ...prev,
          { key: nextMessageKey(), role: 'assistant', content: message, sources: [], status: 'failed', supportLevel: null },
        ])
      })
      .finally(() => setSending(false))
  }

  return (
    <div className="chat-drawer">
      <button type="button" className="chat-drawer-trigger" onClick={handleOpen}>
        Ask Pillioo
      </button>

      {open && (
        <div className="chat-drawer-overlay" role="presentation" onClick={() => setOpen(false)}>
          <div className="chat-drawer-panel" role="dialog" aria-label="Ticket chat" onClick={(e) => e.stopPropagation()}>
            <div className="chat-drawer-head">
              <span className="chat-drawer-title">Ask Pillioo</span>
              <button type="button" className="chat-drawer-close" aria-label="Close chat" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className="chat-drawer-body">
              {messages.length === 0 && (
                <p className="chat-status-text">Ask a question about this case's evidence or status.</p>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.key} message={message} />
              ))}
            </div>

            <form className="chat-drawer-input-row" onSubmit={handleSubmit}>
              <input
                type="text"
                className="chat-drawer-input"
                placeholder="Ask about this case…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="chat-drawer-send" disabled={sending || draft.trim().length === 0}>
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatDrawer
