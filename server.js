const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

let games = {}

app.use(express.static('public'))

io.on('connection', socket => {
	console.log('Новое подключение: ' + socket.id)

	// Подключение игрока к комнате с кодом '12345'
	socket.on('joinGame', ({ nickname, gameCode }) => {
		if (gameCode !== '12345') {
			return socket.emit('gameError', 'Неверный код игры')
		}

		if (!games[gameCode]) {
			games[gameCode] = {
				players: [],
				started: false,
				currentPlayerIndex: 0,
			}
		}

		// Проверяем, что игрок не подключен уже
		if (games[gameCode].players.includes(nickname)) {
			return socket.emit('gameError', 'Вы уже подключены')
		}

		// Добавляем игрока в игру
		games[gameCode].players.push(nickname)
		socket.join(gameCode)

		// Отправляем список игроков
		io.to(gameCode).emit('gameJoined', { players: games[gameCode].players })
	})

	// Запуск игры
	socket.on('startGame', gameCode => {
		if (gameCode !== '12345') {
			return socket.emit('gameError', 'Неверный код игры')
		}

		if (!games[gameCode]) {
			return socket.emit('gameError', 'Игра не существует')
		}

		if (games[gameCode].started) {
			return socket.emit('gameError', 'Игра уже началась')
		}

		// Проверяем, что в комнате есть хотя бы два игрока
		if (games[gameCode].players.length < 2) {
			return socket.emit(
				'gameError',
				'Нужно минимум два игрока для начала игры'
			)
		}

		games[gameCode].started = true
		io.to(gameCode).emit('gameStart')
	})

	socket.on('playerMove', ({ city, gameCode, player }) => {
		if (!games[gameCode]) {
			return socket.emit('gameError', 'Игра не существует')
		}

		if (
			!games[gameCode].players[games[gameCode].currentPlayerIndex] === player
		) {
			return socket.emit('gameError', 'Не твой ход')
		}

		// Здесь можно добавить логику для проверки города
		console.log(`${player} ввел город: ${city}`)

		io.to(gameCode).emit('cityAccepted', { city })

		// Переключаем игрока
		games[gameCode].currentPlayerIndex =
			(games[gameCode].currentPlayerIndex + 1) % games[gameCode].players.length
	})

	// Обработка выхода игроков
	socket.on('disconnect', () => {
		console.log('Игрок отключился')
	})
})

server.listen(3000, () => {
	console.log('Сервер запущен на порту 3000')
})
