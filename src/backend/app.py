import os
from flask import Flask, render_template, request, jsonify
import mysql.connector
import base64

from goodservice import GoodService




app = Flask(
	__name__,
	static_folder='../frontend/static',
	template_folder='../frontend/template'
)


goodService=GoodService(
    'src/backend/.password.json'
)



@app.route('/')
def root():
	return render_template('index.html')

@app.route('/goods/')
def render_goods():
    return render_template('goods.html')

@app.route('/api/goods/',methods=['GET','POST'])
def goods_route():
    if request.method=='GET':
        limit = request.args.get('limit', type=int)
        if limit:
            return goodService.get_goods_ids(limit)
        ids=request.args.getlist('ids', type=int)
        if ids and len(ids)!=0:
            return goodService.get_goods_by_ids(ids)
    elif request.method=='POST':
        good=request.get_json()
        result=goodService.create_good(
            good['name'],good['description'],good['image'],good['price']
        )
        if result==0:
            return jsonify({'error':'Не удалось добавить новый товар'}),500
        else:
            return jsonify({'message':f'Новый товар успешно добавлен'}),201

@app.route('/api/goods/<int:good_id>', methods=['UPDATE','GET'])
def update_and_get_good(good_id:int):
    if request.method=='UPDATE':
        good=request.get_json()
        result=goodService.update_good(
            good['name'],good['description'],good['image'],good['price']
        )
        if result==0:
            return jsonify({'error':'Не удалось обновить товар'}),400
        else:
            return jsonify({'message':f'Товар с id {good_id} обновлён'}),201
    elif request.method=='GET':
        result=goodService.get_good_by_id(good_id)
        if result:
            result['Image'] = result['Image'].decode('utf-8')
            return jsonify(result),200
        else:
            return jsonify({'error':'Not Found'}),404




def main():
	app.run(debug=True, host='0.0.0.0', port=5000)

if __name__=='__main__':
	main()