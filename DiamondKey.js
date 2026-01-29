class DiamondKey {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        
        this.collected = false;
        this.isSolid = false;
        
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png");
        this.removeFromWorld = false;
    
    }
    
    // if lily doesn't have the key, is close to it, and presses 'E', collect
    update() {
        if (this.collected) return; // if its already collected dont do anything 
        
        // Check if Lily is first close to it, then second presses 'E' to pick it up
        if (this.isNearLily() && this.game.E) {
            this.collect();
        }
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 80;
    }
    
    collect() {
        this.collected = true;
        this.removeFromWorld = true;
        
        // Add to inventory
        this.game.sceneManager.addToInventory("diamond_key");
        
        console.log("Collected Diamond Key!");
        // Play sound
        // ASSET_MANAGER.playAsset("./audio/pickup.mp3");
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        if (this.sprite) {
            ctx.drawImage(
                this.sprite, 
                this.x, 
                this.y + this.bobOffset, 
                this.width, 
                this.height
            );
        } else {
            // Placeholder
            ctx.fillStyle = "cyan";
            ctx.fillRect(this.x, this.y + this.bobOffset, this.width, this.height);
        }
        
        // Show "Press E" when near
        if (this.isNearLily()) {
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Press E to pick up", this.x - 20, this.y - 10);
        }
    }
}