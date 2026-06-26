import { useEffect, useState } from 'react';
import Dropdown from '../Components/DropDown';
import Checkbox from '../Components/CheckBox';
import '../Styles/HODSystem.css';
import data from "../data";
import apiService from '../apiService';

/**
 * HODSystem.jsx
 * 
 * Configuration panel for the HOD System.
 * Auto-selects first model when module changes.
 */

const HODSystem = ({ width, height, appState, updateState }) => {
  const [modules, setModules] = useState([]); // now the base types like "RZ-104"
  const [models, setModels] = useState([]);   // now the variants like "11", "12"
  const [moduleMap, setModuleMap] = useState({});

  const options = appState?.dropDownOptions?.["RZ Series"];

  const processOptions = (systems) => {
    const map = {};

    // Iterate over the dictionary entries
    Object.entries(systems).forEach(([key, item]) => {
      const parts = item.split("-");
      const module = parts.slice(0, -1).join("-"); // everything except last part
      const model = parts[parts.length - 1];       // last part

      if (!map[module]) {
        map[module] = [];
      }
      if (!map[module].includes(model)) {
        map[module].push(model);
      }
    });

    setModuleMap(map);
    setModules(Object.keys(map));

    // Set initial module if not set
    const firstModule = Object.keys(map)[0];
    if (firstModule && !appState?.Module) {
      const firstModel = map[firstModule][0];
      updateState({ Module: firstModule, Model: firstModel });
    }
  };

  // Fetch options from server
  useEffect(() => {
    if (options) {
      processOptions(options);
    }
  }, [appState?.dropDownOptions]);

  // When Module changes → update available models AND auto-select first one
  useEffect(() => {
    if (appState?.Module && moduleMap[appState.Module]) {
      const availableModels = moduleMap[appState.Module];
      setModels(availableModels);

      // Auto-select first model if current model is not in the list
      if (availableModels.length > 0 && !availableModels.includes(appState?.Model)) {
        updateState({ Model: availableModels[0] });
      }
    } else {
      setModels([]);
    }
  }, [appState?.Module, moduleMap]);

  return (
    <div className="HODSystem">
      <div className="title-box">
        <p>HOD System</p>
      </div>
      <div className="wrapper">
        <div className="vertical-container">

          {/* Module */}
          <div className="horizontal-container">
            <div className="type-box">
              <p>Module:</p>
            </div>
            <Dropdown
              className="drop-down"
              options={modules.map(m => ({ label: m, value: m }))}
              placeholder={modules[0] || "Select Module"}
              value={appState?.Module}
              onChange={(option) => {
                // When module changes, model will auto-update via useEffect
                updateState({ Module: option });
              }}
            />
          </div>

          {/* Model */}
          <div className="horizontal-container">
            <div className="type-box">
              <p>Model:</p>
            </div>
            <Dropdown
              className="drop-down"
              options={models.map(m => ({ label: m, value: m }))}
              placeholder={models[0] || "Select Model"}
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

          {/* Branch */}
          <div className="horizontal-container">
            <div className="type-box">
              <p>Branch:</p>
            </div>
            <input
              type="text"
              className="simple-input"
              value={appState?.Branch || "1"}
              onChange={(e) => updateState({ Branch: e.target.value })}
            />
            <div className="type-box small">
              <p>[Units]</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="horizontal-container">
            {data.HODButtons.map((button, index) => (
              <div
                key={index}
                className={`button but-${index} ${
                  appState?.["Lamp Type"] === button.replaceAll(" ", "")
                    ? 'IsPressed'
                    : 'NotPressed'
                }`}
                onClick={() =>
                  updateState({ "Lamp Type": button.replaceAll(" ", "") })
                }
              >
                <p>{button}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HODSystem;
