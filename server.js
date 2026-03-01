dconst express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let players = [];
const brawlers = ["Шелли", "Кольт", "Эль Примо", "Барли", "Поко", "Роза", "Спайк", "Ворон", "Леон", "Сэнди", "Эдгар"];

io.on('connection', (socket) => {
    // Регистрация игрока
    socket.on('register', (name) => {
        players.push({ id: socket.id, name: name });
        io.emit('update_players', players.map(p => p.name)); // Обновляем список у всех
    });

    // Старт игры
    socket.on('start_game', () => {
        if (players.length < 3) return;

        const brawler = brawlers[Math.floor(Math.random() * brawlers.length)];
        let roles = Array(players.length - 1).fill(brawler);
        roles.push("Шпион (Ничего)");
        roles.sort(() => Math.random() - 0.5); // Перемешиваем

        // Отправляем каждому ИХ ЛИЧНУЮ роль
        players.forEach((player, index) => {
            io.to(player.id).emit('show_role', roles[index]);
        });

        players = []; // Очищаем список для новой игры
    });

    // Отключение
    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('update_players', players.map(p => p.name));
    });
});

http.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
});