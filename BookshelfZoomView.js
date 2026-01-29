class BookshelfZoomView {
    constructor(game, bookshelf) {
        this.game = game;
        this.bookshelf = bookshelf;
        
        // Zoom view dimensions, theres are what we change if neeeed
        this.width = 700;
        this.height = 800;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Has player unlocked the book?
        this.bookUnlocked = this.bookshelf.bookOpened;
        
        // Has player taken the paper?
        this.paperTaken = false;
        
        // Check if player has the diamond key
        this.hasKey = this.game.sceneManager.hasItem("diamond_key");
        
        // Load sprites
        this.lockedBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/LockedDiamondBook.png");    // zoomed in locked book 
        this.openBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/OpenBook.png");               // if key is dragged onto book, show open book w paper inside (the fortnite one)
        this.paperSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/067Codex.png");                  // once user clicked paper, they see this i think?
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png");                  // key they drag onto book to unlock it 
        
        // Book position and size 
        this.bookX = this.x + 200;
        this.bookY = this.y + 250;
        this.bookWidth = 300;
        this.bookHeight = 400;
        
        // Paper position and size in the book 
        // NOTE i need to decide w group how the whole paper situation is going to work 
        this.paperX = this.bookX + 100;
        this.paperY = this.bookY + 150;
        this.paperWidth = 100;
        this.paperHeight = 150;
        
        // Key position (if player has it, shown in "inventory" area) top left corner 
        this.keyX = this.x + 50;
        this.keyY = this.y + 50;
        this.keyWidth = 60;
        this.keyHeight = 60;
        
        this.removeFromWorld = false;
    }
    
    update() {
        // press ESC to close out of window 
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // this method works here but rose painting one does not work idk why 
        // Click outside to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // Click outside the view
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // if player has key and the book is locked 
            if (!this.bookUnlocked && this.hasKey) {
                // Click anywhere on the book to unlock it
                if (clickX >= this.bookX && clickX <= this.bookX + this.bookWidth &&
                    clickY >= this.bookY && clickY <= this.bookY + this.bookHeight) {
                    this.unlockBook();
                }
            }
            
            // Click on paper to take it (if book is open and paper not taken)
            // this is buggy too the paper shows up each time i go to the bookshelf
            // BUG: the paper shows up each time i click onto bookshelf even after its collected
            if (this.bookUnlocked && !this.paperTaken) {
                if (clickX >= this.paperX && clickX <= this.paperX + this.paperWidth &&
                    clickY >= this.paperY && clickY <= this.paperY + this.paperHeight) {
                    this.takePaper();
                }
            }
            
            this.game.click = null;
        }
    }
    
    unlockBook() {
        console.log("Unlocking book with diamond key..."); // testing 
        
        // Remove key from inventory (it's been used)
        let keyIndex = this.game.sceneManager.inventory.indexOf("diamond_key");
        if (keyIndex > -1) {
            this.game.sceneManager.inventory.splice(keyIndex, 1);
            console.log("Diamond key used and removed from inventory");
        }
         
        // Unlock the book
        this.bookUnlocked = true;
        this.hasKey = false; // Key is gone
        
        // update bookshelf state to change to the other sprite 
        this.bookshelf.onBookOpened();
    }
    
    takePaper() {
        console.log("Taking paper from book..."); //testing 
        
        // Add paper to inventory
        this.game.sceneManager.addToInventory("riddle_paper");
        
        this.paperTaken = true; // update paper state this isnt woking 
    
    }
    
    close() {
        console.log("Closing bookshelf zoom view");
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw frame
        ctx.fillStyle = "#5C4033"; // Dark brown
        ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
        
        ctx.fillStyle = "#D4A574"; // Light brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw inventory area label if player has key
        if (this.hasKey) {
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x + 20, this.y + 20, 150, 100);
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("INVENTORY:", this.x + 40, this.y + 40);
            
            // Draw the diamond key
            if (this.keySprite && this.keySprite.complete) {
                ctx.drawImage(this.keySprite, this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            } else {
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            }
        }
        
        // Draw the book (locked or open)
        if (!this.bookUnlocked) {
            // Locked book
            if (this.lockedBookSprite && this.lockedBookSprite.complete) {
                ctx.drawImage(this.lockedBookSprite, this.bookX, this.bookY, this.bookWidth, this.bookHeight);
            } else {
                ctx.fillStyle = "#8B4513";
                ctx.fillRect(this.bookX, this.bookY, this.bookWidth, this.bookHeight);
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.fillText("Locked Book", this.bookX + 80, this.bookY + this.bookHeight/2);
            }
            
            // Hover effect on book if player has key
            if (this.hasKey && this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.bookX && mx <= this.bookX + this.bookWidth &&
                    my >= this.bookY && my <= this.bookY + this.bookHeight) {
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.bookX - 5, this.bookY - 5, this.bookWidth + 10, this.bookHeight + 10);
                    
                    ctx.fillStyle = "white";
                    ctx.font = "16px Arial";
                    ctx.fillText("Click to use key", this.bookX + 70, this.bookY - 15);
                }
            }
            
            // Message if no key
            if (!this.hasKey) {
                ctx.fillStyle = "white";
                ctx.font = "18px Arial";
                ctx.fillText("This book is locked...", this.bookX + 50, this.bookY - 20);
                ctx.fillText("I need a key.", this.bookX + 80, this.bookY - 40);
            }
        } else {
            // Open book
            if (this.openBookSprite && this.openBookSprite.complete) {
                ctx.drawImage(this.openBookSprite, this.bookX, this.bookY, this.bookWidth, this.bookHeight);
            } else {
                ctx.fillStyle = "#D2B48C";
                ctx.fillRect(this.bookX, this.bookY, this.bookWidth, this.bookHeight);
            }
            
            // Draw paper inside (if not taken)
            if (!this.paperTaken) {
                if (this.paperSprite && this.paperSprite.complete) {
                    ctx.drawImage(this.paperSprite, this.paperX, this.paperY, this.paperWidth, this.paperHeight);
                } else {
                    ctx.fillStyle = "#FFF8DC";
                    ctx.fillRect(this.paperX, this.paperY, this.paperWidth, this.paperHeight);
                }
                
                // Hover effect on paper
                if (this.game.mouse) {
                    let mx = this.game.mouse.x;
                    let my = this.game.mouse.y;
                    
                    if (mx >= this.paperX && mx <= this.paperX + this.paperWidth &&
                        my >= this.paperY && my <= this.paperY + this.paperHeight) {
                        ctx.strokeStyle = "yellow";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(this.paperX - 5, this.paperY - 5, this.paperWidth + 10, this.paperHeight + 10);
                    }
                }
            }
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);
    }
}