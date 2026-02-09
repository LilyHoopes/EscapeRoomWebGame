class FrameZoomView {
    constructor(game, frame) {
        this.game = game;
        this.frame = frame; // Reference to the GenericFrame that opened this
        this.isPopup = true;
        
        this.width = 800;
        this.height = 800;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        this.sprite = this.frame.sprite;
        this.removeFromWorld = false;
    }
    
    update() {
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Click anywhere to close (simple for generic frames)
        if (this.game.click) {
            this.close();
            this.game.click = null;
        }
    }
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = "#5C4033";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText("Painting (Zoomed)", this.x + 250, this.y + this.height/2);
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click to close", this.x + 250, this.y + this.height + 30);
    }
}