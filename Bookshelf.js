class Bookshelf {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 200;  // sizing 
        this.height = 250; //sizing 
        
        this.bookOpened = false; // Has the book been unlocked and opened?
        this.isSolid = false;
        this.removeFromWorld = false;
        
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
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 120; // Within 120 pixels
    }
    
    openZoomView() {
        console.log("Opening bookshelf zoom view...");
        
        // Create the zoom view
        let zoomView = new BookshelfZoomView(this.game, this);
        this.game.addEntity(zoomView);
        
        // Mark that we're examining
        this.game.examining = true;
        
        // Prevent immediate re-trigger
        this.game.E = false;
    }
    
    // Called by BookshelfZoomView when book is opened
    onBookOpened() {
        this.bookOpened = true;
        this.game.sceneManager.puzzleStates.room1.bookUnlocked = true;
        console.log("Book has been opened!"); //testing 
    }
    
    draw(ctx) {
        // Use opened sprite if book was unlocked
        let sprite = this.bookOpened ? this.spriteOpened : this.sprite; 
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if bugs in image 
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
            
            let text = "Press E to examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y - 15;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}