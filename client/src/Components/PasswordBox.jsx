/**
 * PasswordBox.jsx
 *
 * A full-screen password input component for developer access.
 * Checks password against a hardcoded value from data.js
 * Independent of user role - anyone can unlock developer features with the correct password.
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
 *   - Simple client-side password check (no backend authentication)
 */

import React, { useState, useEffect, useRef } from 'react';
import '../Styles/PasswordBox.css';
import data from '../data';

const PasswordBox = ({ onClose, updateState}) => {
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
    if (!value. trim()) {
      setErrorMessage('Please enter a password');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setIsVerifying(true);

    try {
      // Simple hardcoded password check from data.js
      if (value === data.DeveloperPassword) {
        // Password is correct - set calculatorMode and activate physics mode
        // activatePhysicsMode ensures physics ranges are applied even if already in Developer mode
        updateState?.({ calculatorMode: 'Developer', activatePhysicsMode: true });
        onClose?.();
      } else {
        // Wrong password
        setErrorMessage('Wrong Password! ');
        setShowError(true);
        setPassword('');
        setTimeout(() => setShowError(false), 3000);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setErrorMessage('Error checking password');
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