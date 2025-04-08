import os
from flask import Flask, render_template
import mysql.connector
from mysql.connector import Error


def load_mysql_password():
    with open('.password') as file:
        return file.read()

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

@app.route('/api/goods/')
def show_top_goods():
    pass



def main():
	app.run(debug=True, host='0.0.0.0', port=5000)

if __name__=='__main__':
	main()