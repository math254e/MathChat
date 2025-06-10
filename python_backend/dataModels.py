from pydantic import BaseModel
from datetime import datetime
from typing import List

class Model(BaseModel):
    id: str
    name: str
    description: str | None = None

class ChatRequest(BaseModel):
    message: str
    model: str

class SplitRequest(BaseModel):
    split_point: str

class ThreadCreateRequest(BaseModel):
    auth: str

class ThreadData(BaseModel):
    id: str
    name: str | None = None
    created_at: datetime
    last_message_at: datetime
    split_from: str | None = None

class Message(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

class Thread(BaseModel):
    data: ThreadData
    messages: List[Message]

