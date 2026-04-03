const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 35; 
const pairsCount = 8; 
let firstCard, secondCard, hasFlipped, lockBoard, matches, moves;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    hasFlipped = false; lockBoard = false;
    document.getElementById('move-counter').innerText = '0';
    
    let images = [];
    const v = new Date().getTime(); 

    for (let i = 1; i <= totalPool; i++) {
        // Exclude system images (Back=6, Logo=30, Bg=40)
        if (i === 6 || i === 30 || i === 40) continue; 
        images.push(`${i}.png?v=${v}`);
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
                <img src="img/${name}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">
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
    if(sfx.flip) sfx.flip.play().catch(()=>{});

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
        if(sfx.match) sfx.match.play().catch(()=>{});
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        if(sfx.mismatch) sfx.mismatch.play().catch(()=>{});
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

// Global Volume Control
function updateVolume(val) {
    bgMusic.volume = val;
    Object.values(sfx).forEach(s => s.volume = val);
}

function toggleMute() {
    bgMusic.muted = !bgMusic.muted;
    Object.values(sfx).forEach(s => s.muted = bgMusic.muted);
    document.getElementById('mute-btn').innerText = bgMusic.muted ? '🔇' : '🔊';
}

let timer = 5;
const countdown = setInterval(() => {
    timer--;
    document.getElementById('count-num').innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        document.getElementById('intro-overlay').style.display = 'none';
        bgMusic.play().catch(() => {});
        initGame();
    }
}, 1000);
