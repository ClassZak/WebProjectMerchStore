class ManufacturerMeta(type):
	def __new__(cls, name, bases, dct):
		fields_meta = {}
		db_columns = {}
		for attr_name, attr_value in dct.items():
			if isinstance(attr_value, dict) and 'field_meta' in attr_value:
				meta = attr_value['field_meta']
				fields_meta[attr_name] = meta
				db_columns[attr_name] = meta.get('db_column', attr_name)
		dct['FIELDS_META'] = fields_meta
		dct['DB_COLUMNS'] = db_columns
		return super().__new__(cls, name, bases, dct)

class Manufacturer(metaclass=ManufacturerMeta):
	name = {
		'field_meta': {
			'type': str,
			'max_len': 100,
			'required': True,
			'db_column': 'Name'  # Пример сопоставления с БД
		}
	}
#class Manufacturer:
#	MAX_NAME_LENGTH = 100
#	FIELDS_META = {
#		'name': {'type': str, 'max_len': MAX_NAME_LENGTH, 'required': True}
#	}
#
#	def __init__(self, id: int = 0, name: str = ''):
#		self.id = id
#		self.name = name