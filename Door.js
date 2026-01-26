class Door {
    constructor(game, x, y, width, height, destinationRoom, spawnX, spawnY, isLocked = true) {
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
        
        // Load door sprites (you'll need to create these or use placeholders)
        // this.lockedSprite = ASSET_MANAGER.getAsset("./Sprites/door_locked.png");
        // this.unlockedSprite = ASSET_MANAGER.getAsset("./Sprites/door_unlocked.png");
    }
    
    update() {

        if (!this.canTrigger) return;

        // Check if Lily is touching the door
        if (this.isTouchingLily() && this.game.E) {
            if (this.isLocked) {
                // Door is locked
                console.log("The door is locked!");
                // could play a sound here
            } else {
                this.canTrigger = false;
                // Door is unlocked - LOAD THE NEXT ROOM!
                console.log("Going to", this.destinationRoom);
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
        console.log("Door unlocked!");
        // You could play an unlock sound here
    }
    
    draw(ctx) {
        // For now, draw a simple rectangle so you can see where the door is
        if (this.isLocked) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = "green";
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Later, you can replace this with:
        // let sprite = this.isLocked ? this.lockedSprite : this.unlockedSprite;
        // ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        
        // Draw a label for debugging
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(this.isLocked ? "LOCKED" : "OPEN", this.x + 5, this.y + 20);
    }
}