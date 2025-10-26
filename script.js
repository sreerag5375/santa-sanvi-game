const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const splash = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('score');
const gameOverBtn = document.getElementById('gameover-restart');

let animationId = null;
let gameStarted = false;
let gameOver = false;
let gameReady = false;
let character, pipes, frame, score;

// Player image
const playerImg = new Image();
playerImg.src = 'santa-sanvi.png';

const pipeImg = new Image();
pipeImg.src = 'pipe.png';

const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.4;

// Canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

// Init game
function initGame() {
  resizeCanvas();
  character = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    width: 120,
    height: 120,
    velocity: 0,
    gravity: 0.4,
    lift: -8
  };
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}



// Draw player
function drawCharacter() {
  const centerX = character.x + character.width / 2;
  const centerY = character.y + character.height / 2;
  const radius = character.width / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(playerImg, centerX - radius, centerY - radius, character.width, character.height);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Pipes
function createPipe() {
  const gap = canvas.height * 0.40;
  const topHeight = Math.random() * (canvas.height - gap - 200) + 100;
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + gap, width: 120 });
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Draw top pipe (flipped vertically)
    ctx.save();
    ctx.translate(pipe.x + pipe.width / 2, pipe.top);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipe.width / 2, 0, pipe.width, pipe.top);
    ctx.restore();

    // Draw bottom pipe
    ctx.drawImage(pipeImg, pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
  });
}


function updatePipes() {
  pipes.forEach(pipe => (pipe.x -= 3));
  if (pipes.length && pipes[0].x + pipes[0].width < 0) {
    pipes.shift();
    score++;
  }
}

function checkCollision() {
  const radius = character.width / 2;
  const centerX = character.x + radius;
  const centerY = character.y + radius;

  // Check if player hits top or bottom of screen
  if (centerY + radius > canvas.height || centerY - radius < 0) return true;

  // Slight tolerance to avoid early collision (tweakable)
  const tolerance = 10;

  return pipes.some(pipe => {
    const pipeLeft = pipe.x + tolerance;
    const pipeRight = pipe.x + pipe.width - tolerance;

    if (centerX + radius > pipeLeft && centerX - radius < pipeRight) {
      if (centerY - radius < pipe.top - tolerance || centerY + radius > pipe.bottom + tolerance) {
        return true;
      }
    }
    return false;
  });
}



// Game Loop
function gameLoop() {
  animationId = requestAnimationFrame(gameLoop);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Physics
  character.velocity += character.gravity;
  character.y += character.velocity;

  // Pipes
  if (frame % 100 === 0) createPipe();
  updatePipes();
  drawPipes();

  // Player
  drawCharacter();

  // Collision
  if (checkCollision()) {
    bgMusic.pause();
    bgMusic.currentTime = 0;

    // 📳 Vibrate on crash (mobile only)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 150]);
    }

    gameOver = true;
    cancelAnimationFrame(animationId);

    // Overlay background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText(' Game Over', canvas.width / 2, canvas.height / 2 - 40);

    // Final Score
    ctx.font = 'bold 40px Comic Sans MS';
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    // Show Restart Button
    gameOverBtn.style.display = 'block';
    return;
  }

  // HUD update
  scoreDisplay.textContent = `Score: ${score}`;
  frame++;
}

// Countdown before start
function startCountdown(callback) {
  const countdownNumbers = ['3', '2', '1', 'START!'];
  let index = 0;

  function showNext() {
    if (index < countdownNumbers.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 100px Comic Sans MS';
      ctx.textAlign = 'center';
      ctx.fillText(countdownNumbers[index], canvas.width / 2, canvas.height / 2);
      index++;
      setTimeout(showNext, 700);
    } else {
      callback();
    }
  }

  showNext();
}

// Start game (preload assets)
function startGame() {
  const loadingText = document.getElementById('loading-text');
  startBtn.disabled = true;
  startBtn.querySelector('.front').textContent = 'Loading...';
  loadingText.style.display = 'block';

  const assets = ['game-bg.png', 'santa-sanvi.png'];
  let loaded = 0;

  if ('vibrate' in navigator) {
    navigator.vibrate(40); // short gentle vibration
  }

  assets.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loaded++;
      if (loaded === assets.length) {
        splash.style.display = 'none';
        canvas.style.display = 'block';
        hud.style.display = 'flex';
        startBtn.disabled = false;
        startBtn.querySelector('.front').textContent = 'Start Game';
        loadingText.style.display = 'none';

        cancelAnimationFrame(animationId);
        initGame();

        // Show “Press to start” message
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK to Start 🎅', canvas.width / 2, canvas.height / 2);

        gameReady = true;

        // 🎵 Start background music safely
        bgMusic.play().catch(() => {
          document.addEventListener('click', () => bgMusic.play(), { once: true });
        });
      }
    };
  });
}


// Controls
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!gameStarted && gameReady) {
      gameStarted = true;
      startCountdown(() => gameLoop());
    } else if (!gameOver) {
      character.velocity = character.lift;
    }
  }
});

canvas.addEventListener('click', () => {
  if (!gameStarted && gameReady) {
    gameStarted = true;
    startCountdown(() => gameLoop());
  } else if (!gameOver) {
    character.velocity = character.lift;
  }
});

// Restart
startBtn.addEventListener('click', startGame);
gameOverBtn.addEventListener('click', () => window.location.reload());
