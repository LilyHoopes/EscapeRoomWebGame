class PigHead {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;        
        this.y = y;
        this.width = 125;  
        this.height = 125; 
        this.depth = 150;
        
        // TODO: set state of medallion array to nothing in the constructor 
        this.medallionTaken = false;
        this.isSolid = false; // Not a collision object
        
        // Load sprite
        this.pigHead = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHead_Medallion.png"); 
        this.pigHeadNoMedallion = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHeadEmptyMouth.png"); 
        this.removeFromWorld = false;
    }
    
    update() {
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
        this.game.addEntity(new PigHeadZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }

    // Called by PigHeadZoomView when key is taken
    onMedallionTaken() {
        this.medallionTaken = true;
        this.game.sceneManager.puzzleStates.room3.hasMedallion = true; //TODO: not sure what this needs to be fhcanged to or fixed
        // should it just be medallion or specifically pighead medallion ?
    }
    
    draw(ctx) {
        // Use sprite without key if already taken
        let sprite = this.medallionTaken ? this.pigHead : this.pigHeadNoMedallion;
        
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
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2 - 13;
            let textY = this.y + 178;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}