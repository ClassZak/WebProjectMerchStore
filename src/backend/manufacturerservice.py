from sqlite3 import IntegrityError
from typing import Tuple, Union
import mysql.connector
from flask import Response, jsonify, request, Flask
from mysql.connector import Error
import base64

from aservice import AService
from model.manufacturer import Manufacturer
from validators.modelvalidator import ModelValidator


class ManufacturerService(AService):
	TABLE_NAME='Manufacturer'
	def __init__(self,config_file:str):
		super().__init__(config_file)
	
	def create_manufacturer(self, data: dict) -> Tuple[Response, int]:
		try:
			self.connect()
			validated = ModelValidator.validate(data, Manufacturer.FIELDS_META)
			values = tuple(validated.values())
			db_columns = [Manufacturer.DB_COLUMNS['columns'][field] for field in validated.keys()]
			
			query = f"""
				INSERT INTO {ManufacturerService.TABLE_NAME} ({', '.join(db_columns)})
				VALUES ({', '.join(['%s'] * len(values))})
			"""
			
			self.cursor.execute(query, values)
			self.connection.commit()
			
			return (jsonify({'id': self.cursor.lastrowid}), 201)
		
		except ValueError as e:
			return jsonify({'error':str(e)}), 400
		except IntegrityError as e:
			self.connection.rollback()
			if e.errno == 1062:
				return jsonify({'error':'Производитель с таким именем уже существует'}), 409	
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		
		finally:
			self.disconnect()
	
	def read_manufacturers(self) -> Tuple[Response, int]:
		try:
			self.connect()
			columns = [Manufacturer.DB_COLUMNS['columns'][field] 
				for field in Manufacturer.FIELDS_META.keys()]
			self.cursor.execute(f'SELECT {", ".join(columns)} FROM Manufacturer')
			raw_data = self.cursor.fetchall()
			
			# Преобразуем данные БД в формат модели
			return jsonify({'manufacturers': [
				{field: row[Manufacturer.DB_COLUMNS['columns'][field]]
                for field in Manufacturer.FIELDS_META.keys()}
				for row in raw_data
			]}), 200
		except Error as e:
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
		
	def update_manufacturer(self, data: dict, id: int) -> Tuple[Response, int]:
		try:
			self.connect()
			# Проверка конфликта ID
			if 'id' in data and data['id'] != id:
				return jsonify({'error': 'ID в теле не совпадает с ID в URL'}), 400
				
			data['id'] = id  # Принудительно устанавливаем ID из URL
			validated = ModelValidator.validate(data, Manufacturer.FIELDS_META, self.cursor)
			
			# Формируем SET-часть
			set_clause = ', '.join([
				f"{Manufacturer.DB_COLUMNS['columns'][field]} = %s" 
				for field in validated if field != 'id'
			])
			values = [validated[field] for field in validated if field != 'id']
			values.append(id)
			
			query = f"""
				UPDATE {ManufacturerService.TABLE_NAME}
				SET {set_clause}
				WHERE {Manufacturer.DB_COLUMNS['columns']['id']} = %s
			"""
			
			self.cursor.execute(query, values)
			self.connection.commit()
			
			if self.cursor.rowcount == 0:
				return jsonify({'error': 'Производитель не найден'}), 404
				
			return jsonify({'message': 'Производитель обновлён'}), 200
			
		except ValueError as e:
			return jsonify({'error': str(e)}), 400
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()

	def delete_manufacturer(self, id: int) -> Tuple[Response, int]:
		try:
			self.connect()
			if not self.exists(id):
				return jsonify({'error': 'Не найден объект для удаления'}), 404
			else:
				query = f"""
					DELETE FROM {ManufacturerService.TABLE_NAME}
					WHERE {Manufacturer.DB_COLUMNS['columns']['id']} = %s
				"""
				self.cursor.execute(query, (id,))
				self.connection.commit()
				return jsonify({'error': 'Объект успешно удалён'}), 200
		except Error as e:
			self.connection.rollback()
			return jsonify({'error': f'Ошибка БД: {str(e)}'}), 500
		finally:
			self.disconnect()
		pass
	

	def exists(self, id: int)-> bool:
		if not (self.connection or self.connection.is_connected()):
			raise Exception('Не возможно проверить наличие объекта без подключения к БД')
		query = f"""
			SELECT EXISTS(
				SELECT 1 FROM {ManufacturerService.TABLE_NAME} 
				WHERE {Manufacturer.DB_COLUMNS['columns']['id']} = %s
			)
				AS exist 
		"""
		self.cursor.execute(query, (id,))
		return bool(self.cursor.fetchone()['exist'])