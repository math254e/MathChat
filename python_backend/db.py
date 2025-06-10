import os
from dotenv import load_dotenv
from convex import ConvexClient, ConvexError
from dataModels import Message, Thread, ThreadData

class ThreadDB:
	def __init__(self):
		load_dotenv(".env.local")
		self.client = ConvexClient(os.getenv("PUBLIC_CONVEX_URL"))

	def create_thread(self, auth):
		try:
			self.client.set_auth(auth)

			thread_id = self.client.mutation("thread:create")
			return thread_id
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e
		
	def delete_thread(self, thread_id: str, auth):
		try:
			self.client.set_auth(auth)

			self.client.mutation("thread:delete_thread", {"thread_id": thread_id})
			return True
		except ConvexError as e:
			print(f"Convex error: {e}")
			raise e
		except Exception as e:
			print(f"Unexpected error: {e}")
			raise e