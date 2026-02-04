class BookshelfZoomView {
    constructor(game, bookshelf) {
        this.game = game;
        this.bookshelf = bookshelf;
        this.isPopup = true;
        
        // Zoom view dimensions, theres are what we change if neeeed
        this.width = 700;
        this.height = 800;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Has player unlocked the book?
        this.bookUnlocked = this.bookshelf.bookOpened;
        
        // Has player taken the paper?
        this.paperTaken = this.game.sceneManager.puzzleStates.room1.paperTaken; 
            console.log("Paper taken status:", this.game.sceneManager.puzzleStates.room1.paperTaken);
        
        // Check if player has the diamond key
        this.hasKey = this.game.sceneManager.hasItem("diamond_key");
        
        // Load sprites
        this.lockedBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/LockedDiamondBook.png");    // zoomed in locked book 
        this.openBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/OpenBook.png");               // if key is dragged onto book, show open book w paper inside (the fortnite one)
        this.paperSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/Room1Note.png");                  // once user clicked paper, they see this i think?
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png");                  // key they drag onto book to unlock it 
        
        // Book position and size 
        this.bookX = this.x + 150;
        this.bookY = this.y + 200;
        this.bookWidth = 391;
        this.bookHeight = 544;
        
        // Paper position and size in the book 
        this.paperX = this.bookX + 0;
        this.paperY = this.bookY + 100;
        this.paperWidth = 400;
        this.paperHeight = 400;
        
        // Key position (if player has it, shown in "inventory" area) top left corner 
        this.keyX = this.x + 50;
        this.keyY = this.y + 50;
        this.keyWidth = 60;
        this.keyHeight = 120;

        // Drag-and-drop state for key to book dragging 
        this.draggingKey = false;
        this.dragKeyX = this.keyX; // Current position while dragging
        this.dragKeyY = this.keyY;
        this.dragOffsetX = 0; // Offset from mouse to key corner
        this.dragOffsetY = 0;
        
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

        // Handle mouse down/up for dragging
        if (this.game.mouse) {
            let mx = this.game.mouse.x;
            let my = this.game.mouse.y;
                
            // Check if mouse is pressed (we'll need to track this)
            // For now, we'll use click to start drag
        }
            
        // DRAG-AND-DROP LOGIC
        if (this.hasKey && !this.bookUnlocked) {
            console.log("inside the hasKey and book not unlocked")
            this.handleKeyDragAndDrop();
        }        

        
    }

    handleKeyDragAndDrop() {
        console.log("inside handleKeyDragAndDrop")
        console.log("=== handleKeyDragAndDrop called ===");
        console.log("this.game.mouse:", this.game.mouse);
        console.log("this.game.mouseDown:", this.game.mouseDown);
        console.log("this.game.mouseUp:", this.game.mouseUp);
        console.log("this.hasKey:", this.hasKey);
        console.log("this.draggingKey:", this.draggingKey);

        if (!this.game.mouse) {
            console.log("No mouse - returning early");
            return;
        }        
        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;

        // DEBUG: Log mouse state
        if (this.game.mouseDown || this.draggingKey) {
            console.log("Mouse:", mx, my, "MouseDown:", this.game.mouseDown, "Dragging:", this.draggingKey);
        }
        
        // Start dragging on mouse down over key
        if (this.game.mouseDown && !this.draggingKey) {

            console.log("Checking if mouse over key...");
            console.log("Key bounds:", this.dragKeyX, this.dragKeyY, this.keyWidth, this.keyHeight);
            console.log("Mouse pos:", mx, my);

            // Check if mouse is over the key
            if (mx >= this.dragKeyX && mx <= this.dragKeyX + this.keyWidth &&
                my >= this.dragKeyY && my <= this.dragKeyY + this.keyHeight) {
                this.draggingKey = true;
                this.dragOffsetX = mx - this.dragKeyX;
                this.dragOffsetY = my - this.dragKeyY;
                console.log("Started dragging key");
            } else {
                console.log("mouse not over key")
            }
        }
        
        // While dragging, follow mouse
        if (this.draggingKey && this.game.mouseDown) {
            this.dragKeyX = mx - this.dragOffsetX;
            this.dragKeyY = my - this.dragOffsetY;
            console.log("Dragging to:", this.dragKeyX, this.dragKeyY);
        }
        
        // Release mouse - check if over book
        if (this.draggingKey && !this.game.mouseDown) {
            console.log("Released mouse!");

            // Check if key was dropped on the book
            let keyCenterX = this.dragKeyX + this.keyWidth / 2;
            let keyCenterY = this.dragKeyY + this.keyHeight / 2;
            console.log("Released mouse!");
            
            let keyOverBook = (
                keyCenterX >= this.bookX &&
                keyCenterX <= this.bookX + this.bookWidth &&
                keyCenterY >= this.bookY &&
                keyCenterY <= this.bookY + this.bookHeight
            );
            
            if (keyOverBook) {
                console.log("Key dropped on book - unlocking!");
                this.unlockBook();
            } else {
                console.log("Key dropped elsewhere - snapping back");
                // Snap key back to original position
                this.dragKeyX = this.keyX;
                this.dragKeyY = this.keyY;
            }
            
            this.draggingKey = false;
        }
    }
    
    unlockBook() {
        console.log("Unlocking book with diamond key..."); // testing 
        
        // key has been used, mark as used 
        this.game.sceneManager.markItemAsUsed("diamond_key");

         
        // Unlock the book
        this.bookUnlocked = true;
        this.hasKey = false; // Key is gone
        
        // update bookshelf state to change to the other sprite 
        this.bookshelf.onBookOpened();
    }
    
    takePaper() {
        console.log("Taking paper from book..."); //testing 
            
        this.game.sceneManager.addToInventory("Room1Note", "./Sprites/Room1/Room1Note.png");   
        this.game.sceneManager.puzzleStates.room1.paperTaken = true;
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
                ctx.fillStyle = "#d28cb3";
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

                // Draw inventory area label if player has key
        if (this.hasKey) {
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x + 20, this.y + 20, 125, 175);
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("INVENTORY:", this.x + 40, this.y + 40);
            
            // Draw the diamond key at dragged position (or original if not dragging)
            if (this.keySprite && this.keySprite.complete) {
                ctx.drawImage(this.keySprite, this.dragKeyX, this.dragKeyY, this.keyWidth, this.keyHeight);
            } else {
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.dragKeyX, this.dragKeyY, this.keyWidth, this.keyHeight);
            }
            
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);
    }
}