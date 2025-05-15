class Manufacturer:
	MAX_NAME_LENGTH = 100
	FIELDS_META = {
		'name': {'type': str, 'max_len': MAX_NAME_LENGTH, 'required': True}
	}

	def __init__(self, id: int = 0, name: str = ''):
		self.id = id
		self.name = name