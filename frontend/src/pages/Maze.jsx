import React from 'react'

import TextBox from '../components/graph/TextBox'

import classes from './Home.module.css'

const Maze = ({onClick, addNode, messages}) => {
  return (
    <div>
      <TextBox text='SYSTEM' type='system' id={0} onClick={() => onClick(0)} />
      <div>
        {console.log(messages)}
        {messages.length === 0 ? messages : messages[0].map((message) => {
          return <TextBox text={message.text} type={message.role} id={message.id} onClick={() => onClick(message.id)} />
        }
        )}
      </div>
    </div>
  )
}

export default Maze
