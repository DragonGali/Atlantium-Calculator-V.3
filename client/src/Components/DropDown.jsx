/**
 * DropDown.jsx (Updated for Backend Integration)
 * 
 * A custom dropdown menu with animated stacked options.
 * Now properly handles controlled state with backend integration.
 * 
 * - Props:
 *   - `options`: array of { label, value } items (or strings)
 *   - `placeholder`: text shown before selection
 *   - `colors`: alternating background colors for options
 *   - `value` + `onChange`: controlled usage
 * 
 * - Features:
 *   - Works controlled or uncontrolled
 *   - Animated expand/collapse
 *   - Customizable colors per option
 *   - Displays label while storing value
 */

import React, { useState, useEffect } from 'react';
import '../Styles/DropDown.css';

const Dropdown = ({ 
  options = ['aaaaa', 'bbbbb', 'ccccc'], 
  placeholder = "Select an option",
  colors = ['var(--primary)', 'var(--title-box)'],
  value,
  onChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  // Normalize options to always have { label, value } format
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  // If parent passes value, prefer it over internal state
  const selectedValue = value ?? internalValue;

  // Find the label for the current value
  const getDisplayLabel = () => {
    const option = normalizedOptions.find(opt => opt.value === selectedValue);
    return option ? option.label : (selectedValue || placeholder);
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleSelect = (option) => {
    const valueToSet = option.value ?? option.label;
    
    if (onChange) {
      onChange(valueToSet); // notify parent with value
    } else {
      setInternalValue(valueToSet); // uncontrolled fallback
    }
    setIsActive(false);
  };

  const getColor = (index) => colors[index % colors.length];

  const getTransform = (index, isActive) => {
    if (!isActive) return `translateY(${3 * index}%)`;
    return `translateY(${100 * (index)}%)`;
  };

  return (
    <div className="dropdown-wrapper">
      <div 
        className={`dropdown ${isActive ? 'active' : ''}`}
      >
        {/* Label */}
        <span
          className="dropdown-label"
          onClick={handleToggle}
        >
          <span className='dropdown-text'>{getDisplayLabel()}</span>
          <span className="dropdown-arrow">
            {isActive ? '▲' : '▼'}
          </span>
        </span>

        {/* Options */}
        <ul className="dropdown-list">
          {normalizedOptions.map((option, index) => (
            <li
              key={option.value || index}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
              style={{
                backgroundColor: getColor(index),
                zIndex: options.length - index,
              }}
            >
              <span>
                {option.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;