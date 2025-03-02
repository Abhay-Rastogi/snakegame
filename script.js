// DOM Elements
const gameBoard = document.getElementById('game-board');
const currentScoreElement = document.getElementById('current-score');
const finalScoreElement = document.getElementById('final-score');
const scoresListElement = document.getElementById('scores-list');
const gridSize = 20;
const cells = [];

// Create the game grid
for (let y = 1; y <= gridSize; y++) {
    cells[y] = [];
    for (let x = 1; x <= gridSize; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        gameBoard.appendChild(cell);
        cells[y][x] = cell;
    }
}

// Game state
let snake;
let direction;
let food;
let score;
let gameInterval;
let isGameActive = false;
let currentPlayer;

// Initial snake position
const initialSnake = [
    {x: 10, y: 10},
    {x: 10, y: 11},
    {x: 10, y: 12}
];

// Score Management Functions
function loadScores() {
    const scores = localStorage.getItem('snakeScores');
    return scores ? JSON.parse(scores) : [];
}

function saveScores(scores) {
    localStorage.setItem('snakeScores', JSON.stringify(scores));
}

function displayScores() {
    const scores = loadScores();
    const lastTen = scores.slice(-10).reverse(); // Most recent first
    scoresListElement.innerHTML = '<h3>Last 10 Scores</h3><ul>' +
        lastTen.map(score => `<li>${score.name}: ${score.score}</li>`).join('') +
        '</ul>';
}

// Screen Transition Functions
function showStartScreen() {
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    displayScores();
}

function showGameScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('game-over').style.display = 'none';
}

function showGameOverScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    finalScoreElement.textContent = `Game Over! ${currentPlayer}'s final score: ${score}`;
}

// Game Logic Functions
function initGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    // Clear previous snake and food
    for (let y = 1; y <= gridSize; y++) {
        for (let x = 1; x <= gridSize; x++) {
            cells[y][x].classList.remove('snake', 'food');
        }
    }
    snake = JSON.parse(JSON.stringify(initialSnake));
    direction = 'right';
    score = 0;
    currentScoreElement.textContent = `${currentPlayer}: ${score}`;
    snake.forEach(segment => cells[segment.y][segment.x].classList.add('snake'));
    generateFood();
    gameInterval = setInterval(move, 200);
    isGameActive = true;
}

function generateFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * gridSize) + 1;
        y = Math.floor(Math.random() * gridSize) + 1;
    } while (snake.some(segment => segment.x === x && segment.y === y));
    if (food) cells[food.y][food.x].classList.remove('food');
    food = {x, y};
    cells[y][x].classList.add('food');
}

function move() {
    const head = snake[0];
    let newHead;
    if (direction === 'right') newHead = {x: head.x + 1, y: head.y};
    else if (direction === 'left') newHead = {x: head.x - 1, y: head.y};
    else if (direction === 'up') newHead = {x: head.x, y: head.y - 1};
    else if (direction === 'down') newHead = {x: head.x, y: head.y + 1};

    // Check for wall collision
    if (newHead.x < 1 || newHead.x > gridSize || newHead.y < 1 || newHead.y > gridSize) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        currentScoreElement.textContent = `${currentPlayer}: ${score}`;
        generateFood();
    } else {
        const tail = snake.pop();
        cells[tail.y][tail.x].classList.remove('snake');
    }
    cells[newHead.y][newHead.x].classList.add('snake');

    // Check for self-collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    isGameActive = false;
    const scores = loadScores();
    scores.push({name: currentPlayer, score});
    saveScores(scores);
    showGameOverScreen();
}

function pauseGame() {
    if (isGameActive) {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        } else {
            gameInterval = setInterval(move, 200);
        }
    }
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (!isGameActive) return;
    switch (event.key) {
        case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
    }
});

document.getElementById('start-button').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName === '') {
        alert('Please enter your name.');
        return;
    }
    currentPlayer = playerName;
    showGameScreen();
    initGame();
});

document.getElementById('pause').addEventListener('click', pauseGame);

document.getElementById('reset').addEventListener('click', initGame);

document.getElementById('exit').addEventListener('click', () => {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    showStartScreen();
});

document.getElementById('play-again').addEventListener('click', showStartScreen);

// Start the application
showStartScreen();