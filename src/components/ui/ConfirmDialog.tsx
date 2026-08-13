import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div style={{ padding: '40px 38px', textAlign: 'center', maxWidth: 460, margin: '0 auto' }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: danger ? '#fdecec' : 'var(--pink-mist)',
            color: danger ? '#c0392b' : 'var(--choco)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <AlertTriangle width={28} height={28} />
        </div>
        <h3 style={{ fontSize: 23, marginBottom: 10 }}>{title}</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 26 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn"
            style={{
              background: danger ? 'linear-gradient(135deg,#c0392b,#a93226)' : 'var(--grad-choco)',
              color: '#fff',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}