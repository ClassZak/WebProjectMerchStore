import mysql.connector
from mysql.connector import Error

class AService:
	def __init__(self,host:str,user:str,password:str,database:str):
		self.connection=None
		self.cursor=None
		self.host=host
		self.user=user
		self.password=password
		self.database=database

	def connect(self):
		self.connection=mysql.connector.connect(
			host=self.host,
			user=self.user,
			password=self.password,
			database=self.database
		)
		self.cursor=self.connection.cursor(dictionary=True)
	
	def disconnect(self):
		if self.connection.is_connected():
			self.cursor.close()
			self.connection.close()
