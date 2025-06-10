from fastapi import FastAPI, HTTPException, Header
from db import ThreadDB
#from ai import AI
from dataModels import Message, Thread, Model, ChatRequest, ThreadData, SplitRequest
from typing import List, Optional

app = FastAPI()
db = ThreadDB()
#ai_client = AI()





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)