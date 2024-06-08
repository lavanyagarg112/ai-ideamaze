import React, { useState } from 'react'

import Query from '../components/chat/QueryChat'
import Response from '../components/chat/ResponseChat'

import classes from './Home.module.css'

const ChatBox = ({messages, addMessage, newBranch, userName, latest}) => {

  return (
    <div className={classes.scrollablecontent}>
      <Query text={`Username: ${userName}`} onClick={() => newBranch('0', false, '')} canChange={false} />
      <div>
        {console.log("messages: ", messages)}
        {messages.length === 0 ? messages : messages.map((message) => {
          if (message.role === 'user') {
            return <Query key={message.id} text={message.text} onClick={() => addMessage(message.id)} canChange={false}/>
          } else if (message.role === 'assistant') {
            return <Response key={message.id} text = {message.text} />
          } else {
            return
          }
        }
        )}
        {messages.length === 0
          ? <Query text='add query here' onClick={(message) => newBranch('0', true, message)} canChange={true} />
          : <Query text='add query here' onClick={(message) => newBranch(latest.id, true, message)} canChange={true} />
        }

        {/* need to accept input for the above thing to work */}
        

      </div>
    </div>
  )
}

export default ChatBox
