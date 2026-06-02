import { useState } from 'react'

function Tooltip({ children, text, position = 'top' }) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`tooltip tooltip-${position}`}>
          {text}
        </div>
      )}
    </div>
  )
}

export default Tooltip
