class RosePainting {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;         // location on screen I think 
        this.y = y;
        this.width = 600;  // change width of sprite here
        this.height = 600; // change height of sprite here 
        this.depth = 150;
        
        this.keyTaken = false; // from behind the painting or front, don't matter 
        this.isSolid = false; // Not a collision object
        
        // Load sprite
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingWithKey.png"); 
        this.spriteNoKey = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingNoKey.png"); 
        this.removeFromWorld = false;


            console.log("RosePainting sprite loaded?", this.sprite);
            console.log("RosePaintingNoKey loaded?", this.spriteNoKey);
    }
    
    // rose painting keeps checking until following happens
    update() {
        if (this.game.activePopup) return;
        // Only allows interaction if not already examining
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
    }
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 100;
    }

    openZoomView() {
        console.log("Opening painting zoom view...");
        
        // Create the zoom view entity
        //let zoomView = new PaintingZoomView(this.game, this);
        //this.game.addEntity(zoomView);
        this.game.activePopup = new PaintingZoomView(this.game, this);
        
        // Mark that we're examining something (prevents other interactions)
        this.game.examining = true;
        
        // Prevent immediate re-trigger
        this.game.E = false;
    }

    // Called by PaintingZoomView when key is taken
    onKeyTaken() {
        this.keyTaken = true;
        this.game.sceneManager.puzzleStates.room1.hasKey = true;
        console.log("Diamond key added to inventory!");
    }
    

    
    draw(ctx) {
         console.log("Drawing RosePainting at", this.x, this.y);
        // Use sprite without key if already taken
        let sprite = this.keyTaken ? this.spriteNoKey : this.sprite;
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if key sprite isnt loaded or broken 
            ctx.fillStyle = this.keyTaken ? "#6b345f" : "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Show interaction prompt
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = this.keyTaken ? "Press E to examine" : "Press E to examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y + 250;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}