import os
from flask import Flask, render_template



app = Flask(
	__name__,
	static_folder='../frontend/static',
	template_folder='../frontend/template'
)

@app.route('/')
def root():
	return render_template('index.html')


def main():
	app.run(debug=True)

if __name__=='__main__':
	main()