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
        this.blurCtx.begi
        /* Tainted canvas can not get pixel data on cross origin image (from cdn.playbuzz.com to stackoverflow.com)
        var img = document.createElement("img");
        img.src = ctx.canvas.toDataURL();
        img.addEventListener("load", () => {
              show_img_here.appendChild(img);
        }, {once: true});
         nPath();*/

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
  
  render(player, projectiles, mouseX, mouseY, imgsrc) {
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bgImg = new Image();
    this.bgImg.src = '/assets/' + imgsrc;
    // Draw background first if loaded
    this.ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
    
    // Add overlay effect
    this.ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
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

    // Draw projectiles
    //console.log(projectiles);
    projectiles.forEach(proj => {
      
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      const bounceColor = 255 - (proj.bounces * 60);
      this.ctx.fillStyle = `rgb(255, ${bounceColor}, ${bounceColor})`;
      this.ctx.fill();
    });
  }
}