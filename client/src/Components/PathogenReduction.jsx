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


  //Turns killData into a table format that I could use
  const parseKillDataToTableFormat = (tableText) => {
    const lines = tableText.trim().split('\n');
    const headers = lines[0].split('\t');

    const tableData = lines.slice(1)
      .map(line => {
        const cells = line.split('\t');
        const name = cells[0]?.trim();

        const obj = { name };

        // Only include logs 1, 2, and 3
        for (let i = 1; i < headers.length - 1; i++) {
          const logValue = headers[i].trim();
          if (['1', '2', '3'].includes(logValue)) {
            const val = cells[i]?.trim();
            if (val) obj[`${logValue}Log`] = isNaN(val) ? val : parseFloat(val);
          }
        }

        // Skip rows that don't have any log data (like "Bacteria")
        const hasData = ['1Log', '2Log', '3Log'].some(k => obj[k] !== undefined);
        return hasData ? obj : null;
      })
      .filter(Boolean);

    return tableData;
  };

  const parseKillDataToTreeFormat = (tableText) => {
    const lines = tableText.trim().split('\n').filter(Boolean);
    const categoryMap = {};

    // Parse header to find column indices
    const headerRow = lines[0].split('\t');
    const oneLogIndex = headerRow.findIndex(h => h.trim() === '1');
    const categoryIndex = headerRow.length - 1;

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split('\t');
      if (cells.length < 2) continue;

      const name = cells[0].trim();
      const category = cells[categoryIndex].trim();
      const dose = oneLogIndex !== -1 ? cells[oneLogIndex]?.trim() : undefined;

      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }

      categoryMap[category].push({ 
        label: name,
        dose: dose ? (isNaN(dose) ? dose : parseFloat(dose)) : undefined
      });
    }

    // Convert map to array and return
    const treeData = [];
    for (const [category, children] of Object.entries(categoryMap)) {
      treeData.push({
        label: category,
        children,
      });
    }

    return treeData;
  };

  useEffect (() => {
    handleClick(buttons[0])
  }, [])


  // Text content that changes based on view mode
  const getHeaderText = () => {
    if (viewMode === buttons[0]) {
      return (
        <div className="view-header" style={{gridTemplateColumns: "2fr 1fr"}}>
          <div className="pathogen-type-header">Pathogen Type</div>
          <div className="dose-header">1-Log Dose [mJ/cm²]</div>
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
                <TreeView data={parseKillDataToTreeFormat(appState?.killData?.["table_text"])} appState={appState} updateState={updateState}/>
              )}
              {(viewMode === buttons[1] || viewMode === buttons[2]) && (
                <TableView data={parseKillDataToTableFormat(appState?.killData?.["table_text"])} appState={appState} updateState={updateState}/>
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