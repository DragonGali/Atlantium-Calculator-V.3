/**
 * apiService.js
 * 
 * Handles all communication with the FastAPI backend.
 * Matches the exact API structure from the backend.
 */

import config from '../config.json';
import localData from './data';
const API_BASE_URL = config.API_BASE_URL;

// Toggle this to `false` to re-enable real network requests.
// Set to `true` while the backend is unavailable to avoid fetch() calls.
const OFFLINE_MODE = true;

class APIService {
  /**
   * Check if the backend server is healthy
   * GET /health
   */
  async checkHealth() {
    if (OFFLINE_MODE) {
      return {
        success: true,
        healthy: true,
        data: { status: 'healthy', calculator_initialized: true }
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return {
        success: true,
        healthy: data.status === 'healthy' && data.calculator_initialized,
        data
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get the version of the calculator
   * GET /version
   * Returns API server version and RED library version
   */
  async getVersion() {
    if (OFFLINE_MODE) {
      return {
        success: true,
        api_version: 'offline',
        library_version: 'offline'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/version`);
      const data = await response.json();
      return {
        success: true,
        api_version: data.api_version,
        library_version: data.library_version
      };
    } catch (error) {
      console.error('Failed to get version:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * User authentication - uses MongoDB backend
   * POST /login
   * 
   * {string} username - The username
   * {string} password - The password
   */
  async login(username, password) {
    if (OFFLINE_MODE) {
      // Return a permissive mock user so UI can operate when offline
      return {
        success: true,
        role: 'Admin',
        calculator_type: 'Standard',
        message: 'Offline mock login'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Login failed'
        };
      }

      // Check if login was successful
      if (data.status === 'success') {
        return {
          success: true,
          role: data.role,
          calculator_type: data.calculator_type,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get supported systems from backend
   * GET /systems/supported
   *
   * @param {string} type - Optional filter for system Type (e.g., "EPA", "Standard")
   * @param {string} role - User role (e.g., "Marketing", "Developer", "Admin")
   *                        Marketing users see only production systems
   */
  async getSupportedSystems(type, role) {
    if (OFFLINE_MODE) {
      return {
        success: true,
        systems: []
      };
    }

    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (role) params.append('role', role);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/systems/supported${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);
      const data = await response.json();
      return {
        success: true,
        systems: data.systems
      };
    } catch (error) {
      console.error('Failed to get supported systems:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get lamp info for a specific system
   * GET /system/{system_type}/lamp
   *
   * @param {string} systemType - System identifier (e.g., "RZ104-11")
   * @returns {Object} Lamp info including power, count, and available types
   */
  async getLampInfo(systemType) {
    if (OFFLINE_MODE) {
      return {
        success: true,
        power: 100,
        count: 1,
        types: ['Regular']
      };
    }

    try {
      const url = `${API_BASE_URL}/system/${systemType}/lamp`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get lamp info');
      }

      return {
        success: true,
        power: data.power,
        count: data.count,
        types: data.types || ['Regular']
      };
    } catch (error) {
      console.error('Failed to get lamp info:', error);
      return {
        success: false,
        error: error.message,
        types: ['Regular']  // Default fallback
      };
    }
  }

  /**
   * Get valid parameter ranges for a specific system
   * GET /system/{system_type}/ranges
   *
   * {string} systemType - e.g., "RZ-104-11"
   * {string} position - e.g., "Horizontal" or "Vertical"
   * {number} branch - Number of branches (default 1)
   */
  async getParameterRanges(systemType, position = null, branch = 1) {
    if (OFFLINE_MODE) {
      return {
        success: true,
        ranges: {},
        systemType
      };
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (position) {
        params.append('position', position. toLowerCase());
      }
      if (branch && branch >= 1) {
        params.append('branch', branch);
      }

      const queryString = params.toString();
      const url = `${API_BASE_URL}/system/${systemType}/ranges${queryString ? '?' + queryString :  ''}`;

      const response = await fetch(url);
      const data = await response.json();
      return {
        success: true,
        ranges: data.ranges,
        systemType:  data.system_type
      };
    } catch (error) {
      console.error('Failed to get parameter ranges:', error);
      return {
        success:  false,
        error: error.message
      };
    }
  }

  /**
   * Get KillData table for pathogens
   * GET /killData
   */
  async getKillData() {
    if (OFFLINE_MODE) {
      // Build a minimal TSV from local data to keep client components functional
      const rows = localData.PathogenReduction.tableView.tableData || [];
      const header = ['Name', '1', '2', '3', 'Category'].join('\t');
      const body = rows.map(r => `${r.name}\t${r.oneLog}\t${r.twoLog}\t${r.threeLog}\tBacteria`).join('\n');
      const table_text = `${header}\n${body}`;
      return {
        success: true,
        status: 'ok',
        table_text,
        rows: rows.length,
        columns: 5
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/killdata`);
      const data = await response.json();
      return {
        success: true,
        status: data.status,
        table_text: data.table_text,
        rows: data.rows,
        columns: data.columns
      };
    } catch (error) {
      console.error('Failed to get KillData:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  /**
   * Get data for Dechlorination
   * POST /Dechlorination
   */
  async getDechlorination(chlorine_in, ozone_in, red = 300) {
    if (OFFLINE_MODE) {
      return {
        success: true,
        status: 'ok',
        ozone_out: ozone_in,
        chlorine_out: chlorine_in
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Dechlorination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "red": red,
          "ozone_in": ozone_in,
          "chlorine_in": chlorine_in,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Dechlorination calculation failed');
      }

      return {
        success: true,
        status: data.status,
        ozone_out: data.ozone_out,
        chlorine_out: data.chlorine_out
      };
    } catch (error) {
      console.error('Failed to get Dechlorination data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get chart sensitivity data
   * POST /charts/sensitivity
   * 
   * {string} systemType - e.g., "RZ163-11"
   * {string} chartType - e.g., "uvt", "flow", "drive"
   * {number} numPoints - Number of data points, e.g., 20
   * {string} position - e.g., "Horizontal" or "Vertical"
   * {string} lampType - e.g., "Regular"
   * {object} powerSettings - e.g., { all_lamps: 100.0 }
   * {object} efficiencySettings - e.g., { all_lamps: 80.0 }
   * {object} range - Range object with min and max, e.g., { min: 40, max: 97 }
   * {number} flowRate - Flow rate for "drive" chart type
   */
  async getChartSensitivity(
    systemType,
    chartType,
    numPoints,
    position,
    lampType,
    powerSettings,
    efficiencySettings,
    range,
    flowRate
  ) {
    if (OFFLINE_MODE) {
      return { success: true, data: { x: [], y: [] } };
    }

    try {
      let requestBody;

      if (chartType === 'drive') {
        // For "drive" chart: use fixed_params with flow, null for power/efficiency
        requestBody = {
          system_type: systemType,
          chart_type: chartType,
          fixed_params: {
            flow: flowRate
          },
          num_points: numPoints,
          position: position,
          lamp_type: lampType,
          power_settings: null,
          efficiency_settings: null
        };
      } else {
        // For other charts (uvt, flow, etc.): use power_settings and efficiency_settings
        requestBody = {
          system_type: systemType,
          chart_type: chartType,
          num_points: numPoints,
          position: position,
          lamp_type: lampType,
          power_settings: powerSettings,
          efficiency_settings: efficiencySettings,
          [`${chartType}_range`]: range
        };
      }

      const response = await fetch(`${API_BASE_URL}/charts/sensitivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Chart sensitivity calculation failed');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Failed to get chart sensitivity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
     Get flow rate for target dose
     POST /flow-for-dose

   */
  async flowForDose({
    systemType,
    targetDose,
    uvt254,
    uvt215,
    d1Log,
    position,
    powerSettings = {},
    efficiencySettings = {},
    tolerance = 0.1,
    override = false
  }) {
    if (OFFLINE_MODE) {
      return {
        success: true,
        flowRate: 0,
        achievedDose: 0,
        targetDose: targetDose,
        details: {}
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/flow-for-dose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_type: systemType,
          target_dose: targetDose,
          uvt_254: uvt254,
          uvt_215: uvt215,
          d1_log: d1Log,
          position: position,
          power_settings: powerSettings,
          efficiency_settings: efficiencySettings,
          tolerance: tolerance,
          override: override
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Flow for dose calculation failed');
      }

      return {
        success: true,
        flowRate: data.flow_rate,
        achievedDose: data.achieved_dose,
        targetDose: data.target_dose,
        details: data.details
      };
    } catch (error) {
      console.error('Failed to get flow for dose:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  /**
   * Main calculation method
   * POST /calculate
   * 
   * Sends parameters exactly as backend expects them
   */
  async calculate(params) {
    try {
      // Ensure Model and Module are in correct order
      const requestBody = {
        ...params,
        Model: params.Model,
        Module: params.Module,
        override: params.override || false  // Add override with default false
      };


      if (OFFLINE_MODE) {
        return {
          success: true,
          data: { message: 'Offline mock calculation', results: {} }
        };
      }

      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });


      // Get response text first
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Calculation failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // If response is not JSON, use the text directly
          errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = JSON.parse(responseText);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new APIService();