import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { API_BASE } from '../config';

export default function AdminMenu({ menuItems, categories, token, onRefreshData }) {
  const [editingItem, setEditingItem] = useState(null); // null means not editing or creating
  const [isCreating, setIsCreating] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dietaryType, setDietaryType] = useState('veg');
  const [allergensInput, setAllergensInput] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [calories, setCalories] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory(categories[0]?.name || '');
    setImage('');
    setTagsInput('');
    setDietaryType('veg');
    setAllergensInput('');
    setIngredientsInput('');
    setCalories('');
    setPrepTime('');
    setIsAvailable(true);
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleOpenEdit = (item) => {
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategory(item.category);
    setImage(item.image);
    setTagsInput(item.tags ? item.tags.join(', ') : '');
    setDietaryType(item.dietaryType || 'veg');
    setAllergensInput(item.allergens ? item.allergens.join(', ') : '');
    setIngredientsInput(item.ingredients ? item.ingredients.join(', ') : '');
    setCalories(item.calories ? String(item.calories) : '');
    setPrepTime(item.prepTime ? String(item.prepTime) : '');
    setIsAvailable(item.isAvailable !== undefined ? item.isAvailable : true);
    
    setError('');
    setIsCreating(false);
    setEditingItem(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      setError('Please provide Name, Price, and Category');
      return;
    }

    setSubmitting(true);
    const itemData = {
      name,
      description,
      price: parseFloat(price),
      category,
      image: image.trim() || undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
      dietaryType,
      allergens: allergensInput.split(',').map(a => a.trim()).filter(a => a !== ''),
      ingredients: ingredientsInput.split(',').map(i => i.trim()).filter(i => i !== ''),
      calories: calories ? parseInt(calories) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      isAvailable
    };

    try {
      const url = isCreating 
        ? `${API_BASE}/menu`
        : `${API_BASE}/menu/${editingItem._id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'API operations failed');
      }

      await onRefreshData();
      setIsCreating(false);
      setEditingItem(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this culinary dish from the menu?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}`, {
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

  const toggleAvailabilityInline = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/menu/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...item,
          isAvailable: !item.isAvailable
        })
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
      
      <div className="admin-crud-header">
        <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-gradient">Menu Dishes Manager</h2>
        <button className="admin-crud-btn" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Forms Drawer/Modal overlay */}
      {(isCreating || editingItem) && (
        <div className="modal-backdrop" onClick={() => { setIsCreating(false); setEditingItem(null); }}>
          <div className="detail-modal glassmorphism" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="cart-header" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>{isCreating ? 'Create Gourmet Dish' : `Edit: ${editingItem.name}`}</h3>
              <button onClick={() => { setIsCreating(false); setEditingItem(null); }} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="detail-modal-content" style={{ padding: '1.5rem', gap: '1rem' }}>
              {error && <div style={{ color: 'var(--accent-nonveg)', background: 'var(--accent-nonveg-glow)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>⚠️ {error}</div>}
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Dish Name*</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)*</label>
                  <input type="number" step="0.01" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category*</label>
                  <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dietary Type</label>
                  <select className="form-control" value={dietaryType} onChange={e => setDietaryType(e.target.value)}>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows="2" className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Unsplash or direct link)</label>
                <input type="url" className="form-control" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Prep Time (mins)</label>
                  <input type="number" className="form-control" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input type="number" className="form-control" value={calories} onChange={e => setCalories(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Key Ingredients (comma-separated)</label>
                <input type="text" className="form-control" placeholder="e.g. Potatoes, Butter, Cheese" value={ingredientsInput} onChange={e => setIngredientsInput(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Allergens (comma-separated)</label>
                <input type="text" className="form-control" placeholder="e.g. Dairy, Gluten" value={allergensInput} onChange={e => setAllergensInput(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input type="text" className="form-control" placeholder="e.g. Best Seller, Spicy, Cold" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input type="checkbox" id="availCheck" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />
                <label htmlFor="availCheck" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Available in Stock</label>
              </div>

              <button type="submit" className="place-order-btn" style={{ marginTop: '1rem' }} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Culinary Dish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dishes Table */}
      <section className="analytics-panel glassmorphism" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Dish Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id}>
                <td>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                </td>
                <td style={{ fontWeight: '600' }}>
                  <div>{item.name}</div>
                  <span className={`tag-badge`} style={{ fontSize: '0.65rem', background: item.dietaryType === 'veg' ? 'var(--accent-veg-glow)' : 'var(--accent-nonveg-glow)', color: item.dietaryType === 'veg' ? 'var(--accent-veg)' : 'var(--accent-nonveg)' }}>
                    {item.dietaryType.toUpperCase()}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{item.category}</td>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{item.price.toFixed(2)}</td>
                <td>
                  <button 
                    className="filter-btn" 
                    style={{ 
                      padding: '0.25rem 0.6rem', 
                      fontSize: '0.75rem', 
                      borderColor: item.isAvailable ? 'var(--accent-veg)' : 'var(--accent-nonveg)', 
                      color: item.isAvailable ? 'var(--accent-veg)' : 'var(--accent-nonveg)', 
                      background: item.isAvailable ? 'var(--accent-veg-glow)' : 'var(--accent-nonveg-glow)' 
                    }}
                    onClick={() => toggleAvailabilityInline(item)}
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </td>
                <td>⭐ {item.averageRating > 0 ? item.averageRating : 'New'}</td>
                <td>
                  <div className="crud-actions">
                    <button className="crud-edit-btn" onClick={() => handleOpenEdit(item)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="crud-delete-btn" onClick={() => handleDelete(item._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
