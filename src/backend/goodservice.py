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
			values = tuple(validated.values())
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

	def update_good(self, data:dict, id: int) -> Tuple[Response, int]:
		try:
			# Проверка конфликта ID
			if 'id' in data and data['id'] != data:
				return jsonify({'error': 'ID в теле запроса не совпадает с ID в URL'}), 400

			data['id'] = id

			# Проверка ID и валидация
			if not self.exists(data['id']):
				return jsonify({'error': 'Товар для обновления данных не найден'}), 404
			validated = ModelValidator.validate(data, Good.FIELDS_META, self.cursor)

			set_clause = ', '.join([
				f"{Good.DB_COLUMNS['columns'][field]} = %s"
				for field in validated if field != 'id'
			])
			values = [validated[field] for field in validated if field != 'id']
			values.append(data['id'])

			query = f"""
				UPDATE {GoodService.TABLE_NAME}
				SET {set_clause}
				WHERE {Good.DB_COLUMNS['columns']['id']} = %s
			"""

			self.connect()
			self.cursor.execute(query, values)
			self.connection.commit()

			if self.cursor.rowcount == 0:
				return jsonify({'error': 'Товар уже имеет эти данные'}), 400
		
			return jsonify({'message': 'Данные товара обновлены'}), 200

		except ValueError as e:
			return jsonify({'error': str(e)}), 400
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
	
	def delete_good(self, id: int) -> Tuple[Response, int]:
		try:
			if not self.exists(id):
				return jsonify({'error': 'Не найден объет для удаления'}), 404
			else:
				self.connect()
				query = f"""
					DELETE FROM {GoodService.TABLE_NAME}
					WHERE {Good.DB_COLUMNS['columns']['id']} = %s
				"""
				self.cursor.execute(query, (id,))
				self.connection.commit()
				return jsonify({'message': 'Объект успешно удалён'}), 200
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
	"""
		CRUD операции
	"""
	



	"""
		Дополнительные запросы
	"""
	def read_good_by_id(self, id:int):
		try:
			if not self.exists(id):
				return jsonify({'error': 'Не найден объект для чтения'}), 404

			self.connect()
			columns=[Good.DB_COLUMNS['columns'][field]
				for field in Good.FIELDS_META.keys()]
			self.cursor.execute(
				f"""
				SELECT {', '.join(columns)} 
				FROM {GoodService.TABLE_NAME} 
					WHERE {Good.DB_COLUMNS['columns']['id']} = %s
				""",(id,))
			obj=self.cursor.fetchone()
			return jsonify(self.sql_data_to_json_list(obj)), 200
		except ValueError as e:
			return jsonify({'error':str(e)}), 400
		except Error as e:
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
		
	def read_new_goods(self):
		try:
			self.connect()
			columns = [Good.DB_COLUMNS['columns'][field] 
				for field in Good.FIELDS_META.keys()]
			query = f"""
				SELECT {", ".join(columns)} 
				FROM {GoodService.TABLE_NAME}
					WHERE {Good.DB_COLUMNS['columns']['appearance_date']} = (
						SELECT MAX({Good.DB_COLUMNS['columns']['appearance_date']})
						FROM {GoodService.TABLE_NAME}
					)
				"""
			self.cursor.execute(
				query)
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
	"""
		Дополнительные запросы
	"""
	



	"""
		Простые методы
	"""
	def sql_data_to_json_list(self, data:dict):
		return {field:str(data[Good.DB_COLUMNS['columns'][field]]) for field in Good.FIELDS_META.keys()}
	
	def exists(self, id: int) -> bool:
		try:
			self.connect()
			query = f"SELECT EXISTS(SELECT 1 FROM {GoodService.TABLE_NAME} WHERE {Good.DB_COLUMNS['columns']['id']} = %s) AS exist"
			self.cursor.execute(query, (int(id),))
			print("SQL:", self.cursor.statement)  # или ._executed
			# вернёт (1,) или (0,)
			result = self.cursor.fetchone()
			return bool(result['exist']) if result else False
		finally:
			self.disconnect()
	"""
		Простые методы
	"""

