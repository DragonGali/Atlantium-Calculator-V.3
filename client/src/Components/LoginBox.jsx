/**
 * LoginBox.jsx
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

const LoginBox = ({ onLoginSuccess, appState, updateState }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState('username'); // 'username' or 'password'
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid credentials!');

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
    if (!usernameValue.trim()) {
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
        updateState({ username: usernameValue });
        updateState({ password: passwordValue });
        onLoginSuccess(true);
      } else {
        let displayError = 'Invalid credentials!';

        if (result.error.includes('Wrong Login Name')) {
          displayError = 'Username not found';
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

  const renderFieldDisplay = (value, fieldName) => {
    const isActive = activeField === fieldName;
    const displayText =
      fieldName === 'password'
        ? '*'.repeat(value?.length || 0)
        : value || '';
    const cursor = showCursor && !isTyping && isActive ? '|' : '';

    return (
      <span className="input-text">
        {displayText}
        {cursor && <span className="cursor">{cursor}</span>}
      </span>
    );
  };

  const handleFieldClick = (fieldName) => {
    setActiveField(fieldName);
    if (fieldName === 'username') {
      usernameInputRef.current?.focus();
    } else {
      passwordInputRef.current?.focus();
    }
  };

  return (
    <div className="LoginBox">
      <div className="container">
        <p className={`title ${showError ? 'error' : ''}`}>
          {showError ? errorMessage : 'Please Login:'}
        </p>

        {/* Username field */}
        <div className="input-group">
          <label className="input-label">Username:</label>
          <div
            className={`type-bar ${activeField === 'username' ? 'active' : ''}`}
            onClick={() => handleFieldClick('username')}
            tabIndex={0}
          >
            {isVerifying ? (
              <span className="input-text">Verifying...</span>
            ) : (
              renderFieldDisplay(username, 'username')
            )}
          </div>
        </div>

        {/* Password field */}
        <div className="input-group">
          <label className="input-label">Password:</label>
          <div
            className={`type-bar ${activeField === 'password' ? 'active' : ''}`}
            onClick={() => handleFieldClick('password')}
            tabIndex={0}
          >
            {isVerifying ? (
              <span className="input-text">Verifying...</span>
            ) : (
              renderFieldDisplay(password, 'password')
            )}
          </div>
        </div>

        {/* Hidden username input */}
        <input
          ref={usernameInputRef}
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 100);
          }}
          onFocus={() => setActiveField('username')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isVerifying) {
              if (!username.trim()) {
                passwordInputRef.current?.focus();
                setActiveField('password');
              } else if (!password.trim()) {
                passwordInputRef.current?.focus();
                setActiveField('password');
              } else {
                checkLogin(e.currentTarget.value, password);
              }
            } else if (e.key === 'Tab') {
              e.preventDefault();
              passwordInputRef.current?.focus();
              setActiveField('password');
            }
          }}
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

        {/* Hidden password input */}
        <input
          ref={passwordInputRef}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 100);
          }}
          onFocus={() => setActiveField('password')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isVerifying) {
              checkLogin(username, e.currentTarget.value);
            } else if (e.key === 'Tab') {
              e.preventDefault();
              usernameInputRef.current?.focus();
              setActiveField('username');
            }
          }}
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

        {/* Login button (fixed) */}
        <div className="login-button">
          <p
            onClick={() => {
              if (isVerifying) return;
              const usernameValue = usernameInputRef.current?.value || username;
              const passwordValue = passwordInputRef.current?.value || password;
              checkLogin(usernameValue, passwordValue);
            }}
            style={{
              opacity: isVerifying ? 0.5 : 1,
              cursor: isVerifying ? 'not-allowed' : 'pointer',
            }}
          >
            {isVerifying ? 'Verifying...' : 'Login'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
