/**
 * CalculatorVersion.jsx
 * 
 * Lets the user choose for what purpose they are using the app.
 * If the "Developer" option is selected:
 *   - Developer/Admin users: Immediately activate physics mode (no password)
 *   - Marketing users: Prompts for a password
 */

import '../Styles/CalculatorVersion.css';
import data from "../data";
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

const CalculatorVersion = ({openPasswordBox, updateState, appState}) => {

  // Handles button actions: open password box for Developer, or lock features
  const handleClick = (button) => {
    if (button === data.CalculatorVersionButtons[0]) {  // Developer
      // Check if user is Developer or Admin - they don't need password
      const userRole = appState?.role;
      if (userRole === 'Developer' || userRole === 'Admin') {
        // Directly activate physics mode without password
        updateState({ calculatorMode: 'Developer', activatePhysicsMode: true });
      } else {
        // Marketing users need password
        openPasswordBox();
      }
    }
    else if (button === data.CalculatorVersionButtons[1]) {  // Standard
      // Set both calculatorMode and let App.jsx derive unlockAll from it
      updateState({ calculatorMode: 'Marketing' });
    }
  };
   
  return ( 
    <div className="CalculatorVersion">
      <div className="title-box">
        <p>Developer Options</p>
      </div>
        <Tooltip text={tooltips.version} delay={1000}>
          <div className="wrapper">
            <div className='horizontal-container'>
              {data.CalculatorVersionButtons.map((button, index) => (
                <div
                  className='button'
                  key={index}
                  onClick={() => {handleClick(button)}}
                >
                  <p>{button}</p>
                </div>
              ))}
            </div>
          </div>
        </Tooltip>
    </div>
  )
}

export default CalculatorVersion;
