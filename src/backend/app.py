import os
from flask import Flask, render_template, request, jsonify
import mysql.connector
from mysql.connector import Error

from aservice import AService
from goodservice import GoodService


def load_mysql_password():
    with open('src/backend/.password') as file:
        return file.read()

goodService=GoodService(
    'localhost','root',load_mysql_password(),'merchstorewebpract'
)

def get_image_from_db(image_id):
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=load_mysql_password(),
            database='merchstorewebpract'
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT data, mime_type FROM Good WHERE Id = %s", (image_id,))
        result = cursor.fetchone()
        if result:
            return result['data'], result['mime_type']  # Данные в формате BLOB и MIME-тип
        return None, None
    except Error as e:
        print(f"Database error: {e}")
        return None, None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




app = Flask(
	__name__,
	static_folder='../frontend/static',
	template_folder='../frontend/template'
)





@app.route('/')
def root():
	return render_template('index.html')

@app.route('/api/image/<int:good_id>')
def get_good_image(good_id:int):
	image_data, mime_type=get_image_from_db(good_id)

@app.route('/goods/')
def render_goods():
    return render_template('goods.html')

@app.route('/api/goods/',methods=['GET', 'POST'])
def goods_rout():
    if request.method=='GET':
        limit = request.args.get('limit', type=int)
        ids=request.args.getlist('id')
        if limit:
            return goodService.get_goods_ids()
        return goodService.get_goods(ids)
    elif request.method=='POST':
        good=request.get_json()
        result=goodService.insert_good(
            good['name'],good['description'],good['image'],good['price']
        )
        if result==0:
            return jsonify({'Не удалось добавить новый товар',400})
        else:
            return jsonify({'Новый товар успешно добавлен',201})
    pass



def main():
	app.run(debug=True, host='0.0.0.0', port=5000)

if __name__=='__main__':
	main()