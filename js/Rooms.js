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
    keys: [],
    type: "regular",
    visited: 0
};

const emptyRoom = {
    background: "/rooms/room2.png",
    travel: {
        up: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "door", open: 0, openreq: 6, shotcount: 0 },
        right: { type: "wall", open: 0, openreq: 10, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('attacker', 150, 100, 'keyer', true),
        EnemyFactory.createEnemy('attacker', 250, 200, 'keyless'),
    ],
    projectiles: [],
    coins: [],
    keys: [],
    type: "regular",
    visited: 0
};

const testRoom = {
    background: "/rooms/room3.png",
    travel: {
        up: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('regular', 150, 100),
    ],
    projectiles: [],
    coins: [],
    keys: [],
    type: "regular",
    visited: 0
};

const shopRoom = {
    background: "/rooms/storetutorial.jpg",
    travel: {
        up: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "door", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        
    ],
    projectiles: [],
    coins: [],
    type: "shop",
    keys: [],
    powerUps: [['extraballs', 2, 'Extra Balls', 'Increases the speed at which you can fire!'], ['extrahealth', 1, 'Extra Health', 'Increases your maximum health!']],
    bought: [0, 0],
    visited: 0
};

const nullTile = {
    background: "/rooms/store.png",
    travel: {
        up: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        down: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        
    ],
    projectiles: [],
    coins: [],
    keys: [],
    type: "nullTile",
    visited: 0
};

const tutorialRoom = {
    background: "/rooms/tutorial1.jpg",
    travel: {
        up: { type: "door", open: 0, openreq: 3, shotcount: 0 },
        down: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        
    ],
    projectiles: [],
    coins: [],
    keys: [],
    type: "regular",
    visited: 1
};

const tutorialRoom2 = {
    background: "/rooms/tutorial2.jpg",
    travel: {
        up: { type: "door", open: 0, openreq: 3, shotcount: 0 },
        down: { type: "door", open: 1, openreq: 0, shotcount: 0 },
        left: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
        right: { type: "wall", open: 1, openreq: 0, shotcount: 0 },
    },
    enemies: [
        EnemyFactory.createEnemy('regular', 150, 100)
    ],
    projectiles: [],
    coins: [],
    keys: [],
    type: "regular",
    visited: 0
};

export const startIndex = [2, 1];

export const Rooms = [
    [shopRoom, emptyRoom, nullTile],
    [nullTile, tutorialRoom2, nullTile],
    [nullTile, tutorialRoom, nullTile]
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
