from typing import Tuple, Union
import mysql.connector
from flask import jsonify, request, Flask
from mysql.connector import Error
import base64

from aservice import AService
from model.manufacturer import Manufacturer
from validators.modelvalidator import ModelValidator


class ManufacturerService(AService):
	def __init__(self,config_file:str):
		super().__init__(config_file)
	
	def create_manufacturer(self, data: dict) -> Tuple[str, int]:
		try:
			# Валидация по JSON-полям модели
			validated = ModelValidator.validate(data, Manufacturer.FIELDS_META)
			
			self.connect()
			
			# Преобразование полей модели в БД-столбцы
			db_fields = [Manufacturer.DB_COLUMNS[field] for field in validated.keys()]
			values = tuple(validated.values())
			
			query = f"""
				INSERT INTO Manufacturer ({', '.join(db_fields)})
				VALUES ({', '.join(['%s'] * len(values))})
			"""
			
			self.cursor.execute(query, values)
			self.connection.commit()
			
			return jsonify({'id': self.cursor.lastrowid}), 201
			
		except ValueError as e:
			return str(e), 400
		except Error as e:
			self.connection.rollback()
			if e.errno == 1062:
				return "Производитель с таким именем уже существует", 409
			return f"Ошибка БД: {str(e)}", 500
		finally:
			self.disconnect()
	
	def read_manufacturers(self) -> Tuple[str, int]:
		try:
			self.connect()
			fields = ', '.join([v['db_column'] for v in Manufacturer.FIELDS_META.values()])
			self.cursor.execute(f"SELECT {fields} FROM Manufacturer")
			raw_data = self.cursor.fetchall()
			
			# Преобразуем данные БД в формат модели
			return jsonify({'manufacturers': [
				{k: row[v['db_column']] 
				for k, v in Manufacturer.FIELDS_META.items()}
				for row in raw_data
			]}), 200
		except Error as e:
			return f"Ошибка БД: {str(e)}", 500
		finally:
			self.disconnect()