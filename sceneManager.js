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

        if (roomName === "room1") {

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