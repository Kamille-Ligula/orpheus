function debounce(fn, delay) {
	let timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

function generateKey(element) {
	// Use URL + a unique selector path
	const url = window.location.href;
	const name = element.name || element.id || element.className || 'unnamed';
	return `${url}::${name}`;
}

function saveInput(event) {
	const element = event.target;
	const key = generateKey(element);
	const value = element.value;

	chrome.storage.local.set({ [key]: value });
}

function restoreInputs() {
	const inputs = document.querySelectorAll('textarea, input[type="text"], input:not([type])');

	chrome.storage.local.get(null, (items) => {
		inputs.forEach((input) => {
			const key = generateKey(input);
			if (items[key]) {
				input.value = items[key];
			}

			// Debounced input listener
			input.addEventListener('input', debounce(saveInput, 500));
		});
	});
}

restoreInputs();
