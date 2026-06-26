/**
 * Results.jsx
 * 
 * Displays calculated results in rows with values and optional dropdowns.
 * 
 * - Props:
 *   - `width`, `height`: used to size dropdowns proportionally
 * 
 * - Features:
 *   - Iterates over `data.Results` to render each field
 *   - Uses `DropDown` for fields with options
 *   - Displays scale text for other fields
 *   - Adds a separator line after the first row
 */


import { useState, useEffect, Fragment} from 'react'
import '../Styles/Results.css';
import data from "../data";

import DropDown from '../Components/DropDown.jsx';

const Results = ({appState, updateState}) => {

  return ( <div className="Results">
    <div className="title-box">
            <p>Results</p>
    </div>
    <div className="wrapper">
      <div className="vertical-container">
        {data.Results.map((field, index) => (
        <div key={index}>
          <div className="horizontal-container">
            <div className="type-box">
              <p>{field.fieldName}</p>
            </div>

            <div className="value-box">
              <p>{Object.values(appState?.results)[index]}</p>
            </div>

            {/* Scale or Dropdown */}
            {field.options ? (
              //If the row contains "options" than its a drop-down.
              <DropDown
                className="drop-down"
                options={[...field.options]}
                placeholder={field.options[0].value}
              />
            ) : (
              // Regular scale for other rows
              <div className="type-box small">
                <p>{field.scale}</p>
              </div>
            )}
            
          </div>
          
          {/* Separator line after first row */}
          {index === 0 && (<hr className="line"/>)}
        </div>
      ))}
        </div>
    </div>
    
    </div>
  
  )}

export default Results;