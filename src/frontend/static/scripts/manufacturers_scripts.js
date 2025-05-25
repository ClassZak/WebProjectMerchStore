// Данные страницы
var manufacturers
var csrfToken = undefined;


function handleUnknownError(error){
	const message=`Неизвестная ошибка: "${error}"`;
	alert(message);
	console.log(message)
}




async function loadManufacturers(){
	let response = await fetch('/api/manufacturers/');
	
	const container=document.getElementById('manufacturers_grid');
	container.innerHTML='';

	try{
		if(!response.ok)
			throw new Error(`Response status ${response.status}`);

		let elements = await response.json();
		manufacturers=elements.manufacturers
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
	const findingPart='<div class=\"manufacturer-card\"'
	const container=document.getElementById('manufacturers_grid');
	let idPos=container.innerHTML.indexOf(`\"${id}\"`)
	if(idPos===-1)
		return;
	try{
		let findingPartPos=idPos;
		let endPos=0;
		while(container.innerHTML.substring(findingPartPos,findingPartPos+findingPart.length)!=findingPart)
			--findingPartPos;

		const openedDiv='<div'
		const closedDiv='</div>'
		let divsOpened=0;
		let divsClosed=0;
		let i=findingPartPos;
		while(true){
			if(container.innerHTML.substring(i,i+openedDiv.length)==openedDiv)
				++divsOpened;
			if(container.innerHTML.substring(i,i+closedDiv.length)==closedDiv)
				++divsClosed;

			if(divsOpened===divsClosed){
				container.innerHTML=
					container.innerHTML.substring(0,findingPartPos)+
					container.innerHTML.substring(i+closedDiv.length, container.innerHTML.length-1);
				break;
			}
				

			++i;
		}
	}
	catch(error){

	}
}


async function deleteManufacturer(id){
	const manufacturer = manufacturers.find(x => x.id==id)

	fetch(`/api/manufacturers/${id}`, {method: "DELETE", headers: { 'X-CSRFToken': csrfToken}})
	.then(response => response.json())
	.then(data => {
		if(data.error){
			alert(`Ошибка удаление поставщика "${manufacturer.name}": ${data.error}`);
			loadManufacturers();
		} else{
			alert(`Поставщик "${manufacturer.name}" успешно удалён`);
			manufacturers=manufacturers.filter(element=>element.id!=id)
			deleteManufacturerFromHTML(id)
		}
	})
	.catch(error =>{ 
		handleUnknownError(error);
		loadManufacturers();
	});
}
async function updateManufacturer(id) {
	const manufacturer = manufacturers.find(x => x.id==id)
	
	let element=document.getElementById('edit_manufacturers_form');
	element.setAttribute('element-data-id',id);
	openModal('edit_manufacturers_form_overlay');
	/*
	fetch(
		`/api/manufacturers/${id}`, 
		{
			method: "PUT",
			headers: 
			{'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }, body: JSON.stringify(manufacturer)
		}
	)
	.then(response => response.json())
	.then(data => {
		if(data.error) {
			alert(`Ошибка редактирования данных производителя "${manufacturer.name}": ${data.error}`);
			loadManufacturers();
		}
		else {
			alert(`Данные производителя "${manufacturer.name}" изменены успешно`);
		}
	})
	.catch(error =>{ 
		handleUnknownError(error);
		loadManufacturers();
	});*/
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
				loadManufacturers()
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
	loadManufacturers()
});