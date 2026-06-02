import { useState } from 'react'

function SectionReorder({ order, setOrder }) {
  const [draggedIndex, setDraggedIndex] = useState(null)

  const sectionLabels = {
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newOrder = [...order]
    const draggedItem = newOrder[draggedIndex]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(index, 0, draggedItem)
    setOrder(newOrder)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newOrder = [...order]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setOrder(newOrder)
  }

  const moveDown = (index) => {
    if (index === order.length - 1) return
    const newOrder = [...order]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setOrder(newOrder)
  }

  return (
    <div className="section-reorder">
      <h4>Section Order</h4>
      <p className="reorder-hint">Drag to reorder or use arrows</p>
      <div className="reorder-list">
        {order.map((section, index) => (
          <div
            key={section}
            className={`reorder-item ${draggedIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <span className="drag-handle">⋮⋮</span>
            <span className="section-name">{sectionLabels[section] || section}</span>
            <div className="reorder-buttons">
              <button
                className="reorder-btn"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                className="reorder-btn"
                onClick={() => moveDown(index)}
                disabled={index === order.length - 1}
                title="Move down"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionReorder
