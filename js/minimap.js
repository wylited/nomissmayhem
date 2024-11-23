export function createMinimap(rooms, currentPosition) {
    const minimapContainer = document.getElementById('map');
    const mapSize = 150; // Total minimap size
    const roomSize = mapSize / rooms.length; // Size of each room cell

    const html = `
        <style>
            .minimap {
                width: ${mapSize}px;
                height: ${mapSize}px;
                background: #333;
                padding: 5px;
                display: grid;
                grid-template-columns: repeat(${rooms[0].length}, 1fr);
                grid-template-rows: repeat(${rooms.length}, 1fr);
                gap: 2px;
                border-radius: 5px;
            }
            .room {
                background: #666;
                position: relative;
            }
            .room.visited {
                background: #888;
            }
            .room.current {
                background: #4CAF50;
            }
            .room.shop {
                background: #2196F3;
            }
            .room.null {
                background: transparent;
            }
            .door {
                position: absolute;
                background: #FFC107;
            }
            .door.up { top: 0; left: 50%; width: 30%; height: 3px; transform: translateX(-50%); }
            .door.down { bottom: 0; left: 50%; width: 30%; height: 3px; transform: translateX(-50%); }
            .door.left { left: 0; top: 50%; width: 3px; height: 30%; transform: translateY(-50%); }
            .door.right { right: 0; top: 50%; width: 3px; height: 30%; transform: translateY(-50%); }
        </style>
        <div class="minimap">
            ${rooms.map((row, i) => 
                row.map((room, j) => {
                    if (room === nullTile) {
                        return `<div class="room null"></div>`;
                    }
                    
                    const isCurrentRoom = i === currentPosition[0] && j === currentPosition[1];
                    const roomClass = `room ${isCurrentRoom ? 'current' : ''} ${room.type === 'shop' ? 'shop' : ''} visited`;
                    
                    const doors = ['up', 'down', 'left', 'right']
                        .filter(direction => room.travel[direction].type === 'door')
                        .map(direction => `<div class="door ${direction}"></div>`)
                        .join('');
                    
                    return `<div class="${roomClass}">${doors}</div>`;
                }).join('')
            ).join('')}
        </div>
    `;

    minimapContainer.innerHTML = html;
}

// Keep track of current position

// Initial render

// Update minimap when moving between rooms
// Add this to wherever you handle room transitions
export function updateMinimap(newRow, newCol) {
    currentPosition = [newRow, newCol];
    createMinimap(Rooms, currentPosition);
}