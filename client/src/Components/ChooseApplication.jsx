/**
 * ChooseApplication.jsx
 * 
 * Lets the user select which application/purpose they want to use the app for.
 * 
 * - Renders a list of radio buttons from `data.options`.
 * - Syncs the selected option with server state via `sendUpdate`.
 * - Highlights the current choice stored in `appState.selectedOption`.
 */

import { Fragment } from 'react';
import '../Styles/ChooseApplication.css';
import data from "../data";

function ChooseApplication({ appState, updateState }) {
  // appState is the ChooseApplication section from the server
  const selectedOption = appState?.Application || "";

  const handleChange = (option) => {
    updateState({Application : option})
  };

  return (
    <div className="ChooseApplication">
      <div className="title-box">
        <p>Choose Application</p>
      </div>
      <div className="wrapper">
        <div className="radio-buttons">
          <form>
            {data.options.map((option, index) => (
              <Fragment key={index}>
                {index === data.options.length - 1 && <hr />}
                <label className='form-control'>
                  <input
                    type="radio"
                    name="Application"
                    value={option}
                    onChange={() => handleChange(option)}
                    checked={selectedOption === option}
                  />
                  <span>{option}</span>
                </label>
              </Fragment>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChooseApplication;