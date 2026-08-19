import React, { useState } from 'react';
import { X, Flame, Clock, Apple, Star, User } from 'lucide-react';

export default function ItemDetailModal({ item, onClose, onAddReview, onAddToCart }) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    const success = await onAddReview(item._id, {
      customerName: customerName.trim() || 'Anonymous Diner',
      rating: parseInt(rating),
      comment: comment.trim()
    });
    setSubmitting(false);
    if (success) {
      setCustomerName('');
      setRating(5);
      setComment('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal glassmorphism" onClick={(e) => e.stopPropagation()}>
        
        {/* Large Image Header */}
        <div className="detail-modal-img-container">
          <img src={item.image} alt={item.name} className="detail-modal-img" />
          <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="detail-modal-content">
          
          <div className="detail-header">
            <div className="detail-title-row">
              <h2 className="detail-title">{item.name}</h2>
              <span className="item-card-price" style={{ fontSize: '1.6rem' }}>
                ₹{item.price.toFixed(2)}
              </span>
            </div>
            
            <div className="detail-tags">
              <span className={`tag-badge`} style={{ 
                background: item.dietaryType === 'veg' ? 'var(--accent-veg-glow)' : 'var(--accent-nonveg-glow)',
                color: item.dietaryType === 'veg' ? 'var(--accent-veg)' : 'var(--accent-nonveg)',
                fontWeight: '600'
              }}>
                {item.dietaryType.toUpperCase()}
              </span>
              {item.tags && item.tags.map((tag, idx) => (
                <span key={idx} className="tag-badge">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="detail-meta-grid">
            <div className="meta-box">
              <Clock className="meta-icon" size={18} />
              <span className="meta-val">{item.prepTime || 15} mins</span>
              <span className="meta-lbl">Prep Time</span>
            </div>
            <div className="meta-box">
              <Apple className="meta-icon" size={18} />
              <span className="meta-val">{item.calories || 350} kcal</span>
              <span className="meta-lbl">Calories</span>
            </div>
            <div className="meta-box">
              <Star className="meta-icon" size={18} />
              <span className="meta-val">{item.averageRating || 'New'}</span>
              <span className="meta-lbl">Rating ({item.reviews ? item.reviews.length : 0})</span>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <h4 className="form-label">Description</h4>
            <p className="detail-desc">{item.description}</p>
          </div>

          {/* Ingredients list */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="form-group">
              <h4 className="form-label">Key Ingredients</h4>
              <div className="ingredients-list">
                {item.ingredients.map((ing, idx) => (
                  <span key={idx} className="ing-badge">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens warning */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="form-group" style={{ 
              background: 'rgba(239, 68, 68, 0.05)', 
              padding: '0.8rem 1.2rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}>
              <h4 className="form-label" style={{ color: 'var(--accent-nonveg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ⚠️ Allergens Warning
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Contains: {item.allergens.join(', ')}. Please inform the server if you have any hypersensitivities.
              </p>
            </div>
          )}

          {/* Add to Cart button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            {item.isAvailable ? (
              <button 
                className="add-cart-btn" 
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}
                onClick={() => {
                  onAddToCart(item);
                  onClose();
                }}
              >
                Add to Order Cart
              </button>
            ) : (
              <button className="add-cart-btn" style={{ width: '100%', padding: '1rem', background: 'var(--surface-border)', color: 'var(--text-muted)' }} disabled>
                Currently Out of Stock
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="review-form-section">
            <h3 className="detail-title" style={{ fontSize: '1.25rem' }}>Diner Feedbacks</h3>
            
            {/* Reviews list scroll */}
            <div className="reviews-container">
              {(!item.reviews || item.reviews.length === 0) ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No reviews yet. Be the first to share your dining experience!
                </p>
              ) : (
                item.reviews.map((rev, idx) => (
                  <div key={idx} className="review-card">
                    <div className="review-user-row">
                      <span className="review-user">{rev.customerName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
                        <Star size={12} fill="var(--primary)" /> {rev.rating}/5
                      </span>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleSubmitReview} className="form-group" style={{ gap: '0.75rem', marginTop: '1rem' }}>
              <h4 className="form-label">Rate this Dish</h4>
              
              <div className="form-grid-2">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Your Name (optional)" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                
                <div className="rating-input-row">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20}
                      className={`star-input ${star <= rating ? 'active' : ''}`}
                      fill={star <= rating ? 'var(--primary)' : 'none'}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              <textarea 
                className="review-input" 
                rows="2" 
                placeholder="What did you think of the flavor, texture, and presentation?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <button 
                type="submit" 
                className="submit-review-btn" 
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
