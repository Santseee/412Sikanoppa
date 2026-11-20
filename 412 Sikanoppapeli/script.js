
const playerCountSelect = document.getElementById("player-count");
const playerNamesContainer = document.getElementById("player-names");
const diceModeSelect = document.getElementById("dice-mode");
const winningScoreInput = document.getElementById("winning-score");

const startButton = document.getElementById("start-game");
const rollButton = document.getElementById("roll-dice");
const holdButton = document.getElementById("hold-score");
const newGameButton = document.getElementById("new-game");

const gameStatus = document.getElementById("game-status");
const die1Element = document.getElementById("die-1");
const die2Element = document.getElementById("die-2");
const turnScoreElement = document.getElementById("turn-score");
const targetScoreElement = document.getElementById("target-score");
const scoreboard = document.getElementById("scoreboard");

const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let players = [];
let currentPlayerIndex = 0;
let turnScore = 0;
let targetScore = 100;
let diceMode = 1;
let consecutiveDoubles = 0;
let gameStarted = false;
let gameOver = false;

function createPlayerNameFields() {
    const playerCount = Number(playerCountSelect.value);
    const oldNames = [];

    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`player-${i}`);
        oldNames.push(input ? input.value : "");
    }

    playerNamesContainer.innerHTML = "";

    for (let i = 1; i <= playerCount; i++) {
        const group = document.createElement("div");
        group.className = "form-group";

        const label = document.createElement("label");
        label.htmlFor = `player-${i}`;
        label.textContent = `Pelaaja ${i}`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `player-${i}`;
        input.name = `player-${i}`;
        input.placeholder = `Pelaajan ${i} nimi`;
        input.maxLength = 30;
        input.value = oldNames[i - 1] || "";

        group.appendChild(label);
        group.appendChild(input);
        playerNamesContainer.appendChild(group);
    }
}

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

function showDice(firstRoll, secondRoll) {
    die1Element.textContent = diceFaces[firstRoll];

    if (diceMode === 2) {
        die2Element.style.display = "flex";
        die2Element.textContent = diceFaces[secondRoll];
    } else {
        die2Element.style.display = "none";
    }
}

function updateScoreboard() {
    scoreboard.innerHTML = "";

    players.forEach((player, index) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;

        const scoreCell = document.createElement("td");
        scoreCell.textContent = player.score;

        const turnCell = document.createElement("td");
        if (gameStarted && !gameOver && index === currentPlayerIndex) {
            turnCell.textContent = "Nykyinen pelaaja";
            row.classList.add("current-player");
        } else {
            turnCell.textContent = "–";
        }

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(turnCell);
        scoreboard.appendChild(row);
    });
}

function updateGameDisplay() {
    turnScoreElement.textContent = turnScore;
    targetScoreElement.textContent = targetScore;

    const canPlay = gameStarted && !gameOver;
    rollButton.disabled = !canPlay;
    holdButton.disabled = !canPlay;
    startButton.disabled = canPlay;

    updateScoreboard();
}

function startGame() {
    const playerCount = Number(playerCountSelect.value);
    const scoreValue = Number(winningScoreInput.value);

    if (!Number.isInteger(scoreValue) || scoreValue < 10) {
        gameStatus.textContent = "Anna voittorajaksi vähintään 10 pistettä.";
        winningScoreInput.focus();
        return;
    }

    const newPlayers = [];

    for (let i = 1; i <= playerCount; i++) {
        const input = document.getElementById(`player-${i}`);
        const enteredName = input ? input.value.trim() : "";

        newPlayers.push({
            name: enteredName || `Pelaaja ${i}`,
            score: 0
        });
    }

    players = newPlayers;
    currentPlayerIndex = 0;
    turnScore = 0;
    targetScore = scoreValue;
    diceMode = Number(diceModeSelect.value);
    consecutiveDoubles = 0;
    gameStarted = true;
    gameOver = false;

    showDice(1, 1);
    gameStatus.textContent = `${players[currentPlayerIndex].name} aloittaa pelin.`;
    updateGameDisplay();
}

function nextTurn(message) {
    turnScore = 0;
    consecutiveDoubles = 0;

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    gameStatus.textContent = `${message} ${players[currentPlayerIndex].name} on seuraavana vuorossa.`;
    updateGameDisplay();
}

function finishGame(player) {
    gameOver = true;
    gameStarted = false;
    turnScore = 0;

    gameStatus.textContent = ` ${player.name} voitti pelin ${player.score} pisteellä!`;
    rollButton.disabled = true;
    holdButton.disabled = true;
    startButton.disabled = false;
    updateScoreboard();
    turnScoreElement.textContent = "0";
}

function rollDice() {
    if (!gameStarted || gameOver) {
        return;
    }

    const firstRoll = rollDie();
    const secondRoll = diceMode === 2 ? rollDie() : 0;

    showDice(firstRoll, secondRoll);

    // Yhden nopan säännöt.
    if (diceMode === 1) {
        if (firstRoll === 1) {
            nextTurn(`${players[currentPlayerIndex].name} heitti ykkösen ja menetti vuoron pisteet.`);
            return;
        }

        turnScore += firstRoll;
        gameStatus.textContent = `${players[currentPlayerIndex].name} heitti ${firstRoll}. Voit jatkaa tai lopettaa vuoron.`;
        updateGameDisplay();
        return;
    }

    if (firstRoll === 1 && secondRoll === 1) {
        const player = players[currentPlayerIndex];
        player.score += 25;

        if (player.score >= targetScore) {
            finishGame(player);
            return;
        }

        nextTurn(`${player.name} heitti kaksi ykköstä ja sai 25 pistettä.`);
        return;
    }

    if (firstRoll === 1 || secondRoll === 1) {
        nextTurn(`${players[currentPlayerIndex].name} heitti ykkösen ja menetti vuoron pisteet.`);
        return;
    }

    if (firstRoll === secondRoll) {
        consecutiveDoubles++;
    } else {
        consecutiveDoubles = 0;
    }

    if (consecutiveDoubles >= 3) {
        nextTurn(`${players[currentPlayerIndex].name} heitti kolme tuplaa peräkkäin ja menetti vuoron pisteet.`);
        return;
    }

    let points = firstRoll + secondRoll;

    if (firstRoll === secondRoll) {
        points *= 2;
        gameStatus.textContent = `${players[currentPlayerIndex].name} heitti tuplat ja sai ${points} vuoropistettä.`;
    } else {
        gameStatus.textContent = `${players[currentPlayerIndex].name} heitti ${firstRoll} ja ${secondRoll}, yhteensä ${points} pistettä.`;
    }

    turnScore += points;
    updateGameDisplay();
}

function holdTurn() {
    if (!gameStarted || gameOver) {
        return;
    }

    const player = players[currentPlayerIndex];
    player.score += turnScore;

    if (player.score >= targetScore) {
        finishGame(player);
        return;
    }

    nextTurn(`${player.name} tallensi ${turnScore} pistettä.`);
}

function resetGame() {
    players = [];
    currentPlayerIndex = 0;
    turnScore = 0;
    consecutiveDoubles = 0;
    gameStarted = false;
    gameOver = false;

    showDice(1, 1);
    gameStatus.textContent = "Aseta pelaajat ja aloita peli.";
    turnScoreElement.textContent = "0";
    targetScoreElement.textContent = winningScoreInput.value || "100";

    startButton.disabled = false;
    rollButton.disabled = true;
    holdButton.disabled = true;

    scoreboard.innerHTML = `
        <tr>
            <td colspan="3" class="empty-state">
                Pisteet näkyvät tässä, kun peli alkaa.
            </td>
        </tr>
    `;
}

playerCountSelect.addEventListener("change", createPlayerNameFields);
startButton.addEventListener("click", startGame);
rollButton.addEventListener("click", rollDice);
holdButton.addEventListener("click", holdTurn);
newGameButton.addEventListener("click", resetGame);

diceModeSelect.addEventListener("change", () => {

    die2Element.style.display = Number(diceModeSelect.value) === 2 ? "flex" : "none";
});

createPlayerNameFields();
die2Element.style.display = "none";
