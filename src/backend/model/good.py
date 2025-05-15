import os

class Good:
	FIELDS_META = {
		'name': {'type': str, 'max_len': 100, 'required': True},
		'description': {'type': str, 'required': True},
		'image': {'type': str, 'required': True},  # base64
		'price': {'type': float, 'required': True},
		'id_manufacturer': {'type': int, 'fk': 'Manufacturer.Id'}
	}
	
	def __init__(
			self,
			id:int,
			name:str, 
			description:str, 
			image:str, 
			price:float, 
			appearance_date: str, 
			id_manufacturer:int, 
			manufacturer_name:str, 
			quantity:int
		):
		self.id=id
		self.name=name
		self.description=description
		self.image=image
		self.price=price
		self.appearance_date=appearance_date
		self.id_manufacturer=id_manufacturer
		self.manufacturer_name=manufacturer_name
		self.quantity=quantity