import { useEffect, useState, useMemo } from 'react';
import Dropdown from '../Components/DropDown';
import Checkbox from '../Components/CheckBox';
import '../Styles/HODSystem.css';
import data from "../data";
import React from 'react';
import Tooltip from '../Components/Tooltip';
import tooltips from '../tooltips';

/**
 * HODSystem.jsx
 * 
 * Configuration panel for the HOD System.
 * Auto-selects first model when module changes.
 * Auto-selects first module and model when application changes.
 * Processes ALL dropdown series/categories, not just the first one.
 */

const HODSystem = ({ appState, updateState }) => {
  const [modules, setModules] = useState([]);
  const [models, setModels] = useState([]);
  const [moduleMap, setModuleMap] = useState({});
  const [isEditing, setIsEditing] = useState({
    branch: false
  });

  // Get available lamp types for current system from lampInfo
  const availableLampTypes = useMemo(() => {
    if (!appState?.lampInfo?.types) {
      return ['Regular', 'OF', 'VUV']; // Default fallback - all available
    }

    return appState.lampInfo.types;
  }, [appState?.lampInfo?.types]);


  // Check if a lamp type is available for current system
  // Developer mode users have access to all lamp types
  const isLampTypeAvailable = (lampTypeValue) => {
    if (appState?.calculatorMode === 'Developer') {
      return true;
    }
    return availableLampTypes.includes(lampTypeValue);
  };

  // Handle lamp type selection - only if available
  const handleLampTypeClick = (buttonLabel) => {
    const lampTypeValue = data.LampTypeMapping[buttonLabel];
    if (isLampTypeAvailable(lampTypeValue)) {
      updateState({ "Lamp Type": buttonLabel.replaceAll(" ", "") });
    }
  };

  // Reset lamp type to Regular if current selection becomes unavailable (for Standard users)
  useEffect(() => {
    if (appState?.calculatorMode !== 'Developer' && appState?.["Lamp Type"]) {
      // Map current lamp type back to backend value
      const currentLampType = appState["Lamp Type"];
      let backendValue;
      if (currentLampType === "OzoneFree") {
        backendValue = "OF";
      } else {
        backendValue = currentLampType;
      }

      if (!availableLampTypes.includes(backendValue)) {
        updateState({ "Lamp Type": "Regular" });
      }
    }
  }, [availableLampTypes, appState?.calculatorMode]);

  const processOptions = (dropDownOptions) => {
    const map = {};

    // Process ALL series/categories in dropDownOptions
    Object.entries(dropDownOptions).forEach(([seriesKey, systemsArray]) => {
      // systemsArray is like ['RS104-11', 'RS104-12']
      systemsArray.forEach((system) => {
        const parts = system.split("-");
        const module = parts.slice(0, -1).join("-");
        const model = parts[parts.length - 1];

        if (!map[module]) {
          map[module] = [];
        }
        if (!map[module].includes(model)) {
          map[module].push(model);
        }
      });
    });

    setModuleMap(map);
    const modulesList = Object.keys(map);
    setModules(modulesList);
    
    // Auto-select first module and model when application changes
    if (modulesList.length > 0) {
      const firstModule = modulesList[0];
      const firstModel = map[firstModule][0];
      // Update both together
      updateState({ Module: firstModule, Model: firstModel });
    }
  };

  useEffect(() => {
    if (appState?.dropDownOptions) {
      processOptions(appState.dropDownOptions);
    }
  }, [appState?.dropDownOptions]);

  useEffect(() => {
    if (appState?.Module && moduleMap[appState.Module]) {
      const availableModels = moduleMap[appState.Module];
      setModels(availableModels);

      // Only update Model if current Model is not available in the new Module
      if (availableModels.length > 0 && !availableModels.includes(appState?.Model)) {
        updateState({ Model: availableModels[0] });
      }
    } else {
      setModels([]);
    }
  }, [appState?.Module, moduleMap]);

  const handleInputKeyPress = (e) => {
    if (!/[\d.]/.test(e.key) && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === '.' && e.target.value.includes('.')) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleInputChange = (e, field) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      updateState({ [field]: val });
    }
  };

  const handleInputFocus = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
    updateState({ [field]: '' });
  };

  const handleInputBlur = (e, field) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
    
    let value = e.target.value;
    
    if (value === '') {
      value = '1';
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = num.toString();
      } else {
        value = '1';
      }
    }
    
    updateState({ [field]: value });
  };

  // Handler for Module change - update both Module and its first Model
  const handleModuleChange = (module) => {
    const availableModels = moduleMap[module];
    const firstModel = availableModels && availableModels.length > 0 ? availableModels[0] : appState?.Model;
    
    // Update both together in a single call
    updateState({ Module: module, Model: firstModel });
  };

  return (
    <div className="HODSystem">
      <div className="title-box">
        <p>UV HOD System</p>
      </div>
      <div className="wrapper">
        <div className="vertical-container">

          {/* Module */}
          <div className="horizontal-container">
            <Tooltip text={tooltips.module} delay={1000}>
              <div className="type-box">
                <p>Module:</p>
              </div>
            </Tooltip>
            <Dropdown
              className="drop-down"
              options={modules.map(m => ({ label: m, value: m }))}
              value={appState?.Module}
              onChange={handleModuleChange}
            />
          </div>

          {/* Model */}
          <Tooltip text={tooltips.model} delay={1000}>
            <div className="horizontal-container">
              <div className="type-box">
                <p>Model:</p>
              </div>
              <Dropdown
                className="drop-down"
                options={models.map(m => ({ label: m, value: m }))}
                value={appState?.Model}
                onChange={(option) => updateState({ Model: option })}
              />
              <Checkbox
                items={[{ id: 1, text: 'Vertical', disabled: false }]}
                className="check-box"
                checked={appState?.Position === "Vertical"}
                onChange={(checked) =>
                  updateState({ Position: checked ? "Vertical" : "Horizontal" })
                }
              />
            </div>
          </Tooltip>

          {/* Branch */}
          <div className="horizontal-container">
            <Tooltip text={tooltips.branch} delay={1000}>
              <div className="type-box">
                <p>Branch:</p>
              </div>
            </Tooltip>
            <input
              type="number"
              min="1"
              step="1"
              className="simple-input"
              value={appState?.Branch || 1}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                updateState({ Branch: Math.max(1, value) });
              }}
              onBlur={(e) => {
                // Ensure minimum value of 1 on blur
                const value = parseInt(e.target.value) || 1;
                updateState({ Branch: Math.max(1, value) });
              }}
              onKeyDown={handleInputKeyPress}
            />
            <div className="type-box small">
              <p>[Units]</p>
            </div>
          </div>

          {/* Buttons */}
          <Tooltip text={tooltips.lampType} delay={1000}>
            <div className="horizontal-container">
              {data.HODButtons.map((button, index) => {
                const lampTypeValue = data.LampTypeMapping[button];
                const isAvailable = isLampTypeAvailable(lampTypeValue);
                const isPressed = appState?.["Lamp Type"] === button.replaceAll(" ", "");

                return (
                  <div
                    key={index}
                    className={`button but-${index} ${
                      isPressed ? 'IsPressed' : 'NotPressed'
                    } ${!isAvailable ? 'Disabled' : ''}`}
                    onClick={() => handleLampTypeClick(button)}
                    style={!isAvailable ? { cursor: 'not-allowed' } : {}}
                  >
                    <p>{button}</p>
                  </div>
                );
              })}
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default HODSystem;