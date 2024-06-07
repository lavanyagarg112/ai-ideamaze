import React from 'react'
import classes from './Chat.module.css'

const Query = ({text, onClick}) => {
  return (
    <div className={classes.query} onClick={onClick}>
      {text}
    </div>
  )
}

export default Query
