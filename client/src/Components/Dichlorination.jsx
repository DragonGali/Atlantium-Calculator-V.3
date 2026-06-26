/**
 * Dichlorination.jsx
 * 
 * Displays input/output values for ozone and chlorine during
 * dichlorination and ozone decomposition.
 * 
 * - Static layout with placeholders for values.
 * - Certain boxes (e.g., "In" values) are disabled.
 */


import { useState, useEffect, Fragment} from 'react'
import '../Styles/Dichlorination.css';
import data from "../data";

function Dichlorination () {

  return ( <div className="Dichlorination">
    <div className="title-box">
            <p>Dichlorination and Ozone decomposition</p>
    </div>
    <div className="wrapper">
        <div className="vertical-container">
          <div className='horizontal-container'>
              <div className='type-box'>
                <p>Ozone-In</p>
              </div>
              
              <div className='value-box disabled'>
                  <p>0.0</p>
              </div>

              <div className='type-box'>
                <p>Ozone-Out</p>
              </div>

              <div className='value-box'>
                  <p>0.0</p>
              </div>
          </div>
          <div className='horizontal-container'>
              <div className='type-box'>
                <p>Chlorine-In</p>
              </div>
              
              <div className='value-box disabled'>
                  <p>0.0</p>
              </div>

              <div className='type-box'>
                <p>Chlorine-Out</p>
              </div>

              <div className='value-box'>
                  <p>0.0</p>
              </div>
          </div>
        </div>
        </div>
        
    </div>
  
  )}

export default Dichlorination;