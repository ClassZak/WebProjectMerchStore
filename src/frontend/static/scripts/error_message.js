function escapeHtml(unsafe){
	return unsafe
		.replaceAll('&','&amp;')
		.replaceAll('<','&lt;')
		.replaceAll('>','&gt;')
		.replaceAll('\"','&quot;')
		.replaceAll('\'','&#39;');
}

var errorWindow;
var errorWindowObject = {
	htmlElement : errorWindow
}



function hideError(){
	errorWindow.style.visibility='collapse';
}
function showError(error){
	errorWindow.style.visibility='visible';
	/*Экранирование не требуется, т.к. устанавливается textContent*/
	document.getElementById('error-message').textContent=error;
}


function createErrorNotification(){
	errorWindow = document.createElement('div');
	errorWindow.style.visibility = 'collapse';
	errorWindow.classList.add('error-window');
	
	errorWindow.innerHTML = `
		<div class="error-window-text-content">
			<h2 class="error-window-inline-element" id="error-message"></h2>
		</div>
		<div >
			<button
				class="square-btn error-window-square-btn"
				onclick="hideError()" style = "">
				X
			</button>
		</div>
	`;

	document.body.append(errorWindow);
}
document.addEventListener('DOMContentLoaded', createErrorNotification);