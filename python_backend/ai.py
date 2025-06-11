from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import Optional, Union
from openai import APIError, RateLimitError, APIConnectionError, APITimeoutError
import json
from datetime import datetime


class AI:
    def __init__(self) -> None:
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)
        self.last_full_response = ""

    async def chat(self, content: Union[str, dict], model: str):
        """Regular chat completion without streaming"""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=content if isinstance(content, list) else [{"role": "user", "content": content}]
            )
            return response.choices[0].message.content
        except (APIError, RateLimitError, APIConnectionError, APITimeoutError) as e:
            print(f"OpenAI API error: {str(e)}")
            raise e

    async def stream_chat(self, messages: list, model: str):
        """Stream chat completion with error handling"""
        try:
            stream = self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True
            )
            return stream
        except (APIError, RateLimitError, APIConnectionError, APITimeoutError) as e:
            print(f"OpenAI API error: {str(e)}")
            raise e

    def format_messages_for_api(self, thread_messages: list) -> list:
        """Format thread messages for OpenAI API"""
        return [{
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content
        } for msg in thread_messages]

    def generate_thread_name(self, user_message: str, ai_response: str) -> str:
        """Generate a name for a thread based on the first message"""
        prompt = f"""Based on this conversation, generate a short, descriptive name (max 5 words) for the thread.
        Focus on the main topic or purpose of the conversation.

        User: {user_message}
        Assistant: {ai_response}

        Thread name:"""
        
        response = self.chat(prompt, "gpt-4.1-nano")
        return response.strip()

    def generate_split_thread_name(self, user_message: str, ai_response: str) -> str:
        """Generate a name for a thread that was split from another thread"""
        prompt = f"""This is a new thread that was split from a previous conversation. 
        Based on the most recent messages, generate a short, descriptive name (max 5 words) for this thread.
        Focus on the new direction or topic that emerged in these messages.

        User: {user_message}
        Assistant: {ai_response}

        Thread name:"""
        
        response = self.chat(prompt, "gpt-4.1-nano")
        return response.strip()


