# MStore

MStore - это учебный проект онлайн магазина мерчевой продукции.

Данный проект разрабатывается при помощи mysql 80 в python 3.11.8 через mysql-connector-python       9.3.0 и при помощи фреймворка Flask 3.1.0 и библиотеки Flask-WTF 1.2.2. 

## 🪟 Внешний вид сайта
![Image alt](https://github.com/ClassZak/WebProjectMerchStore/blob/master/screenshot1.png)
![Image alt](https://github.com/ClassZak/WebProjectMerchStore/blob/master/screenshot2.png)
![Image alt](https://github.com/ClassZak/WebProjectMerchStore/blob/master/screenshot3.png)

## 🛠 Запуск сайта

Для запуска необходимо выполнить следующие действия:
1) Склонировать репозитрий 
```bash
git clone https://github.com/ClassZak/WebProjectMerchStore.git
cd WebProjectMerchStore
```
2) Установить разрешение на запуск скриптов
```bash
chmod +x *.sh
```
3) Сгенерировать файл конфигурации сервера
```bash
./setup.sh
```
4) Установить зависимости
```bash
./setup_environment.sh
```
5) Активировать виртульное окружение
```bash
. .venv/bin/activate
```
6) Настроить файл конфигурации по пути src/backend/.password.json
```json
{
	"host": "localhost",
	"user": "<пользователь для БД>",
	"password": "<пароль>",
	"database": "merchstorewebpract",
	"secret_key": "<ключ для CRTF токенов>"
}
```
7) Выполнить sql код из файла DBCrearionScript.sql для создания БД
8) Запустить проект
```bash
python3 src/backend/app.py
```