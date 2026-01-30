class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1";

        // Player state
        this.health = 3;
        this.inventory = []; // Will store objects like {name, sprite, used}

        // Puzzle progress tracking
        this.puzzleStates = {
            room1: { hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false },
            room2: { paintingsClicked: [], pipeObtained: false, lockBroken: false },
            room3: { medallions: [], candlesArranged: false, medallionDoor: false }
        };

        // NPC dialogue tracking
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0 },
            victor: { met: false, dialogueIndex: 0 },
            jin: { met: false, dialogueIndex: 0 }
        };

        this.lily = new Lily(this.game, 1000, 50);

        // ===== BGM STATE =====
        this.roomBGM = null;
        this.roomBGMName = null;
    }

    loadRoom(roomName, spawnX, spawnY) {
        this.clearEntities();
        this.currentRoom = roomName;

        // BGM applicator
        const bgmMap = {
            room1: "./bgm/House of Souls Room1.mp3"
            // room2: "./bgm/room2.mp3",
            // room3: "./bgm/room3.mp3",
            // room4: "./bgm/room4.mp3",
            // room5: "./bgm/room5.mp3"
        };

        const nextBGM = bgmMap[roomName] || null;

        // Stop previous BGM if switching rooms
        if (nextBGM !== this.roomBGMName) {
            if (this.roomBGM) {
                this.roomBGM.pause();
                this.roomBGM.currentTime = 0;
                this.roomBGM = null;
            }

            this.roomBGMName = nextBGM;

            if (nextBGM) {
                this.roomBGM = new Audio(nextBGM);
                this.roomBGM.loop = true;
                this.roomBGM.volume = 0.5;
                this.roomBGM.play().catch(() => {});
            }
        }

        if (roomName === "room1") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room1/PlantRoomBackground.png", 1380, 882)
            );

            // Interactive objects
            this.game.addEntity(new RosePainting(this.game, 150, -150));
            this.game.addEntity(new Bookshelf(this.game, 805, 440));

            // Decorative objects
            this.game.addEntity(new DecorativeSprite(this.game, 1, 200, "./Sprites/Room1/Bed.png", 300, 300, true, { x: 0, y: 0, w: 40, h: 130 }));
            this.game.addEntity(new DecorativeSprite(this.game, 17, 355, "./Sprites/FillerFurniture/SideTable.png", 90, 80));
            this.game.addEntity(new DecorativeSprite(this.game, 30, 325, "./Sprites/Room1/Plant1.png", 40, 60, true));
            this.game.addEntity(new DecorativeSprite(this.game, 50, 400, "./Sprites/Room1/Plant2.png", 40, 70));
            this.game.addEntity(new DecorativeSprite(this.game, 170, 400, "./Sprites/FillerFurniture/BigRedRug.png", 400, 200, false));
            this.game.addEntity(new DecorativeSprite(this.game, 55, 520, "./Sprites/Room1/PlantCluster1.png", 520, 600, true, { x: 80, y: 225, w: 190, h: 500 }));
            this.game.addEntity(new DecorativeSprite(this.game, -40, 450, "./Sprites/Room1/PlantCluster2.png", 500, 600, true, { x: 50, y: 20, w: 380, h: 200 }));
            this.game.addEntity(new DecorativeSprite(this.game, 860, 425, "./Sprites/Room1/PlantCluster3.png", 500, 600, true, { x: 380, y: 120, w: 400, h: 100 }));
            this.game.addEntity(new DecorativeSprite(this.game, 1010, 440, "./Sprites/FillerFurniture/Bookshelf.png", 210, 250));

            // Door to room2
            this.game.addEntity(new Door(this.game, 1105, 65, 157, 187, "room2", 600, 650, false));
        }

        if (roomName === "room2") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 553, 700, 300, 175, "room1", 1100, 150, false));
            this.game.addEntity(new Door(this.game, 975, 18, 155, 187, "room3", 600, 700, false));
            this.game.addEntity(new Shiannel(this.game, 1210, 480, true));

            this.game.addEntity(new DecorativeSprite(this.game, 620, 330, "./Sprites/FillerFurniture/BigRedRug.png", 150, 250, false));
            this.game.addEntity(new DecorativeSprite(this.game, 100, 560, "./Sprites/FillerFurniture/BigRedRug.png", 100, 140, false));
            this.game.addEntity(new DecorativeSprite(this.game, 5, 500, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200, true));
        }

        if (roomName === "room3") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room3/TheCellsBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 553, 736, 260, 150, "room2", 950, 100, false));
            this.game.addEntity(new Door(this.game, 610, 26, 155, 187, "room4", 250, 700, false));

            this.game.addEntity(new DecorativeSprite(this.game, 150, 135, "./Sprites/FillerFurniture/Table.png", 220, 135, true));
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 620, "./Sprites/FillerFurniture/SideToilet.png", 95, 110, true, { x: 20, y: 50, w: 60, h: 80 }, true));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 672, "./Sprites/FillerFurniture/LilStool.png", 60, 60, true));
            this.game.addEntity(new DecorativeSprite(this.game, 982, 135, "./Sprites/FillerFurniture/SideTable.png", 242, 122, true));
        }

        if (roomName === "room4") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room4/LibraryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 230, 714, 230, 187, "room3", 600, 100, false));
            this.game.addEntity(new Door(this.game, 1075, 714, 230, 187, "room5", 150, 700, false));
        }

        if (roomName === "room5") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room5/FinalRoom.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 110, 668, 275, 187, "room4", 1100, 700, false));
        }

        // Position Lily at spawn point
        this.lily.x = spawnX;
        this.lily.y = spawnY;
        this.lily.velocity = { x: 0, y: 0 };
        this.game.addEntity(this.lily);

        // Prevent instant retriggering of interaction key
        this.game.E = false;

        console.log("Room loaded:", roomName, "Lily at:", spawnX, spawnY);
    }

    // Inventory helpers
    addToInventory(itemName, spritePath) {
        this.inventory.push({ name: itemName, sprite: spritePath, used: false });
    }

    markItemAsUsed(itemName) {
        const item = this.inventory.find(i => i.name === itemName);
        if (item) item.used = true;
    }

    hasItem(itemName) {
        const item = this.inventory.find(i => i.name === itemName);
        return item && !item.used;
    }

    getItem(itemName) {
        return this.inventory.find(i => i.name === itemName);
    }

    update() {
        const inventoryOpen = this.game.entities.some(e => e instanceof InventoryUI);

        if (!inventoryOpen) {
            if (this.game.I && !this.wasIPressed && !this.game.examining) {
                this.game.addEntity(new InventoryUI(this.game));
                this.game.examining = true;
                this.wasIPressed = true;
            } else if (!this.game.I) {
                this.wasIPressed = false;
            }
        }
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            // Game over logic
        }
    }

    clearEntities() {
        this.game.entities = [];
    }
}
