import { useState } from 'react'

function PaymentModal({ onClose, onSuccess, resumeName }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeName,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (err) {
      setError('Cannot connect to payment server. Make sure server is running on port 3001.')
      setLoading(false)
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close" onClick={onClose}>
          ×
        </button>

        <div className="payment-header">
          <div className="payment-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <h2>Download Resume</h2>
          <p className="payment-subtitle">One-time payment to download your PDF</p>
        </div>

        <div className="payment-price">
          <span className="currency">€</span>
          <span className="amount">1</span>
          <span className="period">.00</span>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <button 
          className="payment-submit" 
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            'Pay with Stripe'
          )}
        </button>

        <div className="payment-footer">
          <div className="security-badges">
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Secure Payment
            </span>
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              SSL Encrypted
            </span>
          </div>
          <p className="powered-by">Powered by Stripe</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
