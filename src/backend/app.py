import os
from typing import Dict
from flask import Flask, Request, json, render_template, request, jsonify
from markupsafe import escape
import mysql.connector
import base64

from goodservice import GoodService
from manufacturerservice import ManufacturerService



# Настройка CSRF
from flask_wtf.csrf import CSRFProtect

def get_app_config(filename:str='src/backend/.password.json'):
	with open(filename, 'r', encoding='utf-8') as file:
		return json.load(file)

app = Flask(
	__name__,
	static_folder='../frontend/static',
	template_folder='../frontend/template'
)
app.secret_key = get_app_config()['secret_key']
csrf = CSRFProtect(app)









# Получение словаря из формы
def get_dict_from_request(request:Request) -> Dict:
	return {
		k:v
		for k in request.form.keys() 
			for v in request.form.getlist(k)
	}

# Сервисы
good_service=GoodService(
	'src/backend/.password.json'
)
manufacturer_service=ManufacturerService(
	'src/backend/.password.json'
)




# Маршруты
# Шаблоны
@app.route('/admin/')
def render_admin_panel():
	return render_template('admin_panel.html')

@app.route('/')
def root():
	return render_template('index.html')

@app.route('/goods/')
def render_goods():
	return render_template('goods.html')




# API
# Производители
@app.route('/api/manufacturers/<int:id>', methods=['PUT', 'DELETE', 'GET'])
def handle_manufacturer(id:int):
	if request.method == 'PUT':
		data = get_dict_from_request(request)
		return manufacturer_service.update_manufacturer(data, id)
	elif request.method == 'DELETE':
		return manufacturer_service.delete_manufacturer(id)
	elif request.method == 'GET':
		return manufacturer_service.read_manufacturer_by_id(id)
	return jsonify({'error': 'Method Not Allowed'}), 405
@app.route('/api/manufacturers/', methods=['GET', 'POST'])
def manufacturers_route():
	try:
		if request.method=='POST':
			return manufacturer_service.create_manufacturer({'name':request.form.get('name')})
		elif request.method=='GET':
			return manufacturer_service.read_manufacturers()
		else:
			return jsonify({'error': 'Method Not Allowed'}), 405
	except Exception as e:
		return jsonify({'error': 'Internal Server Error'}), 500

# Товары
@app.route('/api/goods/<int:good_id>', methods=['PUT','GET'])
def update_and_get_good(good_id:int):
	if request.method=='PUT':
		good=request.get_json()
		result=good_service.update_good(
			good['name'],good['description'],good['image'],good['price']
		)
		if result==0:
			return jsonify({'error':'Не удалось обновить товар'}),400
		else:
			return jsonify({'message':f'Товар с id {good_id} обновлён'}),201
	elif request.method=='GET':
		result=good_service.get_good_by_id(good_id)
		if result:
			result['Image'] = result['Image'].decode('utf-8')
			return jsonify(result),200
		else:
			return jsonify({'error':'Not Found'}),404
@app.route('/api/goods/',methods=['GET','POST'])
def goods_route():
	if request.method=='GET':
		return good_service.read_goods()
	elif request.method=='POST':
		data = get_dict_from_request(request)
		return good_service.create_good(data)



# Точка входа
def main():
	app.run(debug=True, host='0.0.0.0', port=5000)

if __name__=='__main__':
	main()