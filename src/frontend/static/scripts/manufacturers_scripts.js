// Данные страницы
var manufacturers


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
		console.log(error.message);
	}
}
function createManufacturerCard(element){
	return `
	<div class="manufacturer-card" element-data-id="${element.id}">
		<div class="card-content">
			<h4 class="card-title">${element.name}</h4>
			<p>Название</p>
		</div>
		<div class="card-button-div">
			<button class="square-btn"><strong>✎</strong></button>
			<button class="square-btn"><strong>🗑</strong></button>
		</div>
	</div>
	`;// Доп. div для стиля
}




// Функции добавления производителей
function openModal() {
	document.getElementById('manufacturers_form_overlay').style.display = 'flex';
	document.body.classList.add('no-scroll');
};

function closeModal() {
	document.getElementById('manufacturers_form_overlay').style.display = 'none';
	document.body.classList.remove('no-scroll');
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	// Закрытие при клике вне модального окна
	document.getElementById('manufacturers_form_overlay')?.addEventListener('click', function(e) {
		if (e.target === this) closeModal();
	});

	// Обработка отправки формы
	document.getElementById('manufacturers_form')?.addEventListener('submit', function(e) {
		e.preventDefault();
		
		/* Поля formData:
		name		string
		csrf_token	string	*/
		const formData = new FormData(this);
		
		fetch(this.action, {
			method: 'POST',
			body: formData,
			headers: {
				'X-CSRFToken': document.querySelector('[name=csrf_token]').value
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
				closeModal();
				this.reset();
				loadManufacturers()
			}
		})
		.catch(error => {
			console.error('Ошибка:', error);
			alert('Произошла ошибка при отправке формы');
		});
	});



	// Загрузки данных при запуске страницы
	loadManufacturers()
});