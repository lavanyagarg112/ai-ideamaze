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

    const removeUser = async (username) => {
        const responseFetch = await fetch(`${process.env.REACT_APP_API_URL}/remove-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user })
        });
    }

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
            console.log(`Assigned username to user: ${newUser.username}`);
        });

    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            removeUser(user);
            event.returnValue = ''; // some browsers require this to show a confirmation dialog
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup event listener
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user])

    const handleClick = async (newid) => {
        if (newid !== '-1'){
            const data = {
                username: user,
                id: newid,
            }
            const responseFetch = await fetch(`${process.env.REACT_APP_API_URL}/get-history`, {
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

        const data = {
            username: user,
            user_query_id: parentId,
        }

        const responseFetch = await fetch(`${process.env.REACT_APP_API_URL}/make-sibling`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        const responseMessage = await responseFetch.json()

        setMessages([...messages, responseMessage])
        setNewMessage(responseMessage)
        setChatMessages([...chatMessages, responseMessage])

        responseMessage && handleClick(responseMessage.id)
    }

    const newBranch = async (newparentid, getMessage, message) => {

        if (getMessage) {
            const data = {
                username: user,
                old_id: newparentid,
                query: message,
            }
            // send api
            const responseFetch = await fetch(`${process.env.REACT_APP_API_URL}/send-message`, {
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
                    latest={newMessage} handleClick={(id) => handleClick(id)} />
            </div>
        </div>
    )
}

export default Home
