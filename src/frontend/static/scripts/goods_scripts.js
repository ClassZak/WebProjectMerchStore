async function loadGoods(){
	try{
		const idsResponse = await fetch('/api/goods/?limit=10');
		const idsData = await idsResponse.json();
		const ids=idsData.ids;
		
		setTimeout(async ()=>{
			const goodsResponse = await fetch(
				`/api/goods/?${new URLSearchParams({ids: JSON.stringify(ids)})}`
			);
			const goodsData = await goodsResponse.json();
			
			const goodsGrid=document.getElementById('goods_grid');
			goodsData.goods.array.forEach(element => {
				const div = document.createElement('div');
				div.innerHTML=`
				<h4>${element.name}</h4>
				<img src="${element.image}" alt="${element.name}">
				<p>${element.description}</p>
				<p>Цена: ${element.price}</p>
				`;
				goodsGrid.append(div);
			});
		},1000);
	}
	catch (error){
		console.error('Ошибка загрузки данных:',error)
	}
}


loadGoods();

