var goods;
var manufacturers;



async function loadManufacturersToArray(){
	let response = await fetch('/api/manufacturers/');

	let message = '';
	try{
		if(!response.ok) {
			message = (await response.json()).error
			throw new Error(`Статус запроса: ${response.status}\nОшибка: ${message}`);
		}

		let elements = await response.json();
		manufacturers=elements.manufacturers;
	}
	catch(error){
		console.log(error);
		showError(message);
	}
}
async function loadGoodsToArray(apiRoute='') {
	let response = await fetch('/api/goods/'+apiRoute);

	let message = '';
	try{
		if(!response.ok){
			message = (await response.json()).error;
			throw new Error(`Статус запроса: ${response.status}\nОшибка: ${message}`);
		}

		let elements = await response.json();
		goods = elements.goods;
	}
	catch(error){
		console.log(error);
		showError(message);
	}
}




async function createGoodCard(element) {
	while (manufacturers === undefined);
	let manufacturer = manufacturers.find(x => x.id == element.id_manufacturer);

	const card = document.createElement('a');
	card.href = `/good/${element.id}`;
	card.classList.add('card', 'good-card', 'shadow-card');
	card.style.display = 'flex'; // Добавляем flex для карточки
	card.style.flexDirection = 'column'; // Вертикальное расположение
	card.style.height = '100%'; // Занимаем всю высоту

	card.innerHTML = `
		<div class="image-container">
			<img src="data:image/*;base64,${element.image.slice(2, -1)}" 
				alt="${escapeHtml(element.name)}">
		</div>
		<div class="card-content">
			<h4 class="card-title">${escapeHtml(element.name)}</h4>
			<h4 class="card-price">
				${Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(element.price)}
			</h4>
			
			<p class="card-desc">${escapeHtml(element.description)}</p>
			<div class="secondary-info card-bottom">
				<p>Производитель:</p>
				<h4 class="card-title card-manufacturer">${manufacturer && manufacturer.name ? manufacturer.name: 'Незвестен'}</h4>
				<p>Дата появления в ассортименте:</p>
				<h4 class="card-title card-date">${element.appearance_date}</h4>
			</div>
		</div>
	`;

	return card;
}

async function loadGoods(elementId, apiRoute = '') {
    try {
        const container = document.getElementById(elementId);
        container.innerHTML = '';
        await loadGoodsToArray(apiRoute);
        
        goods.forEach(async element => {
            const col = document.createElement('div');
            col.className = "col-xs-6 col-sm-4 col-md-3 col-lg-2";
            
            const card = await createGoodCard(element);
            col.appendChild(card);
            container.appendChild(col);
        });
    } catch (error) {
        console.log(error);
    }
}