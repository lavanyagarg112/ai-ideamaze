import React from 'react'
import classes from './Chat.module.css'

const Response = ({text, onClick}) => {
  return (
    <div className={classes.response} onClick={onClick}>
      {text}
    </div>
  )
}

export default Response
