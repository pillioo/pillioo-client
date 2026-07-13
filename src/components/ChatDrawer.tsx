import type { FormEvent } from 'react'
import { useState } from 'react'
import { getChatHistory, submitChatQuery } from '../api/chat'
import { ApiError } from '../api/client'
import type { ChatCitation, ChatMessage } from '../api/types'
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

type HistoryState = 'idle' | 'loading' | 'ready' | 'error'

let messageKeySeq = 0
function nextMessageKey(): string {
  messageKeySeq += 1
  return `m${messageKeySeq}`
}

function toUIMessage(message: ChatMessage): UIMessage {
  return {
    key: nextMessageKey(),
    role: message.role,
    content: message.content,
    sources: message.retrieved_sources,
    status: message.status,
    supportLevel: null,
  }
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

// Ticket-scoped chat. Relies on the parent Ticket Workspace being remounted
// with key={ticketId} (see useTicketPreview.ts) so session/message state
// always starts fresh when the ticket changes, instead of tracking it here.
function ChatDrawer({ ticketId }: ChatDrawerProps) {
  const [open, setOpen] = useState(false)
  const [historyState, setHistoryState] = useState<HistoryState>('idle')
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  function handleOpen() {
    setOpen(true)
    if (historyState !== 'idle') return
    setHistoryState('loading')
    getChatHistory(ticketId)
      .then((history) => {
        setMessages(history.map(toUIMessage))
        const last = history[history.length - 1]
        if (last?.session_id) setSessionId(last.session_id)
        setHistoryState('ready')
      })
      .catch(() => {
        setHistoryState('error')
      })
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
              {historyState === 'loading' && messages.length === 0 && (
                <p className="chat-status-text">Loading conversation…</p>
              )}
              {historyState === 'error' && (
                <p className="chat-status-text chat-status-text-danger">Couldn't load previous messages.</p>
              )}
              {historyState !== 'loading' && messages.length === 0 && (
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
