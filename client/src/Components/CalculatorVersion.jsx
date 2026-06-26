/**
 * CalculatorVersion.jsx
 * 
 * Lets the user choose for what purpose they are using the app.
 * If the "Developer" option is selected, it prompts for a password.
 */

import { useState, useEffect, Fragment} from 'react'
import '../Styles/CalculatorVersion.css';
import data from "../data";

import PasswordBox from './PasswordBox';

const CalculatorVersion = ({unlockAll, openPasswordBox}) => {
  
  // Logs unlockAll changes (mainly for debugging)
  useEffect(() => {
  }, [unlockAll])

  // Handles button actions: open password box for Developer, or lock features
  const handleClick = (button) => {
    if (button === data.CalculatorVersionButtons[0]) { 
      openPasswordBox();
    } 
    else if (button === data.CalculatorVersionButtons[1]) { 
      unlockAll(false);
    }
  };
   
  return ( 
    <div className="CalculatorVersion">
      <div className="title-box">
        <p>Calculator Version</p>
      </div>
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
    </div>
  )
}

export default CalculatorVersion;
