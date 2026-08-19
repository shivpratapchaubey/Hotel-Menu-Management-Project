import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronRight, Star, HeartHandshake, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function OrderTracker({ orderId, onCloseTracker }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showQR, setShowQR] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Poll order status every 5 seconds to show live kitchen updates
  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        
        // Find our order
        const currentOrder = data.find(o => o._id === orderId);
        if (currentOrder && active) {
          setOrder(currentOrder);
          setLoading(false);
          // If order has feedback already, reflect it
          if (currentOrder.feedback && currentOrder.feedback.rating) {
            setFeedbackSubmitted(true);
          }
        } else if (active) {
          setError('Order not found or was removed.');
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError('Unable to fetch live status. Please check connection.');
          setLoading(false);
        }
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="tracker-container glassmorphism animate-fade" style={{ textAlign: 'center', padding: '4rem' }}>
        <Clock className="logo-icon" size={48} style={{ margin: '0 auto 1.5rem auto' }} />
        <h3>Retrieving order details...</h3>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracker-container glassmorphism animate-fade" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--accent-nonveg)' }}>Error</h3>
        <p style={{ margin: '1rem 0' }}>{error || 'Something went wrong.'}</p>
        <button className="add-cart-btn" onClick={onCloseTracker} style={{ margin: '0 auto' }}>
          Back to Menu
        </button>
      </div>
    );
  }

  // Calculate values
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = order.totalAmount;

  // Determine active step index
  // pending: 0, preparing: 1, served: 2, completed: 3
  const statusSteps = ['pending', 'preparing', 'served', 'completed'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="tracker-container glassmorphism animate-slide-up">
      
      {/* Header */}
      <div className="tracker-title">
        <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>Order Live Tracker</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket ID: {order._id}</span>
      </div>

      {/* Progress Timeline */}
      <div className="progress-timeline">
        <div className={`timeline-step ${currentStepIndex >= 0 ? (currentStepIndex === 0 ? 'active' : 'completed') : ''}`}>
          <div className="step-node">
            {currentStepIndex > 0 ? <CheckCircle2 size={16} /> : '1'}
          </div>
          <span className="step-label">Received</span>
        </div>

        <div className={`timeline-step ${currentStepIndex >= 1 ? (currentStepIndex === 1 ? 'active' : 'completed') : ''}`}>
          <div className="step-node">
            {currentStepIndex > 1 ? <CheckCircle2 size={16} /> : '2'}
          </div>
          <span className="step-label">Preparing</span>
        </div>

        <div className={`timeline-step ${currentStepIndex >= 2 ? (currentStepIndex === 2 ? 'active' : 'completed') : ''}`}>
          <div className="step-node">
            {currentStepIndex > 2 ? <CheckCircle2 size={16} /> : '3'}
          </div>
          <span className="step-label">Served</span>
        </div>

        <div className={`timeline-step ${currentStepIndex >= 3 ? (currentStepIndex === 3 ? 'active' : 'completed') : ''}`}>
          <div className="step-node">
            {currentStepIndex > 3 ? <CheckCircle2 size={16} /> : '4'}
          </div>
          <span className="step-label">Completed</span>
        </div>
      </div>

      {/* Status Description Callout */}
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        borderRadius: 'var(--radius-md)', 
        background: 'var(--primary-glow)',
        border: '1px solid rgba(249, 115, 22, 0.1)',
        fontWeight: '500'
      }}>
        {order.status === 'pending' && "📋 Kitchen has received your order. Checking ingredient stocks."}
        {order.status === 'preparing' && "🔥 Chef is preparing your dishes. Smell the freshness!"}
        {order.status === 'served' && "🔔 Your order is served! Enjoy your gourmet dining."}
        {order.status === 'completed' && "✅ Dining complete. Thank you for eating with us!"}
      </div>

      {/* Receipt Layout */}
      <div className="receipt-card">
        <div className="receipt-header">
          <div className="receipt-title">GRAND ROYAL GOURMET</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Table: {order.tableNumber} | Order: #{order._id.substring(0, 6)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()} | Cashier: Kitchen
          </div>
        </div>

        <div className="receipt-items">
          {items.map((item, idx) => (
            <div key={idx} className="receipt-row" style={{ fontSize: '0.85rem' }}>
              <span>{item.name} x{item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
          <div className="receipt-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-row">
            <span>VAT (8%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="receipt-row" style={{ fontWeight: 'bold' }}>
            <span>Total Paid:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {order.note && (
          <div style={{ borderTop: '1px dashed var(--text-muted)', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Note: {order.note}
          </div>
        )}
      </div>

          {/* QR Code for Payment (optional) */}
          {showQR && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>Scan to pay ₹{total.toFixed(2)}</div>
              <QRCode value={`https://pay.example.com?amount=${total.toFixed(2)}`} size={128} />
            </div>
          )}
          {/* Toggle QR Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button className="theme-toggle" onClick={() => setShowQR(!showQR)} style={{ padding: '0.4rem 0.8rem' }}>
              {showQR ? 'Hide QR' : 'Show QR for Payment'}
            </button>
          </div>
          {/* Print Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="theme-toggle" onClick={handlePrint} style={{ padding: '0.6rem 1.2rem', gap: '0.5rem' }}>
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
          </div>

      {/* Customer feedback Form */}
      <div className="review-form-section">
        <h3 className="detail-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartHandshake size={20} style={{ color: 'var(--primary)' }} />
          <span>Dining Experience Feedback</span>
        </h3>
        
        {feedbackSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--accent-veg)', fontWeight: 600 }}>
            🎉 Thank you! Your feedback has been registered.
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="form-group" style={{ gap: '1rem' }}>
            <div className="rating-input-row" style={{ justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={24}
                  className={`star-input ${star <= rating ? 'active' : ''}`}
                  fill={star <= rating ? 'var(--primary)' : 'none'}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea 
              className="review-input"
              rows="2"
              placeholder="Tell us about the kitchen speed, table service, or tastes..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button 
              type="submit" 
              className="place-order-btn" 
              style={{ padding: '0.75rem' }}
              disabled={submittingFeedback}
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* Close/Back Button */}
      <button 
        className="place-order-btn" 
        style={{ background: 'var(--surface-border)', color: 'var(--text-main)', padding: '0.8rem' }}
        onClick={onCloseTracker}
      >
        Close Tracker & Return Menu
      </button>

    </div>
  );
}
