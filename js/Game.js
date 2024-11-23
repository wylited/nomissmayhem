// Game.js
import { CANVAS } from './constants.js';
import { Player } from './Player.js';
import { Projectile } from './Projectile.js';
import { Renderer } from './Renderer.js';
import { checkCollision } from './utils.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.blurCanvas = document.getElementById('blurCanvas');
    this.dashElement = document.getElementById('dash');

    this.player = new Player(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
    this.renderer = new Renderer(this.canvas, this.blurCanvas);
    this.projectiles = [];
    this.hitCount = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false
    };

    this.setup();
  }

  setup() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.gameLoop();
  }

  resizeCanvas() {
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;
    this.blurCanvas.width = CANVAS.WIDTH;
    this.blurCanvas.height = CANVAS.HEIGHT;

    [this.canvas, this.blurCanvas].forEach(canvas => {
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
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const angle = Math.atan2(canvasY - this.player.y, canvasX - this.player.x);
      this.projectiles.push(new Projectile(this.player.x, this.player.y, angle));
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

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const shouldRemove = proj.update();

      if (shouldRemove) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (proj.canHurt && checkCollision(this.player, proj)) {
        this.handleCollision();
        this.projectiles.splice(i, 1);
      }
    }
  }

  gameLoop() {
    this.update();
    this.renderer.render(this.player, this.projectiles, this.mouseX, this.mouseY);
    requestAnimationFrame(() => this.gameLoop());
  }
}
