class Door {
    constructor(game, x, y, width, height, destinationRoom, spawnX, spawnY, lockedSpritePath, openSpritePath, isLocked = true, opacity = 1.0, depthOverride = 50,) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destinationRoom = destinationRoom; 
        this.spawnX = spawnX; 
        this.spawnY = spawnY;
        this.isLocked = isLocked;
        this.removeFromWorld = false;
        this.canTrigger = true;
        this.depthOverride = depthOverride; 
        this.opacity = opacity; //NOTE: i made this when we were using the same door image so i have to find a way to make half of them clear, but now its a door per each room so maybe we dont need this in the final version 


        this.lockedDORE = ASSET_MANAGER.getAsset(lockedSpritePath);
        this.openDORE   = ASSET_MANAGER.getAsset(openSpritePath);
    }
    
    update() {

        if (!this.canTrigger) return;
    
        if (this.isLocked) {
            // Check Room 1 -> Room 2 door
            if (this.destinationRoom === "room2" && this.game.sceneManager.puzzleStates.room1.door1Open) {
                this.unlock();
            }
            
            // Check Room 2 -> Room 3 door
            if (this.destinationRoom === "room3" && this.game.sceneManager.puzzleStates.room2.door2Open) {
                this.unlock();
            }
            
            // Check Room 3 -> Room 4 door (medallion door)
            if (this.destinationRoom === "room4" && this.game.sceneManager.puzzleStates.room3.door3Open) {
                this.unlock();
            }
    }
        // Block door interaction while dialogue or examining is active
        if (this.game.sceneManager.dialogueBox.active || this.game.examining) {
            return;
        }

        // Only trigger once per key press
        if (this.isTouchingLily() && this.game.E && this.canTrigger) {

            this.game.E = false; // consume key immediately

            if (!this.isLocked) {
                this.canTrigger = false;
                this.game.sceneManager.loadRoom(
                    this.destinationRoom,
                    this.spawnX,
                    this.spawnY
        );
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