const cards = document.querySelectorAll('.memory-card');
const bgMusic = document.getElementById('bg-music');
const flipSound = document.getElementById('sound-flip');
const matchSound = document.getElementById('sound-match');
const mismatchSound = document.getElementById('sound-mismatch');

let hasFlippedCard = false, lockBoard = false, firstCard, secondCard;
let moves = 0, matchedPairs = 0, timerStarted = false, seconds = 0, timerInterval, currentScore = 1000;

window.addEventListener('load', runIntroSequence);

function runIntroSequence() {
  const intro = document.getElementById('intro-overlay'), welcome = document.getElementById('welcome-content');
  const instructions = document.getElementById('instructions-content'), countDisplay = document.getElementById('count-num');
  const board = document.getElementById('game-board'), header = document.querySelector('.game-header');

  board.style.visibility = 'hidden';
  header.style.visibility = 'hidden';

  let countdown = 6;
  const introInterval = setInterval(() => {
    countdown--;
    countDisplay.innerText = countdown;
    if (countdown === 3) { welcome.style.display = 'none'; instructions.style.display = 'block'; }
    if (countdown <= 0) {
      clearInterval(introInterval);
      intro.style.display = 'none';
      board.style.visibility = 'visible';
      header.style.visibility = 'visible';
    }
  }, 1000);
}

function flipCard() {
  if (lockBoard || this === firstCard) return;
  if (!timerStarted) { bgMusic.play().catch(() => {}); startTimer(); timerStarted = true; }
  if (flipSound) { flipSound.currentTime = 0; flipSound.play(); }
  this.classList.add('flip');
  if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; }
  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
  moves++;
  document.getElementById('move-counter').innerText = moves;
}

function disableCards() {
  setTimeout(() => { if (matchSound) matchSound.play(); }, 300);
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchedPairs++;
  if (matchedPairs === 12) setTimeout(showWinScreen, 1500);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    if (mismatchSound) mismatchSound.play();
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 1000);
}

function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }

function showWinScreen() {
  clearInterval(timerInterval);
  fireConfetti();
  setTimeout(() => {
    const winModal = document.getElementById('win-modal');
    winModal.style.display = 'flex';
    document.getElementById('final-stats-text').innerHTML = `Challenge completed in <b>${moves} moves</b> and <b>${seconds} seconds</b>.`;
    document.getElementById('final-score-big').innerText = `Score: ${currentScore}`;
  }, 500);
}

function fireConfetti() {
  const duration = 3000, end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 10001 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 10001 });
    if (Date.now() < end) requestAnimationFrame(frame);
  }());
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    let m = Math.floor(seconds / 60).toString().padStart(2, '0'), s = (seconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;
    currentScore = Math.max(100, 1000 - (moves * 10) - (seconds * 2));
    document.getElementById('score-display').innerText = currentScore;
  }, 1000);
}

function resetGame() { location.reload(); }
function shuffle() { cards.forEach(c => c.style.order = Math.floor(Math.random() * 24)); }
shuffle();
cards.forEach(c => c.addEventListener('click', flipCard));
