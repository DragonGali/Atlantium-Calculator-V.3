/*
 
 ______     ______   __         ______     __   __     ______   __     __  __     __    __    
/\  __ \   /\__  _\ /\ \       /\  __ \   /\ "-.\ \   /\__  _\ /\ \   /\ \/\ \   /\ "-./  \   
\ \  __ \  \/_/\ \/ \ \ \____  \ \  __ \  \ \ \-.  \  \/_/\ \/ \ \ \  \ \ \_\ \  \ \ \-./\ \  
 \ \_\ \_\    \ \_\  \ \_____\  \ \_\ \_\  \ \_\\"\_\    \ \_\  \ \_\  \ \_____\  \ \_\ \ \_\ 
  \/_/\/_/     \/_/   \/_____/   \/_/\/_/   \/_/ \/_/     \/_/   \/_/   \/_____/   \/_/  \/_/ 
                                                                                              

  App.jsx
 
 * Main application component for the UV Dose Calculator.
 
 * Responsibilities:
 * - Tracks global application state (fetched from backend server).
 * - Handles screen resizing and propagates width/height to child components.
 * - Manages opening/closing of modals like the password box, full table view, and charts.
 * - Renders all main UI components (ChooseApplication, HODSystem, Specifications, Results, etc.).
 */

import { useState, useEffect } from 'react'
import data from "./data.js"
import './App.css'

//Importing components
import ChooseApplication from './Components/ChooseApplication.jsx'
import HODSystem from './Components/HODSystem.jsx'
import CalculatrVersion from './Components/CalculatorVersion.jsx'
import PlotFigures from './Components/PlotFigures.jsx'
import Specifications from './Components/Specifications.jsx'
import Results from './Components/Results.jsx'
import PathogenReduction from './Components/PathogenReduction.jsx'
import PathogenInactivation from './Components/PathogenInactivation.jsx'
import Dechlorination from './Components/Dechlorination.jsx'
import TableView from './Components/TableView.jsx'
import DraggableWindow from './Components/DraggableWindow.jsx'
import PasswordBox from './Components/PasswordBox.jsx'
import SimpleChart from './Components/SimpleChart.jsx'
import FlowDosePrompt from './Components/FlowDosePrompt.jsx'


// =======================
// Main App Component
// =======================
const App = ({appState, updateState, getChartSensitivity, isOutOfOperationalRange}) =>  {

  /**
   * Track window size so child components
   * can render responsively (e.g. tables, charts).
   */
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const unlockAll = appState?.calculatorMode === 'Developer';
  const [openPasswordBox, setOpenPasswordBox] = useState(false); // Controls whether the password box modal is shown.
  const [openChart, setOpenChart] = useState(false); // Controls whether the chart draggable window is shown. 
  const [fullTableOpened, setFullTableOpened] = useState(false);//Controls whether the full pathogen table window is open.
  const [openDosePrompt, setOpenDosePrompt] = useState(false);

  // Helper to toggle unlock mode
  const setUnlockAll = (value) => {
    const mode = value ? 'Developer' :  'Marketing';
    updateState({ calculatorMode: mode });
  };

  const parseFullKillDataToTableFormat = (tableText) => {
  const lines = tableText.trim().split('\n');
  const headers = lines[0].split('\t');

  const tableData = lines.slice(1)
    .map(line => {
      const cells = line.split('\t');
      const name = cells[0]?.trim();
      const obj = { name };

      // Include all numeric log columns
      for (let i = 1; i < headers.length - 1; i++) {
        const logValue = headers[i].trim();
        if (!isNaN(parseFloat(logValue))) {
          const val = cells[i]?.trim();
          if (val) {
            const key = `${logValue}Log`.replace('.', 'PointFive');
            if (!isNaN(val)) {
              let num = parseFloat(val);
              // Limit to 4 total characters (including decimal point)
              const str = num.toFixed(3); // ensure precision
              obj[key] = parseFloat(
                str.length > 4 ? str.slice(0, 4) : str
              );
            } else {
              obj[key] = val;
            }
          }
        }
      }

      // Skip category rows like "Bacteria"
      const hasData = Object.keys(obj).length > 1;
      return hasData ? obj : null;
    })
    .filter(Boolean);

  return tableData;
};

  // Window resize handling
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);


  // WhatsApp Contact Icon
  //Renders a scalable WhatsApp logo as an inline SVG.
  const WhatsAppIcon = () => (
    <svg className="whatsapp-icon" viewBox="0 0 24 24">
       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  );

  return ( 
    <div className="App">
      <div id="flex-container">
        <div className="banner-container">
          <a href="https://www.atlantium.com" target="_blank" rel="noopener noreferrer">
            <img id="atlantium-img" src="/AtlantiumLogo_Long.png" />
          </a>
          <div className="user-info-banner">
            Logged in as: <strong>{appState?.username}</strong> ({appState?.role})
          </div>
        </div>

        <div className="systems-container">

          {/* Row 1, Column 1 */}
          <div className="bundle column-1" style={{ gridRow: "1", gridColumn: "1" }}>
            <ChooseApplication 
              id="choose-application" 
              appState={appState} 
              updateState={updateState}
              unlockAll={unlockAll}
            />
            <HODSystem 
              id="hod-system" 
              width={size.width} 
              height={size.height} 
              appState={appState} 
              updateState={updateState}
            />
          </div>

          {/* Row 1, Column 2 */}
          <Specifications
            id="specifications"
            width={size.width}
            height={size.height}
            className="column-2"
            unlockAll={unlockAll}
            isOutOfOperationalRange={isOutOfOperationalRange}
            style={{ gridRow: "1", gridColumn: "2" }}
            updateState={updateState}
            appState={appState}
            openDosePrompt={() => {setOpenDosePrompt(true);}}
          />

          {/* Row 1, Column 3 */}
          <PathogenReduction
            id="Pathogen-reduction"
            openFullTable={() => setFullTableOpened(true)}
            width={size.width}
            height={size.height}
            className="column-3"
            style={{ gridRow: "1", gridColumn: "3" }}
            appState={appState}
            updateState={updateState}
          />

          {/* Row 2, Column 1 */}
          <div className="bundle column-1" style={{ gridRow: "2", gridColumn: "1" }}>
            <CalculatrVersion 
              id="calculator-version" 
              unlockAll={setUnlockAll} 
              openPasswordBox={() => setOpenPasswordBox(true)}
              updateState={updateState}
              appState={appState}
            />
            <PlotFigures 
              id="plot-figures" 
              unlockAll={unlockAll} 
              openChart={() => setOpenChart(true)}
              updateState={updateState}
              getChartSensitivity={getChartSensitivity}
            />
          </div>

          {/* Row 2, Column 2 */}
          <Results
            id="results"
            width={size.width}
            height={size.height}
            className="column-2"
            style={{ gridRow: "2", gridColumn: "2" }}
            appState={appState}
            updateState={updateState}
          />

          {/* Row 2, Column 3 */}
          <div className="bundle column-3" style={{ gridRow: "2", gridColumn: "3" }}>
            <PathogenInactivation
              id="pathogen-inactivation"
              width={size.width}
              height={size.height}
              unlockAll={unlockAll}
              appState={appState}
              updateState={updateState}
            />
            <Dechlorination id="Dechlorination" appState={appState} updateState={updateState}/>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
      <p id="creator-names">
        <a href="https://www.linkedin.com/in/gali-kertser/" target="_blank" rel="noopener noreferrer">Gali Kertser</a> 
        <a href="https://www.linkedin.com/in/mike-kertser/" target="_blank" rel="noopener noreferrer"> ,Mike Kertser</a>
      </p>

        <p id="version">UV Dose Calculator v{appState?.api_version || "?"} | RED Library v{appState?.library_version || "?"}</p>
        <a
          href="https://wa.me/0546490221" 
          className="whatsapp-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
          Contact
        </a>
      </footer>

      {/* Password Modal */}
      {openPasswordBox && (
        <PasswordBox 
          onClose={() => setOpenPasswordBox(false)}
          updateState={updateState}
        />
      )}

      {/* Full Pathogen Table Window */}
      {fullTableOpened && (
        <DraggableWindow
          content={
            <div>
              <div
                className="app-view-header"
                style={{
                  gridTemplateColumns: `1.5fr repeat(10, 1fr)`
                }}
              >
                <div className="app-pathogen-type-header">Pathogen Type</div>
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i} className="app-log-header">
                    {`${1 + i * 0.5}-Log`}
                  </div>
                ))}
                
              </div>

              <TableView data={parseFullKillDataToTableFormat(appState?.killData?.["table_text"])} appState={appState}
          updateState={updateState} />
            </div>
          }
          title={data.PathogenReduction.FullTable.title}
          onClose={() => setFullTableOpened(false)}
        />
      )}

      {/* Chart Window */}
      {openChart && (
        <DraggableWindow 
          height={Math.max(200, Math.min(600, size.height * 0.6))}
          width={Math.max(500, Math.min(1000, size.width * 0.5))}
          onClose={() => setOpenChart(false)}
          title={appState?.chartSensitivity?.chart_type}
          content={
            <SimpleChart
              chartData={appState?.chartSensitivity}
              key={appState?.chartSensitivity?.chart_type}
            />
          }
        />
      )}

      {openDosePrompt && <FlowDosePrompt onClose={() => {setOpenDosePrompt(false);}} appState={appState} updateState={updateState}/>}
    </div>
  )
}

export default App
