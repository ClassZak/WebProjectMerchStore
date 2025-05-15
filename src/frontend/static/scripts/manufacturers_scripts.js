// Объявляем функции глобально через window
window.openModal = function() {
	document.getElementById('overlay').style.display = 'flex';
	document.body.classList.add('no-scroll');
};

window.closeModal = function() {
	document.getElementById('overlay').style.display = 'none';
	document.body.classList.remove('no-scroll');
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
	// Закрытие при клике вне модального окна
	document.getElementById('overlay')?.addEventListener('click', function(e) {
		if (e.target === this) closeModal();
	});

	// Обработка отправки формы
	document.getElementById('myForm')?.addEventListener('submit', function(e) {
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
				//TODO: добавить обновление списка производителей
				if(data.id!=0)
					alert(`Успешно добавлен новый производитель ${formData.get('name')}`);
				closeModal();
				this.reset();
			}
		})
		.catch(error => {
			console.error('Ошибка:', error);
			alert('Произошла ошибка при отправке формы');
		});
	});
});