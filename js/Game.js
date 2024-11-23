import { Player } from './Player.js';
import { Projectile } from './Projectile.js';
import { Renderer } from './Renderer.js';
import { checkCollision } from './utils.js';
import { Rooms, startIndex, checkDoorCollision } from './Rooms.js';
import { Music } from './Music.js';
import { EnemyFactory } from './Enemy.js';
import { CANVAS, BULLETS_LIMITER } from './constants.js';
import { Coin } from './Coin.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.blurCanvas = document.getElementById('blurCanvas');
    this.scoreElement = document.getElementById('score');
    this.moneyElement = document.getElementById('money')
    this.dashElement = document.getElementById('dash');
    this.bulletCooldown = 200
    this.lastBulletTime = Date.now();
    this.music = new Music();

    this.player = new Player(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
    this.renderer = new Renderer(this.canvas, this.blurCanvas);
    this.roomPosition = startIndex;

    this.hitCount = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
    };

    this.setup();
  }

  setup() {
    this.resizeCanvas();
    this.setupEventListeners();

    this.music.init();
    this.setupMusicControls();

    this.gameLoop();
  }

  setupMusicControls() {
    // Optional: Add music controls with 'M' key to mute/unmute
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'm') {
        if (this.music.currentAudio.paused) {
          this.music.play();
        } else {
          this.music.stop();
        }
      }
    });

    // Start playing music on first click (many browsers require user interaction)
    window.addEventListener(
      'click',
      () => {
        this.music.play();
      },
      { once: true }
    );
  }

  resizeCanvas() {
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;
    this.blurCanvas.width = CANVAS.WIDTH;
    this.blurCanvas.height = CANVAS.HEIGHT;

    [this.canvas, this.blurCanvas].forEach((canvas) => {
      canvas.style.position = 'absolute';
      canvas.style.left = '50%';
      canvas.style.top = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      //canvas.style.backgroundImage = "url('/assets/rooms/room1.png')";
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = false;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', (e) => {
      const currentTime = Date.now();
      //console.log(currentTime);
      if ((currentTime - this.lastBulletTime) >= this.bulletCooldown) {
        // Check if enough time has passed since the last bullet was fired
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        const angle = Math.atan2(canvasY - this.player.y, canvasX - this.player.x);
        this.getCurrentRoom().projectiles.push(new Projectile(this.player.x, this.player.y, angle, 35));

        this.lastBulletTime = currentTime; // Update the last bullet firing time
      }
    });
  }

  handleCollision() {
    console.log(this.player.isInvulnerable);
    if (!this.player.isInvulnerable) {
      this.hitCount++;
      this.scoreElement.textContent = `Hits: ${this.hitCount}`;

      this.player.isInvulnerable = true;
      setTimeout(() => {
        this.player.isInvulnerable = false;
      }, this.player.invulnerableTime);
    }
  }

  checkDoor(door) {
    if ((door.type=='door') && door.open==1) {
      return true;
    }

    if (door.type=='door' && door.shotcount >= door.openreq) {
      console.log('UNLOCK')
      return true;
    }
    return false;
  }

  checkRooms() {
    //console.log(this.player.x, this.player.y);
    const midpoint = [this.canvas.width/2, this.canvas.height/2];
    //up
    if (this.player.y < 25 && this.player.x < 350 && this.player.x > 250 ) {
      //console.log(this.roomPosition[0]);
      let status = this.getCurrentRoom().travel.up
      let bool = this.checkDoor(status);

      status.open = bool;
      
      if (bool) {
        this.roomPosition[0] -= 1;
        this.player.y = 560
        this.player.x = 300
      }
    }
    //down
    if (this.player.y > 575 && this.player.x < 350 && this.player.x > 250 ) {
      //console.log(this.roomPosition[0]);
      let status = this.getCurrentRoom().travel.down
      let bool = this.checkDoor(status);

      status.open = bool;
      
      if (bool) {
        this.roomPosition[0] += 1;
        this.player.y = 40
        this.player.x = 300
      }
    }
    //right
    if (this.player.x > 575 && this.player.y < 350 && this.player.y > 250 ) {
      //console.log(this.roomPosition[0]);
      let status = this.getCurrentRoom().travel.right
      let bool = this.checkDoor(status);
      console.log(status)
      status.open = bool;
      
      if (bool) {
        this.roomPosition[1] += 1;
        this.player.x = 40
        this.player.y = 300
      }
    }
    //left
    if (this.player.x < 25 && this.player.y < 350 && this.player.y > 250 ) {
      //console.log(this.roomPosition[0]);
      let status = this.getCurrentRoom().travel.left
      let bool = this.checkDoor(status);

      status.open = bool;
      
      if (bool) {
        this.roomPosition[1] -= 1;
        this.player.x = 560
        this.player.y = 300
      }
    }
    
    this.canvas.width
  }

  update() {
    this.player.update(this.keys, this.mouseX, this.mouseY, this.dashElement);

    // Update enemies
    this.getCurrentRoom().enemies.forEach((enemy, index) => {
      if (enemy.isActive) {
        const enemyProjectile = enemy.update(this.player, Date.now());

        // If enemy fired a projectile, add it to projectiles array
        if (enemyProjectile) {
          this.getCurrentRoom().projectiles.push(enemyProjectile);
        }

        // Check collision with player
        if (enemy.checkCollision(this.player)) {
          this.handleCollision();
        }

        // Check collision with player's projectiles
        this.getCurrentRoom().projectiles.forEach((proj, projIndex) => {
          if (!proj.isEnemyProjectile && checkCollision(enemy, proj)) {
            enemy.takeDamage(20);
            this.getCurrentRoom().projectiles.splice(projIndex, 1);
            
            // Drop coin when enemy dies
            if (!enemy.isActive) {
              const coin = new Coin(enemy.x, enemy.y, enemy.coinDrop.value, enemy.coinDrop.type);
              this.getCurrentRoom().coins.push(coin);
              console.log('Created coin:', coin);
              console.log('Current room coins:', this.getCurrentRoom().coins);
            }
          }
        });
      } else {
        this.getCurrentRoom().enemies.splice(index, 1);
      }
    });

    // Update projectiles
    for (let i = this.getCurrentRoom().projectiles.length - 1; i >= 0; i--) {
      const proj = this.getCurrentRoom().projectiles[i];
      const shouldRemove = proj.update();

      if (shouldRemove) {
        this.getCurrentRoom().projectiles.splice(i, 1);
        continue;
      }

      if (checkCollision(this.player, proj)) {
        this.handleCollision();
        this.getCurrentRoom().projectiles.splice(i, 1);
      }

      let res = checkDoorCollision(proj);

      let copy = Rooms[this.roomPosition[0]][this.roomPosition[1]].travel

      switch (res) {
        case 'up':
          if (copy.up.open==0){
            this.getCurrentRoom().projectiles.splice(i, 1);
            Rooms[this.roomPosition[0]][this.roomPosition[1]].travel.up.shotcount += 1;
          }
          break;
        case 'down':
          if (copy.down.open==0){
            this.getCurrentRoom().projectiles.splice(i, 1);
            Rooms[this.roomPosition[0]][this.roomPosition[1]].travel.down.shotcount += 1;
          }
          break;
        case 'left':
          if (copy.left.open==0){
            this.getCurrentRoom().projectiles.splice(i, 1);
            Rooms[this.roomPosition[0]][this.roomPosition[1]].travel.left.shotcount += 1;
          }
          break;
        case 'right':
          if (copy.right.open==0){
            this.getCurrentRoom().projectiles.splice(i, 1);
            Rooms[this.roomPosition[0]][this.roomPosition[1]].travel.right.shotcount += 1;
          }
          break;
      }
    }

    // Check coin collection
    this.getCurrentRoom().coins = this.getCurrentRoom().coins.filter(coin => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - coin.x, 2) + 
        Math.pow(this.player.y - coin.y, 2)
      );
      
      if (distance < this.player.radius + coin.radius) {
        this.player.addMoney(coin.value);
        return false;
      }
      return true;
    });

    this.checkRooms();
  }

  gameLoop() {
    this.update();
    //console.log(this.getCurrentRoom().projectiles);

    this.renderer.render(this.player,
                         this.getCurrentRoom(),
                         this.mouseX,
                         this.mouseY,
                        ); // Add enemies to render

    requestAnimationFrame(() => this.gameLoop());
  }

  getCurrentRoom() {
    return Rooms[this.roomPosition[0]][this.roomPosition[1]];
  }
}
