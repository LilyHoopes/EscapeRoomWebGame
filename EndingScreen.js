class EndingScreen {
    constructor(game) {
        this.game = game;
        this.isPopup = true;
        this.removeFromWorld = false;
        
        // Screen dimensions
        this.width = 800;
        this.height = 500;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Button dimensions
        this.buttonWidth = 250;
        this.buttonHeight = 60;
        this.buttonSpacing = 20;
        
        // Play Again button
        this.playAgainButton = {
            x: this.x + (this.width - this.buttonWidth) / 2,
            y: this.y + 300,
            width: this.buttonWidth,
            height: this.buttonHeight
        };
        
        // Return to Title button
        this.titleButton = {
            x: this.x + (this.width - this.buttonWidth) / 2,
            y: this.y + 300 + this.buttonHeight + this.buttonSpacing,
            width: this.buttonWidth,
            height: this.buttonHeight
        };
        
        // Optional: Load ending background sprite
        // this.backgroundSprite = ASSET_MANAGER.getAsset("./Sprites/UI/EndingBackground.png");
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
        // Reset game and load Room 1
        this.game.sceneManager.resetGame();
        this.game.sceneManager.loadRoom("room1", 1000, 50);
        this.removeFromWorld = true;
    }
    
    returnToTitle() {
        // Reset game state
        this.game.sceneManager.resetGame();
        
        // Stop room BGM
        if (this.game.sceneManager.roomBGM) {
            this.game.sceneManager.roomBGM.pause();
            this.game.sceneManager.roomBGM.currentTime = 0;
            this.game.sceneManager.roomBGM = null;
        }
        
        // Start intro BGM
        if (this.game.introAudio) {
            this.game.introAudio.currentTime = 0;
            this.game.introAudio.play().catch(() => {});
        }
        
        // Clear entities and show title
        this.game.sceneManager.clearEntities();
        this.game.addEntity(new TitleScreen(this.game));
        this.removeFromWorld = true;
    }
    
    draw(ctx) {
        // Darken entire screen
        ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw ending screen box
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = "#FFD700"; // Gold border
        ctx.lineWidth = 5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // "You Escaped!" text
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 64px Arial";
        ctx.textAlign = "center";
        ctx.fillText("YOU ESCAPED!", this.x + this.width/2, this.y + 100);
        
        // Subtitle/flavor text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "24px Arial";
        ctx.fillText("You made it out alive...", this.x + this.width/2, this.y + 160);
        ctx.fillText("For now.", this.x + this.width/2, this.y + 195);
        
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
        ctx.fillStyle = isHovering ? "#555" : "#222";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Button border
        ctx.strokeStyle = isHovering ? "#FFD700" : "#666";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Button text
        ctx.fillStyle = isHovering ? "#FFD700" : "#FFFFFF";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, button.x + button.width/2, button.y + button.height/2 + 8);
    }
}