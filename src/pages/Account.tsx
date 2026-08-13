import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Package,
  Heart,
  Star,
  MapPin,
  Settings,
  LogOut,
  ShoppingBag,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react'
import { fetchAddresses, fetchMyReviews, fetchOrders, deleteAddress, saveAddress, setDefaultAddress, updateProfile, updatePassword } from '@/lib/db'
import type { Address, OrderWithItems } from '@/lib/types'
import { formatDate, formatPrice, formatDateTime, unsplash } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import RatingStars from '@/components/ui/RatingStars'
import SafeImage from '@/components/ui/SafeImage'
import ProductCard from '@/components/ui/ProductCard'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { EmptyState, PageSpinner } from '@/components/ui/Feedback'

type Tab = 'profile' | 'orders' | 'wishlist' | 'reviews' | 'addresses' | 'settings'

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'reviews', label: 'My Reviews', icon: Star },
  { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { key: 'settings', label: 'Account Settings', icon: Settings },
]

export default function Account() {
  const { user, profile, refreshProfile, signOut, confirmPasswordReset } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [reviews, setReviews] = useState<Awaited<ReturnType<typeof fetchMyReviews>>>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { push } = useToast()
  const { ids, products: wishProducts, remove, toggle } = useWishlist()
  const { add } = useCart()

  // profile form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  // pw form
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  // address form
  const [addrEditing, setAddrEditing] = useState<Address | null>(null)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', address: '', city: '', postal_code: '' })
  const [deletingAddr, setDeletingAddr] = useState<Address | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.all([fetchOrders(user.id), fetchAddresses(), fetchMyReviews(user.id)])
      .then(([o, a, r]) => {
        if (cancelled) return
        setOrders(o)
        setAddresses(a)
        setReviews(r)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    setName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
  }, [profile])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile({ full_name: name.trim(), phone: phone.trim() || undefined })
      await refreshProfile()
      push('Profile updated', { sub: 'Your details are saved 🌸' })
    } catch (err) {
      push('Could not update profile', { sub: (err as Error).message })
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw1.length < 6) {
      push('Password too short', { sub: 'Use at least 6 characters' })
      return
    }
    if (pw1 !== pw2) {
      push('Passwords do not match', {})
      return
    }
    setSavingPw(true)
    try {
      await confirmPasswordReset(pw1)
      setPw1('')
      setPw2('')
      push('Password updated', { sub: 'Use it next time you sign in 🔐' })
    } catch (err) {
      push('Could not update password', { sub: (err as Error).message })
    } finally {
      setSavingPw(false)
    }
  }

  const openAddrForm = (addr?: Address) => {
    if (addr) {
      setAddrEditing(addr)
      setAddrForm({
        label: addr.label,
        full_name: addr.full_name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        postal_code: addr.postal_code ?? '',
      })
    } else {
      setAddrEditing(null)
      setAddrForm({ label: 'Home', full_name: name || '', phone: phone || '', address: '', city: '', postal_code: '' })
    }
    setShowAddrForm(true)
  }

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveAddress({
        ...addrForm,
        postal_code: addrForm.postal_code || undefined,
        id: addrEditing?.id,
        is_default: addresses.length === 0,
      })
      setShowAddrForm(false)
      setAddresses(await fetchAddresses())
      push(addrEditing ? 'Address updated' : 'Address saved', { sub: '📍 Delivered right where you need it' })
    } catch (err) {
      push('Could not save address', { sub: (err as Error).message })
    }
  }

  const confirmDeleteAddr = async () => {
    if (!deletingAddr) return
    try {
      await deleteAddress(deletingAddr.id)
      setAddresses(await fetchAddresses())
      push('Address deleted', {})
    } catch {
      push('Could not delete address', {})
    } finally {
      setDeletingAddr(null)
    }
  }

  const initials = (profile?.full_name || user?.email || 'F L')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>My Account</span>
          </nav>
          <h1>My Account</h1>
          <p>Orders, wishlist, addresses and settings — all your floral life in one place.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {loading ? (
            <PageSpinner />
          ) : (
            <div className="account-layout">
              <aside className="account-side">
                <div className="account-user">
                  <span className="account-avatar">{initials}</span>
                  <h3>{profile?.full_name || 'Flower Lover'}</h3>
                  <p>{user?.email}</p>
                </div>
                <nav className="account-nav" aria-label="Account menu">
                  {TABS.map((t) => (
                    <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
                      <t.icon width={18} height={18} />
                      {t.label}
                      {t.key === 'wishlist' && ids.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 12 }}>({ids.length})</span>}
                      {t.key === 'orders' && orders.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 12 }}>({orders.length})</span>}
                    </button>
                  ))}
                  <button
                    className="logout-btn"
                    onClick={async () => {
                      await signOut()
                      push('Signed out', { sub: 'Come back soon 🌷' })
                      navigate('/')
                    }}
                  >
                    <LogOut width={18} height={18} /> Logout
                  </button>
                </nav>
              </aside>

              <div className="account-panel">
                {tab === 'profile' && (
                  <div className="panel-card">
                    <h3>👤 My Profile</h3>
                    <form onSubmit={saveProfile} style={{ maxWidth: 520 }}>
                      <div className="field">
                        <label htmlFor="paname">Full Name</label>
                        <input id="paname" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="field">
                        <label htmlFor="paemail">Email</label>
                        <input id="paemail" value={user?.email ?? ''} disabled style={{ background: 'var(--pink-mist)', cursor: 'not-allowed' }} />
                        <span className="hint">Email is managed by your login provider.</span>
                      </div>
                      <div className="field">
                        <label htmlFor="papone">Phone</label>
                        <input id="papone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                      </div>
                      <button className="btn btn-choco" disabled={savingProfile}>
                        {savingProfile ? <span className="spinner" /> : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {tab === 'orders' && (
                  <div className="panel-card">
                    <div className="panel-head">
                      <h3>📦 My Orders</h3>
                      <Link to="/shop" className="btn btn-outline btn-sm">Order More Flowers</Link>
                    </div>
                    {orders.length === 0 ? (
                      <EmptyState
                        compact
                        icon="🧾"
                        title="No orders yet"
                        text="Your first bouquet is one click away."
                        action={<Link to="/shop" className="btn btn-choco">Start Shopping</Link>}
                      />
                    ) : (
                      orders.map((o) => (
                        <article className="order-card" key={o.id}>
                          <div className="order-card-head">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span className="order-no">{o.order_number}</span>
                              <span className="order-date">{formatDateTime(o.created_at)}</span>
                            </div>
                            <span className={`badge-status ${o.status.replace(/\s/g, '\\ ')}`}>{o.status}</span>
                          </div>
                          <div className="order-card-body">
                            <div className="oc-thumbs">
                              {o.items.slice(0, 5).map((it) => (
                                <img key={it.id} src={unsplash(it.image_url ?? '', 200)} alt={it.product_name} />
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                              <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                                {o.items.reduce((s, i) => s + i.quantity, 0)} items · {o.items.map((i) => i.product_name).slice(0, 2).join(', ')}
                                {o.items.length > 2 && '…'}
                              </div>
                              <div className="oc-total">
                                <div className="lbl">Total</div>
                                <div className="amt">{formatPrice(o.total)}</div>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}

                {tab === 'wishlist' && (
                  <div className="panel-card">
                    <div className="panel-head">
                      <h3>💕 My Wishlist</h3>
                      <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                        {ids.length} {ids.length === 1 ? 'flower' : 'flowers'} saved
                      </span>
                    </div>
                    {wishProducts.length === 0 ? (
                      <EmptyState
                        compact
                        icon="💗"
                        title="Your wishlist is dreaming"
                        text="Tap the heart on any bouquet to save it here."
                        action={<Link to="/shop" className="btn btn-choco">Discover Flowers</Link>}
                      />
                    ) : (
                      <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                        {wishProducts.map((p, i) => (
                          <ProductCard key={p.id} product={p} index={i} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'reviews' && (
                  <div className="panel-card">
                    <h3>⭐ My Reviews</h3>
                    {reviews.length === 0 ? (
                      <EmptyState
                        compact
                        icon="✍️"
                        title="No reviews yet"
                        text="After your next delivery, tell everyone how gorgeous it was."
                        action={<Link to="/shop" className="btn btn-choco">Shop & Review</Link>}
                      />
                    ) : (
                      <div className="review-list">
                        {reviews.map((r) => (
                          <div className="review-card" key={r.id}>
                            <div className="review-head">
                              <div style={{ flex: 1 }}>
                                <div className="reviewer">{r.product?.name ?? 'Flower'}</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <RatingStars value={r.rating} size={13} />
                                  <span className="review-date">{formatDate(r.created_at)}</span>
                                </div>
                              </div>
                              {r.product?.image_url && (
                                <SafeImage src={unsplash(r.product.image_url, 200)} alt="" style={{ width: 46, height: 52, borderRadius: 10, objectFit: 'cover' }} />
                              )}
                            </div>
                            {r.review && <p>{r.review}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'addresses' && (
                  <div className="panel-card">
                    <div className="panel-head">
                      <h3>📍 Saved Addresses</h3>
                      <button className="btn btn-choco btn-sm" onClick={() => openAddrForm()}>
                        <Plus width={15} height={15} /> Add Address
                      </button>
                    </div>
                    {addresses.length === 0 && !showAddrForm && (
                      <EmptyState
                        compact
                        icon="🏠"
                        title="No saved addresses"
                        text="Save delivery addresses to make checkout instant."
                        action={<button className="btn btn-choco btn-sm" onClick={() => openAddrForm()}>Add your first address</button>}
                      />
                    )}
                    <div className="address-grid">
                      {addresses.map((a) => (
                        <div className="address-card" key={a.id}>
                          <span className="addr-label">
                            {a.label} {a.is_default && <span className="default-chip">Default</span>}
                          </span>
                          <p>
                            {a.full_name} · {a.phone}
                            <br />
                            {a.address}, {a.city} {a.postal_code}
                          </p>
                          <div className="addr-actions">
                            <button className="edit" onClick={() => openAddrForm(a)}>
                              <Pencil width={13} height={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Edit
                            </button>
                            {!a.is_default && (
                              <button
                                className="edit"
                                onClick={async () => {
                                  await setDefaultAddress(a.id)
                                  setAddresses(await fetchAddresses())
                                }}
                              >
                                Make default
                              </button>
                            )}
                            <button className="del" onClick={() => setDeletingAddr(a)}>
                              <Trash2 width={13} height={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showAddrForm && (
                      <form onSubmit={submitAddress} style={{ marginTop: 26, background: 'var(--pink-mist)', border: '1px solid var(--blush)', borderRadius: 'var(--radius)', padding: 24 }}>
                        <h4 style={{ marginBottom: 18 }}>{addrEditing ? 'Edit address' : 'New address'}</h4>
                        <div className="form-grid-2">
                          <div className="field">
                            <label>Label</label>
                            <select value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}>
                              <option>Home</option>
                              <option>Work</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="field">
                            <label>Full Name</label>
                            <input value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} required />
                          </div>
                          <div className="field">
                            <label>Phone</label>
                            <input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} required />
                          </div>
                          <div className="field">
                            <label>Address</label>
                            <input value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} required />
                          </div>
                          <div className="field">
                            <label>City</label>
                            <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required />
                          </div>
                          <div className="field">
                            <label>Postal Code</label>
                            <input value={addrForm.postal_code} onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button type="submit" className="btn btn-choco">Save Address</button>
                          <button type="button" className="btn btn-outline" onClick={() => setShowAddrForm(false)}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {tab === 'settings' && (
                  <div className="panel-card">
                    <h3>🔐 Account Settings</h3>
                    <form onSubmit={changePassword} style={{ maxWidth: 520 }}>
                      <div className="field">
                        <label htmlFor="pw1">New Password</label>
                        <input id="pw1" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="At least 6 characters" />
                      </div>
                      <div className="field">
                        <label htmlFor="pw2">Confirm New Password</label>
                        <input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat it" />
                      </div>
                      <button className="btn btn-choco" disabled={savingPw}>
                        {savingPw ? <span className="spinner" /> : 'Change Password'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={!!deletingAddr}
        title="Delete this address?"
        message={`"${deletingAddr?.label}" at ${deletingAddr?.address}, ${deletingAddr?.city} will be removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteAddr}
        onCancel={() => setDeletingAddr(null)}
      />
    </div>
  )
}