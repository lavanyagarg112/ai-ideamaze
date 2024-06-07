import React, { useState } from 'react'

import Query from '../components/chat/QueryChat'
import Response from '../components/chat/ResponseChat'

import classes from './Home.module.css'

const ChatBox = ({messages, addMessage, newBranch}) => {

  return (
    <div className={classes.scrollablecontent}>
      <Query text='SYSTEM' onClick={() => newBranch(0, false)} />
      <div>
        {console.log(messages)}
        {messages.length === 0 ? messages : messages[0].map((message) => {
          if (message.role === 'query') {
            return <Query key={message.id} text={message.text} onClick={() => newBranch(message.id, false)} /> // probably addMessage?
          } else {
            return <Response key={message.id} text = {message.text} />
          }
        }
        )}
        {messages.length === 0
          ? <Query text='add query here' onClick={() => newBranch(1, true)} />
          : <Query text='add query here' onClick={() => newBranch(messages[0].length + 1, true)} />
        }

        {/* need to accept input for the above thing to work */}
        

      </div>
    </div>
  )
}

export default ChatBox
