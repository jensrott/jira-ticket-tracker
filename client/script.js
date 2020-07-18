const form = document.querySelector('form');
const input = document.querySelector('input');

const deleteAllBtn = document.querySelector('.delete-all-button');
const refreshAllBtn = document.querySelector('.refresh-all-button');
const sortBtn = document.querySelector('.sort-button');

const errorMsg = document.querySelector('.error-message');
const spinner = document.querySelector('.spinner');
const cardsSection = document.querySelector('.cards'); // ul

let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];

localStorage.setItem('cards', JSON.stringify(cards))

let cardsDataLocalStorage = JSON.parse(localStorage.getItem('cards'))
console.log(cardsDataLocalStorage)

form.addEventListener('submit', formSubmitted);

/**
 * Submit input form 
 * @param {Event} e 
 */
function formSubmitted(e) {
	e.preventDefault();
	let searchTerm = input.value;

	// If input is comma seperated values
	if (input.value.split(",").length > 1) {
		let splittedCommas = searchTerm.split(',');
		// console.log(splittedCommasSpace);
		splittedCommas.forEach(splittedComma => {
			let trimmedData = splittedComma.trim()
			search(trimmedData)
				.then(data => {
					processData(data)
				})
				.catch(err => {
					catchError(err)
				})
		})
	}
	// If input is not empty
	else if (input.value !== '') {
		search(searchTerm)
			.then(data => {
				processData(data)
			})
			.catch(err => {
				catchError(err)
			})
	}
}

/**
 * Fetch data from Jira API
 * @param {string} searchTerm 
 * @return {Function} fetch
 */
function search(searchTerm) {
	const url = `http://localhost:3001/api/jira/${searchTerm}`;
	return fetch(url)
		.then(response => response.json())
		.then(result => {
			return result;
		});
}

/**
 * Process the returned API data
 * @param {Object} data 
 */
function processData(data) {
	console.log(data)
	let cardObject = {
		id: Math.floor(Math.random() * 10000),
		date: new Date(),
		title: data.fields.summary,
		ticketId: data.key,
		status: data.fields.status.name,
		statusIcon: data.fields.status.iconUrl,
		statusChangedDate: data.fields.statuscategorychangedate,
		fullLink: `https://fifthplay.atlassian.net/browse/${data.key}`
	}
	cards.push(cardObject);

	localStorage.setItem('cards', JSON.stringify(cards))

	createCard(cardObject)

	errorMsg.innerHTML = ''
	// input.value = ''
	input.focus()
}

/**
 * Process possible errors
 * @param {Object} err
 */
function catchError(err) {
	console.log(err);
	let errorMsgText = 'We could not find a ticket for your search'
	errorMsg.innerHTML = errorMsgText
}

/** Retrieve cards from Localstorage. */
function getCards() {
	if (cardsDataLocalStorage) {
		cardsSection.innerHTML = ''
		cardsDataLocalStorage.forEach(item => {
			// spinner.classList.remove('hidden')
			createCard(item)
		})
	}
	if (cardsSection.innerHTML === '' && cardsDataLocalStorage.length == 0) {
		errorMsg.innerHTML = 'Add Jira Tickets you want to track!'
	}
}

getCards();

/** Process the returned API data.
 *  @returns {Window}
 */
function reloadPage() {
	return window.location.reload();
}

refreshAllBtn.addEventListener('click', reloadPage)

/** Calculate the amount of days between today and date inserted.
 *  @param {Date} date
 *  @returns {String} 
 */
function calculateBetweenDays(date) {
	const today = new Date()
	const todayFormatted = formatDate(today);

	console.log(todayFormatted)

	// Format should be yyyy-mm-dd
	const dayA = moment(todayFormatted);
	const dayB = moment(date.slice(0, 10));

	let difference = dayA.diff(dayB, 'days');
	console.log(difference)
	if (difference === 0) {
		return `Edited: today`
	} else if (difference === 1) {
		return `Edited: yesterday`
	} else if (difference >= 31) {
		let difference = dayA.diff(dayB, 'months');
		return `Edited: ${difference} months ago`
	} else if (difference > 365) {
		let difference = dayA.diff(dayB, 'years');
		return `Edited: ${difference} years ago`
	}

	return `Edited: ${difference} days ago`

}

/** Format date to: yyyy-mm-dd format
 *  @param {Date} date
 *  @returns {String} 
 */
function formatDate(date) {
	let d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

/** Add card object to the DOM.
 *  @param {Object} cardObjectData 
 */
function createCard(cardObjectData) {
	console.log(cardObjectData)
	const li = document.createElement('li')
	console.log(cardObjectData.status)

	// setStatusBgColor(cardObjectData.status)
	li.innerHTML = `
		<div class="card">
			<div class="title-container">
				<h2>${cardObjectData.title}</h2>
			</div>
		
			<div class="content-container">
				<p>${cardObjectData.status}</p>
				<p class="ticket-id">${cardObjectData.ticketId}</p>
				
				<p>${calculateBetweenDays(cardObjectData.statusChangedDate)}</p>	
				
				<img src="${cardObjectData.statusIcon}"></img>
				<a href='${cardObjectData.fullLink}' target="_blank">Full Jira link</a>
			</div>

			<button id=${cardObjectData.id} class="delete-button">Remove</button>
		</div>
	`;

	cardsSection.appendChild(li)

	// This works when adding it all in the same function, not fully because now it deletes all cards.
	// const addNoteBtn = document.querySelectorAll('.add-note-button');
	const deleteBtn = document.querySelectorAll('.delete-button');

	if (deleteBtn) {
		deleteBtn.forEach(btn => {
			btn.addEventListener('click', (e) => {
				// We turn the id from a string to an integer
				console.log('click')
				deleteCard(parseInt(e.target.id))
			})
		})
	}
}

/** Delete specific card from the DOM and localStorage.
 *  @param {Number} selectedCardId 
 */
function deleteCard(selectedCardId) {
	// We compare the selected card id with the id that is in localStorage
	const selectedCard = document.getElementById(selectedCardId);
	const cardsLocalStorage = JSON.parse(localStorage.getItem('cards'));
	for (let i = 0; i < cardsLocalStorage.length; i++) {

		if (cardsLocalStorage[i].id === selectedCardId) {
			console.log(cardsLocalStorage[i].id)
			cardsLocalStorage.splice(i, 1)
		}

		const cards = JSON.stringify(cardsLocalStorage);
		localStorage.setItem('cards', cards)
	}
	// Remove from DOM
	selectedCard.parentElement.remove()
	if (cardsLocalStorage.length == 0) {
		errorMsg.innerHTML = 'Add Jira Tickets you want to track!'
	}
}

deleteAllBtn.addEventListener('click', deleteAll)

/** Remove all cards from the DOM and localStorage. */
function deleteAll() {
	localStorage.clear()
	while (cardsSection.firstChild) {
		cardsSection.removeChild(cardsSection.firstChild)
	}
	cards = []
	input.value = '';
	input.focus()
}

