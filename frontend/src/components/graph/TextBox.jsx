import React, { useState } from 'react';
import Draggable from 'react-draggable';
import classes from './TextBox.module.css'

const TextBox = ({ id, text, onClick, type }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = () => {
    setIsDragging(true);
  }

  const handleStop = () => {
    setIsDragging(false);
  }

  const handleClick = () => {
    if (!isDragging) {
      onClick(id);
    }
  }

  const maxLength = 100

  return (
    <Draggable
      onStart={handleStart}
      onStop={handleStop}
    >
      <div
        className={
          type === 'user' ? classes.query : type === 'assistant' ? classes.response : type === 'system' ? classes.textbox : classes.textbox
        }
        onClick={handleClick}
      >
        {text.length > maxLength ? `${text.substring(0, maxLength)}...` : text}
      </div>
    </Draggable>
  );
};

export default TextBox;
