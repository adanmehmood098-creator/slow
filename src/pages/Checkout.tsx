import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Landmark, Wallet, MapPin, ChevronRight } from 'lucide-react'
import { RequireAuth } from '@/components/layout/Guards'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { placeOrder, fetchAddresses, saveAddress } from '@/lib/db'
import type { Address } from '@/lib/types'
import { formatPrice, unsplash } from '@/lib/utils'
import SafeImage from '@/components/ui/SafeImage'
import { EmptyState } from '@/components/ui/Feedback'

type Step = 1 | 2

interface DeliveryForm {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
}

const METHODS = [
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'paypal', label: 'PayPal', icon: Wallet },
  { key: 'bank', label: 'Bank Transfer', icon: Landmark },
]

export default function Checkout() {
  const cart = useCart()
  const { user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState<DeliveryForm>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  })
  const [saveAddr, setSaveAddr] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const delivery = cart.subtotal - cart.couponDiscount >= 50 ? 0 : 7.9
    return { ...cart, deliveryFee: delivery }
  }, [cart])

  function pickAddress(a: Address) {
    setForm({ full_name: a.full_name, phone: a.phone, address: a.address, city: a.city, postal_code: a.postal_code ?? '' })
  }

  async function loadAddresses() {
    setAddresses(await fetchAddresses())
  }

  const validateStep1 = () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Please complete all delivery fields.')
      return false
    }
    setError(null)
    return true
  }

  const validatePayment = () => {
    if (!/^\d{16}$/.test(card.number.replace(/\s/g, ''))) {
      setError('Please enter a valid 16-digit card number.')
      return false
    }
    if (card.name.trim().length < 2) {
      setError('Please enter the name on the card.')
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      setError('Expiry must look like MM/YY.')
      return false
    }
    if (!/^\d{3,4}$/.test(card.cvc)) {
      setError('Please enter a valid CVC.')
      return false
    }
    return true
  }

  async function confirmOrder() {
    if (!user) return
    setPlacing(true)
    setError(null)
    try {
      const order = await placeOrder({
        items: cart.items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postal_code.trim() || undefined,
        payment_method: paymentMethod,
        coupon: cart.couponCode ?? undefined,
      })
      if (saveAddr) {
        try {
          await fetchAddresses().then(async (existing) => {
            const labels = existing.map((a) => a.label)
            await saveAddress({
              label: labels.includes('Home') ? 'Checkout address' : 'Home',
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
              address: form.address.trim(),
              city: form.city.trim(),
              postal_code: form.postal_code.trim() || undefined,
              is_default: existing.length === 0,
            })
          })
        } catch {
          /* non-blocking */
        }
      }
      cart.clear()
      push('Payment successful', { sub: 'Your blooms are being prepared 🌸' })
      navigate(`/order-confirmation/${order.id}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      push('Could not place order', { sub: (err as Error).message })
    } finally {
      setPlacing(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="page container">
        <EmptyState
          icon="🧺"
          title="Your basket is empty"
          text="Add some flowers before checking out — the studio is ready when you are."
          action={<Link to="/shop" className="btn btn-choco">Browse Flowers</Link>}
        />
      </div>
    )
  }

  return (
    <RequireAuth fallback="/login?next=/checkout">
      <div className="page">
        <section className="page-hero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">/</span>
              <Link to="/shop">Shop</Link>
              <span className="sep">/</span>
              <span>Checkout</span>
            </nav>
            <h1>Checkout</h1>
            <p>Almost there — your flowers are just a few petals away. 🌷</p>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="checkout-steps" role="tablist">
              <div className={`checkout-step ${step === 1 ? 'active' : 'done'}`}>
                <span className="step-num">{step === 1 ? '1' : '✓'}</span> Delivery
              </div>
              <div className={`checkout-step ${step === 2 ? 'active' : ''}`}>
                <span className="step-num">2</span> Payment
              </div>
            </div>

            <div className="checkout-layout">
              <div>
                {step === 1 && (
                  <div className="checkout-form-card">
                    <h3>📦 Delivery Information</h3>
                    <button className="btn btn-outline btn-sm" style={{ marginBottom: 20 }} onClick={() => void loadAddresses()}>
                      Use a saved address
                    </button>
                    {addresses.length > 0 && (
                      <div className="address-grid" style={{ marginBottom: 24 }}>
                        {addresses.map((a) => (
                          <button
                            type="button"
                            key={a.id}
                            className="address-card"
                            style={{ textAlign: 'left', cursor: 'pointer' }}
                            onClick={() => pickAddress(a)}
                          >
                            <span className="addr-label">
                              <MapPin width={13} height={13} /> {a.label} {a.is_default && <span className="default-chip">Default</span>}
                            </span>
                            <p>
                              {a.full_name} · {a.phone}
                              <br />
                              {a.address}, {a.city} {a.postal_code}
                            </p>
                            <span style={{ color: 'var(--blush-deep)', fontSize: 13, fontWeight: 600 }}>Use this address →</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="form-grid-2">
                      <div className="field">
                        <label htmlFor="cfn">Full Name</label>
                        <input id="cfn" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Bloomfield" required />
                      </div>
                      <div className="field">
                        <label htmlFor="cph">Phone</label>
                        <input id="cph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" required />
                      </div>
                      <div className="field">
                        <label htmlFor="caddr">Address</label>
                        <input id="caddr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="12 Rosewood Avenue" required />
                      </div>
                      <div className="field">
                        <label htmlFor="ccity">City</label>
                        <input id="ccity" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Flower District" required />
                      </div>
                      <div className="field">
                        <label htmlFor="czip">Postal Code</label>
                        <input id="czip" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="12345" />
                      </div>
                    </div>
                    <label className="check-line" style={{ justifyContent: 'flex-start' }}>
                      <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                      Save this address to my account
                    </label>
                    <button
                      className="btn btn-choco btn-lg"
                      onClick={() => {
                        if (validateStep1()) {
                          setStep(2)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                    >
                      Continue to Payment <ChevronRight width={17} height={17} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="checkout-form-card">
                    <h3>💳 Payment</h3>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>
                      Secure checkout — your card details are never stored on our servers. A payment gateway (Stripe /
                      PayPal) can be plugged into this step before launch.
                    </p>
                    <div className="payment-methods">
                      {METHODS.map((m) => (
                        <button
                          type="button"
                          key={m.key}
                          className={`payment-method ${paymentMethod === m.key ? 'active' : ''}`}
                          onClick={() => setPaymentMethod(m.key)}
                        >
                          <m.icon width={22} height={22} />
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <>
                        <div className="card-preview">
                          <span>Bloom &amp; Blush</span>
                          <span className="cp-number">
                            {card.number || '•••• •••• •••• ••••'}
                          </span>
                          <div className="cp-bottom">
                            <span>{card.name.toUpperCase() || 'CARD HOLDER'}</span>
                            <span>{card.expiry || 'MM/YY'}</span>
                          </div>
                        </div>
                        <div className="form-grid-2">
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="cnum">Card Number</label>
                            <input
                              id="cnum"
                              value={card.number}
                              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19) })}
                              placeholder="4242 4242 4242 4242"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="cnm">Name on Card</label>
                            <input id="cnm" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="JANE BLOOMFIELD" />
                          </div>
                          <div className="field">
                            <label htmlFor="cexp">Expiry (MM/YY)</label>
                            <input
                              id="cexp"
                              value={card.expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
                                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                                setCard({ ...card, expiry: v })
                              }}
                              placeholder="12/27"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="ccvc">CVC</label>
                            <input id="ccvc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/[^\d]/g, '').slice(0, 4) })} placeholder="123" inputMode="numeric" type="password" />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentMethod !== 'card' && (
                      <div className="auth-success">
                        {paymentMethod === 'paypal'
                          ? 'You will be redirected to PayPal to approve the payment after clicking the button below.'
                          : 'Bank transfer details will be sent to your email after placing the order.'}
                      </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                      <button className="btn btn-outline" onClick={() => setStep(1)}>
                        ← Back to Delivery
                      </button>
                      <button
                        className="btn btn-gold btn-lg"
                        disabled={placing || cart.count === 0}
                        onClick={() => {
                          if (paymentMethod === 'card' && !validatePayment()) return
                          void confirmOrder()
                        }}
                      >
                        {placing ? <span className="spinner" /> : `Pay ${formatPrice(totals.total)} · Place Order`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="os-items">
                  {cart.items.map((i) => (
                    <div className="os-item" key={i.product.id}>
                      <SafeImage src={unsplash(i.product.image_url ?? '', 300)} alt="" />
                      <div className="os-info">
                        <h5>{i.product.name}</h5>
                        <p>
                          Qty {i.quantity} · {formatPrice(i.product.price * (1 - (i.product.discount || 0) / 100))} each
                        </p>
                      </div>
                      <span className="os-price">
                        {formatPrice(i.product.price * (1 - (i.product.discount || 0) / 100) * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="os-totals">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="row">
                    <span>Discount</span>
                    <span className="green">−{formatPrice(totals.productDiscount + totals.couponDiscount)}</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span className={totals.deliveryFee === 0 ? 'green' : ''}>
                      {totals.deliveryFee === 0 ? 'FREE' : formatPrice(totals.deliveryFee)}
                    </span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>{formatPrice(totals.total)}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </RequireAuth>
  )
}