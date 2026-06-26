/**
 * Tooltip.jsx
 *
 * Simple tooltip component that displays help text on hover with a delay.
 * Uses React Portal to render tooltip outside component hierarchy.
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../Styles/Tooltip.css';

const Tooltip = ({ text, children, position = 'top', delay = 1000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const targetRef = useRef(null);

  const updatePosition = () => {
    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const gap = 8;

    let top, left;
    switch (position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
      default: // top
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
    }
    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    if (!text) return;
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!text) return children;

  // Clone child and attach ref + event handlers
  const child = React.Children.only(children);
  const wrappedChild = React.cloneElement(child, {
    ref: targetRef,
    onMouseEnter: (e) => {
      handleMouseEnter();
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e) => {
      handleMouseLeave();
      child.props.onMouseLeave?.(e);
    },
  });

  return (
    <>
      {wrappedChild}
      {isVisible && ReactDOM.createPortal(
        <div
          className={`tooltip-content tooltip-${position} visible`}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
          <div className="tooltip-arrow" />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;