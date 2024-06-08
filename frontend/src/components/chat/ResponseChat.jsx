import React from 'react'
import classes from './Chat.module.css'

const Response = ({text}) => {
  return (
    <div className={classes.response}>
      {text}
    </div>
  )
}

export default Response
