/**
 * TableView.jsx
 *
 * Displays tabular data dynamically with selectable rows.
 * Used in PathogenReduction and FullTable views.
 *
 * Props:
 * - data: array of objects, each representing a row; keys other than "name" are shown as dose values
 * - isFullTable: boolean to adjust layout (default false)
 *
 * State:
 * - selectedRowIndex: highlights the row clicked by the user
 */


import React from 'react';
import { useState } from 'react';
import "../Styles/TableView.css"

const TableView = ({ data, isFullTable = false, appState, updateState}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Figure out which keys are dose values (exclude "name")
  // So that the component will be dynamic and work with any amount of columns.
  const doseKeys = data.length > 0 
    ? Object.keys(data[0]).filter((key) => key !== "name")
    : [];


  //Sets a row as selected
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
    updateState({"Pathogen" : data[index].name});
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