class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1"; 
        
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
        
        this.lily = new Lily(this.game, 50, 50);
    }
    
    loadRoom(roomName, spawnX, spawnY) {
         this.clearEntities();
         this.currentRoom = roomName;

        if (roomName === "room1") {
            this.game.addEntity(new Background(this.game, "./Sprites/Room1/PlantRoomBackground.png", 1380, 882)); // always add background first

            //interactive objects
            // this.game.addEntity(new Painting(this.game, 200, 300, "diamond_key")); // Falls to reveal key
            // this.game.addEntity(new DiamondKey(this.game, 200, 350)); // Hidden initially
            // this.game.addEntity(new Bookshelf(this.game, 400, 250));
            // this.game.addEntity(new LockedBook(this.game, 450, 280)); // Needs diamond key
            // this.game.addEntity(new CodeLock(this.game, 700, 400, "room1_exit")); // 3-digit lock
                
            // Decorative objects (non-interactive)]
            // add as many decorations as we want using these lines
            this.game.addEntity(new DecorativeSprite(this.game, 1, 200, "./Sprites/Room1/Bed.png", 300, 300));
            this.game.addEntity(new DecorativeSprite(this.game, 17, 355, "./Sprites/FillerFurniture/SideTable.png", 90, 80));
            this.game.addEntity(new DecorativeSprite(this.game, 30, 325, "./Sprites/Room1/Plant1.png", 40, 60));
            this.game.addEntity(new DecorativeSprite(this.game, 50, 400, "./Sprites/Room1/Plant2.png", 40, 70));
            this.game.addEntity(new DecorativeSprite(this.game, 170, 400, "./Sprites/FillerFurniture/BigRedRug.png", 400, 200));
            this.game.addEntity(new DecorativeSprite(this.game, 55, 520, "./Sprites/Room1/PlantCluster1.png", 520, 600));
            this.game.addEntity(new DecorativeSprite(this.game, -40, 450, "./Sprites/Room1/PlantCluster2.png", 500, 600));
            this.game.addEntity(new DecorativeSprite(this.game, 860, 425, "./Sprites/Room1/PlantCluster3.png", 500, 600));
            this.game.addEntity(new DecorativeSprite(this.game, 1010, 440, "./Sprites/FillerFurniture/Bookshelf.png", 210, 250));

            // Exit door (locked initially)
            // Door states: game, x cord, y cord, width, height, destinationRoom, spawnX, spawnY, isLocked
            
            // room1 -> room2
            this.game.addEntity(new Door(this.game, 1100, 50, 192, 192, "room2", 520, 650, false));  // set to false for testing
        }

        if (roomName === "room2") {
            this.game.addEntity(new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882));

            // room2 -> room1
            this.game.addEntity(new Door(this.game, 570, 670, 235, 128, "room1", 1100, 250, false)); // door will always stay unlocked (false)

            // room2 -> room 3
            this.game.addEntity(new Door(this.game, 950, 70, 235, 128, "room3", 520, 700, false));

            //npc?

            // Interactive paintings
            // this.game.addEntity(new Painting(this.game, 100, 200, "music_notes", true));
            // this.game.addEntity(new Painting(this.game, 250, 200, "plants", false));
            // this.game.addEntity(new Painting(this.game, 400, 200, "flowers", false));
            // this.game.addEntity(new Painting(this.game, 550, 200, "house", false));
            // this.game.addEntity(new Painting(this.game, 700, 200, "horizon", false));
            // this.game.addEntity(new Painting(this.game, 100, 500, "abstract1", false));
            // this.game.addEntity(new Painting(this.game, 250, 500, "abstract2", false));
            // this.game.addEntity(new Painting(this.game, 400, 500, "abstract3", false));

            // Lead pipe
        // if (!this.puzzleStates.room2.pipeObtained) {
        //     this.game.addEntity(new LeadPipe(this.game, 100, 230, true));
        // }
        
        // // Frozen lock
        // if (!this.puzzleStates.room2.lockBroken) {
        //     this.game.addEntity(new FrozenLock(this.game, 900, 450));
        // }
        
        // // Exit door
        // this.game.addEntity(new Door(this.game, 900, 400, 64, 128, "room3", 50, 400, true));


        //Then add other objects
        
        }

        if (roomName === "room3") {
            //add background first to be behind everything else
            this.game.addEntity(new Background(this.game, "./Sprites/Room3/TheCellsBackground.png", 1380, 882));

            // room3 -> room2
            this.game.addEntity(new Door(this.game, 570, 670, 235, 128, "room2", 900, 150, false)); // door will always stay unlocked (false)

            // room3 -> room 4
            this.game.addEntity(new Door(this.game, 570, 670, 235, 128, "room4", 1100, 250, false));

        //Then add other objectsd
        
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
    

        // Position Lily at spawn point
        this.lily.x = spawnX;
        this.lily.y = spawnY;
        this.lily.velocity = { x: 0, y: 0 };
        
        this.game.addEntity(this.lily);
        
        console.log("Room loaded:", roomName, "Lily at:", spawnX, spawnY);
        console.log("Total entities:", this.game.entities.length);

        console.log("SPAWNING LILY AT:", spawnX, spawnY); // ADD THIS
        console.log("Lily actual position:", this.lily.x, this.lily.y); // ADD THIS
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

    clearEntities() {
        this.game.entities = []
    }
}