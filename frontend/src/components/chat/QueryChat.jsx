import React, { useState, useRef, useEffect } from 'react';
import classes from './Chat.module.css';

const Query = ({ text, onClick, canChange }) => {
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

    <div className={classes.query}>
      {!canChange && <div onClick={onClick} >{text}</div>}
      {canChange && (
        <div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Talk about your idea here"
            className={classes.input}
          />
          <button onClick={handleSubmit} className={classes.button}>Submit</button>
        </div>
      )}
    </div>


    
  );
};

export default Query;
