import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { fetchCategories } from '@/lib/db'
import { uploadProductImage, deleteStoredImage } from '@/lib/db'
import { createAdminProduct, updateAdminProduct, replaceProductImages, fetchAdminProducts, type AdminProductInput } from '@/lib/admin'
import type { Category } from '@/lib/types'
import { OCCASIONS } from '@/lib/types'
import SafeImage from '@/components/ui/SafeImage'
import { useToast } from '@/context/ToastContext'
import { PageSpinner } from '@/components/ui/Feedback'

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { push } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [occasionSet, setOccasionSet] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    discount: '0',
    stock: '0',
    sku: '',
    featured: false,
    best_seller: false,
    is_active: true,
  })

  useEffect(() => {
    let cancelled = false
    fetchCategories().then((c) => !cancelled && setCategories(c))
    if (isEdit && id) {
      fetchAdminProducts()
        .then((all) => {
          const p = all.find((x) => x.id === id)
          if (!p || cancelled) return
          setForm({
            name: p.name,
            category_id: p.category_id ?? '',
            description: p.description ?? '',
            price: String(p.price),
            discount: String(p.discount),
            stock: String(p.stock),
            sku: p.sku ?? '',
            featured: p.featured,
            best_seller: p.best_seller,
            is_active: p.is_active,
          })
          setOccasionSet(p.occasions ?? [])
          setImages([...(p.images ?? []).map((g) => g.image_url)])
        })
        .finally(() => !cancelled && setLoading(false))
    } else {
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const f of Array.from(files).slice(0, 5)) {
        const { url } = await uploadProductImage(f)
        setImages((prev) => [...prev, url])
      }
    } catch (err) {
      push('Upload failed', { sub: (err as Error).message })
    } finally {
      setUploading(false)
    }
  }

  async function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
    const path = url.split('/').pop()
    if (path) void deleteStoredImage(path)
  }

  function toggleOccasion(o: string) {
    setOccasionSet((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number(form.price)
    const discount = Math.min(90, Math.max(0, Number(form.discount) || 0))
    const stock = Math.max(0, Math.floor(Number(form.stock) || 0))
    if (!form.name.trim() || !price || !images[0]) {
      push('Missing details', { sub: 'Name, a positive price and at least one image are required' })
      return
    }
    setSaving(true)
    const payload: AdminProductInput = {
      name: form.name.trim(),
      category_id: form.category_id || null,
      description: form.description.trim(),
      price,
      discount,
      stock,
      sku: form.sku.trim().toUpperCase(),
      image_url: images[0],
      featured: form.featured,
      best_seller: form.best_seller,
      is_active: form.is_active,
      occasions: occasionSet,
    }
    try {
      if (isEdit && id) {
        await updateAdminProduct(id, payload)
        await replaceProductImages(id, images.slice(1))
        push('Product updated', { sub: payload.name + ' is live in the shop 🌸' })
      } else {
        const created = await createAdminProduct(payload)
        if (images.length > 1) await replaceProductImages(created.id, images.slice(1))
        push('Product added', { sub: payload.name + ' is now in the shop 🌸' })
      }
      navigate('/admin/products')
    } catch (err) {
      push('Could not save product', { sub: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="admin-view">
      <Link to="/admin/products" className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>
        <ArrowLeft width={15} height={15} /> Back to products
      </Link>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>{isEdit ? 'Edit Product' : 'Add New Product / Stock'}</h3>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {isEdit ? 'Update details and images' : 'Fill the details below — required fields are marked'}
          </span>
        </div>
        <form onSubmit={submit} style={{ padding: '28px 30px 34px' }}>
          <div className="admin-product-form">
            <div className="field form-wide">
              <label htmlFor="fname">Product Name *</label>
              <input id="fname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic Red Rose Bouquet" required />
            </div>

            <div className="field">
              <label htmlFor="fcat">Category *</label>
              <select id="fcat" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fsku">SKU</label>
              <input id="fsku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. ROSE-001" />
            </div>
            <div className="field">
              <label htmlFor="fprice">Price ($) *</label>
              <input id="fprice" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="49.99" required />
            </div>
            <div className="field">
              <label htmlFor="fdisc">Discount (%)</label>
              <input id="fdisc" type="number" min="0" max="90" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="fstock">Stock Quantity *</label>
              <input id="fstock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="fstatus">Product Status</label>
              <select id="fstatus" value={form.is_active ? 'active' : 'hidden'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}>
                <option value="active">Active — visible in shop</option>
                <option value="hidden">Hidden — draft</option>
              </select>
            </div>

            <div className="field form-wide">
              <label htmlFor="fdesc">Description</label>
              <textarea
                id="fdesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What makes this arrangement special? Scent, stems, story…"
              />
            </div>

            <div className="field form-wide">
              <label>Product Images * (first image is the cover — upload via Supabase Storage)</label>
              <div className="image-upload-grid">
                {images.map((u) => (
                  <div className="image-upload-box" key={u}>
                    <SafeImage src={u + '?auto=format&fit=crop&w=200&q=70'} alt="" />
                    <button type="button" className="up-remove" onClick={() => void removeImage(u)} aria-label="Remove image">
                      <Trash2 width={13} height={13} />
                    </button>
                  </div>
                ))}
                <label className="image-upload-box" style={uploading ? { pointerEvents: 'none' } : undefined}>
                  {uploading ? <span className="spinner spinner-dark up-spinner" /> : <><Plus width={20} height={20} /> Add image</>}
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => void handleUpload(e.target.files)} />
                </label>
              </div>
            </div>

            <div className="field">
              <label>Featured product</label>
              <button
                type="button"
                className={`toggle ${form.featured ? 'on' : ''}`}
                onClick={() => setForm({ ...form, featured: !form.featured })}
                aria-label="Toggle featured"
              />
              <span className="hint">Shown in "Our Most Loved Flowers" on the homepage.</span>
            </div>
            <div className="field">
              <label>Best seller</label>
              <button
                type="button"
                className={`toggle ${form.best_seller ? 'on' : ''}`}
                onClick={() => setForm({ ...form, best_seller: !form.best_seller })}
                aria-label="Toggle best seller"
              />
              <span className="hint">Tagged with a BEST SELLER badge.</span>
            </div>

            <div className="field form-wide">
              <label>Occasions</label>
              <div className="occasions-checkbox-grid">
                {OCCASIONS.map((o) => (
                  <label key={o}>
                    <input type="checkbox" checked={occasionSet.includes(o)} onChange={() => toggleOccasion(o)} />
                    {o}
                  </label>
                ))}
              </div>
              <span className="hint">Occasion filters link from the homepage and Collections page.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" className="btn btn-choco btn-lg" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
            <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}