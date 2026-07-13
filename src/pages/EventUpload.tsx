import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadEvent } from '../api/events'
import './EventUpload.css'

const CLASSIFICATIONS = ['class_i', 'class_ii', 'class_iii']
const STATUSES = ['ongoing', 'completed', 'terminated']

const initialForm = {
  recall_number: '',
  classification: 'class_i',
  product_ndc: '',
  lot_number: '',
  product_description: '',
  reason_for_recall: '',
  recall_initiation_date: '',
  status: 'ongoing',
}

function EventUpload() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ event_id: string; duplicated: boolean; ticket_id: string } | null>(null)

  function updateField(key: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!form.recall_number || !form.product_ndc || !form.product_description || !form.reason_for_recall || !form.recall_initiation_date) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const response = await uploadEvent(form)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '이벤트 업로드 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="eu-workspace">
      <Link className="eu-back" to="/app">
        ← Back to Safety Inbox
      </Link>

      <header>
        <h1 className="eu-title">Event Upload</h1>
        <p className="eu-subtitle">Recall 이벤트 JSON을 등록하면 정규화, 중복 체크 후 티켓이 생성됩니다.</p>
      </header>

      <form className="eu-form" onSubmit={handleSubmit}>
        <div className="eu-field">
          <label htmlFor="recall_number">Recall Number *</label>
          <input
            id="recall_number"
            type="text"
            value={form.recall_number}
            onChange={(e) => updateField('recall_number', e.target.value)}
            placeholder="D-0277-2024"
          />
        </div>

        <div className="eu-field">
          <label htmlFor="classification">Classification *</label>
          <select id="classification" value={form.classification} onChange={(e) => updateField('classification', e.target.value)}>
            {CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="eu-field">
          <label htmlFor="product_ndc">Product NDC *</label>
          <input
            id="product_ndc"
            type="text"
            value={form.product_ndc}
            onChange={(e) => updateField('product_ndc', e.target.value)}
            placeholder="00641-6014-41"
          />
        </div>

        <div className="eu-field">
          <label htmlFor="lot_number">Lot Number</label>
          <input
            id="lot_number"
            type="text"
            value={form.lot_number}
            onChange={(e) => updateField('lot_number', e.target.value)}
            placeholder="LOT-A"
          />
        </div>

        <div className="eu-field eu-field-wide">
          <label htmlFor="product_description">Product Description *</label>
          <input
            id="product_description"
            type="text"
            value={form.product_description}
            onChange={(e) => updateField('product_description', e.target.value)}
            placeholder="Midazolam HCl Injection 1mg/mL vial"
          />
        </div>

        <div className="eu-field eu-field-wide">
          <label htmlFor="reason_for_recall">Reason for Recall *</label>
          <textarea
            id="reason_for_recall"
            value={form.reason_for_recall}
            onChange={(e) => updateField('reason_for_recall', e.target.value)}
            rows={3}
            placeholder="Subpotent drug product"
          />
        </div>

        <div className="eu-field">
          <label htmlFor="recall_initiation_date">Recall Initiation Date *</label>
          <input
            id="recall_initiation_date"
            type="date"
            value={form.recall_initiation_date}
            onChange={(e) => updateField('recall_initiation_date', e.target.value)}
          />
        </div>

        <div className="eu-field">
          <label htmlFor="status">Status *</label>
          <select id="status" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="eu-error">{error}</p>}

        <div className="eu-actions">
          <button type="submit" className="eu-btn-primary" disabled={submitting}>
            {submitting ? 'Uploading…' : 'Upload Event'}
          </button>
        </div>
      </form>

      {result && (
        <div className="eu-result">
          <p className="eu-result-title">
            {result.duplicated ? '중복 이벤트입니다 (기존 티켓 사용됨)' : '이벤트가 정상적으로 등록되었습니다'}
          </p>
          <p className="eu-result-line">event_id: {result.event_id}</p>
          <p className="eu-result-line">ticket_id: {result.ticket_id}</p>
          <button className="eu-btn-secondary" onClick={() => navigate(`/app/tickets/${result.ticket_id}`)}>
            티켓 워크스페이스로 이동
          </button>
        </div>
      )}
    </div>
  )
}

export default EventUpload
