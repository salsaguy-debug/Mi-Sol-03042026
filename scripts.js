const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const totalPool = 34;
const pairsCount = 8;

let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard;
let matches = 0;
let moves = 0;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0;
    moves = 0;
    document.getElementById('move-counter').innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    // Explicitly mapping extensions based on your GitHub files
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i === 6 || i === 30) continue; // Skip logo and back card

        let ext = '.jpg';
        if ([1, 31, 32, 33, 34].includes(i)) ext = '.jpeg';
        if ([3, 7, 8, 9, 29].includes(i)) ext = '.png';
        
        images.push(`${i}${ext}`);
    }

    // Shuffle and pick 8 pairs
    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `
            <img class="front-face" src="img/${name}" onerror="console.error('Failed: ${name}')">
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    document.getElementById('sound-flip').play();

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.getElementById('move-counter').innerText = moves;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.id === secondCard.dataset.id) {
        matches++;
        document.getElementById('sound-match').play();
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        document.getElementById('sound-mismatch').play();
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetGame() {
    initGame(); // Instant restart
}

function updateVolume(val) { bgMusic.volume = val; }
function toggleMute() {
    bgMusic.muted = !bgMusic.muted;
    document.getElementById('mute-btn').innerText = bgMusic.muted ? '🔇' : '🔊';
}

// Initial Launch with 5s countdown
let timer = 5;
const startCounter = setInterval(() => {
    timer--;
    document.getElementById('count-num').innerText = timer;
    if (timer === 0) {
        clearInterval(startCounter);
        document.getElementById('intro-overlay').style.display = 'none';
        bgMusic.play().catch(() => console.log("User interaction required for audio"));
        initGame();
    }
}, 1000);
