/**
 * tooltips.js
 *
 * Centralized tooltip text configuration for the application.
 * This allows easy maintenance and potential internationalization.
 */

const tooltips = {
  // Calculator fields
  efficiency: "Lamp efficiency represents the percentage of optimal UV output the lamps are producing.",

  relativeDrive: "Relative drive controls the power percentage applied to the UV lamps.",

  uvt254:  "UV Transmittance at 254nm wavelength.",

  uvt215: "UV Transmittance at 215nm wavelength.",

  flowRate: "Total water flow rate through the HOD UV system, all the branches.",

  // Results
  RED: "The effective UV dose delivered for pathogen inactivation",

  headLoss: "Pressure drop across the HOD UV system (flange-to-flange).",

  maxPower: "Maximum electrical power consumption of the HOD UV system at current settings",

  avgPower:  "Estimated HOD UV system electrical power consumption at 90% of maximum drive (L90).",

  // System selection
  application: "Select the application type: Full Range, EPA Municipal, or Dechlorination/Ozone Decomposition",

  module: "Select the HOD UV module type for your system",

  model: "Select the specific system sub-type and orientation",

  branch: "Number of parallel branches in the HOD UV system",

  lampType: "Lamp type selection: Regular, Ozone Free, or VUV (Vacuum UV)",

  // Pathogen
  pathogen: "Select a pathogen to see the log reduction achieved at the calculated dose",

  d1Log: "The UV dose required to achieve 1-log (90%) reduction of the selected pathogen",

  loginactivation: "Expected log reduction level for the selected pathogen",

  // Dechlorination
  ozoneIn: "Input ozone concentration",

  ozoneOut: "Target output ozone concentration",

  chlorineIn:  "Input chlorine concentration",

  chlorineOut: "Target output chlorine concentration",

  // Calculator Version
  version: "Developer Mode overrides validated ranges and opens extended developer options",

  // Plot Figures
  plotREDUVT: "Plot RED as a function of UVT254",
  plotREDFlow: "Plot RED as a function of Flow Rate",
  plotREDDrive: "Plot RED as a function of Lamp Drive",

};

export default tooltips;