const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 40; // Increased to match new file list
const pairsCount = 8;
let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard, matches, moves;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    document.getElementById('move-counter').innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    const version = new Date().getTime(); 

    for (let i = 1; i <= totalPool; i++) {
        // Skip 6 (Back) and 30 (Logo) for the card pool
        if (i === 6 || i === 30) continue; 
        
        // Treat all as .png, including 35 and 40
        images.push(`${i}.png?v=${version}`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name.split('?')[0]; 
        card.innerHTML = `
            <div class="front-face">
                <img src="img/${name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    sfx.flip.play().catch(() => {});

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
        sfx.match.play().catch(() => {});
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        sfx.mismatch.play().catch(() => {});
        setTimeout(() => {
            if(firstCard) firstCard.classList.remove('flip');
            if(secondCard) secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetGame() { initGame(); }

function updateVolume(val) {
    bgMusic.volume = val;
    Object.values(sfx).forEach(s => s.volume = val);
}

function toggleMute() {
    const isMuted = !bgMusic.muted;
    bgMusic.muted = isMuted;
    Object.values(sfx).forEach(s => s.muted = isMuted);
    document.getElementById('mute-btn').innerText = isMuted ? '🔇' : '🔊';
}

// Global Startup sequence
let timer = 5;
const countDisplay = document.getElementById('count-num');
const startCounter = setInterval(() => {
    timer--;
    if (countDisplay) countDisplay.innerText = timer;
    if (timer === 0) {
        clearInterval(startCounter);
        document.getElementById('intro-overlay').style.display = 'none';
        bgMusic.play().catch(() => {});
        initGame();
    }
}, 1000);
