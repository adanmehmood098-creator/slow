import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { FAQS } from '@/data/content'
import { sendContactMessage } from '@/lib/db'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'

export default function Contact() {
  const { push } = useToast()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', subject: 'General question', message: '' })
  const [sending, setSending] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      push('Please fill in all fields', { sub: 'Name, email and message are required 🌷' })
      return
    }
    setSending(true)
    try {
      await sendContactMessage({ ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() })
      setForm({ name: '', email: '', subject: 'General question', message: '' })
      push('Message sent!', { sub: 'We reply within one business day 🌸' })
    } catch (err) {
      push('Could not send message', { sub: (err as Error).message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>Contact</span>
          </nav>
          <h1>Say Hello</h1>
          <p>Questions, wedding enquiries, or just flower chat — we love hearing from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-list">
              {[
                { icon: <Phone width={20} height={20} />, title: 'Phone', lines: ['+1 (555) 123-4567', 'Order line open 9AM–8PM'] },
                { icon: <Mail width={20} height={20} />, title: 'Email', lines: ['hello@bloomandblush.com', 'Replies within 1 business day'] },
                { icon: <MapPin width={20} height={20} />, title: 'Studio', lines: ['12 Rosewood Avenue, Flower District', 'Free parking behind the shop'] },
                { icon: <Clock width={20} height={20} />, title: 'Hours', lines: ['Mon–Sat: 9AM–8PM · Sun: 10AM–6PM', 'Same-day orders before 2PM'] },
              ].map((c) => (
                <div className="contact-tile" key={c.title}>
                  <span className="ct-ico">{c.icon}</span>
                  <div>
                    <h4>{c.title}</h4>
                    {c.lines.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-card" style={{ padding: 34 }}>
              <h3 style={{ marginBottom: 8 }}>Send us a message</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 22 }}>
                We read every single message — yes, really.
              </p>
              <form onSubmit={submit}>
                <div className="form-grid-2">
                  <div className="field">
                    <label htmlFor="cn">Your Name</label>
                    <input id="cn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label htmlFor="ce">Email</label>
                    <input id="ce" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="cs">Subject</label>
                  <select id="cs" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option>General question</option>
                    <option>Wedding enquiry</option>
                    <option>Order &amp; delivery</option>
                    <option>Wholesale &amp; events</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="cm">Message</label>
                  <textarea id="cm" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <button className="btn btn-choco btn-lg" disabled={sending}>
                  {sending ? <span className="spinner" /> : <><Send width={16} height={16} /> Send Message</>}
                </button>
              </form>
              {user && (
                <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--muted)' }}>
                  Signed in as <strong>{user.email}</strong> — we'll use your account details for the reply. Need a
                  different address? <Link to="/account" style={{ textDecoration: 'underline' }}>Switch accounts</Link>.
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 30, marginBottom: 26, textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FAQS.map((f, i) => (
                <div key={f.q} style={{ background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left', fontWeight: 600, fontSize: 15.5, color: 'var(--choco-dark)' }}
                    aria-expanded={openFaq === i}
                  >
                    {f.q}
                    <span style={{ fontSize: 20, color: 'var(--blush-deep)', transition: 'transform .3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <p style={{ padding: '0 22px 18px', color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7, animation: 'pageIn .3s var(--ease) both' }}>
                      {f.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
