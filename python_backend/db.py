import os
from dotenv import load_dotenv
from convex import ConvexClient, ConvexError
from dataModels import Message, Thread, ThreadData
from typing import Optional

class ThreadDB:
	def __init__(self):
		load_dotenv(".env.local")
		self.client = ConvexClient(os.getenv("PUBLIC_CONVEX_URL"))

	def get_thread(self, authToken: str, thread_id: str) -> Thread:
		try:
			self.client.set_auth(authToken)

			response = self.client.query("thread:get", {"thread_id": thread_id})
			thread = Thread(
				data=response["data"],
				messages=response["messages"]
			)
			return thread
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e
		
	def add_message(self, authToken: str, thread_id: str, message: Message) -> Thread:
		try:
			self.client.set_auth(authToken)

			self.client.mutation("thread:add_message", {"thread_id": thread_id, "message": message})
			return self.get_thread(authToken, thread_id)
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e
		
	def update_thread_name(self, authToken: str, thread_id: str, name: str) -> ThreadData:
		try:
			self.client.set_auth(authToken)

			self.client.mutation("thread:update_name", {"id": thread_id, "name": name})
			thread = self.get_thread_data(authToken, thread_id)
			return thread
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e
		
	def get_thread_data(self, authToken: str, thread_id: str) -> Optional[ThreadData]:
		try:
			self.client.set_auth(authToken)

			thread = self.client.query("thread:get_data", {"id": thread_id})
			return thread
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e

	def modify_message(self, authToken: str, thread_id: str, message_id: str, content: str) -> Thread:
		try:
			self.client.set_auth(authToken)
			
			self.client.mutation("thread:modify_message", {
				"thread_id": thread_id,
				"message_id": message_id,
				"content": content
			})
			return self.get_thread(authToken, thread_id)
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e