class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "greenHouse"; 
        
        // Player state
        this.health = 3;
        this.inventory = [];
        
        // Puzzle progress tracking
        this.puzzleStates = {
            room1: {hasKey: false, bookUnlocked: false, codeEntered: false },
            room2: {paintingsClicked: [], pipeObtained: false, lockBroken: false},
            room3: {medallions: [], candlesArranged: false, medallionDoor: false },
            // etc.
        };
        
        // NPC dialogue tracking
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0 },
            victor: { met: false, dialogueIndex: 0 },
            jin: { met: false, dialogueIndex: 0 }
        };
        
        this.lily = new Lily(this.game, startX, startY);
    }
    
    loadRoom(roomName, spawnX, spawnY) {
         this.clearEntities();
         this.currentRoom = roomName;

        if (roomName === "room1") {
            //add background  first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room1/PlantRoomBackground.png", 1025, 2050));

            //interactive objects
            this.game.addEntity(new Painting(this.game, 200, 300, "diamond_key")); // Falls to reveal key
            this.game.addEntity(new DiamondKey(this.game, 200, 350)); // Hidden initially
            this.game.addEntity(new Bookshelf(this.game, 400, 250));
            this.game.addEntity(new LockedBook(this.game, 450, 280)); // Needs diamond key
            this.game.addEntity(new CodeLock(this.game, 700, 400, "room1_exit")); // 3-digit lock
                
            // Decorative objects (non-interactive)]
            // add as many decorations as we want using these lines
            this.game.addEntity(new DecorativeSprite(this.game, 100, 500, "./Sprites/Room1/Bed.png", 150, 100));
            this.game.addEntity(new DecorativeSprite(this.game, 50, 100, "./Sprites/Room1/vines.png", 80, 120));
            this.game.addEntity(new DecorativeSprite(this.game, 600, 200, "./Sprites/Room1/plant.png", 50, 60));
            this.game.addEntity(new DecorativeSprite(this.game, 200, 600, "./Sprites/Room1/bookshelf_decorative.png", 100, 150));

            // Exit door (locked initially)
            this.game.addEntity(new Door(this.game, 900, 400, 64, 128, "room2", 50, 400, true));

        }

        if (roomName === "room2") {
            //add background  first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1025, 2050));

        //Then add other objects
        
        }

        if (roomName === "room3") {
            //add background  first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room3/TheCellsBackground.png", 1025, 2050));

        //Then add other objects
        
        }

        if (roomName === "room4") {
            //add background  first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room4/insertName.png", 1025, 2050));

        //Then add other objects
        
        }

        if (roomName === "room5") {
            //add background  first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room5/insertName.png", 1025, 2050));

        //Then add other objects
        
        }

        // Clear current entities
        // Load room data (similar to Mario's level loading)
        // Spawn objects, NPCs, collectibles
        // Set background music
        // Position Lily
    }
    
    addToInventory(item) {
        this.inventory.push(item);
        // Show notification?
    }
    
    checkPuzzleSolved(roomName) {
        // Check if all puzzle conditions met for this room
        // Unlock door if solved
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            // Game over
        }
    }
}