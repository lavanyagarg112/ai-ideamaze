import React from 'react'

import Query from '../components/chat/QueryChat'
import Response from '../components/chat/ResponseChat'

import classes from './Home.module.css'

const ChatBox = ({messages, addMessage, newBranch}) => {
  return (
    <div className={classes.scrollablecontent}>
      <Query text='add query here!' onClick={() => newBranch(0)} />
      <div>
        {console.log(messages)}
        {messages.length === 0 ? messages : messages[0].map((message) => {
          if (message.role === 'query') {
            return <Query key={message.id} text={message.text} onClick={() => newBranch(message.id)} />
          } else {
            return <Response key={message.id} text = {message.text}  onClick={() => newBranch(message.id)} />
          }
        }
        )}
      </div>
    </div>
  )
}

export default ChatBox
