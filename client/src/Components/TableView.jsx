import React from 'react';
import { useState, useEffect } from 'react';
import "../Styles/TableView.css"

const TableView = ({ data, isFullTable = false, appState, updateState}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Sync selectedRowIndex with appState.Pathogen whenever appState changes
  useEffect(() => {
    if (appState?.Pathogen) {
      const index = data.findIndex(row => row.name === appState.Pathogen);
      setSelectedRowIndex(index >= 0 ? index : null);
    } else {
      setSelectedRowIndex(null);
    }
  }, [appState?.Pathogen, data]);

  // Figure out which keys are dose values (exclude "name")
  const doseKeys = data.length > 0 
    ? Object.keys(data[0]).filter((key) => key !== "name")
    : [];

  // Sets a row as selected
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
    updateState({"Pathogen" : data[index].name});
    updateState({"manualInput" : false}); // Ensure manualInput is false when selecting
  }

  return (
    <div className={`TableView ${isFullTable ? "columns-10" : "columns-4"}`}>
      <table className="fixed_headers">
        <tbody>
          {data.map((pathogen, index) => (
            <tr
              key={index}
              className={selectedRowIndex === index ? "selected" : ""}
              onClick={() => handleRowClick(index)}
            >
              <td className="pathogen-name">{pathogen.name}</td>
              {doseKeys.map((doseKey, i) => (
                <td key={i} className="dose-value">
                  {pathogen[doseKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;