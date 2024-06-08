import React, {useState} from 'react'
import classes from './Chat.module.css'

const Query = ({text, onClick, canChange}) => {

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onClick(inputValue);
      setInputValue('');
    }
  };
  return (
    <div className={classes.query}>
      {!canChange && <div onClick={onClick}>{text}</div>}
      {canChange && (
        <div>
          <input 
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your query..."
          />
          <button onClick={handleSubmit} className={classes.button}>Submit</button>
        </div>
      )}
    </div>
  )
}

export default Query
