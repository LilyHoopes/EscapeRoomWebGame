class MusicNoteZoomView {
    constructor(game, frame) {
        this.game = game;
        this.frame = frame; // Reference to MusicNoteFrame
        this.isPopup = true;
        
        // Zoom view dimensions
        this.width = 800;
        this.height = 900;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        this.frameOpened = false;
        
        this.pipeTaken = this.frame.pipeTaken;
        
        this.closedSprite = this.frame.closedSprite;
        this.openSprite = this.frame.openSprite;
        
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/Pipe.png");
        
        this.pipeX = this.x + 300;
        this.pipeY = this.y + 400;
        this.pipeWidth = 200;
        this.pipeHeight = 100;
        
        this.removeFromWorld = false;
    }
    
    update() {
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Handle clicks
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // Click outside to close
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            if (!this.frameOpened) {
                this.frameOpened = true;
            } 
            else if (!this.pipeTaken) {
                if (clickX >= this.pipeX && clickX <= this.pipeX + this.pipeWidth &&
                    clickY >= this.pipeY && clickY <= this.pipeY + this.pipeHeight) {
                    this.takePipe();
                }
            }
            
            this.game.click = null;
        }
    }
    
    takePipe() {
        this.game.sceneManager.addToInventory("Lead Pipe", "./Sprites/Room2/Pipe.png");
        this.pipeTaken = true;
        this.frame.onPipeTaken();
    }
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        let frameSprite = this.frameOpened ? this.openSprite : this.closedSprite;
        
        if (frameSprite && frameSprite.complete && frameSprite.naturalWidth > 0) {
            ctx.drawImage(frameSprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = this.frameOpened ? "#556B2F" : "#8B4513";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText(this.frameOpened ? "Frame (Open)" : "Frame (Closed)", this.x + 250, this.y + this.height/2);
        }
        
        if (this.frameOpened && !this.pipeTaken) {
            if (this.pipeSprite && this.pipeSprite.complete && this.pipeSprite.naturalWidth > 0) {
                ctx.drawImage(this.pipeSprite, this.pipeX, this.pipeY, this.pipeWidth, this.pipeHeight);
            } else {
                // Placeholder pipe
                ctx.fillStyle = "#708090";
                ctx.fillRect(this.pipeX, this.pipeY, this.pipeWidth, this.pipeHeight);
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.fillText("Lead Pipe", this.pipeX + 50, this.pipeY + 50);
            }
            
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.pipeX && mx <= this.pipeX + this.pipeWidth &&
                    my >= this.pipeY && my <= this.pipeY + this.pipeHeight) {
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.pipeX - 5, this.pipeY - 5, this.pipeWidth + 10, this.pipeHeight + 10);
                }
            }
        }
        
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        
        if (!this.frameOpened) {
            ctx.fillText("Click the frame to pry it open", this.x + 260, this.y + this.height + 30);
        } else if (!this.pipeTaken) {
            ctx.fillText("Click the pipe to take it", this.x + 280, this.y + this.height + 30);
        } else {
            ctx.fillText("Press ESC or click outside to close", this.x + 230, this.y + this.height + 30);
        }
    }
}