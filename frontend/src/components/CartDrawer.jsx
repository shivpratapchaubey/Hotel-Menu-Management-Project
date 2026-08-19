import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem,
  onCheckout,
  note,
  onUpdateNote
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% Tax
  const serviceCharge = subtotal > 0 ? 3.99 : 0; // Flat service charge or delivery/table fee
  const total = subtotal + tax + serviceCharge;

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="cart-drawer-backdrop animate-fade" onClick={onClose} />}

      {/* Slide Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} className="logo-icon" />
            <h3 style={{ fontWeight: 700 }}>Your Dine-In Cart</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* List of Cart Items */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <ShoppingBag size={48} style={{ strokeWidth: 1.5 }} />
              <h4>Your cart is empty</h4>
              <p style={{ fontSize: '0.85rem' }}>Select dishes from the menu to populate your order.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>

                <div className="qty-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => onUpdateQty(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button 
                  className="remove-item-btn"
                  onClick={() => onRemoveItem(item._id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing Details */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            
            {/* Cooking Notes */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Special Instructions / Cooking Notes</label>
              <textarea 
                className="form-control" 
                rows="2" 
                style={{ fontSize: '0.8rem', resize: 'none' }}
                placeholder="e.g., Make it extra spicy, Allergen alert, Onion-free..."
                value={note}
                onChange={(e) => onUpdateNote(e.target.value)}
              />
            </div>

            {/* Bill breakdown */}
            <div className="bill-details">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>VAT / Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Table Service Fee</span>
                <span>₹{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="bill-row total">
                <span>Est. Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Proceed to checkout button */}
            <button 
              className="place-order-btn"
              onClick={onCheckout}
            >
              <span>Verify and Send Order</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
