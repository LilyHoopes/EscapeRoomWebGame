class Bookshelf {
    
    constructor(game, x, y) {
        this.game = game;

        this.x = x;
        this.y = y;
        this.width = 200;  
        this.height = 250;
        
        this.bookOpened = this.game.sceneManager.puzzleStates.room1.bookUnlocked;
        this.isSolid = true;
        this.removeFromWorld = false;
        this.bbOffset = { x: 5, y: 80, w: 0, h: 150 };
        
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithBook.png");
        this.spriteOpened = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithOpenBook.png");

        // ===== ADDED: Dialogue flow state =====
        this.flowActive = false;
        this.zoomRef = null;
        this.waitReleaseE = false;
    }
    
    update() {
        const sm = this.game.sceneManager;

        // ===== Handle dialogue flow =====
        if (this.flowActive) {

            // Handle E for skip/close dialogue
            if (this.game.E && !this.waitReleaseE) {
                if (sm.dialogueBox && sm.dialogueBox.active && sm.dialogueBox.isTyping) {
                    sm.dialogueBox.skipTyping();
                } else if (sm.dialogueBox && sm.dialogueBox.active) {
                    sm.dialogueBox.close();
                }

                this.game.E = false;
                this.waitReleaseE = true;
                return;
            } else if (!this.game.E) {
                this.waitReleaseE = false;
            }

            // If dialogue closed, unlock zoom interaction
            if (!sm.dialogueBox || !sm.dialogueBox.active) {
                if (this.zoomRef) {
                    this.zoomRef.locked = false;
                }

                this.flowActive = false;
                this.game.examining = true; // zoom still open
            }

            return;
        }

        // Normal interaction
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomViewWithDialogue();
        }

        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(
            this.x + this.bbOffset.x, 
            this.y + this.bbOffset.y, 
            this.width - this.bbOffset.w, 
            this.height - this.bbOffset.h
        );
    }

    get depth() {
        return this.BB ? this.BB.bottom : this.y + this.height;
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 140;
    }

    // ===== CHANGED: Zoom opens locked + dialogue first =====
    openZoomViewWithDialogue() {
        const sm = this.game.sceneManager;

        const zoom = new BookshelfZoomView(this.game, this);
        zoom.locked = true; // must add locked logic in BookshelfZoomView like Painting

        this.zoomRef = zoom;
        this.game.addEntity(zoom);

        // Show dialogue first
        if (sm.dialogueBox) {
            sm.dialogueBox.open(
                "Looks like a plain old bookshelf, but a certain book stands out among the rest.",
                null,
                "Lily"
            );

            // Bring dialogue to front
            const idx = this.game.entities.indexOf(sm.dialogueBox);
            if (idx !== -1) {
                this.game.entities.splice(idx, 1);
                this.game.entities.push(sm.dialogueBox);
            }
        }

        this.flowActive = true;
        this.game.examining = true;
        this.game.E = false;
        this.waitReleaseE = true;
    }
    
    onBookOpened() {
        this.bookOpened = true;
        this.game.sceneManager.puzzleStates.room1.bookUnlocked = true;
    }
    
    draw(ctx) {
        let sprite = this.bookOpened ? this.spriteOpened : this.sprite; 
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.bookOpened ? "#654321" : "#8B4513";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Bookshelf", this.x + 50, this.y + this.height/2);
        }
        
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y + 65;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }

        if (this.game.debug) {
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}