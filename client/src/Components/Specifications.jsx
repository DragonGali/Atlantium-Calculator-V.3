/**
 * Specifications.jsx
 *
 * Component for setting UV system parameters.
 * Fetches min/max ranges from backend based on selected system.
 *
 */

import { useState } from 'react';
import '../Styles/Specifications.css';
import Slider from '../Components/Slider.jsx';
import DropDown from '../Components/DropDown.jsx';
import data from '../data.js';
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

const Specifications = ({ appState, updateState, unlockAll, openDosePrompt, setLastError, isOutOfOperationalRange }) => {
  const ranges = appState?. ranges;
  const [pressedButton, setPressedButton] = useState(null);

  // Calculate flow rate multiplier and display value
  const flowMultiplier = data.FlowRateMultiplyer[appState?.["Flow Units"]] ??  1;

  const handleResetToDefaults = () => {
    // VALIDATION: Check if ranges are loaded
    if (!ranges || !ranges.efficiency || !ranges.drive || !ranges.uvt || !ranges.flow) {
      console.warn('Ranges not loaded yet:', ranges);

      if (setLastError) {
        setLastError('System ranges not loaded yet.  Please wait.. .');
        setTimeout(() => setLastError(null), 2000);
      }
      return;
    }

    // Define default values, clamped to available ranges
    const defaultValues = {
      "Efficiency": Math.min(Math.max(80, ranges.efficiency. min), ranges.efficiency.max),
      "Relative Drive": Math.min(Math.max(100, ranges.drive.min), ranges.drive.max),
      "UVT-1cm@254nm": Math.min(Math.max(92, ranges.uvt.min), ranges.uvt.max),
      "UVT-1cm@215nm": Math.min(Math. max(92, ranges.uvt.min), ranges.uvt.max),
      "Flow Rate": Math.min(Math. max(100, ranges.flow.min), ranges.flow.max),
      "Flow Units": "m3/h",
      "Branch": 1
    };

    updateState(defaultValues);

    // Show pressed state briefly
    setPressedButton("Reset To Default Values");
    setTimeout(() => setPressedButton(null), 300);
  };

  return (
      <div className="Specifications">
        <div className="title-box">
          <p>Specifications</p>
        </div>
        <div className="wrapper">
          <div className="vertical-container">

            {/* Efficiency - typically 0-100% */}
            <div className="horizontal-container">
              <Tooltip text={tooltips.efficiency} delay={1000}>
                <div className="type-box">
                  <p>Lamp Efficiency: </p>
                </div>
              </Tooltip>
              <Slider
                  min={ranges?. efficiency?.min}
                  max={ranges?.efficiency?. max}
                  step={1}
                  value={appState?. Efficiency}
                  onChange={(value) => updateState({ Efficiency: value })}
                  isOutOfRange={isOutOfOperationalRange?. ('efficiency', appState?. Efficiency)}
              />
              <div className="type-box">
                <p>[{ranges?.efficiency?.unit} Efficiency]</p>
              </div>
            </div>

            {/* Relative Drive - typically 0-100% */}
            <div className="horizontal-container">
              <Tooltip text={tooltips.relativeDrive} delay={1000}>
                <div className="type-box">
                  <p>Relative Drive:</p>
                </div>
              </Tooltip>
              <Slider
                  min={ranges?.drive?.min}
                  max={ranges?.drive?.max}
                  step={1}
                  value={appState?.["Relative Drive"]}
                  onChange={(value) => updateState({ "Relative Drive": value })}
                  isOutOfRange={isOutOfOperationalRange?.('drive', appState?.["Relative Drive"])}
              />
              <div className="type-box">
                <p>[{ranges?.drive?. unit} Power]</p>
              </div>
            </div>

            {/* UVT @ 254nm - uses backend ranges */}
            <div className="horizontal-container">
              <Tooltip text={tooltips.uvt254} delay={1000}>
                <div className="type-box">
                  <p>UVT @ 254nm:</p>
                </div>
              </Tooltip>
              <Slider
                  min={ranges?.uvt?. min}
                  max={ranges?. uvt?.max}
                  step={0.1}
                  value={appState?.["UVT-1cm@254nm"]}
                  onChange={(value) => updateState({ "UVT-1cm@254nm": value })}
                  isOutOfRange={isOutOfOperationalRange?.('uvt', appState?.["UVT-1cm@254nm"])}
              />
              <div className="type-box">
                <p>[{ranges?.uvt?.unit}]</p>
              </div>
            </div>

            {/* UVT @ 215nm - uses backend ranges */}
            <div className={`horizontal-container`}>
              <Tooltip text={tooltips.uvt215} delay={1000}>
                <div className="type-box">
                  <p>UVT @ 215nm:</p>
                </div>
              </Tooltip>
              <div className={`${unlockAll ? '' : 'locked'}`}>
                <Slider
                    min={ranges?.uvt?.min}
                    max={ranges?.uvt?. max}
                    step={0.1}
                    value={appState?.["UVT-1cm@215nm"]}
                    onChange={(value) => updateState({ "UVT-1cm@215nm": value })}
                    isOutOfRange={isOutOfOperationalRange?.('uvt', appState?.["UVT-1cm@215nm"])}
                />
              </div>
              <div className="type-box">
                <p>[{ranges?.uvt?. unit}]</p>
              </div>
            </div>

            <hr className='line'></hr>

            {/* Flow Rate - uses backend ranges */}
            <div className='horizontal-container'>
              <Tooltip text={tooltips.flowRate} delay={1000}>
                <div className='type-box'>
                  <p>Flow rate:</p>
                </div>
              </Tooltip>
              <Slider
                  min={ranges?.flow?.min}
                  max={ranges?.flow?.max}
                  step={0.1}
                  value={appState?.["Flow Rate"]}
                  onChange={(value) => updateState({ "Flow Rate": parseFloat(value. toFixed(1))})}
                  multiplyer={flowMultiplier}
                  isOutOfRange={isOutOfOperationalRange?.('flow', appState?.["Flow Rate"])}
              />
              <DropDown
                  options={[
                    { label: 'm³/h', value: 'm3/h' },
                    { label: 'US GPM', value: 'US GPM' }
                  ]}
                  value={appState?.["Flow Units"]}
                  placeholder={appState?.["Flow Units"]}
                  onChange={(value) => updateState({ "Flow Units": value })}
              />
            </div>

            {/* Action Buttons */}
            <div className='horizontal-container'>
              <div
                  className={`button ${pressedButton === 'Reset To Default Values' ? 'IsPressed' : ''}`}
                  onClick={handleResetToDefaults}
                  title={! ranges ?  'Waiting for ranges to load...' : 'Reset all values to defaults'}
              >
                <p>Reset To Default Values</p>
              </div>
              <div
                  className={`button`}
                  onClick={() => openDosePrompt()}
              >
                <p>Flow For Target Dose</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Specifications;