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
let character, pipes, frame, score;

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

// Start game
function startGame() {
  splash.style.display = 'none';
  canvas.style.display = 'block';
  hud.style.display = 'flex';
  gameStarted = true;
  cancelAnimationFrame(animationId);
  initGame();
  gameLoop();
}

// Player image
const playerImg = new Image();
playerImg.src = 'santa-sanvi.png';

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
  const gap = canvas.height * 0.45;
  const topHeight = Math.random() * (canvas.height - gap - 200) + 100;
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + gap, width: 100 });
}

function drawPipes() {
  ctx.fillStyle = '#c40000';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
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
  if (character.y + character.height > canvas.height || character.y < 0) return true;
  return pipes.some(pipe =>
    character.x + character.width > pipe.x &&
    character.x < pipe.x + pipe.width &&
    (character.y < pipe.top || character.y + character.height > pipe.bottom)
  );
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
    gameOver = true;
    cancelAnimationFrame(animationId);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('🎅 Game Over 🎄', canvas.width / 2, canvas.height / 2);
    gameOverBtn.style.display = 'block';
    return;
  }

  // HUD update
  scoreDisplay.textContent = `Score: ${score}`;
  frame++;
}

// Controls
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && !gameOver) character.velocity = character.lift;
});
canvas.addEventListener('click', () => {
  if (!gameOver) character.velocity = character.lift;
});

// Restart
startBtn.addEventListener('click', startGame);
gameOverBtn.addEventListener('click', () => window.location.reload());
