const socket = io()

let players = []
let history = [] 

let currentPlayerIndex = 0
let gameStarted = false
let playerNickname = 'KeshaJan'
let gameCode = '12345' 

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

	socket.emit('playerMove', {
		city: city,
		gameCode: gameCode,
		player: players[currentPlayerIndex],
	})

	history.push(`${players[currentPlayerIndex]}: ${city}`)
	updateHistory()

	currentPlayerIndex = (currentPlayerIndex + 1) % players.length
	setCurrentPlayer()

	document.getElementById('cityInput').value = ''
	document.getElementById('gameMessage').textContent = ''
}

function updateHistory() {
	const historyElement = document.getElementById('history')
	historyElement.innerHTML = history.map(item => `<p>${item}</p>`).join('')
}

socket.on('cityAccepted', data => {
	document.getElementById(
		'gameMessage'
	).textContent = `Город ${data.city} принят!`
	setCurrentPlayer()
})

socket.on('gameError', message => {
	document.getElementById('gameMessage').textContent = message
})

socket.on('gameStart', () => {
    gameStarted = true;
    document.getElementById("gamePlay").style.display = "block";
    setCurrentPlayer();

    const startButton = document.getElementById("startGameBtn");
    startButton.textContent = "Игра началась";
    startButton.disabled = true;
});

socket.on('updateHistory', history => {
	const historyElement = document.getElementById('history')
	historyElement.innerHTML = history.map(item => `<p>${item}</p>`).join('')
})