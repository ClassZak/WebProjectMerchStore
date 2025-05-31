// Данные страницы
var manufacturers;
var goods;
var csrfToken = undefined;
// Константные выражения
const deleteManufacturerConfirmMessage='Вы уверены, что хотите удалить производителя';
const deleteGoodConfirmMessage='Вы уверены, что хотите удалить товар';
// Общие функции
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
function createManufacturerCard(element){
	return `
	<div class="manufacturer-card" element-data-id="${element.id}">
		<div class="card-content">
			<p>Название</p>
			<h4 class="card-title">${element.name}</h4>
		</div>
		<div class="card-button-div">
			<button class="square-btn" onclick="updateManufacturer(${element.id})"><strong>✎</strong></button>
			<button class="square-btn" onclick="deleteManufacturer(${element.id})"><strong>🗑</strong></button>
		</div>
	</div>
	`;// Доп. div для стиля
}
function createGoodCard(element){
	let manufacturer=manufacturers.find(x=>x.id==element.idManufacturer);
	return `
	<div class="manufacturer-card" element-data-id="${element.id}">
		<div class="card-content">
			<p>Название</p>
			<h4 class="card-title">${element.name}</h4>
			<p>Описание</p>
			<h4 class="card-title">${element.description}</h4>
			<p>Цена</p>
			<h4 class="card-title">
				${Intl.NumberFormat('ru-RU',{style: 'currency', currency: 'RUB'}).format(element.price)}
			</h4>
			<p>Производитель</p>
			<h4 class="card-title">${manufacturer && manufacturer.name ? manufacturer.name: 'Незвестен'}</h4>
			<p>Дата появления в ассортименте</p>
			<h4 class="card-title">${element.appearanceDate}</h4>
		</div>
		<div class="card-button-div">
			<button class="square-btn" onclick="updateGood(${element.id})"><strong>✎</strong></button>
			<button class="square-btn" onclick="deleteGood(${element.id})"><strong>🗑</strong></button>
		</div>
	</div>
	`
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
			throw new Error(`Response status ${response.status}`);

		let elements = await response.json();
		manufacturers=elements.manufacturers;
		manufacturers.forEach(element => container.innerHTML+=createManufacturerCard(element));
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
	const card = document.querySelector(`.manufacturer-card[element-data-id="${id}"]`);
	if(card)
		card.remove();
}
function deleteManufacturer(id) {
	const manufacturer = manufacturers.find(x => x.id==id)
	if(manufacturer === undefined || manufacturer===NaN)
		return;

	const modal = document.querySelector('#delete_manufacturers_form_overlay .modal');
	modal.setAttribute('element-data-id', id);
	openModal('delete_manufacturers_form_overlay');
	setDeleteConfirmMessage(
		'delete_manufacturers_confirm_message',
		deleteManufacturerConfirmMessage, 
		manufacturer.name
	);
}
function handleDeleteConfirm() {
	const modal = document.querySelector('#delete_manufacturers_form_overlay .modal');
	const id = modal.getAttribute('element-data-id');
	
	if (!id) return;
	
	deleteManufacturerFromDB(id);
	closeModal('delete_manufacturers_form_overlay');

	modal.removeAttribute('element-data-id');
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
	element.setAttribute('element-data-id',id);
	openModal('edit_manufacturers_form_overlay');
}










/**
 * Товары
 */
async function loadGoods() {
	let response = await fetch('/api/googs', {method: 'get'});

	const container = document.getElementById('goods_grid');
	container.innerHTML = '';

	try {
		if(!response.ok)
			throw new Error(`Response status: ${response.status}`);
		
		let elements = await response.json();
		goods = elements;
		goods.forEach(element => {
			container.innerHTML += createGoodCard(element);
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
		
		fetch(this.action+this.getAttribute('element-data-id'),{
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
		image			string,
		price			number,
		appearanceDate	string,
		idManufacturer	numnber
		csrf_token		string	*/
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
					alert(`Успешно добавлен новый товар \"${formData.get('name')}\"`);
				closeModal('create_goods_form_overlay');
				this.reset();
				loadManufacturers();
			}
		})
		.catch(error => {
			console.error('Ошибка:', error);
			alert('Произошла ошибка при отправке формы');
		});
	});






	// Загрузки данных при запуске страницы
	loadManufacturers();
	loadGoods();
});