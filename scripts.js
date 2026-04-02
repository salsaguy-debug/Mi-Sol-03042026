const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 34;
const pairsCount = 8;
let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard, matches, moves;

function handleImageError(img, id) {
    img.style.display = 'none';
    const parent = img.parentElement;
    const errorText = document.createElement('span');
    errorText.className = 'img-error';
    errorText.innerText = id.split('.')[0]; 
    parent.appendChild(errorText);
}

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    document.getElementById('move-counter').innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        // Skip image 6 (back) and 30 (logo) for card selection
        if (i === 6 || i === 30) continue; 
        
        let ext = '.jpg';
        if ([1, 31, 32, 33, 34].includes(i)) ext = '.jpeg';
        if ([3, 7, 8, 9, 29].includes(i)) ext = '.png';
        images.push(`${i}${ext}`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `
            <div class="front-face">
                <img src="img/${name}" style="width:100%; height:100%; object-fit:cover;" 
                     onerror="handleImageError(this, '${name}')">
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

// Initial Countdown
let timer = 5;
const startCounter = setInterval(() => {
    timer--;
    const countDisplay = document.getElementById('count-num');
    if (countDisplay) countDisplay.innerText = timer;
    if (timer === 0) {
        clearInterval(startCounter);
        document.getElementById('intro-overlay').style.display = 'none';
        bgMusic.play().catch(() => {});
        initGame();
    }
}, 1000);
