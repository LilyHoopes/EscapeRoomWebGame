class Bookshelf {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 200;  // sizing 
        this.height = 250; //sizing 
        
        this.bookOpened = this.game.sceneManager.puzzleStates.room1.bookUnlocked;
        this.isSolid = true;
        this.removeFromWorld = false;
        this.bbOffset = { x: 5, y: 80, w: 0, h: 150 };
        
        // Bookshelf with closed/locked book
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithBook.png");
        // Bookshelf with opened book (after unlocking)
        this.spriteOpened = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithOpenBook.png");
    }
    
    update() {
        // Only allow interaction if not already examining something
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
        this.updateBB();
    }
    updateBB() {
        this.BB = new BoundingBox(
            this.x + this.bbOffset.x, 
            this.y + this.bbOffset.y, 
            this.width - this.bbOffset.w, 
            this.height - this.bbOffset.h
        );
    }
    get depth() {
        return this.BB ? this.BB.bottom : this.y + this.height;
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 140; // Within 120 pixels
    }
    
    openZoomView() {
        
        this.game.addEntity(new BookshelfZoomView(this.game, this));
        
        this.game.examining = true;
        this.game.E = false;
    }
    
    // Called by BookshelfZoomView when book is opened
    onBookOpened() {
        this.bookOpened = true;
        this.game.sceneManager.puzzleStates.room1.bookUnlocked = true;
    }
    
    draw(ctx) {
        // Use opened sprite if book was unlocked
        let sprite = this.bookOpened ? this.spriteOpened : this.sprite; 
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if image is bugging 
            // need to change this size here
            ctx.fillStyle = this.bookOpened ? "#654321" : "#8B4513";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Bookshelf", this.x + 50, this.y + this.height/2);
        }
        
        // Show interaction prompt
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y + 65;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
        //debug hitbox stuff
        if (this.game.debug) {
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}