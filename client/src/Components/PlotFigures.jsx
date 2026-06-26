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


import { useState } from 'react'
import '../Styles/PlotFigures.css';
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

function PlotFigures ({unlockAll, openChart, updateState, getChartSensitivity}) {

  const [loading, setLoading] = useState(false);

  const handleClick = async (button) => {
    setLoading(true);
    updateState({chartType: button});

    // Wait for chart data to be fetched before opening window
    await getChartSensitivity(button);

    setLoading(false);
    openChart();
  }
   

  return ( <div className={`PlotFigures ${unlockAll ? '' : 'locked'}`}>
    <div className="title-box">
            <p>Plot Figures</p>
    </div>
    <div className="wrapper">
        <div className='vertical-container'>
            <Tooltip text={tooltips.plotREDUVT} delay={1000}>
                <div className={`button ${loading ? 'disabled' : ''}`} onClick={() => !loading && handleClick("uvt")}>
                        <p>{loading ? 'Loading...' : 'Plot RED = f(UVT)'}</p>
                </div>
            </Tooltip>
            <Tooltip text={tooltips.plotREDFlow} delay={1000}>
                <div className={`button ${loading ? 'disabled' : ''}`} onClick={() => !loading && handleClick("flow")}>
                        <p>{loading ? 'Loading...' : 'Plot RED = f(Flow)'}</p>
                </div>
            </Tooltip>
            <Tooltip text={tooltips.plotREDDrive} delay={1000}>
                <div className={`button ${loading ? 'disabled' : ''}`} onClick={() => !loading && handleClick("drive")}>
                        <p>{loading ? 'Loading...' : 'Plot RED = f(Rel.Drive)'}</p>
                </div>
            </Tooltip>
            </div>
    </div>
    
    </div>
  
  )}

export default PlotFigures;