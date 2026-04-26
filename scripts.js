const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const winVideo = document.getElementById('win-video');
const moveDisplay = document.getElementById('move-counter');
const bestDisplay = document.getElementById('best-score');
const startBtn = document.getElementById('start-btn');

const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 59; 
const pairsCount = 8; 
let firstCard, secondCard, hasFlipped, lockBoard, matches, moves = 0;
let audioState = { bg: 0.5, sfx: 0.5, muted: false };

bestDisplay.innerText = localStorage.getItem('memoryGameBest') || '--';

function applyVolumes() {
    bgMusic.volume = audioState.muted ? 0 : audioState.bg;
    Object.values(sfx).forEach(s => { if(s) s.volume = audioState.muted ? 0 : audioState.sfx; });
    if (winVideo) winVideo.volume = audioState.muted ? 0 : audioState.sfx;
}

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    hasFlipped = false; lockBoard = false;
    moveDisplay.innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    if (winVideo) {
        winVideo.pause();
        winVideo.currentTime = 0;
    }
    
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i === 3 || i === 30 || i === 40) continue; 
        images.push(`${i}.png`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `
            <div class="front-face"><img src="img/${name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
            <div class="back-face"></div>`;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('flip') || this.classList.contains('matched')) return;
    
    if (bgMusic.paused) bgMusic.play().catch(()=>{});
    
    this.classList.add('flip');
    if (sfx.flip) { sfx.flip.currentTime = 0; sfx.flip.play(); }
    
    if (!hasFlipped) { 
        hasFlipped = true; 
        firstCard = this; 
        return; 
    }
    
    secondCard = this;
    moves++;
    moveDisplay.innerText = moves;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.id === secondCard.dataset.id) {
        matches++;
        if (sfx.match) { sfx.match.currentTime = 0; sfx.match.play(); }
        
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        if (matches === pairsCount) handleWin();
        resetTurn();
    } else {
        lockBoard = true; 
        if (sfx.mismatch) { sfx.mismatch.currentTime = 0; sfx.mismatch.play(); }
        
        firstCard.classList.add('shake');
        secondCard.classList.add('shake');
        
        setTimeout(() => {
            firstCard.classList.remove('shake', 'flip');
            secondCard.classList.remove('shake', 'flip');
            resetTurn();
        }, 1000);
    }
}

function handleWin() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    // Check permanent memory for the last played video (Defaults to '2' so '1' plays first)
    let lastPlayed = localStorage.getItem('lastWinVideo') || '2';
    let nextToPlay = lastPlayed === '1' ? '2' : '1';
    
    // Save the new video back to memory immediately
    localStorage.setItem('lastWinVideo', nextToPlay);

    const currentBest = localStorage.getItem('memoryGameBest');
    if (!currentBest || moves < parseInt(currentBest)) {
        localStorage.setItem('memoryGameBest', moves);
        bestDisplay.innerText = moves;
    }
    
    setTimeout(() => { 
        document.getElementById('win-modal').style.display = 'flex'; 
        bgMusic.pause();
        
        if (winVideo) {
            // Assign the video source right before it plays
            winVideo.src = `video/win${nextToPlay}.mp4`;
            winVideo.load();
            winVideo.play().catch(e => console.log("Video autoplay blocked by browser"));
        }
    }, 600);
}

function resetTurn() { 
    hasFlipped = false; 
    lockBoard = false; 
    firstCard = null; 
    secondCard = null; 
}

function toggleAudioModal() {
    const modal = document.getElementById('audio-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

function toggleMute() {
    audioState.muted = !audioState.muted;
    document.getElementById('mute-btn').innerText = audioState.muted ? 'Mute: ON' : 'Mute: OFF';
    applyVolumes();
}

let timer = 5;
const countdown = setInterval(() => {
    timer--;
    const countEl = document.getElementById('count-num');
    if (countEl) countEl.innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        const timerText = document.getElementById('timer-text');
        if (timerText) timerText.style.display = 'none';
        
        const startBtnElem = document.getElementById('start-btn');
        if (startBtnElem) {
            startBtnElem.style.display = 'inline-block';
        } else {
            document.getElementById('intro-overlay').style.display = 'none';
            initGame();
        }
    }
}, 1000);

startBtn.addEventListener('click', () => {
    document.getElementById('intro-overlay').style.display = 'none';
    applyVolumes();
    bgMusic.play().catch(() => {});
    initGame();
});

document.getElementById('bg-music-slider').addEventListener('input', (e) => { audioState.bg = e.target.value; applyVolumes(); });
document.getElementById('sfx-slider').addEventListener('input', (e) => { audioState.sfx = e.target.value; applyVolumes(); });
document.getElementById('new-game-btn').addEventListener('click', initGame);
document.getElementById('play-again-btn').addEventListener('click', initGame);
