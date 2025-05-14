import mysql.connector
from flask import jsonify, request, Flask
from mysql.connector import Error
import base64

from aservice import AService
from model.good import Good


class GoodService(AService):
	def __init__(self,config_file:str):
		super().__init__(config_file)

	def create_good(self,name:str,description:str,base64_image:str,price:str)->int:
		result=0
		try:
			super().connect()
			self.cursor.execute(
				'INSERT INTO Good (Name,Description,Image,Price) VALUES (%s,%s,%s,%s)',
				(name,description,base64_image,price)
			)
			self.connection.commit()
			result=self.cursor.lastrowid
			return result
		except Error as e:
			self.connection.rollback()
			return result
		finally:
			super().disconnect()
	


	def get_all_goods(self):
		try:
			super().connect()
			self.cursor.execute('SELECT * FROM Good')
			return super().remove_keys_uppercase_in_dicts_list(self.cursor.fetchall())
		except Error as e:
			return None
		finally:
			super().disconnect()
	
	def get_good_by_id(self, id:int):
		try:
			super().connect()
			self.cursor.execute('SELECT * FROM Good WHERE Id=%s',(id,))
			return super().remove_keys_uppercase_in_dicts_list(self.cursor.fetchone())
		except Error as e:
			return None
		finally:
			super().disconnect()

	def get_goods_by_ids(self, ids=[]):
		try:
			super().connect()
			self.cursor.execute(
				'SELECT * FROM Good WHERE Id IN (%s)' % ','.join(['%s']*len(ids)), ids
			)
			goods=[]
			result=self.cursor.fetchall()
			for row in result:
				image_base64=row['Image'].decode('utf-8')
				goods.append({
					'id': row['Id'],
					'name':row['Name'],
					'description':row['Description'],
					'image':f'data:image/png;base64, {image_base64}',
					'price':float(row['Price'])
				})
			if len(goods)==0:
				return "Not found", 404
			return jsonify({"goods":goods})
		except Error as e:
			return jsonify({"error":str(e)}),5
		finally:
			super().disconnect()

	def get_new_goods(self):
		try:
			super().connect()
			self.cursor.execute('SELECT Id FROM Good LIMIT %s',(limit,))
			result=self.cursor.fetchall()
			
			return AService.remove_keys_uppercase_in_dicts_list(result)
		except Error as e:
			return None, str(e)
		finally:
			super().disconnect()

	def get_goods_ids(self, limit=10):
		try:
			super().connect()
			self.cursor.execute('SELECT Id FROM Good LIMIT %s',(limit,))
			result=self.cursor.fetchall()
			
			return AService.remove_keys_uppercase_in_dicts_list(result)
		except Error as e:
			return None, str(e)
		finally:
			super().disconnect()
	


	def update_good(self, id, name, description, image, price):
		try:
			super().connect()
			self.cursor.execute(
				'''
				UPDATE Good
				SET [Name] = %s, Description = %s, Image = %s, Price = %s
				WHERE Id=%s
				''',
				(name,description,image,price,id)
			)
			self.connection.commit()
			return self.cursor.rowcount
		except Error as e:
			return None, str(e)
		finally:
			super().disconnect()