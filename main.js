const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    let hitCount = 0;

    function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    dx: 0,
    dy: 0,
    isInvulnerable: false,
    invulnerableTime: 1000
    };

    const keys = {
    w: false,
    a: false,
    s: false,
    d: false
    };

    const projectiles = [];
    const projectileSpeed = 10;
    const maxBounces = 3;
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
        canHurt: false,  // Start as non-hurting
        createdAt: Date.now() // Track creation time
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

    function updatePlayerPosition() {
    player.dx = 0;
    player.dy = 0;

    if (keys.w) player.dy -= player.speed;
    if (keys.s) player.dy += player.speed;
    if (keys.a) player.dx -= player.speed;
    if (keys.d) player.dx += player.speed;

    if (player.dx !== 0 && player.dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        player.dx *= factor;
        player.dy *= factor;
    }

    player.x += player.dx;
    player.y += player.dy;

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    }

    function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updatePlayerPosition();

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.isInvulnerable ? 
        (Math.floor(Date.now() / 100) % 2 === 0 ? '#4488ff' : '#ff4444') : 
        '#4488ff';
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
        
        // Enable collision after projectile has traveled away from player
        if (!proj.canHurt && Date.now() - proj.createdAt > 100) {
        proj.canHurt = true;
        }

        proj.x += proj.dx;
        proj.y += proj.dy;

        // Only check collision if projectile can hurt
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