import React, { useState } from 'react';
import "../Styles/FlowDosePrompt.css"

const FlowDosePrompt = ({ onClose, appState, updateState }) => {
  const [doseValue, setDoseValue] = useState('');

  const handleSubmit = () => {
    if (doseValue) {
      updateState({'doseValue' : doseValue});
      onClose();
    }
  };

  return (
    <div className="overlay">
      <div className="prompt-container">
        <p className='title'>Enter Dose Value</p>
        <div className="input-group">
          <input
            type="text"
            value={doseValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+\.?\d*$/.test(val)) {
                setDoseValue(val);
              }
            }}
            placeholder="Enter only numbers..."
            autoFocus
            className='input-dose'
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="button-group">
          <button className="submit-btn" onClick={handleSubmit}>
            OK
          </button>
          <button className="cancel-btn" onClick={() => {onClose();}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowDosePrompt;