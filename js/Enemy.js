// Enemy.js
import { CANVAS } from './constants.js';
import { Projectile } from './Projectile.js';

// Base Enemy class
export class Enemy {
    constructor(x, y, radius = 20) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = 2;
        this.health = 100;
        this.type = 'regular';
        this.isActive = true;
        this.color = '#ff0000';
        this.minDistanceFromPlayer = this.radius * 2; // Minimum distance to maintain from player
    }

    update(player) {
        if (!this.isActive) return;

        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Only move if we're further than the minimum distance
        if (distance > this.minDistanceFromPlayer) {
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        } else if (distance < this.minDistanceFromPlayer - 5) {
            // Move away if too close
            this.x -= Math.cos(angle) * this.speed;
            this.y -= Math.sin(angle) * this.speed;
        }

        // Keep enemy within canvas bounds
        this.x = Math.max(this.radius, Math.min(CANVAS.WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CANVAS.HEIGHT - this.radius, this.y));
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isActive = false;
        }
    }

    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + player.radius;
    }
}

// Shielded Enemy
export class ShieldedEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.type = 'shielded';
        this.color = '#00ff00';
        this.shieldActive = true;
        this.shieldAngle = 0; // Shield facing angle
        this.shieldArc = Math.PI / 2; // Shield covers 90 degrees
    }

    update(player) {
        super.update(player);
        // Update shield angle to face player
        this.shieldAngle = Math.atan2(player.y - this.y, player.x - this.x);
    }

    checkBulletCollision(projectile) {
        // Implement shield logic here
        // Return true if bullet should bounce, false if it should hit
    }
}

// Reflector Enemy
export class ReflectorEnemy extends ShieldedEnemy {
    constructor(x, y) {
        super(x, y);
        this.type = 'reflector';
        this.color = '#0000ff';
    }

    reflectBullet(projectile) {
        // Implement bullet reflection logic
        return new Projectile(this.x, this.y, Math.PI + projectile.angle, projectile.speed);
    }
}

// Attacker Enemy
export class AttackerEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.type = 'attacker';
        this.color = '#ff00ff';
        this.attackCooldown = 2000; // ms
        this.lastAttack = 0;
        this.minDistanceFromPlayer = this.radius * 12; // Increased distance for attacker
        this.projectileSpeed = 8; // Projectile speed
    }

    update(player, gameTime) {
        super.update(player);

        // Attack logic
        if (gameTime - this.lastAttack >= this.attackCooldown) {
            this.lastAttack = gameTime;
            return this.attack(player);
        }
        return null;
    }

    attack(player) {
        // Calculate angle to player for accurate shooting
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const projectile = new Projectile(this.x, this.y, angle, this.projectileSpeed);
        projectile.isEnemyProjectile = true; // Mark as enemy projectile
        return projectile;
    }
}

// Laser Enemy
export class LaserEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.type = 'laser';
        this.color = '#ffff00';
        this.isCharging = false;
        this.chargeTime = 1000; // ms
        this.chargeStart = 0;
        this.laserWidth = 5;
    }

    update(player, gameTime) {
        if (!this.isCharging) {
            this.startCharging(gameTime);
        } else if (gameTime - this.chargeStart >= this.chargeTime) {
            return this.fireLaser(player);
        }
        return null;
    }

    startCharging(gameTime) {
        this.isCharging = true;
        this.chargeStart = gameTime;
    }

    fireLaser(player) {
        // Implement laser firing logic
        this.isCharging = false;
        // Return laser object or effect
    }
}

// Enemy Factory
export class EnemyFactory {
    static createEnemy(type, x, y) {
        switch(type.toLowerCase()) {
            case 'regular':
                return new Enemy(x, y);
            case 'shielded':
                return new ShieldedEnemy(x, y);
            case 'reflector':
                return new ReflectorEnemy(x, y);
            case 'attacker':
                return new AttackerEnemy(x, y);
            case 'laser':
                return new LaserEnemy(x, y);
            default:
                return new Enemy(x, y);
        }
    }
}
