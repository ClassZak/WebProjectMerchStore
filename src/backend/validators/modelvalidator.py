from typing import Dict, Any
from flask import jsonify

class ModelValidator:
	@staticmethod
	def validate(data: Dict[str, Any], model_meta: Dict) -> Dict[str, Any]:
		validated = {}
		for field, meta in model_meta.items():
			value = data.get(field)
			
			# Проверка на обязательность
			if meta.get('required') and value in (None, ''):
				raise ValueError(f"Поле {field} обязательно")
				
			# Обработка пустых значений
			if value == '':
				value = None
				
			# Проверка типа
			if value is not None and not isinstance(value, meta['type']):
				try:
					value = meta['type'](value)
				except:
					raise TypeError(f"Некорректный тип для {field}")
					
			# Проверка длины
			if value is not None and meta.get('max_len') and len(str(value)) > meta['max_len']:
				raise ValueError(f"Максимальная длина {field}: {meta['max_len']}")
				
			validated[field] = value
		return validated