import React, { useState } from 'react'

import classes from './Home.module.css'

import Maze from './Maze'
import ChatBox from './ChatBox'

const Home = () => {

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState([])

    const DUMMY_DATA = [
        {
            id: 1,
            parent_id: 0,
            role: 'response',
            text: 'This is my message'
        },
        {
            id: 2,
            parent_id: 1,
            role: 'query',
            text: 'This is a new query'
        },
        {
            id: 3,
            parent_id: 2,
            role: 'response',
            text: 'This is my new message'
        }
    ]

    const handleClick = async (id) => {
        // API endpoint here for getting all messages
        await alert(`chatid ${id}`)
        setMessages([])
    }

    const addMessage = async (parentId) => {
        await alert(`add a new branch for parent ${parentId}`)
        // for when user sends query for additional ans
        // get response
        // send new message back to the maze, with parentid?
    }

    const newBranch = async (id) => {
        await alert(`get next branch for ${id}`) // parent id
        // API end point for getting next branch and the whole thing to send it back to chatbox
        setMessages([DUMMY_DATA])
    }

  return (
    <div className={classes.container}>
        <div className={classes.maincontent}>
            <Maze onClick={(id) => handleClick()} addNode={newMessage} messages={messages} />
        </div>
        <div className={classes.scrollablecontainer}>
            <ChatBox messages={messages} addMessage={(parentId) => addMessage(parentId)} newBranch={(id) => newBranch(id)} />
        </div>
    </div>
  )
}

export default Home
