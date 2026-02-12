class CandleTable {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 400;
        this.height = 150;
        
        // Check if puzzle is solved
        this.puzzleSolved = this.game.sceneManager.puzzleStates.room3.candlesArranged;
        this.medallionTaken = this.game.sceneManager.puzzleStates.room3.candleMedallion;
        
        // Medallion spawn position (appears when puzzle solved)
        this.medallionX = this.x + 50;
        this.medallionY = this.y + 180;
        this.medallionWidth = 60;
        this.medallionHeight = 60;
        
        this.isSolid = false;
        this.removeFromWorld = false;
        
        // Load sprites
        this.medallionSprite = ASSET_MANAGER.getAsset("./Sprites/Room3/CandleMedallion.png");
    }
    
    update() {
        // Interaction with table
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
        
        // Pick up medallion if puzzle solved
        if (this.puzzleSolved && !this.medallionTaken && this.isNearMedallion() && this.game.E) {
            this.takeMedallion();
        }
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 120;
    }
    
    isNearMedallion() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.medallionX + this.medallionWidth/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.medallionY + this.medallionHeight/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 80;
    }
    
    openZoomView() {
        this.game.addEntity(new CandleTableZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }
    
    onPuzzleSolved() {
        this.puzzleSolved = true;
        this.game.sceneManager.puzzleStates.room3.candlesArranged = true;
    }
    
    takeMedallion() {
        this.game.sceneManager.addToInventory("Candle Medallion", "./Sprites/Room3/CandleMedallion.png");
        this.medallionTaken = true;
        this.game.sceneManager.puzzleStates.room3.candleMedallion = true;
        console.log("Candle Medallion taken!");
    }
    
    draw(ctx) {
 
        // Draw medallion if puzzle solved and not taken
        if (this.puzzleSolved && !this.medallionTaken) {
            if (this.medallionSprite && this.medallionSprite.complete && this.medallionSprite.naturalWidth > 0) {
                ctx.drawImage(this.medallionSprite, this.medallionX, this.medallionY, 
                             this.medallionWidth, this.medallionHeight);
            } else {
                ctx.fillStyle = "gold";
                ctx.beginPath();
                ctx.arc(this.medallionX + this.medallionWidth/2, this.medallionY + this.medallionHeight/2, 
                       this.medallionWidth/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Prompt for medallion
            if (this.isNearMedallion() && !this.game.examining) {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.font = "16px Arial";
                
                let text = "Press E to take";
                let textX = this.medallionX - 20;
                let textY = this.medallionY - 10;
                
                ctx.strokeText(text, textX, textY);
                ctx.fillText(text, textX, textY);
            }
        }
        
        // Prompt for table
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to examine";
            let textX = this.x + this.width/2 - 60;
            let textY = this.y - 10;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    
    get depth() {
        return this.y + this.height;
    }
}