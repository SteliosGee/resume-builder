function SuccessAnimation({ show, onComplete }) {
  if (!show) return null

  return (
    <div className="success-overlay" onAnimationEnd={onComplete}>
      <div className="success-checkmark">
        <svg className="checkmark-svg" viewBox="0 0 100 100">
          <circle className="checkmark-circle" cx="50" cy="50" r="45" />
          <path className="checkmark-check" d="M30 50 L45 65 L70 35" />
        </svg>
        <p className="success-text">Download Complete!</p>
      </div>
    </div>
  )
}

export default SuccessAnimation
