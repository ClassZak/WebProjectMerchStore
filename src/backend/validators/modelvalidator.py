from typing import Dict, Any
from flask import jsonify

class ModelValidator:
	@staticmethod
	def validate(data: Dict[str, Any], model_meta: Dict) -> Dict[str, Any]:
		validated = {}
		for field, meta in model_meta.items():
			# Валидация по имени JSON-поля
			value = data.get(field)
			
			if meta.get('required') and value in (None, ''):
				raise ValueError(f"Поле {field} обязательно")
				
			# Преобразование типа
			if value is not None and not isinstance(value, meta['type']):
				try:
					value = meta['type'](value)
				except:
					raise TypeError(f"Некорректный тип для {field}")
					
			validated[field] = value
		return validated