function escapeHtml(unsafe){
	return unsafe
		.replace('&','&amp;')
		.replace('<','&lt;')
		.replace('>','&gt;')
		.replace('\"','&quot;')
		.replace('\'','&#39;')
}

var errorWindow;
var errorWindowObject = {
	htmlElement : errorWindow
}

function createErrorNotification(){
	errorWindow = document.createElement('div');
	errorWindow.style.visibility = 'collapse';
	errorWindow.classList.add('error-window');
	
	errorWindow.innerHTML = `
		<div class="error-window-element">
			<h2 id="error-message"></h2>
		</div>
		<button class="error-window-element" onclick="hideError()" style = "">X</button>
	`;

	document.body.append(errorWindow);
}


function hideError(){
	errorWindow.style.visibility='collapse';
}
function showError(error){
	errorWindow.style.visibility='visible';
	document.getElementById('error-message').textContent=escapeHtml(error);
}