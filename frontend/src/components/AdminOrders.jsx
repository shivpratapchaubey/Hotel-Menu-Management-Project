import React, { useState, useEffect } from 'react';
import { Clock, Check, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config';

export default function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time ticking relative time counter
  const [tick, setTick] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll orders every 4 seconds for immediate kitchen notification
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [token]);

  // Clock tick to force re-render of elapsed order timers
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000); // every 30s
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // optimistically update local state for faster interface feel
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Helper to format elapsed time (e.g. "12m ago")
  const getElapsedString = (isoString) => {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <h3>Loading active order lists...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-nonveg)' }}>
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Filter orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const servedOrders = orders.filter(o => o.status === 'served');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const getStatusColumn = (title, count, list, targetStatus, btnLabel, btnStatus) => {
    return (
      <div className="kot-col glassmorphism">
        <div className="kot-col-header">
          <span>{title}</span>
          <span className="kot-count">{count}</span>
        </div>

        <div className="kot-list">
          {list.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '2rem 0' }}>
              No orders in this state.
            </p>
          ) : (
            list.map((order) => (
              <div key={order._id} className="kot-ticket glassmorphism animate-scale">
                <div className="kot-ticket-header">
                  <span className="kot-table-no">Table {order.tableNumber}</span>
                  <span className="kot-time">
                    <Clock size={12} /> {getElapsedString(order.createdAt)}
                  </span>
                </div>

                <div className="kot-cust-name" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} style={{ color: 'var(--primary)' }} />
                  <span>{order.customerDetails.name}</span>
                </div>

                {/* Items */}
                <div className="kot-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="kot-item-row">
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                      <span style={{ fontWeight: '700' }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {order.note && (
                  <div className="kot-note" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem' }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>"{order.note}"</span>
                  </div>
                )}

                {/* Action button */}
                {btnStatus && (
                  <div className="kot-actions">
                    <button 
                      className="kot-btn primary"
                      onClick={() => handleUpdateStatus(order._id, btnStatus)}
                    >
                      {btnLabel}
                    </button>
                  </div>
                )}

                {/* Served orders complete billing option */}
                {order.status === 'completed' && order.feedback && order.feedback.rating && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-veg)', borderTop: '1px dotted var(--surface-border)', paddingTop: '0.5rem' }}>
                    ⭐ Feedback: {order.feedback.rating}/5 - "{order.feedback.comment || 'No comment'}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container animate-fade">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1rem' }} className="text-gradient">
        Live Kitchen Orders Dashboard (KOT Board)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Kitchen staff receives orders instantly. Progress tickets chronologically to keep tables served.
      </p>

      <section className="kot-board">
        {getStatusColumn('1. Received (Pending)', pendingOrders.length, pendingOrders, 'pending', 'Accept & Prepare', 'preparing')}
        {getStatusColumn('2. In Kitchen (Preparing)', preparingOrders.length, preparingOrders, 'preparing', 'Mark Served', 'served')}
        {getStatusColumn('3. Served (At Table)', servedOrders.length, servedOrders, 'served', 'Close & Bill', 'completed')}
        {getStatusColumn('4. Completed (Archived)', completedOrders.length, completedOrders, 'completed', null, null)}
      </section>
    </div>
  );
}
