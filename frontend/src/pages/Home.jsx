import React, { useState } from 'react'
import { ReactFlowProvider } from 'reactflow';

import classes from './Home.module.css'

import Maze from './Maze'
import ChatBox from './ChatBox'

const Home = () => {

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState([])

    const DUMMY_DATA = [
        {
            id: 0,
            parent_id: 0,
            role: 'user',
            text: 'This is my first query'
        },
        {
            id: 1,
            parent_id: 0,
            role: 'assistant',
            text: 'This is my message'
        },
        {
            id: 2,
            parent_id: 1,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 3,
            parent_id: 2,
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: 4,
            parent_id: 3,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 5,
            parent_id: 4,
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: 6,
            parent_id: 5,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 7,
            parent_id: 6,
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: 8,
            parent_id: 7,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 9,
            parent_id: 8,
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: 10,
            parent_id: 9,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 11,
            parent_id: 10,
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: 12,
            parent_id: 11,
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: 13,
            parent_id: 12,
            role: 'assistant',
            text: 'This is my new message'
        }
    ]

    const handleClick = async (id) => {
        // API endpoint here for getting all messages
        await alert(`chatid ${id}`)
        setMessages(DUMMY_DATA)
    }

    const addMessage = async (parentId) => {
        await alert(`add a new branch for parent ${parentId}`)
        // for when user sends query for additional ans
        // get response
        // send new message back to the maze, with parentid?
    }

    const newBranch = async (id, getMessage) => {
        await alert(`get next branch for ${id}`) // parent id
        // API end point for getting next branch and the whole thing to send it back to chatbox
        setMessages(DUMMY_DATA)
        setNewMessage(DUMMY_DATA[1])
    }

    // right now i am sending in an array of array of messages so i have to do messages[0].
    // see if i can fix this

  return (
    <div className={classes.container}>
        <div className={classes.maincontent}>
            <ReactFlowProvider>
                <Maze onClick={(id) => handleClick(id)} addNode={newMessage} allMessages={messages} />
            </ReactFlowProvider>
            
        </div>
        <div className={classes.scrollablecontainer}>
            <ChatBox messages={messages} addMessage={(parentId) => addMessage(parentId)} newBranch={(id) => newBranch(id)} />
        </div>
    </div>
  )
}

export default Home
