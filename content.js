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

	// Save the new entry
	chrome.storage.local.set({
		[key]: {
			text: value,
			_savedAt: Date.now()
		}
	}, () => {
		// cleanup logic if more than 10 saved entries
		chrome.storage.local.get(null, (items) => {
			const keys = Object.keys(items);

			if (keys.length > 10) {
				// Sort keys by last modified time (we store it alongside the value)
				const sortedKeys = keys.sort((a, b) => {
					return items[a]._savedAt - items[b]._savedAt;
				});

				const oldestKey = sortedKeys[0];
				chrome.storage.local.remove(oldestKey);
			}
		});
	});
}

function restoreInputs() {
	const inputs = document.querySelectorAll('textarea, input[type="text"], input:not([type])');

	chrome.storage.local.get(null, (items) => {
		inputs.forEach((input) => {
			const key = generateKey(input);
			if (items[key]) {
				input.value = items[key].text || "";
			}

			// Debounced input listener
			input.addEventListener('input', debounce(saveInput, 500));
		});
	});
}

restoreInputs();
