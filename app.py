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
    id: str
    parent_id: Optional[str] = None
    role: str
    content: str

class messageToFrontend(BaseModel):
    id: str
    parent_id: Optional[str] = None
    role: str
    text: str



class openAIMessages(BaseModel):
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

class SiblingRequest(BaseModel):
    username: str
    user_query_id: str

GPT_3 = "gpt-3.5-turbo"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def convert_to_openai_messages(messages: List[Message]) -> List[openAIMessages]:
    return [openAIMessages(role=msg.role, content=msg.content) for msg in messages]

default_message: Message = Message(id="0", parent_id=None, role="system", content="You are a helpful AI assistant whose job it is to give the user new ideas. Always give one idea and one idea only. Never give more than one idea")

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
    userRandomValue = generate_model_random_key()
    new_message = Message(id=userRandomValue, parent_id=old_id, role="user", content=query)
    print("the parent id is", new_message.parent_id)

    # Make user block
    user_messages = parent_messages + [new_message]
    user_parent = parent_key
    userBlock = DataValue(type=Choices.user, messages=user_messages, parent=user_parent, children=[])
    userKey = f'{username}/{userRandomValue}'
    # set user_key as child of parent
    parent_data.children.append(userKey)

    print("user block key is", userKey)
    
    # make GPTresponse block
    new_messages = user_messages
    print("the type is", type(new_messages[0]))

    send_to_openAI_format = list(convert_to_openai_messages(new_messages))
    chat = client.chat.completions.create(model=GPT_3, messages=send_to_openAI_format)
    model_reply = chat.choices[0].message.content

    model_random_key = generate_model_random_key()
    new_messages.append(Message(id=model_random_key, parent_id=userRandomValue, role="assistant", content=model_reply))
   
    model_response_block = DataValue(type=Choices.assistant, messages=new_messages, parent=userKey, children=[])
    model_response_key = f'{username}/{model_random_key}'

    print("model block key is", model_response_key)
    userBlock.children.append(model_response_key)
    print(model_response_block)
    r.set(model_response_key, json.dumps(model_response_block.model_dump()))
    r.set(userKey, json.dumps(userBlock.model_dump()))   
    r.set(parent_key,  json.dumps(parent_data.model_dump()))
    print("\n\n userBlock is", userBlock)
    send_to_user = ReturnValue(id=model_random_key, parent_id=userRandomValue, role="assistant", text=model_reply)
    return send_to_user.model_dump()

def convert_to_message_to_frontend(messages: List[Message]) -> List[messageToFrontend]:
    return [messageToFrontend(id=msg.id, parent_id=msg.parent_id, role=msg.role, text=msg.content) for msg in messages]

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
    if key_exists:
        print("found key!")
        value_raw = r.get(key)
        formatted_value = DataValue(**json.loads(value_raw))
        messages_list = formatted_value.messages
        converted_messages = convert_to_message_to_frontend(messages_list)
        output = {
            'Data': converted_messages
        }
        return output
    
    else:
        raise HTTPException(status_code=404, detail="Key not found")

async def get_content(key: str) -> str:
    value_raw = r.get(key)
    formatted_value = DataValue(**json.loads(value_raw))
    return (formatted_value.messages[-1].content)

def ordinal(n: int) -> str:
    if 11 <= n % 100 <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
    return str(n) + suffix

async def get_messages(key: str) -> List[Message]:
    value_raw = r.get(key)
    formatted_value = DataValue(**json.loads(value_raw))
    return (formatted_value.messages)
 


@app.post('/make-sibling')
async def makeSibling(input: SiblingRequest):
    print("HI")
    username = input.username
    user_query_id = input.user_query_id
    key = f'{username}/{user_query_id}'
    key_exists = bool(r.exists(key))
    if not key_exists:
        raise HTTPException(status_code=404, detail="Key not found")
    
    value_raw = r.get(key)
    formatted_value = DataValue(**json.loads(value_raw))
    children = formatted_value.children
    previous_answers = ""
    for i in range(len(children)):
        ans = await get_content(children[i])
        to_add = "The " + str(ordinal(i+1)) + " response is " + ans + "\n"
        previous_answers += to_add

    print("PREVIOUS ANSWERS: \n \n", previous_answers)
    question = await get_content(key)
    prompt = "The user is asking " + question + ". " + "The previous responses are " + previous_answers + "Give different ideas than the ones above" 
    print("prompt to openai is", prompt)


    old_messages = await get_messages(key)
    

    
    prev_messages = convert_to_openai_messages(old_messages)
    messages_to_send_to_OpenAI = prev_messages + [openAIMessages(role="user", content=prompt)] 
    chat = client.chat.completions.create(model=GPT_3, messages=messages_to_send_to_OpenAI)
    model_reply = chat.choices[0].message.content

    # making model response data
    model_response_id = generate_model_random_key()
    GPT_response_key = f'{username}/{model_response_id}'
    formatted_value.children.append(GPT_response_key)
    model_response_message = Message(id=model_response_id, parent_id=user_query_id, role="assistant", content=model_reply)
    final_messages = old_messages + [model_response_message] 
    # make new GPT response block
    model_response_block = DataValue(type=Choices.assistant, messages=final_messages, parent=key, children=[])
    r.set(key, json.dumps(formatted_value.model_dump()))
    r.set(GPT_response_key, json.dumps(model_response_block.model_dump()))
    print("\n\n\n")
    print(model_response_block)

    return ReturnValue(id=model_response_id, parent_id=user_query_id, role="assistant", text=model_reply)





@app.post('/check-children')
async def checkChildren(input: GetHistory):
    username = input.username
    id = input.id
    key = f'{username}/{id}'
    key_exists = bool(r.exists(key))
    print(key_exists)
    print("username is", username)
    print("id is", id)
    if key_exists:
        print("found key!")
        value_raw = r.get(key)
        formatted_value = DataValue(**json.loads(value_raw))
        ans = len(formatted_value.children) > 0
        output = {
            "exists": ans
        }

        return output
    else:
        raise HTTPException(404, "No such key!")
 