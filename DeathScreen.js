class DeathScreen {
    constructor(game) {
        this.game = game;
        this.isPopup = true;
        this.removeFromWorld = false;
        
        // Screen dimensions
        this.width = 600;
        this.height = 400;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Button dimensions
        this.buttonWidth = 250;
        this.buttonHeight = 60;
        this.buttonSpacing = 20;
        
        // Play Again button
        this.playAgainButton = {
            x: this.x + (this.width - this.buttonWidth) / 2,
            y: this.y + 200,
            width: this.buttonWidth,
            height: this.buttonHeight
        };
        
        // Return to Title button
        this.titleButton = {
            x: this.x + (this.width - this.buttonWidth) / 2,
            y: this.y + 200 + this.buttonHeight + this.buttonSpacing,
            width: this.buttonWidth,
            height: this.buttonHeight
        };
    }
    
    update() {
        // Handle button clicks
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // Play Again button
            if (clickX >= this.playAgainButton.x && clickX <= this.playAgainButton.x + this.playAgainButton.width &&
                clickY >= this.playAgainButton.y && clickY <= this.playAgainButton.y + this.playAgainButton.height) {
                this.playAgain();
            }
            
            // Return to Title button
            if (clickX >= this.titleButton.x && clickX <= this.titleButton.x + this.titleButton.width &&
                clickY >= this.titleButton.y && clickY <= this.titleButton.y + this.titleButton.height) {
                this.returnToTitle();
            }
            
            this.game.click = null;
        }
    }
    
    playAgain() {
        // Reset everything and load Room 1
        this.game.sceneManager.clearEntities();
        this.game.sceneManager.resetGame();
        this.removeFromWorld = true;
    }
    
    returnToTitle() {
        // Clear all entities and show title screen
        this.game.sceneManager.resetGame();
        // Start intro BGM again
        if (this.game.introAudio) {
            this.game.introAudio.currentTime = 0;
            this.game.introAudio.play().catch(() => {});
        }
        
        // Clear all entities and show title screen
        this.game.sceneManager.clearEntities();
        this.game.addEntity(new TitleScreen(this.game));
        this.removeFromWorld = true;
    }
    
    draw(ctx) {
        // Darken entire screen
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw death screen box
        ctx.fillStyle = "#1A1A1A";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = "#8B0000";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // "You Died" text
        ctx.fillStyle = "#FF0000";
        ctx.font = "72px Arial";
        ctx.textAlign = "center";
        ctx.fillText("YOU DIED", this.x + this.width/2, this.y + 100);
        
        // Draw Play Again button
        this.drawButton(ctx, this.playAgainButton, "Play Again");
        
        // Draw Return to Title button
        this.drawButton(ctx, this.titleButton, "Return to Title");
    }
    
    drawButton(ctx, button, text) {
        // Check if mouse is hovering
        let isHovering = false;
        if (this.game.mouse) {
            let mx = this.game.mouse.x;
            let my = this.game.mouse.y;
            
            if (mx >= button.x && mx <= button.x + button.width &&
                my >= button.y && my <= button.y + button.height) {
                isHovering = true;
            }
        }
        
        // Button background
        ctx.fillStyle = isHovering ? "#555" : "#333";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Button border
        ctx.strokeStyle = isHovering ? "#FFF" : "#888";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Button text
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, button.x + button.width/2, button.y + button.height/2 + 8);
    }
}