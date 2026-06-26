/**
 * Dechlorination.jsx
 * 
 * Displays input/output values for ozone and chlorine during
 * Dechlorination and ozone decomposition.
 * 
 * - Static layout with placeholders for values.
 * - Certain boxes (e.g., "In" values) are disabled.
 */

import { useState, useEffect } from 'react';
import '../Styles/Dechlorination.css';
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

const Dechlorination = ({ appState, updateState }) => {
  const [disable, setDisable] = useState();

  useEffect(() => {
    setDisable(appState?.Application === 'Dechlorination' ? '' : 'disabled');
  }, [appState?.Application]);

  return (
    <div className="Dechlorination">
      <div className="title-box">
        <p>Dechlorination and Ozone decomposition</p>
      </div>
      <div className="wrapper">
        <div className="vertical-container">
          <div className='horizontal-container'>
            <Tooltip text={tooltips.ozoneIn} delay={1000}>
              <div className='type-box'>
                <p>Ozone-In [ppm]:</p>
              </div>
            </Tooltip>
            <input 
              className={`simple-input ${disable}`}
              type="text"
              placeholder=''
              value={appState?.ozone_in}
              onChange={(e) => updateState({ ozone_in: e.target.value })}
            />
            <Tooltip text={tooltips.ozoneOut} delay={1000}>
              <div className='type-box'>
                <p>Ozone-Out [ppm]:</p>
              </div>
            </Tooltip>

            <div className={`value-box ${disable}`}>
              {disable !== 'disabled' && <p>{appState?.ozone_out || '0.0'}</p>}
            </div>
          </div>

          <div className='horizontal-container'>
            <Tooltip text={tooltips.chlorineIn} delay={1000}>
              <div className='type-box'>
                <p>Chlorine-In [ppm]:</p>
              </div>
            </Tooltip>
            
            <input 
              className={`simple-input ${disable}`}
              type="text"
              placeholder=''
              value={appState?.chlorine_in}
              onChange={(e) => updateState({ chlorine_in: e.target.value })}
            />
            <Tooltip text={tooltips.chlorineOut} delay={1000}>
              <div className='type-box'>
                <p>Chlorine-Out [ppm]:</p>
              </div>
            </Tooltip>
            <div className={`value-box ${disable}`}>
              {disable !== 'disabled' && <p>{appState?.chlorine_out || '0.0'}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dechlorination;