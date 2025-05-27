// Данные страницы
var manufacturers
var csrfToken = undefined;
// Константные выражения
const deleteManufacturerConfirmMessage='Вы уверены, что хотите удалить производителя';


function handleUnknownError(error){
	const message = `Неизвестная ошибка: "${error}"`;
	alert(message);
	console.log(message);
}




async function loadManufacturers(){
	let response = await fetch('/api/manufacturers/');
	
	const container=document.getElementById('manufacturers_grid');
	container.innerHTML='';

	try{
		if(!response.ok)
			throw new Error(`Response status ${response.status}`);

		let elements = await response.json();
		manufacturers=elements.manufacturers;
		manufacturers.forEach(element => {
			container.innerHTML+=createManufacturerCard(element)
		});
	}
	catch(error){
		console.log(error);
	}
}
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




// Функции добавления производителей
function openModal(modalId) {
	document.getElementById(modalId).style.display = 'flex';
	document.body.classList.add('no-scroll');
};

function closeModal(modalId) {
	document.getElementById(modalId).style.display = 'none';
	document.body.classList.remove('no-scroll');
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	// CSRF токен
	csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	// Закрытие при клике вне модального окна
	document.getElementById('create_manufacturers_form_overlay')?.addEventListener('click', function(e) {
		if (e.target === this) closeModal('create_manufacturers_form_overlay');
	});

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
				//TODO: Доработать обновление списка производителей
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
				//TODO: Доработать обновление списка производителей
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



	// Загрузки данных при запуске страницы
	loadManufacturers();
});