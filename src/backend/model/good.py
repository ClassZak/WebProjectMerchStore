import os

class Good:
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