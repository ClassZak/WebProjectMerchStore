var goods;
var manufacturers;



async function loadManufacturersToArray(){
	let response = await fetch('/api/manufacturers/');

	let message = '';
	try{
		if(!response.ok) {
			message = (await response.json()).error
			throw new Error(`Response status: ${response.status}\nError Message: ${message}`);
		}

		let elements = await response.json();
		manufacturers=elements.manufacturers;
	}
	catch(error){
		console.log(error);
		showError(message);
	}
}




async function createGoodCard(element){
	while(manufacturers===undefined);
	let manufacturer=manufacturers.find(x=>x.id==element.id_manufacturer);

	const card = document.createElement('div');
	card.setAttribute('data-element-id',element.id);
	card.classList.add('card');
	card.classList.add('good-card');

	card.innerHTML = `
		<div class="card-content">
			<div class="one-photo">
				<img src="data:image/*;base64,${element.image.slice(2, -1)}" alt="${escapeHtml(element.name)}">
			</div>
			<h4 class="card-title">${escapeHtml(element.name)}</h4>
			<h4 class="card-title">
			${Intl.NumberFormat('ru-RU',{style: 'currency', currency: 'RUB'}).format(element.price)}
			</h4>
			<h5 class="card-title">${escapeHtml(element.description)}</h5>
			<p>Производитель:</p>
			<h4 class="card-title">${manufacturer && manufacturer.name ? manufacturer.name: 'Незвестен'}</h4>
			<p>Дата появления в ассортименте:</p>
			<h4 class="card-title">${element.appearance_date}</h4>
		</div>
	`

	return card;
}

async function loadGoods(elementId) {
	let response = await fetch('/api/goods/', {method: 'get'});

	const container = document.getElementById(elementId);
	container.innerHTML = '';

	let message = '';
	try {
		if(!response.ok) {
			message = (await response.json()).error;
			throw new Error(`Response status: ${response.status}\nError Message: ${message}`);
		}
		
		let elements = await response.json();
		goods = elements.goods;
		goods.forEach(async element => {
			container.appendChild(await createGoodCard(element));
		});
	} catch (error) {
		console.log(error);
		showError(message);
	}
}
async function loadNewGoods(elementId) {
	try {
		let response = await fetch('/api/goods/new/', {method: 'get'});

		const container = document.getElementById(elementId);
		if(!container)
			throw new Error('Ошибка поиска элемента для загрузки элементов');
		container.innerHTML = '';

		let message = '';
	
		if(!response.ok) {
			message = (await response.json()).error;
			throw new Error(`Response status: ${response.status}\nError Message: ${message}`);
		}
		
		let elements = await response.json();
		goods = elements.goods;
		goods.forEach(async element => {
			container.appendChild(await createGoodCard(element));
		});
	} catch (error) {
		console.log(error);
		showError(message);
	}
}


