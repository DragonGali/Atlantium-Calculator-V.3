/**
 * Checkbox.jsx
 * 
 * A custom-styled checkbox component with a label.
 * Can be disabled, set to checked, and calls onChange when toggled.
 */

import React from 'react';
import '../Styles/CheckBox.css';

const Checkbox = ({
  text = "Vertical",
  disabled = false,
  checked = false,
  onChange = () => {}
}) => {
  return (
    <div className="check-box">
      <label>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)} // call parent handler
        />
        <span className="label-text">{text}</span>
      </label>
    </div>
  );
};

export default Checkbox;
