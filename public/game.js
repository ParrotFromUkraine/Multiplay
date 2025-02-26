const socket = io()

let playerNickname = ''
let gameCode = '12345' // Код комнаты
let players = []
let currentPlayerIndex = 0 // Индекс текущего игрока
let gameStarted = false
let history = [] // История введенных городов

function joinGame() {
	playerNickname = document.getElementById('nickname').value

	if (!playerNickname) {
		document.getElementById('errorMessage').textContent =
			'Пожалуйста, заполните поле с никнеймом!'
		return
	}

	socket.emit('joinGame', { nickname: playerNickname, gameCode: gameCode })
}

socket.on('gameJoined', data => {
	players = data.players
	document.getElementById('registration').style.display = 'none'
	document.getElementById('game').style.display = 'block'
	document.getElementById('playerNickname').textContent = playerNickname
	updatePlayerList(players)
})

socket.on('gameStart', () => {
	gameStarted = true
	document.getElementById('gamePlay').style.display = 'block'
	setCurrentPlayer()
})

socket.on('gameError', message => {
	document.getElementById('errorMessage').textContent = message
})

function updatePlayerList(players) {
	const playersList = document.getElementById('players')
	playersList.innerHTML = players.map(player => `<p>${player}</p>`).join('')
}

function startGame() {
	socket.emit('startGame', gameCode)
}

function setCurrentPlayer() {
	document.getElementById('currentPlayer').textContent =
		players[currentPlayerIndex]
}

function submitCity() {
	const city = document.getElementById('cityInput').value.trim()

	if (!city) {
		document.getElementById('gameMessage').textContent = 'Введите город!'
		return
	}

	// Отправляем город серверу
	socket.emit('playerMove', {
		city: city,
		gameCode: gameCode,
		player: players[currentPlayerIndex],
	})

	// Добавляем город в историю
	history.push(`${players[currentPlayerIndex]}: ${city}`)
	updateHistory()

	// Переключаем на следующего игрока
	currentPlayerIndex = (currentPlayerIndex + 1) % players.length
	setCurrentPlayer()

	// Очищаем поле ввода
	document.getElementById('cityInput').value = ''
	document.getElementById('gameMessage').textContent = ''
}

function updateHistory() {
	const historyElement = document.getElementById('history')
	historyElement.innerHTML = history.map(item => `<p>${item}</p>`).join('')
}

socket.on('cityAccepted', data => {
	// Успешный ход, можно обновить состояние игры
	document.getElementById(
		'gameMessage'
	).textContent = `Город ${data.city} принят!`
	// Переключаем ход на следующего игрока
	setCurrentPlayer()
})

socket.on('gameError', message => {
	document.getElementById('gameMessage').textContent = message
})

// После старта игры
socket.on('gameStart', () => {
    gameStarted = true;
    document.getElementById("gamePlay").style.display = "block";
    setCurrentPlayer();

    // Изменяем текст кнопки на "Игра началась"
    const startButton = document.getElementById("startGameBtn");
    startButton.textContent = "Игра началась";
    startButton.disabled = true; // Отключаем кнопку после старта игры
});

socket.on('updateHistory', history => {
	const historyElement = document.getElementById('history')
	historyElement.innerHTML = history.map(item => `<p>${item}</p>`).join('')
})