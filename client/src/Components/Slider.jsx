import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Slider.css';

const Slider = ({
                  min,
                  max,
                  step = 1,
                  value,
                  multiplyer = 1,
                  onChange,
                  isOutOfRange = false  // NEW PROP
                }) => {
  // Convert base value to display value
  const displayValue = value * multiplyer;
  const displayMin = min * multiplyer;
  const displayMax = max * multiplyer;
  const displayStep = step * multiplyer;

  const [inputValue, setInputValue] = useState(displayValue?. toString() || '');
  const [isEditing, setIsEditing] = useState(false);
  const prevMinMaxRef = useRef({ min, max });

  // Clamp when min/max changes (operates on base values)
  useEffect(() => {
    const prevMin = prevMinMaxRef.current.min;
    const prevMax = prevMinMaxRef.current. max;

    if (prevMin !== min || prevMax !== max) {
      prevMinMaxRef.current = { min, max };

      if (value !== undefined && value !== null) {
        let clampedValue = Math.min(Math.max(value, min), max);
        if (clampedValue !== value) {
          onChange(clampedValue);
        }
      }
    }
  }, [min, max, value, onChange]);

  // Sync inputValue with external value when not editing (display units)
  useEffect(() => {
    if (!isEditing && value !== undefined && value !== null) {
      setInputValue((value * multiplyer).toString());
    }
  }, [value, isEditing, multiplyer]);

  // Slider change:  convert from display units back to base units
  const handleSliderChange = (e) => {
    const displayVal = Number(e.target.value);
    const baseValue = displayVal / multiplyer;
    onChange(baseValue);
    setInputValue(displayVal.toString());
  };

  const handleInputKeyPress = (e) => {
    if (!/[\d.]/.test(e.key) &&
        ! ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']. includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === '.' && e.target.value. includes('.')) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Input change: validate against display units, convert to base units for onChange
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setInputValue(val);

      const numericDisplayValue = Number(val);
      if (val !== '' && numericDisplayValue >= displayMin && numericDisplayValue <= displayMax) {
        const baseValue = numericDisplayValue / multiplyer;
        onChange(baseValue);
      }
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue('');
  };

  // Input blur: clamp to display range, convert to base units
  const handleInputBlur = () => {
    setIsEditing(false);

    if (inputValue === '') {
      setInputValue((value * multiplyer).toString());
      return;
    }

    let numericDisplayValue = Number(inputValue);
    if (numericDisplayValue < displayMin) numericDisplayValue = displayMin;
    if (numericDisplayValue > displayMax) numericDisplayValue = displayMax;

    const baseValue = numericDisplayValue / multiplyer;
    onChange(baseValue);
    setInputValue(numericDisplayValue.toString());
  };

  return (
      <div className="range-slider-container">
        {isEditing ? (
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyPress}
                className={`range-value-display ${isOutOfRange ?  'out-of-range' : ''}`}
                autoFocus
            />
        ) : (
            <div
                className={`range-value-display ${isOutOfRange ?  'out-of-range' : ''}`}
                onClick={handleInputFocus}
            >
              {parseFloat(displayValue.toFixed(2))}
            </div>
        )}

        <input
            type="range"
            min={displayMin}
            max={displayMax}
            step={displayStep}
            value={displayValue}
            onChange={handleSliderChange}
            className="range-slider"
        />
      </div>
  );
};

export default Slider;