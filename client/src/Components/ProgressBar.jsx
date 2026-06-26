/**
 * ProgressBar.jsx
 * 
 * A simple horizontal progress bar.
 * 
 * - Props:
 *   - `progress`: current progress value
 *   - `maxProgress`: maximum progress value
 * 
 * - Features:
 *   - Fills proportionally to progress
 */

import React from 'react';
import '../Styles/ProgressBar.css';

const ProgressBar = ({ progress, maxProgress}) => {
  // Calculate the percentage, ensuring it stays between 0 and 100
  const percentage = Math.min(100, Math.max(0, (progress / maxProgress) * 100));
  
  return (
    <div 
      className="progress-bar-container"
    >
      <div 
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;