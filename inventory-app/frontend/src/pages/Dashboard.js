import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { dashboardAPI } from '../utils/api';

const StatCard = ({ label, value, icon: Icon, color, prefix = '' }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon"><Icon size={18} /></div>
    <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    pending: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
    processing: 'badge-blue',
  };
  return map[status] || 'badge-gray';
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--accent-danger)' }}>
      <AlertTriangle size={32} style={{ marginBottom: 12 }} />
      <div>Failed to load dashboard: {error}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of your inventory and orders</div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Products" value={stats.total_products} icon={Package} color="var(--accent-primary)" />
        <StatCard label="Total Customers" value={stats.total_customers} icon={Users} color="var(--accent-cyan)" />
        <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingCart} color="var(--accent-secondary)" />
        <StatCard label="Total Revenue" value={stats.total_revenue.toFixed(2)} prefix="$" icon={DollarSign} color="var(--accent-success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} style={{ color: 'var(--accent-warning)' }} />
              Low Stock Alert
            </div>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-accent)', textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="table-wrapper">
            {stats.low_stock_products.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 24px' }}>
                <div style={{ fontSize: 14, color: 'var(--accent-success)' }}>✓ All products are well stocked</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map(p => (
                    <tr key={p.id}>
                      <td className="td-primary">{p.name}</td>
                      <td><span className="sku-pill">{p.sku}</span></td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                          {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={15} style={{ color: 'var(--accent-primary)' }} />
              Recent Orders
            </div>
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-accent)', textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="table-wrapper">
            {stats.recent_orders.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 24px' }}>
                <div style={{ fontSize: 14 }}>No orders yet</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-accent)' }}>
                          #{String(o.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="td-primary">{o.customer?.full_name || '—'}</td>
                      <td style={{ color: 'var(--accent-success)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                        ${o.total_amount.toFixed(2)}
                      </td>
                      <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
