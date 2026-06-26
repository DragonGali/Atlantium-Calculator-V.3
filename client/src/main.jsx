import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginBox from './Components/LoginBox.jsx'
import useAppState from './hooks/useAppState.js'

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);

    // Use the custom hook for state management
    const {
      appState,
      updateState,
    } = useAppState();
  


  return (
    <>
      {!loggedIn && <LoginBox onLoginSuccess={() => {setLoggedIn(true)}} appState={appState} updateState={updateState} onClose={() => {window.close()}}/>}
      {loggedIn && <App appState={appState} updateState={updateState}/>}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
