import React, { useState, useRef, useEffect } from 'react';
import classes from './Chat.module.css';

const Query = ({ text, onClick, canChange, shouldAdd = false, addMessage = undefined }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    autoExpand(event.target);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onClick(inputValue);
      setInputValue('');
    }
  };

  const autoExpand = (field) => {
    field.style.height = 'inherit';
    const computed = window.getComputedStyle(field);
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
      + parseInt(computed.getPropertyValue('padding-top'), 10)
      + field.scrollHeight
      + parseInt(computed.getPropertyValue('padding-bottom'), 10)
      + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    field.style.height = `${height}px`;
  };

  useEffect(() => {
    if (inputRef.current) {
      autoExpand(inputRef.current);
    }
  }, [inputValue]);

  return (
    <div>
      <div className={classes.query}>
        {!canChange && !shouldAdd && <div onClick={onClick}>{text}</div>}
        {canChange && !shouldAdd && (
          <div>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your query..."
              className={classes.input}
            />
            <button onClick={handleSubmit} className={classes.button}>Submit</button>
          </div>
        )}
      </div>
      {shouldAdd && (
        <button onClick={addMessage} className={classes.button}>{text}</button>
      )}

    </div>
    
  );
};

export default Query;
