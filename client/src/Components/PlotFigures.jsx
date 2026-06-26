/**
 * PlotFigures.jsx
 * 
 * Displays buttons to open chart plots.
 * 
 * - Props:
 *   - `unlockAll`: enables developer features (unused here visually)
 *   - `openChart`: callback to open the chart window
 * 
 * - Features:
 *   - Tracks pressed button locally
 *   - Clicking a button opens the chart via `openChart`
 */


import { useState, useEffect, Fragment} from 'react'
import '../Styles/PlotFigures.css';
import data from "../data";

function PlotFigures ({unlockAll, openChart}) {

  const [pressedButton, setPressedButton] = useState(null);

    const handleClick = (button) => {
    setPressedButton(button);
    openChart();
  }
   

  return ( <div className={`PlotFigures ${unlockAll ? '' : 'locked'}`}>
    <div className="title-box">
            <p>Plot Figures</p>
    </div>
    <div className="wrapper">
        <div className='vertical-container'>
                {data.PlotFiguresButtons.map((button, index) => (
                    <div className='button' key={index} onClick={() => handleClick(button)}>
                            <p>{button}</p>
                    </div>
                ))}
            </div>
    </div>
    
    </div>
  
  )}

export default PlotFigures;