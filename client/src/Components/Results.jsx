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
 *   - Marks invalid values with red background and "Error" text
 */


import { useState, useEffect, useRef} from 'react'
import '../Styles/Results.css';
import data from "../data";
import DropDown from '../Components/DropDown.jsx';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

const Results = ({appState, updateState}) => {

   // Flash state for when results update
   const [isFlashing, setIsFlashing] = useState(false);
   const lastResultsRef = useRef(JSON.stringify(appState?.results));

   useEffect(() => {
    const current = JSON.stringify(appState?.results);
    if (lastResultsRef.current !== current) {
      lastResultsRef.current = current;
      setIsFlashing(true);
      const t = setTimeout(() => setIsFlashing(false), 500); // half second
      return () => clearTimeout(t);
    }
   }, [appState?.results]);

   // Map result index to tooltip key
   const tooltipKeys = ['RED', 'headLoss', 'maxPower', 'avgPower'];

   // Check if a result value is invalid (< 0 indicates error)
   const isResultInvalid = (index) => {
     const value = Object.values(appState?.results)[index];
     return value === null || value === undefined || value < 0;
   };

   // Format the display value - show "Error" for invalid results
   const formatDisplayValue = (value, index) => {
     if (isResultInvalid(index)) {
       return "Error";
     }

     return parseFloat(
       (
         value *
         (index === 1 ? data.HeadLossMultipliers[appState?.["Results drop-down"]] : 1)
       ).toFixed(2)
     );
   };

  return ( <div className="Results">
    <div className="title-box">
            <p>Results</p>
    </div>
    <div className="wrapper">
      <div className="vertical-container">
        {data.Results.map((field, index) => (
        <div key={index}>
          <div className="horizontal-container">
            <Tooltip text={tooltips[tooltipKeys[index]]} delay={1000}>
              <div className="type-box">
                <p>{field.fieldName}</p>
              </div>
            </Tooltip>

            <div className={`value-box ${isFlashing ? 'flashing' : ''} ${isResultInvalid(index) ? 'invalid-result' : ''}`}>
            <p>
              {formatDisplayValue(Object.values(appState?.results)[index], index)}
            </p>
            </div>

            {/* Scale or Dropdown */}
            {field.options ? (
              //If the row contains "options" than it is a drop-down.
              <DropDown
                className="drop-down"
                options={[...field. options]}
                value={appState?.["Results drop-down"]}
                onChange={(e) => updateState({"Results drop-down" : e})}
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