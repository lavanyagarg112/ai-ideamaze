import React, { useState, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow';

import classes from './Home.module.css'

import Maze from './Maze'
import ChatBox from './ChatBox'

async function fetchWordList() {
    const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
    const text = await response.text();
    return text.split('\n');
}

const Home = () => {
    const [user, setUser] = useState('username');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState([]);

    useEffect(() => {
        // Step 2: Use the fetched word list
        fetchWordList().then(dictionary => {
            // Function to get a random word from the dictionary
            function getRandomWord() {
                const randomIndex = Math.floor(Math.random() * dictionary.length);
                return dictionary[randomIndex].trim();
            }

            // Function to generate a username with three random words
            function generateUsername() {
                const word1 = getRandomWord();
                const word2 = getRandomWord();
                const word3 = getRandomWord();
                return `${word1}-${word2}-${word3}`;
            }

            // Function to assign the generated username to a user
            function assignUsernameToUser() {
                const username = generateUsername();
                return { username };
            }

            const newUser = assignUsernameToUser();
            setUser(newUser.username);
            console.log(`Assigned username to user: ${user}`);
        });
    }, []);

    const DUMMY_DATA = [
        {
            id: '0',
            parent_id: '0',
            role: 'user',
            text: 'This is my first query'
        },
        {
            id: '1',
            parent_id: '0',
            role: 'assistant',
            text: 'This is my message'
        },
        {
            id: '2',
            parent_id: '1',
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: '3',
            parent_id: '2',
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: '4',
            parent_id: '3',
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: '5',
            parent_id: '4',
            role: 'assistant',
            text: 'This is my new message'
        },
        {
            id: '6',
            parent_id: '5',
            role: 'user',
            text: 'This is a new query'
        },
        {
            id: '7',
            parent_id: '6',
            role: 'assistant',
            text: 'This is my new message'
        },
    ]

    const DUMMY_DATA2 = [
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
        // send user
        setMessages(DUMMY_DATA)
    }

    const addMessage = async (parentId) => {
        await alert(`add a new branch for parent ${parentId}`)
        // for when user sends query for additional ans
        // get response
        // send new message back to the maze, with parentid?
    }

    const newBranch = async (newparentid, getMessage, message) => {
        await alert(`get next branch for ${newparentid}`) // parent id
        // API end point for getting next branch and the whole thing to send it back to chatbox
        if (getMessage) {
            // send api
            const messageFormat = {
                id: newparentid+'1',
                parent_id: newparentid,
                role: 'user',
                text: message
            }
            const dummyResponse = {
                id: newparentid + '12',
                parent_id: newparentid+'1',
                role: 'assistant',
                text: message + 'response'
            }
            setMessages([...messages, messageFormat, dummyResponse])
            setNewMessage(dummyResponse)
            console.log('added message:', messages)
        }

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
                <ChatBox messages={messages} addMessage={(parentId) => addMessage(parentId)} 
                    newBranch={(id, getMessage, message) => newBranch(id, getMessage, message)} userName={user}
                    latest={newMessage} />
            </div>
        </div>
    )
}

export default Home
