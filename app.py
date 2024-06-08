from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import json
import os
from openai import OpenAI
from filelock import FileLock
from dotenv import load_dotenv
load_dotenv()
import secrets
import base64

client = OpenAI()


def generate_random_key(length=10):
    random_bytes = secrets.token_bytes(length)
    random_base64 = base64.b64encode(random_bytes).decode('utf-8')[:length]
    return random_base64
DATA_FILE = 'data.json'
LOCK_FILE = 'data.lock'

class Message(BaseModel):
    role: str
    content: str

class DataValue(BaseModel):
    messages: List[Message]
    parent: Optional[str]
    children: List[str]

class MessageRequest(BaseModel):
    username: str
    old_id: str
    query: str  # This will be a JSON string

class ReturnValue(BaseModel):
    id: str
    parent_id: str
    role: str
    text: str

def initialize_data_file():
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        with open(DATA_FILE, 'w') as file:
            json.dump({}, file)




app = FastAPI()
initialize_data_file()



default_message: Message = Message(role="system", content="You are a helpful AI assistant whose job it is to give the user new ideas")

default_json_value = DataValue(messages=[default_message], parent=None, children=[])

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/send-message")
async def message(req: MessageRequest):
    username = req.username
    old_id = req.old_id
    query = req.query
    parent_key = f'{username}/{old_id}'
    print(username, old_id, query, parent_key)
    initialize_data_file()
    with FileLock(LOCK_FILE):
        with open(DATA_FILE, 'r') as file:
            data = json.load(file)
            print("loaded")
            
        if f'{username}/0' not in data:
            data[f'{username}/0'] = default_json_value.model_dump()
        
        if parent_key not in data:
            raise HTTPException(500, detail="Man something went wrong!")
        
        else:
            parent_data = data[parent_key]
            print(parent_data)
            
            parent_messages = parent_data["messages"]
            new_message = {
                "role": "user", 
                "content": query
            }
            
            new_messages = parent_messages + [new_message]
            print(new_messages)
            
            chat = client.chat.completions.create(model="gpt-3.5-turbo", messages=new_messages)
            model_reply = chat.choices[0].message.content
            print(model_reply)
            
            new_messages.append({"role": "assistant", "content": model_reply})
            
            new_value = DataValue(messages=new_messages, parent = parent_key, children=[])
            random_key = generate_random_key()
            new_key = f'{username}/{random_key}'
            data[new_key] = new_value.model_dump()
            parent_data['children'].append(new_key)
            with open(DATA_FILE, 'w') as file: json.dump(data, file)
            send_to_user = ReturnValue(id=random_key, parent_id=old_id, role="user", text=model_reply)
            return send_to_user.model_dump()
                

