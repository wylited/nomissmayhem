// Projectile.js
import { CANVAS, PROJECTILE } from './constants.js';

export class Projectile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * PROJECTILE.SPEED;
    this.dy = Math.sin(angle) * PROJECTILE.SPEED;
    this.radius = PROJECTILE.RADIUS;
    this.bounces = 0;
    this.canHurt = false;
    this.createdAt = Date.now();
  }

  update() {
    if (!this.canHurt && Date.now() - this.createdAt > 100) {
      this.canHurt = true;
    }

    this.x += this.dx;
    this.y += this.dy;

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx = Math.abs(this.dx);
      this.bounces++;
    }
    if (this.x + this.radius > CANVAS.WIDTH) {
      this.x = CANVAS.WIDTH - this.radius;
      this.dx = -Math.abs(this.dx);
      this.bounces++;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = Math.abs(this.dy);
      this.bounces++;
    }
    if (this.y + this.radius > CANVAS.HEIGHT) {
      this.y = CANVAS.HEIGHT - this.radius;
      this.dy = -Math.abs(this.dy);
      this.bounces++;
    }

    return this.bounces >= PROJECTILE.MAX_BOUNCES;
  }
}
