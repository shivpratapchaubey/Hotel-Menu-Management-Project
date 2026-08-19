import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminCategories({ categories, token, onRefreshData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to create category');
      }

      await onRefreshData();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Are you sure you want to remove this category? Menu items under this category will remain, but their category label will have to be remapped.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-container animate-fade">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1.5rem' }} className="text-gradient">
        Menu Categories Editor
      </h2>

      <div className="dashboard-grid">
        
        {/* Create Category Panel */}
        <div className="analytics-panel glassmorphism">
          <h3 className="category-title" style={{ color: 'var(--text-main)' }}>Create Food Category</h3>
          
          <form onSubmit={handleSubmit} className="form-group" style={{ gap: '1.25rem', marginTop: '1rem' }}>
            {error && (
              <div style={{ color: 'var(--accent-nonveg)', background: 'var(--accent-nonveg-glow)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Category Title*</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Starters, Main Course, Soup..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="Brief summary of category offerings..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="place-order-btn"
              disabled={submitting}
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="analytics-panel glassmorphism">
          <h3 className="category-title" style={{ color: 'var(--text-main)' }}>Existing Categories ({categories.length})</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                No categories defined.
              </p>
            ) : (
              categories.map((cat) => (
                <div 
                  key={cat._id} 
                  className="popular-item-row"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{cat.name}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                  <button 
                    className="crud-delete-btn" 
                    style={{ padding: '0.25rem', marginTop: '0.25rem' }}
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
