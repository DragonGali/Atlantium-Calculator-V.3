/**
 * useAppState.js
 *
 * Custom hook for managing application state and backend communication.
 * Automatically syncs with backend on state changes.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import apiService from '../apiService';
import data from '../data';

// Helper function to calculate UVT215 from UVT254 (for Standard/Marketing mode)
// The formula 0.2804 * exp(0.0609 * UVT254) was fitted for high UVT values and
// extrapolates poorly below ~70%: at UVT254=56 it gives 8.5, far below the
// RZ163UHP-11 operational minimum of 45.  The optional minUVT/maxUVT clamp
// ensures the result stays within the system's operational range.
const calculateUVT215 = (uvt254, minUVT = 0, maxUVT = 99) => {
  const { A, B } = data.UVT215_COEFFICIENTS;
  let uvt215 = A * Math.exp(B * uvt254);
  // Cap UVT215 to not exceed UVT254
  if (uvt215 > uvt254) {
    uvt215 = uvt254;
  }
  // Clamp to the system's operational UVT range so that an unrealistically low
  // formula value (e.g. 8.5 at UVT254=56) is raised to the system minimum (45).
  uvt215 = Math.min(Math.max(uvt215, minUVT), maxUVT);
  // Round to 1 decimal place
  return Math.round(uvt215 * 10) / 10;
};

const useAppState = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);

  // Main application state (includes ranges)
  const [appState, setAppState] = useState({
    Application: null,
    Module: null,
    Model: null,
    Branch: 1,
    Position: "Horizontal",
    "Lamp Type": "Regular",
    Efficiency: 80.0,
    "Relative Drive": 100.0,
    "UVT-1cm@254nm": 92.0,
    "UVT-1cm@215nm": 92.0,
    "Flow Rate": 100.0,
    "Flow Units": "m3/h",
    "D-1Log": 18.0,
    Pathogen: null,
    api_version: null,
    library_version: null,
    killData: null,
    manualInput: true,

    ozone_in: 0.0,
    ozone_out: 0.0,
    chlorine_in:  0.0,
    chlorine_out: 0.0,

    // Results
    results: {
      "Reduction Equivalent Dose": null,
      "Head Loss": null,
      "Maximum Electrical Power": null,
      "Average Lamp Power Consumption": null,
      "Expected LI":  null,
      calculation_details: null
    },

    "Results drop-down":  "[cm/H₂O]",

    //this will auto-update
    ranges: null,
    operationalRanges: null,
    physicsLimits: null,
    dropDownOptions: null,
    supportedSystems: null,
    lampInfo: null,  // Lamp info for current system (power, count, types)

    //current login info
    username: null,
    password: null,
    role: null,

    // Calculator mode (Developer/Marketing)
    calculatorMode: 'Marketing',  // Default to Marketing mode
    activatePhysicsMode: false,   // Flag to explicitly request physics mode activation

    // Data for Charts
    chartType: null,
    chartSensitivity: null,

    //for calculating target dose
    doseValue: null
  });

  const isInitialMount = useRef(true);
  const calculateTimer = useRef(null);
  const previousCalculatorMode = useRef(null);
  const developerModeActivated = useRef(false);  // Only true when user explicitly clicks Developer button
  const rangesRequestId = useRef(0);  // Counter to track latest getRanges request
  const isModeSwitching = useRef(false);  // Prevents double calculation during mode switch

  // Checking server health all the time
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    const result = await apiService.checkHealth();
    setIsServerHealthy(result.healthy);
    if (!result.healthy) {
      setLastError('Backend server is not responding.  Please start it:  cd NewBackend && uv run python server.py');
    } else {
      setLastError(null);
    }
    return result.healthy;
  };

  const getVersion = async () => {
    const result = await apiService.getVersion();
    if (result.success) {
      setAppState(prev => ({
        ...prev,
        api_version: result.api_version,
        library_version: result.library_version
      }));
    } else {
      console.error('Failed to get version:', result.error);
    }
  };

  const getKillData = async () => {
    const result = await apiService.getKillData();
    if (result.success) {
      setAppState(prev => ({
        ...prev,
        killData: result
      }));

    } else {
      console.error('Failed to get KillData:', result.error);
    }
  };

  const getDechlorination = async (chlorine_in, ozone_in, reductionDose) => {
    const result = await apiService.getDechlorination(chlorine_in, ozone_in, reductionDose);
    if (result.success) {
      setAppState(prev => ({
        ...prev,
        ozone_out: result.ozone_out,
        chlorine_out: result.chlorine_out
      }));
    } else {
      console.error('Failed to get Dechlorination data:', result.error);
      return null;
    }
  }

  // Fetch parameter ranges and store both operational and physics limits
  const getRanges = useCallback(async (systemType, position = null, branch = 1, preserveCurrentMode = false) => {
    if (! isServerHealthy) {
      console.warn("Server not healthy, skipping getRanges");
      return;
    }

    // Increment request ID and capture the current request's ID
    const currentRequestId = ++rangesRequestId.current;
    console.log(`getRanges: Starting request #${currentRequestId} for branch ${branch}`);

    try {
      // Fetch operational ranges for current branch number
      const result = await apiService.getParameterRanges(systemType, position, branch);

      // Check if this request is still the latest one
      if (currentRequestId !== rangesRequestId.current) {
        console.log(`getRanges: Ignoring stale response #${currentRequestId} (latest is #${rangesRequestId.current})`);
        return;
      }

      if (! result.success) {
        setLastError(result.error);
        return;
      }

      // Store operational ranges
      const operationalRanges = result. ranges;

      // Calculate physics limits:  operational_max × 2
      const operationalMaxPerBranch = operationalRanges. flow?. max || 4000;
      const physicsMaxPerBranch = operationalMaxPerBranch * 2;

      const physicsLimits = {
        flow: { min: 0, max: physicsMaxPerBranch, unit: "m³/h" },
        uvt: { min: 0, max: 99, unit: "%-1cm" },
        efficiency: { min: 0, max: 100, unit: "%" },
        drive: { min: 0, max: 100, unit: "%" }
      };

      console.log(`Branch:  ${branch}, Operational max: ${operationalMaxPerBranch}, Physics max: ${physicsMaxPerBranch}`);

      // FIXED: Only use physics limits if user explicitly activated Developer mode
      setAppState(prev => {
        // Only use physics limits if:
        // 1. preserveCurrentMode is true AND
        // 2. calculatorMode is Developer AND
        // 3. developerModeActivated is true (user explicitly clicked Developer button)
        let activeRanges;
        if (preserveCurrentMode && prev.calculatorMode === 'Developer' && developerModeActivated.current) {
          activeRanges = physicsLimits;
          console.log(`getRanges: Developer mode ACTIVATED, using physics limits`);
        } else {
          activeRanges = operationalRanges;
          console.log(`getRanges: Setting operational ranges`);
        }

        return {
          ...prev,
          ranges: activeRanges,
          operationalRanges: operationalRanges,
          physicsLimits: physicsLimits
        };
      });

    } catch (err) {
      console.error("Error getting ranges:", err);
      setLastError(err.message);
    }
  }, [isServerHealthy]);

  const getDropDownOptions = useCallback(async (application, role) => {

    if (!isServerHealthy) {
      console.warn("Server not healthy, skipping getDropDownOptions");
      return;
    }

    const type = application === "Municipal EPA" ? "EPA" : null;

    try {
      const result = await apiService.getSupportedSystems(type, role);
      if (result.success) {
        setAppState(prev => ({
          ...prev,
          dropDownOptions: result.systems
        }));

      } else {
        setLastError(result.error);
      }
    } catch (err) {
      console.error("Error getting drop-down options:", err);
      setLastError(err.message);
    }
  }, [isServerHealthy]);

  const getFlowForDose = useCallback(async () => {
    if (!isServerHealthy || !appState. doseValue) {
      console.warn('Server not healthy or no dose value provided');
      return;
    }

    try {
      const override = appState.calculatorMode === 'Developer';

      const result = await apiService. flowForDose({
        systemType: `${appState.Module}-${appState.Model}`,
        targetDose: parseFloat(appState.doseValue),
        uvt254: appState["UVT-1cm@254nm"],
        uvt215: appState["UVT-1cm@215nm"],
        d1Log: appState["D-1Log"],
        position: appState.Position,
        powerSettings: { 'all_lamps': appState["Relative Drive"] },
        efficiencySettings: { 'all_lamps': appState. Efficiency },
        override: override
      });

      if (result.success) {
        updateState({
          "Flow Rate": result.flowRate,
          results: {
            ... appState.results,
            "Reduction Equivalent Dose": result. achievedDose
          }
        });
      } else {
        setLastError(result.error);
      }
    } catch (err) {
      console.error("Error calculating flow for dose:", err);
      setLastError(err.message);
    }
  }, [isServerHealthy, appState])

  const getChartSensitivity = useCallback(async (chartType, numPoints = 20) => {
    const systemType = `${appState?.Module}-${appState?.Model}`;

    getRanges(systemType);

    const range = {
      "min": appState?. ranges?.[chartType]?.min,
      "max": appState?. ranges?.[chartType]?.max
    };

    if (! isServerHealthy) {
      console.warn("Server not healthy, skipping getChartSensitivity");
      return;
    }

    try {
      const override = appState.calculatorMode === 'Developer';

      const result = await apiService.getChartSensitivity(
          systemType,
          chartType,
          numPoints,
          appState.Position,
          appState["Lamp Type"],
          {
            "all_lamps":  appState?. ["Relative Drive"]
          },
          {
            "all_lamps":  appState?. ["Efficiency"]
          },
          range,
          appState["Flow Rate"],  // Pass flow rate for "drive" chart
          override  // Pass override
      );

      if (result. success) {
        setAppState(prev => ({
          ...prev,
          chartSensitivity: result.data
        }));

      } else {
        setLastError(result.error);
      }
    } catch (err) {
      console.error("Error getting chart sensitivity:", err);
      setLastError(err.message);
    }
  }, [isServerHealthy, appState]);

  // Recalculate results with override based on calculatorMode
  const calculateResults = useCallback(async (stateToUse = appState) => {
    if (!isServerHealthy) return;

    setIsCalculating(true);
    setLastError(null);

    // Determine override based on calculatorMode
    // Developer mode:  override = true (physics limits)
    // Marketing mode: override = false (operational limits)
    const override = stateToUse.calculatorMode === 'Developer';

    const requestBody = {
      Application: stateToUse.Application,
      Module: stateToUse.Module,
      Model: stateToUse.Model,
      Branch: stateToUse.Branch,
      Position: stateToUse.Position,
      "Lamp Type":  stateToUse["Lamp Type"],
      Efficiency: stateToUse.Efficiency,
      "Relative Drive": stateToUse["Relative Drive"],
      "UVT-1cm@254nm": stateToUse["UVT-1cm@254nm"],
      "UVT-1cm@215nm": stateToUse["UVT-1cm@215nm"],
      "Flow Rate": stateToUse["Flow Rate"],
      "Flow Units": stateToUse["Flow Units"],
      "D-1Log": stateToUse["D-1Log"],
      Pathogen: stateToUse.Pathogen,
      override: override
    };

    const result = await apiService.calculate(requestBody);

    if (result.success) {
      setAppState(prev => ({
        ...prev,
        results: {
          "Reduction Equivalent Dose": result.data["Reduction Equivalent Dose"],
          "Head Loss": result.data["Pressure Drop"],
          "Maximum Electrical Power": result.data["Maximum Electrical Power"],
          "Average Lamp Power Consumption": result.data["Average Lamp Power Consumption"],
          "Expected LI": result.data["Expected LI"],
          calculation_details: result.data.calculation_details
        }
      }));
    } else {
      // Calculation failed - set results to invalid values to trigger red background
      setAppState(prev => ({
        ...prev,
        results: {
          "Reduction Equivalent Dose": -1,
          "Head Loss": -1,
          "Maximum Electrical Power": -1,
          "Average Lamp Power Consumption": -1,
          "Expected LI": -1,
          calculation_details: null
        }
      }));
      setLastError(result.error);
    }

    setIsCalculating(false);
  }, [isServerHealthy]);

  // Update appState and trigger recalculation (debounced)
  const updateState = useCallback((updates) => {
    // 1. Update state for UI rendering
    setAppState(prev => {
      let newState = { ...prev, ...updates };

      // Auto-calculate UVT215 in Standard (Marketing) mode when UVT254 changes.
      // Use the operational UVT range so that an out-of-range formula value
      // (e.g. calculateUVT215(56)=8.5 < RZ163UHP min=45) is clamped correctly.
      if (newState.calculatorMode !== 'Developer' && 'UVT-1cm@254nm' in updates) {
        const uvtMin = newState.operationalRanges?.uvt?.min ?? newState.ranges?.uvt?.min ?? 0;
        const uvtMax = newState.operationalRanges?.uvt?.max ?? newState.ranges?.uvt?.max ?? 99;
        newState['UVT-1cm@215nm'] = calculateUVT215(updates['UVT-1cm@254nm'], uvtMin, uvtMax);
      }

      // 2. Immediately schedule calculation with NEW values
      // BUT skip if only calculatorMode is changing - the useEffect handles mode switches
      const isOnlyModeChange = 'calculatorMode' in updates && Object.keys(updates).filter(k => k !== 'activatePhysicsMode').length === 1;

      if (!isOnlyModeChange) {
        if (calculateTimer.current) {
          clearTimeout(calculateTimer.current);
        }

        calculateTimer.current = setTimeout(() => {
          if (! isInitialMount.current && isServerHealthy) {
            // Pass newState directly instead of relying on closure!
            calculateResults(newState);
          }
        }, 500);
      }

      return newState;
    });
  }, [calculateResults, isServerHealthy]);

  // Helper function to check if a parameter is outside operational limits
  const isOutOfOperationalRange = useCallback((paramName, value) => {
    // Only show warning in Developer mode
    if (appState.calculatorMode !== 'Developer') {
      return false;
    }

    // Need operational ranges to compare
    if (!appState.operationalRanges) {
      return false;
    }

    const ranges = appState.operationalRanges;

    switch (paramName) {
      case 'flow':
        return value < ranges. flow?. min || value > ranges.flow?. max;

      case 'uvt':
        return value < ranges.uvt?.min || value > ranges.uvt?.max;

      case 'efficiency':
        return value < ranges.efficiency?.min || value > ranges.efficiency?.max;

      case 'drive':
        return value < ranges.drive?.min || value > ranges.drive?.max;

      default:
        return false;
    }
  }, [appState. calculatorMode, appState.operationalRanges]);

  // Pass the user's role to filter systems
  const fetchSupportedSystems = useCallback(async (role) => {
    if (!isServerHealthy) {
      console.warn("Server not healthy, skipping fetchSupportedSystems");
      return;
    }

    if (! role) {
      console.warn("No role provided, skipping fetchSupportedSystems");
      return;
    }

    try {
      // Marketing sees only production, Developer/Admin see all
      const result = await apiService.getSupportedSystems(null, role);

      if (result.success) {
        setAppState(prev => ({
          ...prev,
          supportedSystems: result.systems
        }));
      } else {
        console.error('Failed to fetch systems:', result.error);
        setLastError(result.error);
      }
    } catch (err) {
      console.error('Error fetching supported systems:', err);
      setLastError(err. message);
    }
  }, [isServerHealthy]);

  // Fetch lamp info for the current system
  const getLampInfo = useCallback(async (systemType) => {
    if (!isServerHealthy) {
      console.warn("Server not healthy, skipping getLampInfo");
      return null;
    }

    if (!systemType) {
      return null;
    }

    try {
      const result = await apiService.getLampInfo(systemType);
      if (result.success) {
        return result;
      } else {
        console.error('Failed to get lamp info:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error getting lamp info:', err);
      return null;
    }
  }, [isServerHealthy]);

  // Fetch systems when role changes
  useEffect(() => {
    if (appState.role && isServerHealthy) {
      fetchSupportedSystems(appState.role);
    }
  }, [appState.role, isServerHealthy, fetchSupportedSystems]);

  // Extract UVT254 for dependency array (avoids complex expression warning)
  const uvt254Value = appState['UVT-1cm@254nm'];

  // FIXED: Watch for calculatorMode changes and switch ranges
  useEffect(() => {
    // Don't run on initial mount - ranges will be set by initial getRanges
    if (! isInitialMount.current && isServerHealthy && appState.Module && appState.Model) {

      // Handle explicit physics mode activation request (e.g., when Developer/Admin clicks Developer button)
      if (appState.activatePhysicsMode && appState.physicsLimits) {
        console.log("Explicit physics mode activation requested");
        developerModeActivated.current = true;
        setAppState(prev => ({
          ...prev,
          ranges: prev.physicsLimits,
          activatePhysicsMode: false  // Reset the flag
        }));
        previousCalculatorMode.current = appState.calculatorMode;
        return;
      }

      // If previousCalculatorMode is null, this is the first time after initial load
      // ALWAYS just record the mode - don't switch ranges (keep operational from initial load)
      if (previousCalculatorMode.current === null) {
        console.log(`Recording initial calculator mode after load: ${appState.calculatorMode}`);
        previousCalculatorMode.current = appState.calculatorMode;
        // DON'T set developerModeActivated here - this is just from login, not explicit activation
      }
      // If previousCalculatorMode is set, check for actual mode change
      else if (previousCalculatorMode.current !== appState.calculatorMode) {
        console.log(`Calculator mode changed from ${previousCalculatorMode.current} to: ${appState.calculatorMode}`);

        // Switch between stored ranges
        if (appState.calculatorMode === 'Developer' && appState.physicsLimits) {
          console.log("Switching to physics limits");
          developerModeActivated.current = true;  // User explicitly activated Developer mode
          setAppState(prev => ({
            ...prev,
            ranges: prev.physicsLimits
          }));
        } else if (appState.calculatorMode === 'Developer' && ! appState.physicsLimits) {
          // Physics limits not yet calculated - trigger a range fetch with preserveCurrentMode
          console.log("Physics limits not available, fetching ranges...");
          developerModeActivated.current = true;  // User explicitly activated Developer mode
          const systemType = `${appState.Module}-${appState.Model}`;
          const branch = parseInt(appState.Branch) || 1;
          getRanges(systemType, appState.Position, branch, true);
        } else if (appState.calculatorMode === 'Marketing') {
          // Prevent double execution
          if (isModeSwitching.current) {
            return;
          }
          isModeSwitching.current = true;

          console.log("Switching to Standard (Marketing) mode");
          developerModeActivated.current = false;  // User switched back to Marketing

          // Update the previous mode FIRST to prevent re-triggering
          previousCalculatorMode.current = appState.calculatorMode;

          // Calculate the new UVT215 value, clamped to the system's operational
          // UVT range.  This prevents the formula from returning an unrealistically
          // low value (e.g. 8.5 at UVT254=56 for RZ163UHP-11 whose min is 45).
          const uvtMin = appState.operationalRanges?.uvt?.min ?? 0;
          const uvtMax = appState.operationalRanges?.uvt?.max ?? 99;
          const calculatedUVT215 = calculateUVT215(uvt254Value, uvtMin, uvtMax);
          console.log(`Auto-calculating UVT215: UVT254=${uvt254Value}, range=[${uvtMin},${uvtMax}] -> UVT215=${calculatedUVT215}`);

          // Build the new state
          const newState = {
            ...appState,
            'UVT-1cm@215nm': calculatedUVT215
          };
          if (appState.operationalRanges) {
            newState.ranges = appState.operationalRanges;
          }

          // Update state
          setAppState(newState);

          // Trigger recalculation with the new state, then reset the flag
          calculateResults(newState).finally(() => {
            isModeSwitching.current = false;
          });

          // Return early - we already updated previousCalculatorMode
          return;
        }

        // Update the previous mode for next comparison
        previousCalculatorMode.current = appState.calculatorMode;
      }
    }
  }, [appState.calculatorMode, appState.activatePhysicsMode, appState.physicsLimits, appState.operationalRanges, uvt254Value, appState.Module, appState.Model, appState.Branch, appState.Position, isServerHealthy, getRanges, calculateResults]);

  // Automatically fetch ranges when Model, Module, Position, or Branch changes
  useEffect(() => {
    if (! isInitialMount.current && isServerHealthy) {
      const systemType = `${appState.Module}-${appState.Model}`;
      const branch = parseInt(appState.Branch) || 1;
      // Preserve current mode - don't reset to operational if user is in Developer mode
      getRanges(systemType, appState.Position, branch, true);

      if (appState?.chartType) {
        getChartSensitivity(appState?.chartType);
      }
    }
  }, [appState.Model, appState.Module, appState.Position, appState.Branch, getRanges, isServerHealthy]);

  // Fetch lamp info when system (Module/Model) changes
  useEffect(() => {
    if (isServerHealthy && appState.Module && appState.Model) {
      const systemType = `${appState.Module}-${appState.Model}`;
      getLampInfo(systemType).then((result) => {
        if (result) {
          setAppState(prev => ({
            ...prev,
            lampInfo: {
              power: result.power,
              count: result.count,
              types: result.types || ['Regular']
            }
          }));
        }
      });
    }
  }, [appState.Module, appState.Model, isServerHealthy, getLampInfo]);

  // Extract RED value for clean dependency tracking
  const reductionEquivalentDose = appState.results?.["Reduction Equivalent Dose"];

  useEffect(() => {
    if (!isInitialMount.current && isServerHealthy && appState.Application === 'Dechlorination') {
      // Only call when RED is a valid positive number
      if (reductionEquivalentDose && reductionEquivalentDose > 0) {
        getDechlorination(appState.chlorine_in, appState.ozone_in, reductionEquivalentDose);
      }
    }
  }, [appState.chlorine_in, appState.ozone_in, reductionEquivalentDose, isServerHealthy, appState.Application]);

  useEffect(() => {
    if (!isInitialMount.current && isServerHealthy) {
      getDropDownOptions(appState.Application, appState.role);
    }
  }, [appState.Application, appState. role, getDropDownOptions, isServerHealthy]);

  // Initial calculation + initial ranges fetch
  useEffect(() => {
    if (isInitialMount.current && isServerHealthy) {
      const systemType = `${appState.Module}-${appState.Model}`;
      const branch = parseInt(appState.Branch) || 1;

      // Force operational ranges on initial load, then mark initial mount complete
      getRanges(systemType, appState.Position, branch).then(() => {
        // Set isInitialMount to false AFTER initial fetch completes
        // This will trigger the calculatorMode effect, which will then record the mode
        isInitialMount.current = false;
      });

      getDropDownOptions(appState.Application, appState.role);
      getVersion();
      getKillData();
    }
  }, [isServerHealthy, getRanges, getDropDownOptions]);

  useEffect(() => {
    if (appState?.doseValue !== null && appState?.doseValue !== -1) {
      getFlowForDose();
      updateState({ doseValue: -1 });
    }
  }, [isServerHealthy, appState?.doseValue])

  // Manual recalculation (no debounce)
  const recalculate = useCallback(() => {
    if (calculateTimer. current) {
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
    checkServerHealth,
    getVersion,
    getKillData,
    getDechlorination,
    getChartSensitivity,
    getLampInfo,
    isOutOfOperationalRange
  };
};

export default useAppState;