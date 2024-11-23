// constants.js
export const CANVAS = {
  WIDTH: 600,
  HEIGHT: 600
};

export const PLAYER = {
  RADIUS: 20,
  SPEED: 1,
  MAX_SPEED: 5,
  FRICTION: 0.96,
  INVULNERABLE_TIME: 1000,
  DASH_COOLDOWN: 2000,
  DASH_DISTANCE: 100,
  DASH_DURATION: 200,
};

export const PROJECTILE = {
  SPEED: 5,
  MAX_BOUNCES: 10,
  RADIUS: 5
};

export const BULLETS_LIMITER = 5;

export const COIN = {
  RADIUS: 8,
  COLORS: {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700'
  }
};