import React, { useState, useRef, useEffect } from 'react';
import classes from './Chat.module.css';

const Query = ({ text, onClick, canChange, addNew=undefined }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

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
      {!canChange && (
        <div onClick={onClick}>
          {text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      )}
      {canChange && (
        <div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Talk about your idea here"
            className={classes.input}
          />
          <button onClick={handleSubmit} className={classes.button}>Submit</button>
          {addNew && <button onClick={addNew} className={classes.button}>Give me a different idea instead</button>}
        </div>
      )}
    </div>


    
  );
};

export default Query;
