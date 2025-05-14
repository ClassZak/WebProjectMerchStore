const goodsCache = new Map();

async function loadGoods(){
	let response=await fetch('/api/goods/?limit=4');

	const container=document.getElementById('goods_grid');
	container.innerHTML='';
	
	try{
		if(!response.ok)
			throw new Error(`Response status ${response.status}`);
		
		let goodsIds = await response.json();
		response= await fetch(
			`/api/goods/?${
				goodsIds.filter(
					id=>!goodsCache.has(id.id)
				).map(
					id=>`ids=${id.id}`
				).join('&')
			}`
		);
		let goodsData=await response.json()
		goodsData.goods.forEach(element => {
			createGoodCard(element);
		});
	}
	catch(error){
		console.error(error.message);
	}
}

function createGoodCard(good) {
	const container=document.getElementById('goods_grid')
	
	const formattedPrice = new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB'
	}).format(good.price);

    container.innerHTML+=`
	<div>
		<div>
			<img src="${good.image}" alt="${good.name}">
		</div>
		<div>
			<h4 class="card-title">${good.name}</h5>
			<p class="card-text">${formattedPrice}</p>
			<p class="card-text">${good.description}</p>
		</div>
	</div>`;
}


loadGoods();
