from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os
from openai import OpenAI
import secrets
import base64
import redis
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()
# Create a new client and connect to the server

r = redis.Redis(
    host='redis-13375.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port=13375,
    password=os.getenv('REDIS_PASSWORD')
)

def generate_random_key(length=10):
    random_bytes = secrets.token_bytes(length)
    random_base64 = base64.b64encode(random_bytes).decode('utf-8')[:length]
    return random_base64

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
    query: str

class ReturnValue(BaseModel):
    id: str
    parent_id: str
    role: str
    text: str

app = FastAPI()

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

    parent_data_raw = r.get(parent_key)
    if not parent_data_raw and username + '/0' not in r.keys():
        r.set(username + '/0', json.dumps(default_json_value.model_dump()))
        parent_data_raw = r.get(parent_key)
   
    if not parent_data_raw:
        raise HTTPException(500, detail="Man something went wrong!")
   
    parent_data = DataValue(**json.loads(parent_data_raw))
    print(parent_data)
    parent_messages = parent_data.messages
    new_message = Message(role="user", content=query)
   
    new_messages = parent_messages + [new_message.model_dump()]
   
    chat = client.chat.completions.create(model="gpt-3.5-turbo", messages=new_messages)
    model_reply = chat.choices[0].message.content
   
    new_messages.append(Message(role="assistant", content=model_reply).model_dump())
   
    new_value = DataValue(messages=new_messages, parent=parent_key, children=[])
    random_key = generate_random_key()
    new_key = f'{username}/{random_key}'
   
    r.set(new_key, json.dumps(new_value.model_dump()))
   
    parent_data.children.append(new_key)
    r.set(parent_key, json.dumps(parent_data.model_dump()))
   
    send_to_user = ReturnValue(id=random_key, parent_id=old_id, role="user", text=model_reply)
    return send_to_user.model_dump()
