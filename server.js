const http = require('http')
const socketIo = require('socket.io')
const express = require('express')

// Створюємо Express додаток
const app = express()
const server = http.createServer(app)

// Ініціалізуємо socket.io
const io = socketIo(server)

// Статичні файли (наприклад, ваш HTML, CSS, JS)
app.use(express.static('public')) // Вказуємо папку для статичних файлів

// Основна маршрутка, яка виводить ваш HTML
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html') // Відправляє HTML файл
})

let games = {} // Об'єкт для зберігання інформації про кожну гру

io.on('connection', socket => {
	console.log('A player connected')

	socket.on('joinGame', ({ nickname, gameCode }) => {
		if (!games[gameCode]) {
			games[gameCode] = {
				players: [],
				history: [],
				currentPlayerIndex: 0,
				gameStarted: false,
			}
		}

		if (!games[gameCode].players.includes(nickname)) {
			games[gameCode].players.push(nickname)
		}

		socket.join(gameCode)

		io.to(gameCode).emit('gameJoined', {
			players: games[gameCode].players,
		})
	})

	socket.on('startGame', gameCode => {
		if (games[gameCode]) {
			games[gameCode].gameStarted = true
			io.to(gameCode).emit('gameStart')
		}
	})

	socket.on('playerMove', ({ city, gameCode, player }) => {
		if (!games[gameCode]) return

		if (games[gameCode].history.includes(city.toLowerCase())) {
			io.to(gameCode).emit('gameError', 'Этот город уже был использован!')
			return
		}

		games[gameCode].history.push(city.toLowerCase())

		io.to(gameCode).emit('cityAccepted', { city })
		io.to(gameCode).emit('updateHistory', games[gameCode].history)

		games[gameCode].currentPlayerIndex =
			(games[gameCode].currentPlayerIndex + 1) % games[gameCode].players.length
	})

	socket.on('disconnect', () => {
		// Перевірка і видалення ігор з відсутніми гравцями
	})
})

// Запуск сервера
const port = 3000
server.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
