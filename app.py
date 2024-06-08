from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
import json
import os
from openai import OpenAI
import secrets
import base64
import redis
from dotenv import load_dotenv
import re

load_dotenv()

client = OpenAI()
# Create a new client and connect to the server

r = redis.Redis(
    host='redis-13375.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port=13375,
    password=os.getenv('REDIS_PASSWORD'), 
    decode_responses=True
)

def generate_model_random_key(length=10):
    random_bytes = secrets.token_bytes(length)
    random_base64 = base64.b64encode(random_bytes).decode('utf-8')[:length]
    return re.sub(r'[\\/]', '', random_base64)

class Message(BaseModel):
    role: str
    content: str

class Choices(Enum):
    user = 'user'
    system = 'system'
    assistant = 'assistant'



class DataValue(BaseModel):
    type: Choices
    messages: List[Message]
    parent: Optional[str] = None
    children: List[str] = []

    class Config:
        use_enum_values = True

class MessageRequest(BaseModel):
    username: str
    old_id: str
    query: str

class ReturnValue(BaseModel):
    id: str
    parent_id: str
    role: str
    text: str

class GetHistory(BaseModel):
    username: str
    id: str
    

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

default_message: Message = Message(role="system", content="You are a helpful AI assistant whose job it is to give the user new ideas. Always give one idea and one idea only. Never give more than one idea")

default_json_value = DataValue(type=Choices.system, messages=[default_message], parent=None, children=[])

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/send-message")
async def message(req: MessageRequest):
    print("got data!")
    username = req.username
    old_id = req.old_id
    query = req.query
    parent_key = f'{username}/{old_id}'
    print(username, old_id, query, parent_key)
    parent_data_raw = r.get(parent_key)

    if old_id != '0' and not parent_data_raw:
        raise HTTPException(500, detail="Man something went wrong!")
    elif old_id == '0' and not parent_data_raw:
       r.set(parent_key, json.dumps(default_json_value.model_dump())) 
   
    parent_data_raw = r.get(parent_key)
    parent_data = DataValue(**json.loads(parent_data_raw))
    print("parent_data is", parent_data)
    parent_messages = parent_data.messages
    new_message = Message(role="user", content=query)

    # Make user block
    user_messages = parent_messages + [new_message.model_dump()]
    user_parent = parent_key
    userBlock = DataValue(type=Choices.user, messages=user_messages, parent=user_parent, children=[])
    userRandomValue = generate_model_random_key()
    userKey = f'{username}/{userRandomValue}'
    # set user_key as child of parent
    parent_data.children.append(userKey)

    print("user block key is", userKey)
    
    # make GPTresponse block
    new_messages = user_messages
    chat = client.chat.completions.create(model="gpt-3.5-turbo", messages=new_messages)
    model_reply = chat.choices[0].message.content
   
    new_messages.append(Message(role="assistant", content=model_reply).model_dump())
   
    model_response_block = DataValue(type=Choices.assistant, messages=new_messages, parent=userKey, children=[])
    model_random_key = generate_model_random_key()
    model_response_key = f'{username}/{model_random_key}'

    print("model block key is", model_response_key)
    userBlock.children.append(model_response_key)
    print(model_response_block)
    r.set(model_response_key, json.dumps(model_response_block.model_dump()))
    r.set(userKey, json.dumps(userBlock.model_dump()))   
    r.set(parent_key,  json.dumps(parent_data.model_dump()))
    send_to_user = ReturnValue(id=model_random_key, parent_id=userRandomValue, role="assistant", text=model_reply)
    return send_to_user.model_dump()

@app.post("/get-history")
async def history(input: GetHistory):
    print("running get history")
    
    username = input.username
    id = input.id
    key = f'{username}/{id}'
    key_exists = bool(r.exists(key))
    print(key_exists)
    print("username is", username)
    print("id is", id)
    if (key_exists):
        print("found key!")
        value_raw= r.get(key)
        formatted_value = DataValue(**json.loads(value_raw))
        messages_list = formatted_value.messages
        output = {
            'Data': messages_list
        }
        return output
    
    else:
        raise HTTPException(status_code=404, detail="Key not found") 