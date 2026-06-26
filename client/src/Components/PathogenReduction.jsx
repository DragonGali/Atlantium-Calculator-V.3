/**
 * PathogenReduction.jsx
 * 
 * Displays pathogen log-reduction dosages in different views.
 * 
 * - Props:
 *   - `openFullTable`: callback to open the full table view
 * 
 * - Features:
 *   - Three view modes: tree, table, full table
 *   - Buttons toggle between views
 *   - Header text changes according to selected view
 *   - Renders `TreeView` or `TableView` depending on mode
 */


import { useState, useEffect, Fragment} from 'react'
import '../Styles/PathogenReduction.css';
import data from "../data";

import TreeView from "../Components/TreeView.jsx"
import TableView from "../Components/TableView.jsx"

const PathogenReduction = ({openFullTable, appState, updateState}) => {

  const buttons = data.PathogenReduction.buttons;

  
  const [pressedButton, setPressedButton] = useState(null);
  const [viewMode, setViewMode] = useState(buttons[0]); // 'tree', 'table', or 'fullTable'

  const handleClick = (button) => {
    setPressedButton(button);
  }

  useEffect (() => {
    handleClick(buttons[0])
  }, [])


  // Text content that changes based on view mode
  const getHeaderText = () => {
    if (viewMode === buttons[0]) {
      return (
        <div className="view-header" style={{gridTemplateColumns: "2fr 1fr"}}>
          <div className="pathogen-type-header">Pathogen Type</div>
          <div className="dose-header">1-Log Dose [mJ/cm2]</div>
        </div>
      );
    } else {
      // For table and fullTable views
      return (
        <div className="view-header" style={{gridTemplateColumns: "3fr 1fr 1fr 1fr 0.6fr"}}>
          <div className="pathogen-type-header">Pathogen Type</div>
          <div className="log-header">1-Log</div>
          <div className="log-header">2-Log</div>
          <div className="log-header">3-Log</div>
        </div>
      );
    }
  };
   

  return ( <div className="PathogenReduction">
    <div className="title-box">
            <p>Pathogens - Log Reduction Dosage [mJ/cm²]</p>
    </div>
    <div className="wrapper">
      <div className='vertical-container'>
        {getHeaderText()}
          <div className='container'>
            <div className='scroll-container'>
              {/* Conditional component rendering */}
              {viewMode === buttons[0] && (
                <TreeView data={data.PathogenReduction.treeView.treeData} appState={appState} updateState={updateState}/>
              )}
              {(viewMode === buttons[1] || viewMode === buttons[2]) && (
                <TableView data={data.PathogenReduction.tableView.tableData} appState={appState} updateState={updateState}/>
              )}
            </div>
          </div>
          <div className='buttons'>
          {data.PathogenReduction.buttons.map((button, index) => (
              <div 
                key={index} 
                className={`button ${pressedButton === button ? 'IsPressed' : 'NotPressed'}`} 
                onClick={() => {
                    setPressedButton(button);
                    setViewMode(button);
                    if (button === buttons[2]) {
                    openFullTable();
                    }
                }}
              >
              <p>{button}</p>
               </div>
          ))}
      </div>
    </div>
    </div>
    </div>
  
  )}

export default PathogenReduction;