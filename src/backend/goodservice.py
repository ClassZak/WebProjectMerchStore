from sqlite3 import IntegrityError
from typing import Tuple, Union
import mysql.connector
from flask import Response, jsonify, request, Flask
from mysql.connector import Error
import base64

from aservice import AService
from validators.modelvalidator import ModelValidator
from model.good import Good


class GoodService(AService):
	TABLE_NAME = 'Good'
	def __init__(self,config_file:str):
		super().__init__(config_file)

	"""
		CRUD операции
	"""
	def create_good(self, data:dict) -> Tuple[Response, int]:
		try:
			self.connect()
			validated = ModelValidator.validate(data, Good.FIELDS_META)
			values = tuple([str(i) for i in validated.values()])
			db_columns = [Good.DB_COLUMNS['columns'][field] for field in validated.keys()]
			
			query = f"""
				INSERT INTO {GoodService.TABLE_NAME} ({','.join(db_columns)})
				VALUES ({','.join(['%s'] * len(values))})
			"""

			self.cursor.execute(query,values)
			self.connection.commit()

			return (jsonify({'id': self.cursor.lastrowid}), 201)
			
		except ValueError as e:
			return jsonify({'error':str(e)}), 400
		except IntegrityError as e:
			self.connection.rollback()
			if e.errno == 1062:
				return jsonify({'error':'Товар с таким именем уже существует'}), 409	
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		
		finally:
			self.disconnect()
	
	def read_goods(self):
		try:
			self.connect()
			columns = [Good.DB_COLUMNS['columns'][field] 
				for field in Good.FIELDS_META.keys()]
			self.cursor.execute(f'SELECT {", ".join(columns)} FROM {GoodService.TABLE_NAME}')
			raw_data = self.cursor.fetchall()
			
			# Преобразуем данные БД в формат модели
			return jsonify({'goods': [{
					field: str(row[Good.DB_COLUMNS['columns'][field]])
					for field in Good.FIELDS_META.keys()
				}
				for row in raw_data
			]}), 200
		except Error as e:
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
	
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
		except mysql.connector.errors.DatabaseError as db_error:
			return 'Data base error', 500
		except Error as e:
			return str(e), 500
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