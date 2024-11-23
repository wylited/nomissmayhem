// Room.js

import { EnemyFactory } from './Enemy.js'


const startRoom = {
    background: "/rooms/room1.png",
    travel: {
        up: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
    ],
    projectiles: [],
    coins: [],
};

const emptyRoom = {
    background: "/rooms/room2.png",
    travel: {
        up: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('regular', 150, 100),
        EnemyFactory.createEnemy('attacker', 250, 200),
    ],
    projectiles: [],
    coins: [],
};

export const startIndex = [1, 0];

export const Rooms = [
    [emptyRoom],
    [startRoom],
];
