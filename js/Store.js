export function checkCardCollision(room, proj) {
    if (room.type!="shop") {
        return '';
    }
    //this.ctx.fillRect(320, 35, 100, 150);
    //this.ctx.fillRect(180, 35, 100, 150);

    let x = proj.x;
    let y = proj.y;
    
    if (x > 318 && x < 432 && y > 33 && y < 137) {
        return [1, room.powerUps[1]];
    }

    if (x > 178 && x < 282 && y > 33 && y < 137) {
        return [0, room.powerUps[0]];
    }
}