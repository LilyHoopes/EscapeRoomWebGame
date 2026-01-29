class PaintingZoomView {
    constructor(game, painting) {
        this.game = game;
        this.painting = painting; // painting is the RosePainting class that called this
        
        // Zoom view dimensions (change these values to get the painting large and centered)
        this.width = 2400;
        this.height = 2400;
        this.x = (1500 - this.width) / 2; // Center horizontally
        this.y = (1100 - this.height) / 2;  // Center vertically
        
        // load zoomed in painting image
        this.paintingImage = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingZoom.png"); 
        
        // Diamond key sprite will be layed on top of painting 
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png"); 
        
        // Key position on painting 
        this.keyX = this.x + 1225; 
        this.keyY = this.y + 1100; 
        this.keyWidth = 96;
        this.keyHeight = 192;
        //162x322 is key ratio about half 
        
        this.keyTaken = this.painting.keyTaken;
        this.removeFromWorld = false;
    }
    
    update() {
        // Check for ESC key to closedw
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // BUG: clicking outside screen does not currently work to close the view 
        // THIS IS BROKEN IDK HOW TO FIX IT 
        // Check for click outside the view to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // if user clicks outside the painting it will close 
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // if key isnt taken and user clicks the key 
            if (!this.keyTaken && 
                clickX >= this.keyX && clickX <= this.keyX + this.keyWidth &&
                clickY >= this.keyY && clickY <= this.keyY + this.keyHeight) {
                this.takeKey();
            }
            this.game.click = null;
        }
    }
    
    // if key is clicked on, add to inventory, update the painting, and change state 
    takeKey() {
        console.log("Clicked on diamond key!");
        
        // Add to inventory
        this.game.sceneManager.addToInventory("diamond_key", "./Sprites/Room1/DiamondKey.png");        
        
        // Notify the painting
        this.painting.onKeyTaken();
        
        // Mark as taken
        this.keyTaken = true;
    }
    
    close() {
        console.log("Closing painting zoom view");
        this.removeFromWorld = true; // remove zoomed painting from world 
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken the background (transparaent so it's just shade darker to focus on painting)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw the zoomed painting
        if (this.paintingImage) {
            ctx.drawImage(this.paintingImage, this.x, this.y, this.width, this.height);
        // if image fails draw lame ahh red rectangle 
        } else {
            // Placeholder
            ctx.fillStyle = "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Rose Painting (Zoomed)", this.x + 150, this.y + this.height/2);
        }
        
        // Draw the diamond key on painting (if not taken)
        if (!this.keyTaken) {
            if (this.keySprite) {
                ctx.drawImage(this.keySprite, this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            } else {
                // Placeholder key if bro fails 
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            }

        // Hover effect when hovering over the key 
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.keyX && mx <= this.keyX + this.keyWidth &&
                    my >= this.keyY && my <= this.keyY + this.keyHeight) {
                    // Draw highlight border
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.keyX - 5, this.keyY - 5, this.keyWidth + 10, this.keyHeight + 10);
                }
            }
        }

        // FIXME: shift location of the instruction so it actaully shows up
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);

    }
}