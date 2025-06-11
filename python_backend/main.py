from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from db import ThreadDB
from ai import AI
from dataModels import Message, Thread, Model, ChatRequest, ThreadData, SplitRequest
from typing import List, Optional
import asyncio
import json
from datetime import datetime

app = FastAPI()
db = ThreadDB()
ai_client = AI()


@app.post("/py-api/thread/{thread_id}/chat")
async def create_chat_response(thread_id: str, request: ChatRequest, authToken: str = Header(...)):
    try:
        # Get thread messages
        thread = db.get_thread(authToken, thread_id)
        
        # Format messages for OpenAI API
        messages = ai_client.format_messages_for_api(thread.messages)
        
        # Add new message to the list
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Create initial message in DB
        new_message = Message(
            role="assistant",
            content="",
            timestamp=datetime.now().isoformat()
        )
        thread = db.add_message(authToken, thread_id, new_message)
        message_id = thread.messages[-1].id
        
        # Create streaming response
        async def generate():
            try:
                # Get streaming response from OpenAI
                stream = await ai_client.stream_chat(messages, request.model)
                
                full_response = ""
                chunk_size = 0
                chunk = ""
                
                # Process the stream
                async for event in stream:
                    if event.choices[0].delta.content:
                        content = event.choices[0].delta.content
                        full_response += content
                        chunk += content
                        chunk_size += 1
                        
                        # Send chunk to client
                        yield f"data: {json.dumps({'content': content})}\n\n"
                        
                        # Save chunk to DB every 10 tokens
                        if chunk_size >= 10:
                            db.modify_message(authToken, thread_id, message_id, full_response)
                            chunk = ""
                            chunk_size = 0
                
                # Save final message
                if chunk:
                    db.modify_message(authToken, thread_id, message_id, full_response)
                
                # Send completion signal
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                print(f"Error in stream generation: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream"
        )
        
    except ValueError as e:
        print(f"ValueError in chat endpoint: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)