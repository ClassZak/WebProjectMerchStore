import mysql.connector
from flask import jsonify, request, Flask
from mysql.connector import Error
import base64

from aservice import AService


class GoodService(AService):
	def __init__(self,host:str,user:str,password:str,database:str):
		super().__init__(host,user,password,database)

	def get_goods_ids(self, limit=10):
		try:
			super().connect()
			self.cursor.execute('SELECT Id FROM Good ORDER BY Id LIMIT %s',(limit,))
			result=self.cursor.fetchall()
			
			return [row[0] for row in result],None
		except Error as e:
			return None, str(e)
		finally:
			super().disconnect()
	
	def get_goods(self, ids=[]):
		try:
			super().connect()
			self.cursor.execute(
				'SELECT * FROM Good WHERE Id IN (%s)' % ','.join(['%s']*len(ids)), ids
			)
			goods=[]
			result=self.cursor.fetchall()
			for row in result:
				image_base64=base64.b64encode(row['Image']).decode('utf-8')
				goods.append({
					"id": row['Id'],
					'name':row['Name'],
					'description':row['Description'],
					'image':f'data:image/png;base64, {image_base64}',
					'price':float(row['Price'])
				})
			return jsonify({"goods",goods})
		except Error as e:
			return jsonify({"error":str(e)}),5
		finally:
			super().disconnect()
	
	def insert_good(self,name:str,description:str,base64_image:str,price:str):
		result=0
		try:
			super().connect()
			self.cursor.execute(
				'INSERT INTO Good (Name,Description,Image,Price) VALUES (%s,%s,%s,%s)',
				(name,description,base64_image,price)
			)
			self.connection.commit()
			result=self.cursor.rowcount
		except Error as e:
			self.connection.rollback()
			return str(e),result
		finally:
			super().disconnect()
			return result
