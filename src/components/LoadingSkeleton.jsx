function LoadingSkeleton() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      <div className="skeleton-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
      </div>
      <div className="skeleton-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
      </div>
      <div className="skeleton-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
