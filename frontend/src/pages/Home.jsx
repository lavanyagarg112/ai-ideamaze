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
    const [chatMessages, setChatMessages] = useState([]);

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

    const handleClick = async (newid) => {
        if (newid !== '-1'){
            const data = {
                username: user,
                id: newid,
            }
            const responseFetch = await fetch('https://ai-ideamaze.onrender.com/get-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            const responseMessage = await responseFetch.json()
            console.log("MY RESPONSE:", responseMessage.Data)
            setChatMessages(responseMessage.Data)
            

        }
        
    }

    const addMessage = async (parentId) => {
        await alert(`add a new branch for parent ${parentId}`)
        
        const DUMMYDATA = {
            id: `${parentId}1`,
            parent_id: parentId,
            role: 'assistant',
            text: 'THIS IS MY DUMMY MESSAGE',
        }

        setMessages([...messages, DUMMYDATA])
        setNewMessage(DUMMYDATA)
        setChatMessages([...chatMessages, DUMMYDATA])
    }

    const newBranch = async (newparentid, getMessage, message) => {
        alert(`get next branch for ${newparentid}`) // parent id
        // API end point for getting next branch and the whole thing to send it back to chatbox
        if (getMessage) {
            const data = {
                username: user,
                old_id: newparentid,
                query: message,
            }
            // send api
            const responseFetch = await fetch('https://ai-ideamaze.onrender.com/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            const responseMessage = await responseFetch.json()
            const messageFormat = {
                id: responseMessage.parent_id,
                parent_id: newparentid,
                role: 'user',
                text: message
            }
            console.log("MY RESPONSE:", responseMessage.message)
            
            setMessages([...messages, messageFormat, responseMessage])
            setChatMessages([...chatMessages, messageFormat, responseMessage])
            setNewMessage(responseMessage)
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
                <ChatBox messages={chatMessages} addMessage={(parentId) => addMessage(parentId)} 
                    newBranch={(id, getMessage, message) => newBranch(id, getMessage, message)} userName={user}
                    latest={newMessage} />
            </div>
        </div>
    )
}

export default Home
