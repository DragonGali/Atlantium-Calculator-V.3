/**
 * ChooseApplication.jsx
 * 
 * Lets the user select which application/purpose they want to use the app for.
 * 
 * - Renders a list of radio buttons from `data.options`.
 * - Syncs the selected option with server state via `sendUpdate`.
 * - Highlights the current choice stored in `appState.selectedOption`.
 */

import { Fragment, useEffect } from 'react';
import '../Styles/ChooseApplication.css';
import data from "../data";
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

function ChooseApplication({ appState, updateState, unlockAll }) {
  // appState is the ChooseApplication section from the server
  const selectedOption = appState?.Application || "";

  const handleChange = (option) => {
    updateState({Application : option})
  };

  useEffect(() => {
      if(unlockAll) {
        updateState({Application: data.options.values[0]})
      }

      else {
        updateState({Application: data.options.values[1]})
      }
      
  }, [])

  return (
    <div className="ChooseApplication">
      <div className="title-box">
        <p>Choose Application</p>
      </div>
        <Tooltip text={tooltips.application} delay={1000}>
          <div className="wrapper">
            <div className="radio-buttons">
              <form>
                {data.options.labels.map((option, index) => (
                  <Fragment key={index}>
                    {index === data.options.length - 1 && <hr />}
                    <label className='form-control'>
                      <input
                        type="radio"
                        name="Application"
                        value={data.options.values[index]}
                        onChange={(e) => {handleChange(e.target.value)}}
                        checked={selectedOption === data.options.values[index]}
                      />
                      <span>{option}</span>
                    </label>
                  </Fragment>
                ))}
              </form>
            </div>
          </div>
        </Tooltip>
    </div>
  );
}

export default ChooseApplication;