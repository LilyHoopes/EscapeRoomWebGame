class Door {
    constructor(game, x, y, width, height, destinationRoom, spawnX, spawnY, isLocked = true, depthOverride = 50) {
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

        this.lockedDORE = ASSET_MANAGER.getAsset("./Sprites/Room1/lockedDORE.png");
        this.openDORE   = ASSET_MANAGER.getAsset("./Sprites/Room1/openDORE.png");
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
    
    //NOTE: the size of the normal doors are 106x126
    draw(ctx) {
        
        const sprite = this.isLocked ? this.lockedDORE : this.openDORE; //if locked, use locked sprite, else, use open sprite

        // for testing, if the images havent loaded i will get error here 
        if (!sprite) {
            console.error("Door sprite NOT loaded:", this.isLocked ? "locked" : "open");
            return;
        }



        ctx.drawImage(sprite, this.x, this.y, this.width, this.height);

        // debugging label if needed
        //ctx.fillStyle = "white";
        //ctx.font = "12px Arial";
        //ctx.fillText(this.isLocked ? "LOCKED" : "OPEN", this.x + 5, this.y + 20);
    }
    get depth() {
        return this.depthOverride ?? (this.BB ? this.BB.bottom : this.y + this.height);
    }
}