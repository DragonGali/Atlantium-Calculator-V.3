import { useState, useEffect, Fragment} from 'react'
import '../Styles/PathogenInactivation.css';
import data from "../data";

import ProgressBar from './ProgressBar.jsx'

const PathogenInactivation = ({unlockAll}) => {

  const [pressedButton, setPressedButton] = useState(null);
  const [expectedLI, setExepectedLI] = useState(3);
    const handleClick = (button) => {
    setPressedButton(button);
  }
   

  return ( <div className="PathogenInactivation">
    <div className="title-box">
            <p>Pathogen-Specific Log-Inactivation</p>
    </div>
    <div className="wrapper">
        <div className="vertical-container">
          
          <div className="horizontal-container">
            <div className='type-box' >
                <p>Selected</p>
            </div>
            <div className='value-box'>
              <p>Manul Input</p>
            </div>
          </div>

          <div className="horizontal-container">
            <div className='type-box'>
                <p>D-1LOG UV-</p>
            </div>

            <input
             type="text"
             className={`simple-input ${unlockAll ? '' : 'locked'}`}
             placeholder='' value="3"
             />

            <div className='type-box' style={{width:"20%"}}>
                <p>[mJ]</p>
            </div>
          </div>

          <div className='horizontal-container'>
              <div className='type-box'>
                  <p>Expected LI</p>
              </div>
              <div className='value-box' style={{width:"26%"}}>
                <p>{expectedLI}</p>
              </div>
              <ProgressBar progress='3' maxProgress='5'/>
          </div>
      </div>
      <div className='vertical-container'>
        <div className='reset-button'>
          <p>Reset</p>
        </div>
        <p className='expected-li-text'>{`${expectedLI} out of 5LOG`}</p>
      </div>
      </div>
    </div>
  
  )}

export default PathogenInactivation;