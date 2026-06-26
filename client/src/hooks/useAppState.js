/**
 * useAppState.js
 * 
 * Custom hook for managing application state and backend communication.
 * Automatically syncs with backend on state changes.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import apiService from '../apiService';

const useAppState = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);

  // Main application state (includes ranges)
  const [appState, setAppState] = useState({
    Application: "Municipal EPA",
    Module: "RZ-104",
    Model: "11",
    Branch: "1",
    Position: "Vertical",
    "Lamp Type": "Regular",
    Efficiency: 80.0,
    "Relative Drive": 90.0,
    "UVT-1cm@254nm": 85.0,
    "UVT-1cm@215nm": 85.0,
    "Flow Rate": 100.0,
    "Flow Units": "m3/h",
    "D-1Log": 18.0,
    Pathogen: "Cryptosporidium",

    // Results
    results: {
      "Reduction Equivalent Dose": null,
      "Head Loss": null,
      "Maximum Electrical Power": null,
      "Average Lamp Power Consumption": null,
      "Expected LI": null,
      calculation_details: null
    },

    //this will auto-update
    ranges: null,
    dropDownOptions: null,

    //current login info
    username: null,
    password: null
  });

  const isInitialMount = useRef(true);
  const calculateTimer = useRef(null);

  // Check server health once on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    const result = await apiService.checkHealth();
    setIsServerHealthy(result.healthy);
    if (!result.healthy) {
      setLastError('Backend server is not responding. Please start it: cd NewBackend && uv run python server.py');
    } else {
      setLastError(null);
    }
    return result.healthy;
  };

  // Fetch parameter ranges from backend for the current system
  const getRanges = useCallback(async (systemType) => {
    if (!isServerHealthy) {
      console.warn("Server not healthy, skipping getRanges");
      return;
    }
    try {
      const result = await apiService.getParameterRanges(systemType);
      if (result.success) {
        // Store directly inside appState so any component can read appState.ranges
        setAppState(prev => ({
          ...prev,
          ranges: result.ranges
        }));
      } else {
        setLastError(result.error);
      }
    } catch (err) {
      console.error("Error getting ranges:", err);
      setLastError(err.message);
    }
  }, [isServerHealthy]);

  const getDropDownOptions = useCallback(async () => {

    if (!isServerHealthy) {
      console.warn("Server not healthy, skipping getDropDownOptions");
      return;
    }

    try {
      const result = await apiService.getSupportedSystems();
      if (result.success) {
        setAppState(prev => ({
          ...prev,
          dropDownOptions: result.systems
        }));
      } else {
        setLastError(result.error);
      }
    } catch (err) {
      console.error("Error getting ranges:", err);
      setLastError(err.message);
    }

  }, [isServerHealthy])

  // Recalculate results
  const calculateResults = useCallback(async () => {
    if (!isServerHealthy) {
      console.warn('Server not healthy, skipping calculation');
      return;
    }

    setIsCalculating(true);
    setLastError(null);

    const requestBody = {
      Application: appState.Application,
      Module: appState.Module,
      Model: appState.Model,
      Branch: appState.Branch,
      Position: appState.Position,
      "Lamp Type": appState["Lamp Type"],
      Efficiency: appState.Efficiency,
      "Relative Drive": appState["Relative Drive"],
      "UVT-1cm@254nm": appState["UVT-1cm@254nm"],
      "UVT-1cm@215nm": appState["UVT-1cm@215nm"],
      "Flow Rate": appState["Flow Rate"],
      "Flow Units": appState["Flow Units"],
      "D-1Log": appState["D-1Log"],
      Pathogen: appState.Pathogen
    };

    const result = await apiService.calculate(requestBody);

    if (result.success) {
      console.log(result);
      setAppState(prev => ({
        ...prev,
        results: {
          "Reduction Equivalent Dose": result.data["Reduction Equivalent Dose"],
          "Head Loss": result.data["Head Loss"],
          "Maximum Electrical Power": result.data["Maximum Electrical Power"],
          "Average Lamp Power Consumption": result.data["Average Lamp Power Consumption"],
          "Expected LI": result.data["Expected LI"],
          calculation_details: result.data.calculation_details
        }
      }));
    } else {
      setLastError(result.error);
    }

    setIsCalculating(false);
  }, [appState, isServerHealthy]);

  // Update appState and trigger recalculation (debounced)
  const updateState = useCallback((updates) => {
    setAppState(prev => ({
      ...prev,
      ...updates
    }));

    console.log(appState);

    // Clear existing timer
    if (calculateTimer.current) {
      clearTimeout(calculateTimer.current);
    }

    // Debounce recalculation
    calculateTimer.current = setTimeout(() => {
      if (!isInitialMount.current && isServerHealthy) {
        calculateResults();
      }
    }, 500);
  }, [calculateResults, isServerHealthy]);

  // Automatically fetch ranges when Model or Module changes
  useEffect(() => {
    if (!isInitialMount.current && isServerHealthy) {
      const systemType = `${appState.Module}-${appState.Model}`;
      getRanges(systemType);
    }
  }, [appState.Model, appState.Module, getRanges, getDropDownOptions, isServerHealthy]);

  // Initial calculation + initial ranges fetch
  useEffect(() => {
    if (isInitialMount.current && isServerHealthy) {
      isInitialMount.current = false;
      const systemType = `${appState.Module}-${appState.Model}`;
      getRanges(systemType);
      getDropDownOptions();
      calculateResults();
    }
  }, [isServerHealthy, calculateResults, getRanges, getDropDownOptions]);

  // Manual recalculation (no debounce)
  const recalculate = useCallback(() => {
    if (calculateTimer.current) {
      clearTimeout(calculateTimer.current);
    }
    calculateResults();
  }, [calculateResults]);

  return {
    appState,
    updateState,
    recalculate,
    isCalculating,
    lastError,
    isServerHealthy,
    checkServerHealth
  };
};

export default useAppState;
