/**
 * DraggableWindow.jsx
 * 
 * A reusable draggable window component.
 * 
 * - Props:
 *   - `title`: header text
 *   - `content`: React node shown inside the window
 *   - `onClose`: callback for closing
 * 
 * - Features:
 *   - Dragging via header
 *   - Expand/restore toggle (small vs. large)
 *   - Close button
 *   - Supports rendering multiple instances independently
 */


import React, { useState , useEffect, useRef} from 'react';
import '../Styles/DraggableWindow.css';

const DraggableWindow = ({content, onClose, title}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [isSmall, setIsSmall] = useState(true);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      className={`DraggableWindow ${isSmall ? '' : 'large'}`}
      style={{ top: position.y, left: position.x }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="draggable-header" onMouseDown={handleMouseDown}>
        <p>{title}</p>
        <div className='icons'>
            <img className='icon' src="/Close Icon.svg" onClick={onClose}/>
            <img className='icon' src="/Expand Icon.svg"  onClick={(e) => {e.stopPropagation();if (isSmall) {setPosition({ x: 0, y: 0 });//Set position to top-left
    }
    setIsSmall(!isSmall);
  }}/>
        </div>
      </div>
      <div className="draggable-content">
        {content}
      </div>
    </div>
  );
};

export default DraggableWindow;