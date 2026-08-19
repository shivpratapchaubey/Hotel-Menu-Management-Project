import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function CheckoutModal({ onClose, onSubmit, defaultTable }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [table, setTable] = useState(defaultTable || '1');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for the order ticket');
      return;
    }
    if (!table) {
      setError('Please select your table number');
      return;
    }
    
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      tableNumber: table
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal glassmorphism" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cart-header" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700 }}>Confirm Dining Details</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ color: 'var(--accent-nonveg)', background: 'var(--accent-nonveg-glow)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Table number selection */}
          <div className="form-group">
            <label className="form-label">Table Number</label>
            <select 
              className="form-control"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                <option key={num} value={String(num)}>Table {num}</option>
              ))}
            </select>
          </div>

          {/* Customer name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text"
              className="form-control"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Customer phone number */}
          <div className="form-group">
            <label className="form-label">Contact Number (Optional)</label>
            <input 
              type="tel"
              className="form-control"
              placeholder="e.g., +1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Bottom buttons */}
          <button 
            type="submit" 
            className="place-order-btn" 
            style={{ marginTop: '0.5rem' }}
          >
            <CheckCircle size={18} />
            <span>Confirm and Send to Kitchen</span>
          </button>
        </form>

      </div>
    </div>
  );
}
