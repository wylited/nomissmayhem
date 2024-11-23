export class Renderer {
  constructor(canvas, blurCanvas) {
    this.canvas = canvas;
    this.blurCanvas = blurCanvas;
    this.ctx = canvas.getContext('2d');
    this.blurCtx = blurCanvas.getContext('2d');
  }

  drawBackground() {
    this.bgImg = new Image();
    this.bgImg.src = "/assets/rooms/room1.png";
  // Draw the background image scaled to fit the canvas
    this.ctx.drawImage(
      this.bgImg,
      600,
      600,
      this.canvas.width,
      this.canvas.height
    );
    
  }

  drawMotionBlur(player) {
    this.blurCtx.clearRect(0, 0, this.blurCanvas.width, this.blurCanvas.height);

    if (player.isDashing) {
      const startX = player.trailPositions[player.trailPositions.length - 1]?.x || player.x;
      const startY = player.trailPositions[player.trailPositions.length - 1]?.y || player.y;
      const gradient = this.blurCtx.createLinearGradient(startX, startY, player.x, player.y);

      gradient.addColorStop(0, 'rgba(68, 136, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(68, 136, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(68, 136, 255, 0.6)');

      this.blurCtx.beginPath();
      this.blurCtx.moveTo(startX, startY);

      if (player.trailPositions.length > 1) {
        for (let i = player.trailPositions.length - 2; i >= 0; i--) {
          const pos = player.trailPositions[i];
          this.blurCtx.lineTo(pos.x, pos.y);
        }
      }

      this.blurCtx.lineTo(player.x, player.y);
      this.blurCtx.lineWidth = player.radius * 2;
      this.blurCtx.strokeStyle = gradient;
      this.blurCtx.lineCap = 'round';
      this.blurCtx.lineJoin = 'round';
      this.blurCtx.stroke();

      player.trailPositions.forEach((pos, index) => {
        const alpha = (1 - index / player.trailPositions.length) * 0.4;
        this.blurCtx.beginPath();

        this.blurCtx.arc(pos.x, pos.y, player.radius * 1.2, 0, Math.PI * 2);
        this.blurCtx.fillStyle = `rgba(68, 136, 255, ${alpha})`;
        this.blurCtx.fill();
      });
    } else if (Math.abs(player.dx) > 3 || Math.abs(player.dy) > 3) {
      player.trailPositions.forEach((pos, index) => {
        const alpha = (1 - index / player.trailPositions.length) * 0.2;
        this.blurCtx.beginPath();
        this.blurCtx.arc(pos.x, pos.y, player.radius, 0, Math.PI * 2);
        this.blurCtx.fillStyle = `rgba(68, 136, 255, ${alpha})`;
        this.blurCtx.fill();
      });
    }
  }

  render(player, room, mouseX, mouseY) {
    let enemies = room.enemies;
    let projectiles = room.projectiles;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bgImg = new Image();
    this.bgImg.src = '/assets' + room.background;

    // Draw background first if loaded
    this.ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);

    // Add overlay effect
    this.ctx.fillStyle = "rgba(200, 0.5, 0.5, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawMotionBlur(player);

    // Draw player
    this.ctx.beginPath();
    this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);

    if (player.isDashing) {
      this.ctx.fillStyle = Math.floor(Date.now() / 50) % 2 === 0 ? '#4488ff' : '#66aaff';
    } else if (player.isInvulnerable) {
      this.ctx.fillStyle = Math.floor(Date.now() / 100) % 2 === 0 ? '#4488ff' : '#ff4444';
    } else {
      this.ctx.fillStyle = '#4488ff';
    }
    this.ctx.fill();

    // Draw direction arrow
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    const arrowLength = 40;
    this.ctx.beginPath();
    this.ctx.moveTo(player.x, player.y);
    this.ctx.lineTo(
      player.x + Math.cos(angle) * arrowLength,
      player.y + Math.sin(angle) * arrowLength
    );
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Add null check for enemies
    if (enemies && enemies.length > 0) {
      enemies.forEach(enemy => {
        if (enemy.isActive) {
          this.ctx.beginPath();
          this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = enemy.color;
          this.ctx.fill();
          this.ctx.closePath();

          // Draw health bar
          this.ctx.fillStyle = 'red';
          this.ctx.fillRect(enemy.x - 25, enemy.y - enemy.radius - 10, 50, 5);
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(enemy.x - 25, enemy.y - enemy.radius - 10, (enemy.health / 100) * 50, 5);
        }
      });
    }

    // Add null check for projectiles
    if (projectiles && projectiles.length > 0) {
      projectiles.forEach(proj => {
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        const bounceColor = 255 - (proj.bounces * 60);
        this.ctx.fillStyle = `rgb(255, ${bounceColor}, ${bounceColor})`;
        this.ctx.fill();
      });
    }

    // Draw coins with debug logging
    if (room.coins && room.coins.length > 0) {
        room.coins.forEach(coin => {
            this.ctx.beginPath();
            this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = coin.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    // render cards in shop
    if (room.type=="shop") {
      this.ctx.fillStyle = '#4a4a4a';
      this.ctx.fillRect(180, 35, 100, 150);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Item', 230, 80);
    
      // Second card
      this.ctx.fillStyle = '#4a4a4a';
      this.ctx.fillRect(320, 35, 100, 150);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Item', 370, 80);
    }

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'red'; // door colour
    if (room.travel.up.type=='door') {
      if (room.travel.up.openreq > room.travel.up.shotcount) {
        this.ctx.fillStyle = 'red'; 
      } else {
        this.ctx.fillStyle = 'green'; 
      }
      this.ctx.fillRect(260, 0, 80, 20);
    }
    if (room.travel.down.type=='door') {
      if (room.travel.down.openreq > room.travel.down.shotcount) {
        this.ctx.fillStyle = 'red'; 
      } else {
        this.ctx.fillStyle = 'green'; 
      }
      this.ctx.fillRect(260, 580, 80, 20);
    }
    if (room.travel.left.type=='door') {
      if (room.travel.left.openreq > room.travel.left.shotcount) {
        this.ctx.fillStyle = 'red'; 
      } else {
        this.ctx.fillStyle = 'green'; 
      }
      this.ctx.fillRect(0, 260, 20, 80);
    }
    if (room.travel.right.type=='door') {
      if (room.travel.right.openreq > room.travel.right.shotcount) {
        this.ctx.fillStyle = 'red'; 
      } else {
        this.ctx.fillStyle = 'green'; 
      }
      this.ctx.fillRect(580, 260, 20, 80);
    }
  }
}
