/**
 * LoginBox. jsx
 *
 * A full-screen login component for user access.
 * Uses the backend login endpoint with both username and password.
 *
 * - Props:
 *   - `onLoginSuccess`: called when login is successful
 *
 * - Features:
 *   - Blinking cursor effect on active field
 *   - Hidden inputs keep values synced with custom display
 *   - Shows error message briefly on wrong credentials
 *   - Supports Enter to submit
 *   - Tab to switch between fields
 *   - Fetches authentication from MongoDB backend
 */

import React, { useState, useEffect, useRef } from 'react';
import '../Styles/LoginBox.css';
import apiService from '../apiService';

const LoginBox = ({ onLoginSuccess, updateState}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState('username');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid credentials! ');

  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor(s => !s), 530);
    return () => clearInterval(id);
  }, []);

  // focus the username input on mount
  useEffect(() => usernameInputRef.current?.focus(), []);

  const checkLogin = async (usernameValue = username, passwordValue = password) => {
    if (! usernameValue. trim()) {
      setErrorMessage('Please enter a username');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setActiveField('username');
      usernameInputRef.current?.focus();
      return;
    }

    if (!passwordValue.trim()) {
      setErrorMessage('Please enter a password');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setActiveField('password');
      passwordInputRef.current?.focus();
      return;
    }

    setIsVerifying(true);

    try {
      const result = await apiService.login(usernameValue, passwordValue);

      if (result.success) {
        const calculatorMode = (result.role === 'Developer' || result.role === 'Admin')
            ? 'Developer'
            : 'Marketing';

        // Store user info - SINGLE updateState call
        updateState({
          username: usernameValue,
          password: passwordValue,
          role: result.role,
          calculatorMode: calculatorMode,
          Application: result.calculator_type === 'Developer' ? 'Full Range' : 'Municipal EPA'
        });

        onLoginSuccess(true);
      } else {
        // Map backend error messages to user-friendly messages
        let displayError = 'Invalid credentials!';

        if (result.error. includes('Wrong Login Name')) {
          displayError = 'Username not found';
        } else if (result.error.includes('Wrong Password')) {
          displayError = 'Wrong Password! ';
        } else if (result.error.includes('Expired')) {
          displayError = 'Access Expired.  Contact Admin. ';
        } else {
          displayError = result.error;
        }

        setErrorMessage(displayError);
        setShowError(true);
        setPassword('');
        setTimeout(() => setShowError(false), 3000);
        passwordInputRef.current?.focus();
        setActiveField('password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Server error. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderFieldDisplay = (field) => {
    const value = field === 'username' ? username : password;
    const displayValue = field === 'password' ? '*'.repeat(value.length) : value;
    const isActive = activeField === field;
    const cursor = showCursor && isActive && ! isTyping ?  '|' : '';

    return (
        <span className="input-text">
        {displayValue}
          <span className="cursor">{cursor}</span>
      </span>
    );
  };

  const handleFieldClick = (field) => {
    setActiveField(field);
    if (field === 'username') {
      usernameInputRef. current?.focus();
    } else {
      passwordInputRef.current?. focus();
    }
  };

  return (
      <div className="LoginBox">
        <div className='container'>
          <p className={`title ${showError ? 'error' : ''}`}>
            {showError ?  errorMessage : 'Please Login: '}
          </p>

          {/* Username Field - FIXED:  Using input-group */}
          <div className="input-group">
            <label className="input-label">Username: </label>
            <div
                className={`type-bar ${activeField === 'username' ? 'active' : ''}`}
                onClick={() => handleFieldClick('username')}
                tabIndex={0}
            >
              {isVerifying && activeField === 'username' ?  (
                  <span className="input-text">Checking...</span>
              ) : (
                  renderFieldDisplay('username')
              )}
            </div>
          </div>

          {/* Password Field - FIXED: Using input-group */}
          <div className="input-group">
            <label className="input-label">Password:</label>
            <div
                className={`type-bar ${activeField === 'password' ? 'active' : ''}`}
                onClick={() => handleFieldClick('password')}
                tabIndex={0}
            >
              {isVerifying && activeField === 'password' ? (
                  <span className="input-text">Checking...</span>
              ) : (
                  renderFieldDisplay('password')
              )}
            </div>
          </div>

          {/* Hidden Inputs */}
          <input
              ref={usernameInputRef}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 100);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isVerifying) {
                  setActiveField('password');
                  passwordInputRef.current?.focus();
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  setActiveField('password');
                  passwordInputRef.current?.focus();
                }
              }}
              onFocus={() => setActiveField('username')}
              disabled={isVerifying}
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

          <input
              ref={passwordInputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target. value);
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 100);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isVerifying) {
                  checkLogin(username, e.currentTarget.value);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  setActiveField('username');
                  usernameInputRef.current?.focus();
                }
              }}
              onFocus={() => setActiveField('password')}
              disabled={isVerifying}
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                border: 'none',
                padding: 0,
                margin:  0,
              }}
          />

          {/* Login Button */}
          <div
              className='login-button'
              onClick={() => !isVerifying && checkLogin(username, password)}
              style={{ opacity: isVerifying ? 0.5 : 1, cursor: isVerifying ? 'not-allowed' : 'pointer' }}
          >
            <p>{isVerifying ? 'Verifying...' : 'Login'}</p>
          </div>
        </div>
      </div>
  );
};

export default LoginBox;