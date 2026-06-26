/**
 * apiService.js
 * 
 * Handles all communication with the FastAPI backend.
 * Matches the exact API structure from the backend.
 */

import config from '../config.json';
const API_BASE_URL = config.API_BASE_URL;

class APIService {
  /**
   * Check if the backend server is healthy
   * GET /health
   */
  async checkHealth() {
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
   * User authentication - uses MongoDB backend
   * POST /login
   * 
   * @param {string} username - The username
   * @param {string} password - The password
   */
  async login(username, password) {
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
   */
  async getSupportedSystems() {
    try {
      const response = await fetch(`${API_BASE_URL}/systems/supported`);
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
   * Get valid parameter ranges for a specific system
   * GET /system/{system_type}/ranges
   * 
   * @param {string} systemType - e.g., "RZ-104-11"
   */
  async getParameterRanges(systemType) {
    try {
      const response = await fetch(`${API_BASE_URL}/system/${systemType}/ranges`);
      const data = await response.json();
      return {
        success: true,
        ranges: data.ranges,
        systemType: data.system_type
      };
    } catch (error) {
      console.error('Failed to get parameter ranges:', error);
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
        Module: params.Module
      };

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