import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ShoppingCart, Eye, X, ChevronDown } from 'lucide-react';
import { ordersAPI, productsAPI, customersAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const statusBadge = (s) => ({ pending: 'badge-yellow', completed: 'badge-green', cancelled: 'badge-red', processing: 'badge-blue' }[s] || 'badge-gray');

function CreateOrderModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([customersAPI.getAll(), productsAPI.getAll()]).then(([c, p]) => {
      setCustomers(c.data);
      setProducts(p.data.filter(p => p.quantity > 0));
    });
  }, []);

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx, field, val) => {
    setItems(items.map((item, j) => j === idx ? { ...item, [field]: val } : item));
  };

  const getProduct = (id) => products.find(p => p.id === +id);

  const total = items.reduce((sum, item) => {
    const p = getProduct(item.product_id);
    return sum + (p ? p.price * (item.quantity || 0) : 0);
  }, 0);

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Select a customer';
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) e.items = 'Add at least one item';
    items.forEach((item, idx) => {
      const p = getProduct(item.product_id);
      if (p && item.quantity > p.quantity) {
        e[`item_${idx}`] = `Only ${p.quantity} in stock`;
      }
    });
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await ordersAPI.create({
        customer_id: +customerId,
        notes,
        items: items.filter(i => i.product_id && i.quantity > 0).map(i => ({
          product_id: +i.product_id,
          quantity: +i.quantity
        }))
      });
      toast.success('Order created successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid" style={{ gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Customer *</label>
          <select className={`form-input${errors.customer ? ' error' : ''}`}
            value={customerId} onChange={e => { setCustomerId(e.target.value); setErrors(er => ({...er, customer: ''})); }}>
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
          </select>
          {errors.customer && <span className="form-error">{errors.customer}</span>}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label">Order Items *</label>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={12} /> Add Item
            </button>
          </div>
          {errors.items && <span className="form-error" style={{ marginBottom: 8, display: 'block' }}>{errors.items}</span>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, idx) => {
              const prod = getProduct(item.product_id);
              return (
                <div key={idx} className="order-item-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select className="form-input" value={item.product_id}
                      onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)}) — Stock: {p.quantity}</option>
                      ))}
                    </select>
                    {errors[`item_${idx}`] && <span className="form-error">{errors[`item_${idx}`]}</span>}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                    <input type="number" min={1} max={prod?.quantity || 9999}
                      className="form-input" value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                  </div>
                  {items.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)}
                      style={{ color: 'var(--accent-danger)', alignSelf: 'flex-start', marginTop: 2 }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Estimated Total</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-success)' }}>
            ${total.toFixed(2)}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input" rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Order notes..." />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </form>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Order ID</div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontSize: 18, fontWeight: 600 }}>
            #{String(order.id).padStart(4, '0')}
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Status</div>
          <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Customer</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{order.customer?.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer?.email}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Amount</div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-success)', fontSize: 20, fontWeight: 700 }}>
            ${order.total_amount.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Order Items</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Product</th>
              <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Unit Price</th>
              <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Qty</th>
              <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 0' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{item.product?.name || `Product #${item.product_id}`}</div>
                  {item.product?.sku && <span className="sku-pill">{item.product.sku}</span>}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>${item.unit_price.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>×{item.quantity}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-success)', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Notes</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.notes}</div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    ordersAPI.getAll().then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o =>
    String(o.id).includes(search) ||
    (o.customer?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    o.status.includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await ordersAPI.delete(deleting.id);
      toast.success('Order cancelled and stock restored');
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setDeleteLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{orders.length} total orders</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Order
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search size={15} />
            <input className="form-input search-input" placeholder="Search by ID, customer, status..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="topbar-badge">{filtered.length} results</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} />
              <h3>No orders found</h3>
              <p>{search ? 'Try a different search' : 'Create your first order to get started'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-accent)' }}>
                        #{String(o.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td className="td-primary">{o.customer?.full_name || '—'}</td>
                    <td>
                      <span className="badge badge-gray">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-success)', fontWeight: 600 }}>
                      ${o.total_amount.toFixed(2)}
                    </td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" title="View details" onClick={() => setViewing(o)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Cancel order"
                          onClick={() => setDeleting(o)}
                          style={{ color: 'var(--accent-danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && (
        <Modal title="Create New Order" onClose={() => setShowCreate(false)} size="lg">
          <CreateOrderModal onClose={() => setShowCreate(false)} onCreated={load} />
        </Modal>
      )}

      {viewing && (
        <Modal title={`Order #${String(viewing.id).padStart(4, '0')}`} onClose={() => setViewing(null)} size="lg">
          <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${String(deleting.id).padStart(4, '0')}? Stock will be restored automatically.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
