class PigHeadZoomView {

    constructor(game, PigHead) {
        this.game = game;
        this.painting = painting; 
        this.isPopup = true;
        
        this.width = 800;
        this.height = 800;
        this.x = 300
        this.y = 50
        
        // load zoomed in painting image
        this.paintingImage = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHead_Medallion.png"); 
        
        // Diamond key sprite will be layed on top of painting 
        // TODO: should be a bloody version of the snowflake key as its own sprite 
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/BloodySnowflakeMedallion.png"); 
        
        // Medallion position on painting 
        this.snowX = this.x + 535; 
        this.snowY = this.y + 474; 
        this.snowWidth = 96;
        this.snowHeight = 192;
        
        this.medallionTaken = this.PigHead.medallionTaken;
        this.removeFromWorld = false;
    }
    
    update() {
        // Check for ESC key to closedw
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
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
    
    // if medallion is clicked on, add to inventory, update pighead image, and change state 
    takeMedallion() {
        
        // Add to inventory
        this.game.sceneManager.addToInventory("Snowflake Medallion", "./Sprites/Room3/SnowflakeMedallion.png");        
        
        // Notify the pig head
        this.painting.onMedallionTaken();
        
        // Mark as taken
        this.medallionTaken = true;
    }
    
    close() {
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
        
        // Draw the medallion on the pig head if not taken 
        if (!this.medallionTaken) {
            if (this.medallionTaken) {
                ctx.drawImage(this.keySprite, this.snowX, this.snowY, this.snowWidth, this.snowH);
            } else {
                // Placeholder coin if bro fails 
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.snowX, this.snowY, this.snowWidth, this.snowHeight);
            }

        // Hover effect when hovering over the medallion 
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.snowX && mx <= this.snowX + this.snowWidth &&
                    my >= this.snowY && my <= this.snowY + this.snowHeight) {
                    // Draw highlight border
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.snowX - 5, this.snowY - 5, this.snowWidth + 10, this.snowHeight + 10);
                }
            }
        }

        // TODO: shift location of the instruction so it actaully shows up
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);

    }
}