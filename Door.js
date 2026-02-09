class Door {
    constructor(game, x, y, width, height, destinationRoom, spawnX, spawnY, isLocked = true, opacity = 1.0, depthOverride = 50,) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destinationRoom = destinationRoom; // "room2", "room3", etc.
        this.spawnX = spawnX; // Where Lily appears in next room
        this.spawnY = spawnY;
        this.isLocked = isLocked;
        this.removeFromWorld = false;
        this.canTrigger = true;
        this.depthOverride = depthOverride; //depth override (basically if ur stacking sprites on each other)
        this.opacity = opacity; // for trasnparent doors, 1.0 is solid and 0.0 is totally invisible 

        this.lockedDORE = ASSET_MANAGER.getAsset("./Sprites/Room1/lockedDORE.png");
        this.openDORE   = ASSET_MANAGER.getAsset("./Sprites/Room1/openDORE.png");
    }
    
    update() {

        if (!this.canTrigger) return;

        // Check if Lily is touching the door
        if (this.isTouchingLily() && this.game.E) {
            if (this.isLocked) {
                // play locked door sound here?
            } else {
                this.canTrigger = false;
                // Door is unlocked
                this.game.sceneManager.loadRoom(this.destinationRoom, this.spawnX, this.spawnY);
            }
        }

        // Reset trigger when Lily walks away
        if (!this.isTouchingLily()) {
            this.canTrigger = true;
        }
    }
    
    isTouchingLily() {
        let lily = this.game.lily || this.game.sceneManager.lily;

        if (!lily.BB) return false;
        
        // must use the bouding box collisions of lily, not the size or xy of her
        return (
            this.x < lily.BB.x + lily.BB.width &&
            this.x + this.width > lily.BB.x &&
            this.y < lily.BB.y + lily.BB.height &&
            this.y + this.height > lily.BB.y
        );
    }
    
    unlock() {
        this.isLocked = false;
    }
    
    //NOTE: the size of the normal doors are 106x126
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const sprite = this.isLocked ? this.lockedDORE : this.openDORE; //if locked, use locked sprite, else, use open sprite
        ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        ctx.restore();

        if (this.isTouchingLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = this.isLocked ? "Door is locked" : "Press E to enter";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y - 10;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    get depth() {
        return this.depthOverride ?? (this.BB ? this.BB.bottom : this.y + this.height);
    }
}