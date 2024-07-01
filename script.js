const minefield = document.getElementById('minefield');
const retryButton = document.getElementById('retryButton');
const gridSize = 10;
const mineCount = 10;

let grid = [];
let gameOver = false;

function initGame() {
    grid = [];
    gameOver = false;
    retryButton.style.display = 'none';
    for (let i = 0; i < gridSize; i++) {
        const row = [];
        for (let j = 0; j < gridSize; j++) {
            row.push({
                revealed: false,
                mine: false,
                flagged: false,
                adjacentMines: 0
            });
        }
        grid.push(row);
    }

    placeMines();
    calculateAdjacentMines();
    renderGrid();
}

function placeMines() {
    let placedMines = 0;
    while (placedMines < mineCount) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);

        if (!grid[x][y].mine) {
            grid[x][y].mine = true;
            placedMines++;
        }
    }
}

function calculateAdjacentMines() {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (!grid[x][y].mine) {
                let adjacentMines = 0;
                directions.forEach(([dx, dy]) => {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny].mine) {
                        adjacentMines++;
                    }
                });
                grid[x][y].adjacentMines = adjacentMines;
            }
        }
    }
}

function renderGrid() {
    minefield.innerHTML = '';
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (grid[x][y].revealed) {
                cell.classList.add('revealed');
                if (grid[x][y].mine) {
                    cell.classList.add('mine');
                    cell.innerHTML = '💣';
                } else {
                    cell.innerHTML = grid[x][y].adjacentMines || '';
                }
            } else if (grid[x][y].flagged) {
                cell.classList.add('flagged');
                cell.innerHTML = '🚩';
            }

            cell.addEventListener('click', revealCell);
            cell.addEventListener('contextmenu', flagCell);

            minefield.appendChild(cell);
        }
    }
}

function revealCell(event) {
    if (gameOver) return;

    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (grid[x][y].flagged || grid[x][y].revealed) {
        return;
    }

    grid[x][y].revealed = true;

    if (grid[x][y].mine) {
        gameOver = true;
        revealAllMines();
        retryButton.style.display = 'block';
        alert('Game Over');
    } else {
        if (grid[x][y].adjacentMines === 0) {
            revealAdjacentCells(x, y);
        }
        renderGrid();
        checkWinCondition();
    }
}

function revealAdjacentCells(x, y) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !grid[nx][ny].revealed && !grid[nx][ny].mine) {
            grid[nx][ny].revealed = true;
            if (grid[nx][ny].adjacentMines === 0) {
                revealAdjacentCells(nx, ny);
            }
        }
    });
}

function flagCell(event) {
    event.preventDefault();
    if (gameOver) return;

    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (grid[x][y].revealed) {
        return;
    }

    grid[x][y].flagged = !grid[x][y].flagged;
    renderGrid();
}

function revealAllMines() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (grid[x][y].mine) {
                grid[x][y].revealed = true;
            }
        }
    }
    renderGrid();
}

function checkWinCondition() {
    let revealedCells = 0;
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (grid[x][y].revealed) {
                revealedCells++;
            }
        }
    }
    if (revealedCells === gridSize * gridSize - mineCount) {
        gameOver = true;
        retryButton.style.display = 'block';
        alert('You Win!');
    }
}

initGame();
