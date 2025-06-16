// Данные и объекты страницы
var manufacturers;
var goods;
var csrfToken = undefined;
var DOMPurify = window.DOMPurify;
// Константные выражения
const deleteManufacturerConfirmMessage='Вы уверены, что хотите удалить производителя';
const deleteGoodConfirmMessage='Вы уверены, что хотите удалить товар';
// Общие функции
function escapeHtml(unsafe){
	return unsafe.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('\"','&quot;').replace('\'','&#39;')
}
function handleUnknownError(error){
	const message = `Неизвестная ошибка: "${error}"`;
	alert(message);
	console.log(message);
}
function openModal(modalId) {
	document.getElementById(modalId).style.display = 'flex';
	document.body.classList.add('no-scroll');
};
function closeModal(modalId) {
	document.getElementById(modalId).style.display = 'none';
	document.body.classList.remove('no-scroll');
};
// Создание каточек
function createManufacturerCard(element) {
	// Создаем DOM-структуру без обработчиков событий
	const card = document.createElement('div');
	card.setAttribute('data-element-id',element.id)
	card.className = 'manufacturer-card';
	
	card.innerHTML = `
		<div class="manufacturer-card">
			<p>Название</p>
			<h4 class="card-title">${escapeHtml(element.name)}</h4>
		</div>
		<div class="card-button-div">
			<button class="square-btn update-btn" onclick="updateManufacturer(${element.id})" data-id="${element.id}">
				<strong>✎</strong>
			</button>
			<button class="square-btn delete-btn" onclick="deleteManufacturer(${element.id})" data-id="${element.id}">
				<strong>🗑</strong>
			</button>
		</div>
	`

	return card
}
function createGoodCard(element){
	let manufacturer=manufacturers.find(x=>x.id==element.id_manufacturer);

	const card = document.createElement('div');
	card.setAttribute('data-element-id',element.id);
	card.className = 'manufacturer-card';

	card.innerHTML = `
		<div class="card-content">
			<div class="one-photo">
				<img src="data:image/*;base64,${element.image.slice(2, -1)}" alt="${escapeHtml(element.name)}">
			</div>
			<h4 class="card-title">${escapeHtml(element.name)}</h4>
			<h4 class="card-title">
			${Intl.NumberFormat('ru-RU',{style: 'currency', currency: 'RUB'}).format(element.price)}
			</h4>
			<h4 class="card-title">${escapeHtml(element.description)}</h4>
			<p>Производитель:</p>
			<h4 class="card-title">${manufacturer && manufacturer.name ? manufacturer.name: 'Незвестен'}</h4>
			<p>Дата появления в ассортименте:</p>
			<h4 class="card-title">${element.appearance_date}</h4>
		</div>
		<div class="card-button-div">
			<button class="square-btn" onclick="updateGood(${element.id})"><strong>✎</strong></button>
			<button class="square-btn" onclick="deleteGood(${element.id})"><strong>🗑</strong></button>
		</div>
	`

	return card;
}



/**
 * Производители
 */
async function loadManufacturers(){
	let response = await fetch('/api/manufacturers/');
	
	const container=document.getElementById('manufacturers_grid');
	container.innerHTML='';

	try{
		if(!response.ok)
			throw new Error(`Response status: ${response.status}\nError Message: ${(await response.json()).error}`);

		let elements = await response.json();
		manufacturers=elements.manufacturers;
		manufacturers.forEach(element => container.appendChild(createManufacturerCard(element)));
		loadManufacturersToSelects();
	}
	catch(error){
		console.log(error);
	}
}
function loadManufacturersToSelects(){
	let select = document.getElementById('manufacturer_select_for_good');
	manufacturers.forEach(element => {
		const option = document.createElement('option');
		option.value = element.id;
		option.textContent = element.name;
		select.appendChild(option);
	});
}



function deleteManufacturerFromHTML(id){
	const card = document.querySelector(`.manufacturer-card[data-element-id="${id}"]`);
	if(card)
		card.remove();
}
function deleteManufacturer(id) {
	const manufacturer = manufacturers.find(x => x.id==id)
	if(manufacturer === undefined || manufacturer===NaN)
		return;

	const modal = document.querySelector('#delete_manufacturers_form_overlay .modal');
	modal.setAttribute('data-element-id', id);
	openModal('delete_manufacturers_form_overlay');
	setDeleteConfirmMessage(
		'delete_manufacturers_confirm_message',
		deleteManufacturerConfirmMessage, 
		manufacturer.name
	);
}
function handleDeleteConfirm() {
	const modal = document.querySelector('#delete_manufacturers_form_overlay .modal');
	const id = modal.getAttribute('data-element-id');
	
	if (!id) return;
	
	deleteManufacturerFromDB(id);
	deleteManufacturerFromHTML(id);
	closeModal('delete_manufacturers_form_overlay');

	modal.removeAttribute('data-element-id');
}
async function deleteManufacturerFromDB(id){
	const manufacturer = manufacturers.find(x => x.id==id)

	fetch(`/api/manufacturers/${id}`, {method: "DELETE", headers: { 'X-CSRFToken': csrfToken}})
	.then(response => response.json())
	.then(data => {
		if(data.error){
			alert(`Ошибка удаление поставщика "${manufacturer.name}": ${data.error}`);
			loadManufacturers();
		} else{
			alert(`Поставщик "${manufacturer.name}" успешно удалён`);
			manufacturers=manufacturers.filter(element=>element.id!=id);
			deleteManufacturerFromHTML(id);
		}
	})
	.catch(error =>{ 
		handleUnknownError(error);
		loadManufacturers();
	});
}
function setDeleteConfirmMessage(elementId, text, object){
	const container=document.getElementById(elementId);
	container.textContent=`${text} "${object}"?`;
}



async function updateManufacturer(id) {
	const manufacturer = manufacturers.find(x => x.id==id)
	
	let element=document.getElementById('edit_manufacturers_form');
	element.setAttribute('data-element-id',id);
	openModal('edit_manufacturers_form_overlay');
}










/**
 * Товары
 */
async function loadGoods() {
	let response = await fetch('/api/goods/', {method: 'get'});

	const container = document.getElementById('goods_grid');
	container.innerHTML = '';

	try {
		if(!response.ok)
			throw new Error(`Response status: ${response.status}\nError Message: ${(await response.json()).error}`);
		
		let elements = await response.json();
		goods = elements.goods;
		goods.forEach(element => {
			container.appendChild(createGoodCard(element));
		});
	} catch (error) {
		console.log(error);
	}
}




















// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	// CSRF токен
	csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	// Закрытие при клике вне модального окна
	// Производители
	document.getElementById('create_manufacturers_form_overlay')?.addEventListener('click', function(e) {
		if (e.target === this) closeModal('create_manufacturers_form_overlay');
	});

	
	// Кастомизация выбора файлов
	document.querySelectorAll('.modal-form').forEach(form => {
		// Находим элементы внутри конкретной формы
		const fileInput = form.querySelector('input[type="file"]');
		const fileButton = form.querySelector('.file-select-button');
		const fileNameDisplay = form.querySelector('.file-name-display');
		
		if (fileInput && fileButton && fileNameDisplay) {
			// Обработчик для кастомной кнопки
			fileButton.addEventListener('click', () => fileInput.click());
			
			// Обработчик изменения файла
			fileInput.addEventListener('change', function() {
				fileNameDisplay.textContent = this.files.length 
					? this.files[0].name 
					: 'Файлов не выбрано';
			});
		}
	});




	// Формы для производителей
	// Обработка отправки формы
	document.getElementById('create_manufacturers_form')?.addEventListener('submit', function(e) {
		e.preventDefault();
		
		/* Поля formData:
		name		string
		csrf_token	string	*/
		const formData = new FormData(this);
		
		fetch(this.action, {
			method: 'POST',
			body: formData,
			headers: {
				'X-CSRFToken': csrfToken
			}
		})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				alert(data.error);
			} else {
				if(data.id!=0)
					alert(`Успешно добавлен новый производитель \"${formData.get('name')}\"`);
				closeModal('create_manufacturers_form_overlay');
				this.reset();
				loadManufacturers();
			}
		})
		.catch(error => {
			console.error('Ошибка:', error);
			alert('Произошла ошибка при отправке формы');
		});
	});
	document.getElementById('edit_manufacturers_form')?.addEventListener('submit', function(e){
		e.preventDefault();
		
		/* Поля formData:
		name		string
		csrf_token	string	*/
		const formData = new FormData(this);
		
		fetch(this.action+this.getAttribute('data-element-id'),{
			method: 'PUT',
			body: formData,
			headers: {
				'X-CSRFToken': csrfToken
			}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if(data.error){
				alert(data.error);
			} else {
				if(data.id!=0)
					alert(`Успешно изменены данные производителя \"${formData.get('name')}\"`);
				closeModal('edit_manufacturers_form_overlay');
				this.reset();
				loadManufacturers();
			}
		})
		.catch(error =>{
			console.error('Ошибка:', error);
			alert('Произошла ошибка при отправке формы');
		});
	});








	// Формы для товаров
	// Обработка отправки формы
	document.getElementById('create_goods_form')?.addEventListener('submit', function(e) {
		e.preventDefault();

		/* Поля formData:
		name			string
		description		string,
		image			string (base64),
		price			number,
		appearanceDate	string,
		id_manufacturer	number,
		csrf_token		string	*/

		// Проверка наличия файла
		const fileInput = this.querySelector('input[type="file"]');
		if (!fileInput.files.length) {
			alert('Пожалуйста, выберите изображение товара');
			return;
		}

		// Создаем FormData и добавляем все поля кроме файла
		const formData = new FormData();
		formData.append('name', this.querySelector('[name="name"]').value);
		formData.append('description', this.querySelector('[name="description"]').value);
		formData.append('price', this.querySelector('[name="price"]').value);
		formData.append('appearance_date', this.querySelector('[name="appearance_date"]').value);
		formData.append('id_manufacturer', this.querySelector('[name="id_manufacturer"]').value);
		formData.append('csrf_token', csrfToken);

		// Преобразуем изображение в base64
		const file = fileInput.files[0];
		const reader = new FileReader();

		reader.onload = function() {
			// Получаем base64 строку (без префикса data:image/...;base64,)
			const base64String = reader.result.split(',')[1];
			
			// Добавляем base64 в formData
			formData.append('image', base64String);

			// Отправляем данные
			fetch(e.target.action, {
				method: 'POST',
				body: formData,
				headers: {
					'X-CSRFToken': csrfToken
				}
			})
			.then(response => {
				// Проверяем, что ответ в формате JSON
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					return response.json();
				}
				throw new TypeError('Ответ сервера не в формате JSON');
			})
			.then(data => {
				if (data.error) {
					alert(data.error);
				} else {
					alert(`Успешно добавлен новый товар \"${formData.get('name')}\"`);
					closeModal('create_goods_form_overlay');
					e.target.reset();
					loadGoods(); // Обновляем список товаров
				}
			})
			.catch(error => {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при отправке формы: ' + error.message);
			});
		};

		reader.onerror = function(error) {
			console.error('Ошибка чтения файла:', error);
			alert('Ошибка при чтении файла изображения');
		};

		// Начинаем чтение файла
		reader.readAsDataURL(file);
	});






	// Загрузки данных при запуске страницы
	loadManufacturers();
	loadGoods();
});