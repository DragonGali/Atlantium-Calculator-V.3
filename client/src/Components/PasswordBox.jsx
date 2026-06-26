/**
 * PasswordBox.jsx
 * 
 * A full-screen password input component for developer access.
 * Uses the backend login endpoint with a default "Developer" username.
 * 
 * - Props:
 *   - `onClose`: called when the box is closed/cancelled
 *   - `onPasswordCorrect`: called when the correct password is entered
 * 
 * - Features:
 *   - Blinking cursor effect
 *   - Hidden input keeps value synced with custom display
 *   - Shows error message briefly on wrong password
 *   - Supports Enter to submit and Escape to cancel
 *   - Fetches authentication from MongoDB backend
 */

import React, { useState, useEffect, useRef } from 'react';
import '../Styles/PasswordBox.css';
import apiService from '../apiService';

const PasswordBox = ({ onClose, onPasswordCorrect, appState, updateState }) => {
  const [password, setPassword] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Wrong Password!');
  const inputRef = useRef(null);

  // blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor(s => !s), 530);
    return () => clearInterval(id);
  }, []);

  // focus the hidden input on mount
  useEffect(() => inputRef.current?.focus(), []);

  const checkPassword = async (value = password) => {
    if (!value.trim()) {
      setErrorMessage('Please enter a password');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setIsVerifying(true);
    
    try {
      // Use the login endpoint with default username
      const result = await apiService.login(appState.username, value);
      
      if (result.success) {
        // Store user info for later use
        updateState({"password" : value})
        
        onPasswordCorrect?.(true);
        onClose?.();
      } else {
        // Map backend error messages to user-friendly messages
        let displayError = 'Wrong Password!';
        
        if (result.error.includes('Wrong Login Name')) {
          displayError = 'Developer account not found';
        } else if (result.error.includes('Wrong Password')) {
          displayError = 'Wrong Password!';
        } else if (result.error.includes('Expired')) {
          displayError = 'Access Expired. Contact Admin.';
        } else {
          displayError = result.error;
        }
        
        setErrorMessage(displayError);
        setShowError(true);
        setPassword('');
        setTimeout(() => setShowError(false), 3000);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setErrorMessage('Server error. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderPasswordDisplay = () => {
    const asterisks = '*'.repeat(password.length);
    const cursor = showCursor && !isTyping ? '|' : '';
    return (
      <span className="password-text">
        {asterisks}
        <span className="cursor">{cursor}</span>
      </span>
    );
  };

  return (
    <div className="PasswordBox">
      <div className='container'>
        <p className={`title ${showError ? 'error' : ''}`}>
          {showError ? errorMessage : 'Please Enter Developer Password:'}
        </p>

        {/* clickable typing area — focuses the real (hidden) input */}
        <div
          className='type-bar'
          onClick={() => inputRef.current?.focus()}
          tabIndex={0}
        >
          {isVerifying ? (
            <span className="password-text">Verifying...</span>
          ) : (
            renderPasswordDisplay()
          )}
        </div>

        {/* Real input keeps value in sync; Enter uses e.currentTarget.value (no race) */}
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 100);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isVerifying) {
              // use the input's current value (guaranteed correct)
              checkPassword(e.currentTarget.value);
            } else if (e.key === 'Escape') {
              onClose?.();
            }
          }}
          disabled={isVerifying}
          // visually hidden but focusable
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        />

        <div className='password-buttons'>
          <div className='password-button'>
            <p 
              onClick={() => !isVerifying && checkPassword(password)}
              style={{ opacity: isVerifying ? 0.5 : 1, cursor: isVerifying ? 'not-allowed' : 'pointer' }}
            >
              {isVerifying ? 'Verifying...' : 'OK'}
            </p>
          </div>
          <div 
            className='password-button' 
            onClick={!isVerifying ? onClose : undefined}
            style={{ opacity: isVerifying ? 0.5 : 1, cursor: isVerifying ? 'not-allowed' : 'pointer' }}
          >
            <p>Cancel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordBox;