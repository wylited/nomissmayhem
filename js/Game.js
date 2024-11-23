import { Player } from './Player.js';
import { Projectile } from './Projectile.js';
import { Renderer } from './Renderer.js';
import { checkCollision } from './utils.js';
import { Music } from './Music.js';
import { EnemyFactory } from './Enemy.js';
import { CANVAS, BULLETS_LIMITER } from './constants.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.blurCanvas = document.getElementById('blurCanvas');
    this.scoreElement = document.getElementById('score');
    this.dashElement = document.getElementById('dash');

    this.music = new Music();

    this.player = new Player(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
    this.enemies = [];
    this.projectiles = [];
    this.renderer = new Renderer(this.canvas, this.blurCanvas);
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

    this.lastBulletTime = 0; // Track last bullet firing time
    this.bulletCooldown = 1000 / BULLETS_LIMITER; // Cooldown in milliseconds based on bullets per second

    this.enemies.push(EnemyFactory.createEnemy('regular', CANVAS.WIDTH / 2 + 50, CANVAS.HEIGHT / 2 + 50));
    this.enemies.push(EnemyFactory.createEnemy('attacker', CANVAS.WIDTH / 2 - 50, CANVAS.HEIGHT / 2 - 50));

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
      if (currentTime - this.lastBulletTime >= this.bulletCooldown) {
        // Check if enough time has passed since the last bullet was fired
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        const angle = Math.atan2(canvasY - this.player.y, canvasX - this.player.x);
        this.projectiles.push(new Projectile(this.player.x, this.player.y, angle, 35));

        this.lastBulletTime = currentTime; // Update the last bullet firing time
      }
    });
  }

  handleCollision() {
    if (!this.player.isInvulnerable) {
      this.hitCount++;
      this.scoreElement.textContent = `Hits: ${this.hitCount}`;

      this.player.isInvulnerable = true;
      setTimeout(() => {
        this.player.isInvulnerable = false;
      }, this.player.invulnerableTime);
    }
  }

    update() {
        this.player.update(this.keys, this.mouseX, this.mouseY, this.dashElement);

        // Update enemies
        this.enemies.forEach((enemy, index) => {
            if (enemy.isActive) {
                const enemyProjectile = enemy.update(this.player, Date.now());

                // If enemy fired a projectile, add it to projectiles array
                if (enemyProjectile) {
                    this.projectiles.push(enemyProjectile);
                }

                // Check collision with player
                if (enemy.checkCollision(this.player)) {
                    this.handleCollision();
                }

                // Check collision with player's projectiles
                this.projectiles.forEach((proj, projIndex) => {
                    if (!proj.isEnemyProjectile && checkCollision(enemy, proj)) {
                        enemy.takeDamage(20);
                        this.projectiles.splice(projIndex, 1);
                    }
                });
            } else {
                this.enemies.splice(index, 1);
            }
        });

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            const shouldRemove = proj.update();

            if (shouldRemove) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Only check player collision with enemy projectiles
            if (proj.isEnemyProjectile && checkCollision(this.player, proj)) {
                this.handleCollision();
                this.projectiles.splice(i, 1);
            }
        }
    }

  gameLoop() {
    this.update();
    this.renderer.render(this.player, this.projectiles, this.mouseX, this.mouseY, this.enemies); // Add enemies to render
    requestAnimationFrame(() => this.gameLoop());
  }
}
