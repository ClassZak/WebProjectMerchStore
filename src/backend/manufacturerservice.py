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
			validated = ModelValidator.validate(data, Manufacturer.FIELDS_META)
			
			self.connect()
			fields = ', '.join(validated.keys())
			placeholders = ', '.join(['%s'] * len(validated))
			
			self.cursor.execute(
				f'INSERT INTO Manufacturer ({fields}) VALUES ({placeholders})',
				tuple(validated.values())
			)
			self.connection.commit()
			return jsonify({'id':self.cursor.lastrowid}), 201
			
		except ValueError as e:
			return str(e), 400
		except Error as e:
			self.connection.rollback()
			# Обработка SQL ошибок
			if e.errno == 1062:  # Duplicate entry
				return "Производитель с таким именем уже существует", 409
			return f"Ошибка БД: {str(e)}", 500
		finally:
			self.disconnect()