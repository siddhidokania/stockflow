import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Users, Mail, Phone } from 'lucide-react';
import { customersAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const INIT = { full_name: '', email: '', phone: '', address: '' };

function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid" style={{ gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className={`form-input${errors.full_name ? ' error' : ''}`} value={form.full_name}
            onChange={e => set('full_name', e.target.value)} placeholder="John Doe" />
          {errors.full_name && <span className="form-error">{errors.full_name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input type="email" className={`form-input${errors.email ? ' error' : ''}`} value={form.email}
            onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input type="tel" className="form-input" value={form.phone}
            onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="form-input" rows={2} value={form.address}
            onChange={e => set('address', e.target.value)} placeholder="Street, City, Country" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Add Customer'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    customersAPI.getAll().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      await customersAPI.create(data);
      toast.success('Customer added successfully');
      setShowAdd(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await customersAPI.delete(deleting.id);
      toast.success('Customer deleted');
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
          <div className="page-title">Customers</div>
          <div className="page-subtitle">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search size={15} />
            <input className="form-input search-input" placeholder="Search customers..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="topbar-badge">{filtered.length} results</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No customers found</h3>
              <p>{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="td-primary">{c.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', fontSize: 13 }}>
                        <Mail size={12} /> {c.email}
                      </div>
                    </td>
                    <td>
                      {c.phone
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Phone size={12} /> {c.phone}</div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {c.address ? c.address.substring(0, 40) + (c.address.length > 40 ? '...' : '') : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon" title="Delete"
                        onClick={() => setDeleting(c)}
                        style={{ color: 'var(--accent-danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add New Customer" onClose={() => setShowAdd(false)}>
          <CustomerForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${deleting.full_name}"? Their order history will also be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
