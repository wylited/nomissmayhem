// Room.js

import { EnemyFactory } from './Enemy.js'


const startRoom = {
    background: "/rooms/room1.png",
    travel: {
        up: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
    },
    enemies: [
    ],
    projectiles: [],
    coins: [],
    keys: [],
};

const emptyRoom = {
    background: "/rooms/room2.png",
    travel: {
        up: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        down: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        right: { type: "door", open: 0, openreq: 10, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('regular', 150, 100, 'keyer', true),
        EnemyFactory.createEnemy('attacker', 250, 200, 'keyless'),
    ],
    projectiles: [],
    coins: [],
    keys: [],
};

const testRoom = {
    background: "/rooms/room3.png",
    travel: {
        up: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
        left: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 0, openreq: 0, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('regular', 150, 100),
    ],
    projectiles: [],
    coins: [],
    keys: [],
};

export const startIndex = [1, 0];

export const Rooms = [
    [emptyRoom, testRoom],
    [startRoom],
];

export function checkDoorCollision(proj) {
    let x = proj.x;
    let y = proj.y;
    //260 -> 340, 20 tall

    if (x > 258 && x < 342) {
        if (y < 22) {
            return 'up'
        }
        if (y > 578) {
            return 'down'
        }
    }

    if (y > 258 && y < 342) {
        if (x < 22) {
            return 'left'
        }
        if (x > 578) {
            return 'right'
        }
    }
}
