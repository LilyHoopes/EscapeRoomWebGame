class InventoryUI {
    constructor(game) {
        this.game = game;
        
        // Inventory panel dimensions
        this.width = 600;
        this.height = 400;
        this.x = (1380 - this.width) / 2; // Center on screen
        this.y = (882 - this.height) / 2;
        
        // Grid layout for items
        this.slotsPerRow = 3;
        this.slotSize = 120;
        this.slotPadding = 20;
        this.startX = this.x + 100;
        this.startY = this.y + 80;

        this.wasIPressed = true; 

        
        this.removeFromWorld = false;
        this.isPopup = true;
    }
    
    update() {
        // Press I to close (but wait for key to be released first)
        if (this.game.I && !this.wasIPressed) {
            this.close();
            return;
        }
        this.wasIPressed = this.game.I;
        
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Handle clicks on items
        if (this.game.click) {
            this.handleClick(this.game.click.x, this.game.click.y);
            this.game.click = null;
        }
    }
    
    handleClick(clickX, clickY) {
        let inventory = this.game.sceneManager.inventory;
        
        // Check each item slot
        inventory.forEach((item, index) => {
            let row = Math.floor(index / this.slotsPerRow);
            let col = index % this.slotsPerRow;
            
            let slotX = this.startX + col * (this.slotSize + this.slotPadding);
            let slotY = this.startY + row * (this.slotSize + this.slotPadding);
            
            // Check if click is within this slot
            if (clickX >= slotX && clickX <= slotX + this.slotSize &&
                clickY >= slotY && clickY <= slotY + this.slotSize) {
                this.onItemClick(item);
            }
        });
    }
    
    onItemClick(item) {
        console.log("Clicked on item:", item.name);
        
        // If it's the riddle paper, open the readable view
        if (item.name === "Room1Note") {
            // Close inventory
            this.close();
            
            // Open paper view
            //this.game.addEntity(new PaperView(this.game));
            this.game.activePopup = new PaperView(this.game);
            this.game.examining = true;
        }
        
        // If it's a used item, show message
        if (item.used) {
            console.log("This item has already been used.");
            // Could add a visual notification here
        }
    }
    
    close() {
        console.log("Closing inventory");
        //this.removeFromWorld = true;
        this.game.activePopup = null;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw inventory panel background
        ctx.fillStyle = "#3E2723"; // Dark brown
        ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
        
        ctx.fillStyle = "#5D4037"; // Medium brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = "white";
        ctx.font = "28px Arial";
        ctx.fillText("INVENTORY", this.x + 220, this.y + 45);
        
        // Draw item slots
        let inventory = this.game.sceneManager.inventory;
        
        // displaying each item in the inventory 
        inventory.forEach((item, index) => {
            let row = Math.floor(index / this.slotsPerRow);
            let col = index % this.slotsPerRow;
            
            let slotX = this.startX + col * (this.slotSize + this.slotPadding);
            let slotY = this.startY + row * (this.slotSize + this.slotPadding);
            
            // Draw slot background
            ctx.fillStyle = "#424242";
            ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
            
            // Draw item sprite
            let sprite = ASSET_MANAGER.getAsset(item.sprite);
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, slotX + 10, slotY + 10, this.slotSize - 20, this.slotSize - 20);
            } else {
                // Placeholder
                ctx.fillStyle = "#888";
                ctx.fillRect(slotX + 10, slotY + 10, this.slotSize - 20, this.slotSize - 20);
            }
            
            // If used, darken it
            if (item.used) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
                
                // "USED" label
                ctx.fillStyle = "#FF5252";
                ctx.font = "14px Arial";
                ctx.fillText("USED", slotX + 35, slotY + 70);
            }
            
            // Hover effect
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= slotX && mx <= slotX + this.slotSize &&
                    my >= slotY && my <= slotY + this.slotSize) {
                    // Highlight border
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
                    
                    // Show item name below slot
                    ctx.fillStyle = "white";
                    ctx.font = "16px Arial";
                    let displayName = item.name.replace("_", " ").toUpperCase();
                    ctx.fillText(displayName, slotX, slotY + this.slotSize + 20);
                }
            }
        });
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Click an item to examine it", this.x + 180, this.y + this.height - 30);
        ctx.fillText("Press I or ESC to close", this.x + 200, this.y + this.height - 10);
    }
}