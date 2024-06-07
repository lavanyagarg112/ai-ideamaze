from typing import Optional

from fastapi import FastAPI

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import json
import os
from filelock import FileLock

class Message(BaseModel):
    role: str
    content: str

class DataValue(BaseModel):
    messages: List[Message]
    parent: str
    children: List[str]

class MessageRequest(BaseModel):
    username: str
    old_id: str
    query: str  # This will be a JSON string

app = FastAPI()

DATA_FILE = 'data.json'
LOCK_FILE = 'data.lock'




@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}