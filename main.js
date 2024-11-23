const canvas = document.getElementById('gameCanvas');
const blurCanvas = document.getElementById('blurCanvas');
const ctx = canvas.getContext('2d');
const blurCtx = blurCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const dashElement = document.getElementById('dash');
let hitCount = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  blurCanvas.width = window.innerWidth;
  blurCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  speed: 5,
  maxSpeed: 5,
  friction: 0.85,
  dx: 0,
  dy: 0,
  isInvulnerable: false,
  invulnerableTime: 1000,
  canDash: true,
  isDashing: false,
  dashCooldown: 2000,
  dashPower: 100,
  dashDuration: 200,
  trailPositions: []
};

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false
};

const projectiles = [];
const projectileSpeed = 4;
const maxBounces = 100;
let mouseX = 0;
let mouseY = 0;

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() in keys) {
    keys[e.key.toLowerCase()] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() in keys) {
    keys[e.key.toLowerCase()] = false;
  }
});

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

canvas.addEventListener('click', (e) => {
  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  projectiles.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * projectileSpeed,
    dy: Math.sin(angle) * projectileSpeed,
    radius: 5,
    bounces: 0,
    canHurt: false,
    createdAt: Date.now()
  });
});

function checkCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
}

function handleCollision() {
  if (!player.isInvulnerable) {
    hitCount++;
    scoreElement.textContent = `Hits: ${hitCount}`;

    player.isInvulnerable = true;
    setTimeout(() => {
      player.isInvulnerable = false;
    }, player.invulnerableTime);
  }
}

function handleDash() {
  if (player.canDash && keys.shift) {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    player.dx = Math.cos(angle) * player.dashPower;
    player.dy = Math.sin(angle) * player.dashPower;

    player.canDash = false;
    player.isDashing = true;
    dashElement.textContent = "Dash Cooling...";

    setTimeout(() => {
      player.isDashing = false;
    }, player.dashDuration);

    setTimeout(() => {
      player.canDash = true;
      dashElement.textContent = "Dash Ready!";
    }, player.dashCooldown);
  }
}

function updatePlayerPosition() {
  // Store position for trail
  player.trailPositions.unshift({ x: player.x, y: player.y });
  if (player.trailPositions.length > 5) {
    player.trailPositions.pop();
  }

  let moveX = 0;
  let moveY = 0;

  if (keys.w) moveY -= 1;
  if (keys.s) moveY += 1;
  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;

  if (moveX !== 0 && moveY !== 0) {
    const length = Math.sqrt(moveX * moveX + moveY * moveY);
    moveX /= length;
    moveY /= length;
  }

  player.dx += moveX * player.speed;
  player.dy += moveY * player.speed;

  handleDash();

  const currentSpeed = Math.sqrt(player.dx * player.dx + player.dy * player.dy);
  if (currentSpeed > player.maxSpeed && !player.isDashing) {
    const ratio = player.maxSpeed / currentSpeed;
    player.dx *= ratio;
    player.dy *= ratio;
  }

  player.dx *= player.friction;
  player.dy *= player.friction;

  player.x += player.dx;
  player.y += player.dy;

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  if (Math.abs(player.dx) < 0.01) player.dx = 0;
  if (Math.abs(player.dy) < 0.01) player.dy = 0;
}

function drawMotionBlur() {
  blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);

  if (player.isDashing || Math.abs(player.dx) > 3 || Math.abs(player.dy) > 3) {
    player.trailPositions.forEach((pos, index) => {
      const alpha = (1 - index / player.trailPositions.length) * 0.2;
      blurCtx.beginPath();
      blurCtx.arc(pos.x, pos.y, player.radius, 0, Math.PI * 2);
      blurCtx.fillStyle = `rgba(68, 136, 255, ${alpha})`;
      blurCtx.fill();
    });
  }
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePlayerPosition();
  drawMotionBlur();

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);

  if (player.isDashing) {
    ctx.fillStyle = Math.floor(Date.now() / 50) % 2 === 0 ? '#4488ff' : '#66aaff';
  } else if (player.isInvulnerable) {
    ctx.fillStyle = Math.floor(Date.now() / 100) % 2 === 0 ? '#4488ff' : '#ff4444';
  } else {
    ctx.fillStyle = '#4488ff';
  }
  ctx.fill();

  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  const arrowLength = 40;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(
    player.x + Math.cos(angle) * arrowLength,
    player.y + Math.sin(angle) * arrowLength
  );
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    if (!proj.canHurt && Date.now() - proj.createdAt > 100) {
      proj.canHurt = true;
    }

    proj.x += proj.dx;
    proj.y += proj.dy;

    if (proj.canHurt && checkCollision(player, proj)) {
      handleCollision();
      projectiles.splice(i, 1);
      continue;
    }

    if (proj.x - proj.radius < 0) {
      proj.x = proj.radius;
      proj.dx = Math.abs(proj.dx);
      proj.bounces++;
    }
    if (proj.x + proj.radius > canvas.width) {
      proj.x = canvas.width - proj.radius;
      proj.dx = -Math.abs(proj.dx);
      proj.bounces++;
    }
    if (proj.y - proj.radius < 0) {
      proj.y = proj.radius;
      proj.dy = Math.abs(proj.dy);
      proj.bounces++;
    }
    if (proj.y + proj.radius > canvas.height) {
      proj.y = canvas.height - proj.radius;
      proj.dy = -Math.abs(proj.dy);
      proj.bounces++;
    }

    if (proj.bounces >= maxBounces) {
      projectiles.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    const bounceColor = 255 - (proj.bounces * 60);
    ctx.fillStyle = `rgb(255, ${bounceColor}, ${bounceColor})`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();
