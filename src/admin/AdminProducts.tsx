import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Minus, Search } from 'lucide-react'
import {
  fetchAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  adjustStock,
  replaceProductImages,
} from '@/lib/admin'
import { uploadProductImage, deleteStoredImage } from '@/lib/db'
import type { Product } from '@/lib/types'
import { formatPrice, discountedPrice } from '@/lib/utils'
import SafeImage from '@/components/ui/SafeImage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/context/ToastContext'
import { PageSpinner } from '@/components/ui/Feedback'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extraImages, setExtraImages] = useState<string[]>([])
  const { push } = useToast()

  const load = async () => setProducts(await fetchAdminProducts())
  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          (p.sku ?? '').toLowerCase().includes(query.trim().toLowerCase())
      ),
    [products, query]
  )

  async function toggleField(p: Product, field: 'featured' | 'best_seller' | 'is_active') {
    setBusyId(p.id + field)
    try {
      await updateAdminProduct(p.id, { [field]: !p[field] })
      await load()
      push(`${p.name} updated`, {})
    } catch (err) {
      push('Update failed', { sub: (err as Error).message })
    } finally {
      setBusyId(null)
    }
  }

  async function doAdjustStock(p: Product, delta: number) {
    setBusyId(p.id + 'stock')
    try {
      await adjustStock(p.id, delta)
      await load()
    } catch (err) {
      push('Stock update failed', { sub: (err as Error).message })
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete() {
    if (!deleting) return
    try {
      await deleteAdminProduct(deleting.id)
      await load()
      push('Product deleted', { sub: deleting.name + ' was removed from the studio' })
    } catch (err) {
      push('Delete failed', { sub: (err as Error).message })
    } finally {
      setDeleting(null)
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusyId(editing.id + 'edit')
    try {
      await updateAdminProduct(editing.id, {
        name: String(fd.get('name')),
        description: String(fd.get('description')),
        price: Number(fd.get('price')),
        discount: Number(fd.get('discount')),
        stock: Number(fd.get('stock')),
        sku: String(fd.get('sku')),
      })
      const fileInput = form.querySelector<HTMLInputElement>("input[name='mainImage']")
      const file = fileInput?.files?.[0]
      if (file) {
        const { url } = await uploadProductImage(file)
        await updateAdminProduct(editing.id, { image_url: url })
      }
      if (extraImages.length > 0) await replaceProductImages(editing.id, extraImages)
      await load()
      setEditing(null)
      setExtraImages([])
      push('Product saved', { sub: 'Changes are live in the shop 🌸' })
    } catch (err) {
      push('Save failed', { sub: (err as Error).message })
    } finally {
      setBusyId(null)
    }
  }

  async function handleExtraUpload(files: FileList | null) {
    if (!files || files.length === 0 || !editing) return
    setUploading(true)
    try {
      for (const f of Array.from(files).slice(0, 4)) {
        const { url } = await uploadProductImage(f)
        setExtraImages((prev) => [...prev, url])
      }
      push('Images uploaded', { sub: 'Remember to save the product' })
    } catch (err) {
      push('Upload failed', { sub: (err as Error).message })
    } finally {
      setUploading(false)
    }
  }

  async function removeExtraImage(url: string) {
    setExtraImages((prev) => prev.filter((u) => u !== url))
    const path = url.split('/').pop()
    if (path) void deleteStoredImage(path)
  }

  return (
    <div className="admin-view">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Product Management</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search width={16} height={16} />
              <input placeholder="Search products or SKU…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Link to="/admin/products/new" className="btn btn-choco btn-sm">
              <Plus width={16} height={16} /> Add Product
            </Link>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Best Seller</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="at-product">
                      {p.image_url ? (
                        <SafeImage src={p.image_url + '?auto=format&fit=crop&w=200&q=70'} alt="" />
                      ) : (
                        <div style={{ width: 48, height: 56, borderRadius: 9, background: 'var(--soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌸</div>
                      )}
                      <span>
                        <h5>{p.name}</h5>
                        <p>
                          {p.category?.name ?? '—'} · {p.sku ?? 'no SKU'}
                        </p>
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--choco)' }}>{formatPrice(discountedPrice(p))}</strong>
                    {p.discount > 0 && <br />}
                    {p.discount > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-sale">{p.discount}%</span>
                  </td>
                  <td>
                    <div className="stock-control">
                      <button onClick={() => void doAdjustStock(p, -1)} disabled={busyId === p.id + 'stock'} aria-label="Decrease stock">
                        <Minus width={13} height={13} />
                      </button>
                      <span className="stock-num" style={{ color: p.stock <= 5 ? '#c0392b' : 'var(--choco)' }}>{p.stock}</span>
                      <button onClick={() => void doAdjustStock(p, 1)} disabled={busyId === p.id + 'stock'} aria-label="Increase stock">
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <button className={`toggle ${p.featured ? 'on' : ''}`} onClick={() => void toggleField(p, 'featured')} aria-label="Toggle featured" />
                  </td>
                  <td>
                    <button className={`toggle ${p.best_seller ? 'on' : ''}`} onClick={() => void toggleField(p, 'best_seller')} aria-label="Toggle best seller" />
                  </td>
                  <td>
                    <button className={`toggle ${p.is_active ? 'on' : ''}`} onClick={() => void toggleField(p, 'is_active')} aria-label="Toggle visibility" />
                  </td>
                  <td>
                    <div className="at-actions">
                      <button className="at-btn" onClick={() => { setEditing(p); setExtraImages([]) }} aria-label="Edit product">
                        <Pencil width={15} height={15} />
                      </button>
                      <button className="at-btn danger" onClick={() => setDeleting(p)} aria-label="Delete product">
                        <Trash2 width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    No products{query && <> matching “{query}”</>}. {!query && <a href="/admin/products/new" style={{ color: 'var(--blush-deep)' }}>Add your first product →</a>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this product?"
        message={`"${deleting?.name}" and its images will be permanently removed from the shop. Customers with it in their cart will see it disappear.`}
        confirmLabel="Delete Product"
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />

      {editing && (
        <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 760 }}>
            <button className="modal-close" onClick={() => setEditing(null)} aria-label="Close">✕</button>
            <form onSubmit={onSaveEdit} style={{ padding: '38px 36px' }}>
              <h3 style={{ fontSize: 24, marginBottom: 24 }}>Edit “{editing.name}”</h3>
              <div className="admin-product-form">
                <div className="field form-wide">
                  <label htmlFor="ename">Product Name</label>
                  <input id="ename" name="name" defaultValue={editing.name} required />
                </div>
                <div className="field">
                  <label htmlFor="eprice">Price ($)</label>
                  <input id="eprice" name="price" type="number" step="0.01" min="0" defaultValue={editing.price} required />
                </div>
                <div className="field">
                  <label htmlFor="edisc">Discount (%)</label>
                  <input id="edisc" name="discount" type="number" min="0" max="90" defaultValue={editing.discount} required />
                </div>
                <div className="field">
                  <label htmlFor="estock">Stock</label>
                  <input id="estock" name="stock" type="number" min="0" defaultValue={editing.stock} required />
                </div>
                <div className="field">
                  <label htmlFor="esku">SKU</label>
                  <input id="esku" name="sku" defaultValue={editing.sku ?? ''} />
                </div>
                <div className="field form-wide">
                  <label htmlFor="edesc">Description</label>
                  <textarea id="edesc" name="description" defaultValue={editing.description ?? ''} />
                </div>
                <div className="field form-wide">
                  <label>Main Image</label>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 96, height: 110, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <SafeImage src={editing.image_url ?? ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <input type="file" name="mainImage" accept="image/*" />
                  </div>
                </div>
                <div className="field form-wide">
                  <label>Gallery Images</label>
                  <div className="image-upload-grid">
                    {(editing.images ?? []).map((g) => (
                      <div className="image-upload-box" key={g.image_url} style={{ pointerEvents: 'none' }}>
                        <SafeImage src={g.image_url + '?auto=format&fit=crop&w=200&q=70'} alt="" />
                      </div>
                    ))}
                    {extraImages.map((u) => (
                      <div className="image-upload-box" key={u}>
                        <SafeImage src={u} alt="" />
                        <button type="button" className="up-remove" onClick={() => void removeExtraImage(u)} aria-label="Remove image">✕</button>
                      </div>
                    ))}
                    <label className="image-upload-box" style={uploading ? { pointerEvents: 'none' } : undefined}>
                      {uploading ? <span className="spinner spinner-dark up-spinner" /> : <><Plus width={20} height={20} /> Add</>}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => void handleExtraUpload(e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-choco" disabled={busyId === editing.id + 'edit'}>
                  {busyId === editing.id + 'edit' ? <span className="spinner" /> : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}