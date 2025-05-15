function openModal() {
	document.getElementById('overlay').style.display = 'flex';
	document.body.classList.add('no-scroll');
}

function closeModal() {
	document.getElementById('overlay').style.display = 'none';
	document.body.classList.remove('no-scroll');
}

// Закрытие при клике вне модального окна
document.getElementById('overlay').addEventListener('click', function(e) {
	if (e.target === this) closeModal();
});

// Обработка отправки формы
document.getElementById('myForm').addEventListener('submit', function(e) {
	e.preventDefault();
	// Здесь можно добавить обработку данных
	closeModal();
});