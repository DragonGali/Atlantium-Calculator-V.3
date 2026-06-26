import { useState } from 'react'
import '../Styles/PathogenInactivation.css';
import ProgressBar from './ProgressBar.jsx';
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

const PathogenInactivation = ({unlockAll, appState, updateState}) => {

  const [pressedButton, setPressedButton] = useState(null);
    const handleClick = (button) => {
    setPressedButton(button);
  }

  // Check if Expected LI is invalid
  const isExpectedLIInvalid = () => {
    const liValue = appState?.results?.["Expected LI"];
    return liValue === null || liValue === undefined || liValue < 0;
  };

  // Format Expected LI display value
  const formatExpectedLI = () => {
    if (isExpectedLIInvalid()) {
      return "Error";
    }
    const liValue = appState?.results?. ["Expected LI"];
    return liValue > 5 ? ">5" : liValue;
  };

  // Format Expected LI for progress bar (0 if error)
  const getProgressValue = () => {
    if (isExpectedLIInvalid()) {
      return 0;
    }
    return appState?.results?.["Expected LI"];
  };

  // Format Expected LI text at bottom - hide when error
  const formatExpectedLIText = () => {
    if (isExpectedLIInvalid()) {
      return "";  // Return empty string instead of "Error"
    }
    const liValue = appState?. results?.["Expected LI"];
    return `${liValue > 5 ? "5" : liValue} out of 5LOG`;
  };


  return ( <div className="PathogenInactivation">
    <div className="title-box">
            <p>Pathogen-Specific Log-Inactivation</p>
    </div>
    <div className="wrapper">
        <div className="vertical-container">

          <div className="horizontal-container">
              <Tooltip text={tooltips.pathogen} delay={1000}>
                <div className='type-box' >
                    <p>Selected: </p>
                </div>
              </Tooltip>
            <div className='value-box'>
              <p>{appState?. manualInput ? "Manual Input" : appState?.Pathogen}</p>
            </div>
          </div>

          <div className="horizontal-container">
              <Tooltip text={tooltips. d1Log} delay={1000}>
                <div className='type-box'>
                    <p>D-1Log UV-Dose:</p>
                </div>
              </Tooltip>
            <input
             type="text"
             className={`simple-input ${unlockAll ? '' : 'locked'}`}
             placeholder='' value={appState?.["D-1Log"]} onChange={(e) => {updateState({"D-1Log" : e.target. value}); updateState({"manualInput" : true})}}
             />

            <div className='type-box' style={{width:"20%"}}>
                <p>[mJ/cm²]</p>
            </div>
          </div>

          <div className='horizontal-container'>
              <Tooltip text={tooltips. loginactivation} delay={1000}>
                  <div className='type-box'>
                      <p>Expected LI:</p>
                  </div>
              </Tooltip>
              <div className={`value-box ${isExpectedLIInvalid() ? 'invalid-result' :  ''}`} style={{width:"26%"}}>
                <p>{formatExpectedLI()}</p>
              </div>
              <ProgressBar progress={getProgressValue()} maxProgress='5'/>
          </div>
      </div>
      <div className='vertical-container'>
        <div className='reset-button'
        onClick={() => {
          updateState({"manualInput" :  true});
          updateState({"D-1Log" : 18});
          updateState({"Pathogen" : null});
        }}>
          <p>Reset</p>
        </div>
        <p className='expected-li-text'>{formatExpectedLIText()}</p>
      </div>
      </div>
    </div>
  
  )}

export default PathogenInactivation;