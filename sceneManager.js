class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1";

        // Player state
        this.health = 3;
        this.inventory = []; // Will store objects like {name, sprite, used}

        // set true to unlock door for easier testing, false to lock it
        this.debugDoorUnlocks = {
        room1ToRoom2: true,   // Door from room 1 to room 2
        room2ToRoom3: false,   // Door from room 2 to room 3
        room3ToRoom4: false,  // Door from room 3 to room 4 
        room4ToRoom5: true   // This should always be set to true
    };

        // Puzzle progress tracking
        this.puzzleStates = {
            room1: {door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false },
            room2: {door2Open: false, pipeObtained: false, lockBroken: false, lockPosition: null},
            room3: {
                door3Open: false,
                snowflakeMedallion: false,
                candleMedallion: false,
                leafMedallion: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null]
            }
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

        // ===== DIALOGUE UI =====
        // Added: pass game so DialogueBox can use clockTick for typing effect
        this.dialogueBox = new DialogueBox(this.game);
        this.dialogueBox.isPopup = true;
        this.wasEPressed = false;

        // Added: Shiannel "E to Talk" prompt handle
        this.shiannelPrompt = null;

        // Added: single source of truth for Shiannel position in room2
        this.shiannelPos = { x: 1210, y: 150 };
    }

    loadRoom(roomName, spawnX, spawnY) {
        this.clearEntities();
        this.currentRoom = roomName;

        // BGM applicator
        const bgmMap = {
            room1: "./bgm/House of Souls Room1.mp3",
            room2: "./bgm/House of Souls Room2.mp3"
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
                this.roomBGM.muted = !!this.game.muted;
                this.roomBGM.volume = (typeof this.game.volume === "number") ? this.game.volume : 0.5;
                this.roomBGM.play().catch(() => {});
            }
        }

        if (roomName === "room1") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room1/PlantRoomBackground.png", 1380, 882)
            );

            // Interactive objects
            this.game.addEntity(new RosePainting(this.game, 375, 70)); 
            this.game.addEntity(new Bookshelf(this.game, 805, 440));
            this.game.addEntity(new KeyPad(this.game, 1025, 150));

            // Decorative objects
            this.game.addEntity(new DecorativeSprite(this.game, 1, 200, "./Sprites/Room1/Bed.png", 300, 300, true, { x: 0, y: 0, w: 40, h: 180 }));
            this.game.addEntity(new DecorativeSprite(this.game, 17, 355, "./Sprites/FillerFurniture/SideTable.png", 90, 80));
            this.game.addEntity(new DecorativeSprite(this.game, 30, 345, "./Sprites/Room1/Plant1.png", 40, 60, true, {}, false, 500));
            this.game.addEntity(new DecorativeSprite(this.game, 50, 400, "./Sprites/Room1/Plant2.png", 40, 70));
            this.game.addEntity(new DecorativeSprite(this.game, 170, 400, "./Sprites/FillerFurniture/BigRedRug.png", 400, 200, false, { x: 0, y: 0, w: 400, h: 200 }, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 55, 520, "./Sprites/Room1/PlantCluster1.png", 520, 600, true, { x: 80, y: 250, w: 200, h: 500 }));
            this.game.addEntity(new DecorativeSprite(this.game, -40, 450, "./Sprites/Room1/PlantCluster2.png", 500, 600, true, { x: 50, y: 70, w: 400, h: 200 }));
            this.game.addEntity(new DecorativeSprite(this.game, 860, 425, "./Sprites/Room1/PlantCluster3.png", 500, 600, true, { x: 400, y: 120, w: 400, h: 50 }));
            this.game.addEntity(new DecorativeSprite(this.game, 1010, 440, "./Sprites/FillerFurniture/Bookshelf.png", 210, 250, true, { x: 0, y: 80, w: 0, h: 150 }, false));
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 300, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200, true, { x: 0, y: -25, w: 0, h: 10 }, true));

            // invisible walls
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 200)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

            // Door to room2
            let door1Open = this.puzzleStates.room1.door1Open || this.debugDoorUnlocks.room1ToRoom2;
            let room1To2Door = (new Door(this.game, 1105, 65, 157, 187, "room2", 600, 650, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door1Open, 1.0)); // room1 -> room2

            this.game.addEntity(room1To2Door);
        }

        if (roomName === "room2") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 558, 800, 270, 175, "room1", 1100, 150, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room2 -> room1
            let door2Open = this.puzzleStates.room2.door2Open || this.debugDoorUnlocks.room2ToRoom3;
            let room2To3Door = new Door(this.game, 975, 18, 155, 187, "room3", 600, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door2Open, 1.0); // room2 -> room3
            this.game.addEntity(room2To3Door);

            // added shiannel
            this.game.addEntity(new Shiannel(this.game, 1210, 150, true, "crouch"));

            // Added: keep shiannelPos synced with Shiannel spawn position
            this.shiannelPos = { x: 1210, y: 150 };

            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 645, 560, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 827, 645, 550, 230)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

            // frames
            this.game.addEntity(new GenericFrame(this.game, 50, 390, "./Sprites/Room2/CatFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 175, 390, "./Sprites/Room2/DogFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 300, 390, "./Sprites/Room2/FlowerFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 425, 390, "./Sprites/Room2/HouseFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 875, 390, "./Sprites/Room2/IslandFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 1000, 390, "./Sprites/Room2/PepeFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 1250, 390, "./Sprites/Room2/SkeletonFrame.png", 100, 100, 480));
            this.game.addEntity(new MusicNoteFrame(this.game, 1125, 390, 100, 100));

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, 5, 160, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200));
            this.game.addEntity(new DecorativeSprite(this.game, -20, 455, "./Sprites/Room2/longredrug.png", 660, 500, false, {x:0,y:0,w:660,h:500}, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 820, 455, "./Sprites/Room2/longredrug.png", 640, 500, false, {x:0,y:0,w:640,h:500}, false, 250));

            // wall
            this.game.addEntity(new DecorativeSprite(this.game, 0, 330, "./Sprites/Room2/Room2InvisWall.png", 563, 150, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));
            this.game.addEntity(new DecorativeSprite(this.game, 831, 330, "./Sprites/Room2/Room2InvisWall.png", 550, 150, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));

            // lock on door
            this.game.addEntity(new FrozenLock(this.game, 1090, 95));
        }

        if (roomName === "room3") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room3/TheCellsBackground.png", 1380, 882)
            );

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, 150, 135, "./Sprites/Room3/TableWithBlood.png", 220, 135, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 620, "./Sprites/FillerFurniture/SideToilet.png", 95, 110, true, { x: 20, y: 50, w: 60, h: 80 }, true));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 672, "./Sprites/FillerFurniture/LilStool.png", 60, 60, true));
            this.game.addEntity(new DecorativeSprite(this.game, 982, 135, "./Sprites/FillerFurniture/SideTable.png", 242, 122, true));

            // doors
            this.game.addEntity(new Door(this.game, 550, 815, 265, 150, "room2", 950, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room3 -> room2

            let door3Open = this.puzzleStates.room3.door3Open || this.debugDoorUnlocks.room3ToRoom4; 
            let room3To4Door = (new Door(this.game, 610, 30, 155, 187, "room4", 250, 700, "./Sprites/Room3/BlankMedallionDoor.png", "./Sprites/Room3/OpenMedallionDoor.png", !door3Open, 1.0)); // room3 -> room4

            this.game.addEntity(room3To4Door);

            // added victor and jin
            this.game.addEntity(new Victor(this.game, 955, 510, true));
            this.game.addEntity(new Jin(this.game, 300, 495, true));

            // interactable objects
            this.game.addEntity(new PigHead(this.game, 210, 110));
            this.game.addEntity(new CandleTable(this.game, 982, 155));
            this.game.addEntity(new MedallionDoor(this.game, 610, 30));

            //wall
            // this.game.addEntity(new DecorativeSprite(this.game, 0, 450, "./Sprites/Room3/BarLeft.png", 200, 60, true));
            // this.game.addEntity(new DecorativeSprite(this.game, 940, 450, "./Sprites/Room3/BarRight.png", 200, 60, true));


            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 385, 435, 400)); // jailcell left
            this.game.addEntity(new InvisibleCollider(this.game, 945, 385, 450, 400)); // jailcell right

            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 680, 550, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 815, 680, 560, 230)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left
        }

        if (roomName === "room4") {
            this.game.addEntity(new Background(this.game, "./Sprites/Room4/LibraryBackground.png", 1380, 882));

            this.game.addEntity(new Door(this.game, 232, 800, 228, 187, "room3", 600, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room3
            let room4To5Door = (new Door(this.game, 1072, 800, 228, 187, "room5", 150, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room5

            this.game.addEntity(room4To5Door);

            //wall
            this.game.addEntity(new DecorativeSprite(this.game, 640, 310, "./Sprites/Room4/TopHalfOfBookShelf.png", 420, 120, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));

            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 440, 450)); // top left
            this.game.addEntity(new InvisibleCollider(this.game, 1225, 150, 130, 70)); // top right
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 1300, 150, 100, 410)); // right mid
            this.game.addEntity(new InvisibleCollider(this.game, 640, 400, 420, 300)); // center bot
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 645, 235, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 460, 660, 620, 230)); // bottom mid
            this.game.addEntity(new InvisibleCollider(this.game, 1295, 660, 100, 225)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left
        }

        if (roomName === "room5") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room5/FinalRoom.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 110, 800, 275, 187, "room4", 1100, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room5 -> room4
            this.game.addEntity(new Door(this.game, 700, 18, 450, 180, "ending", 0, 0, "./Sprites/Room5/FinalDoorLocked.png", "./Sprites/Room5/FinalDoorOpen.png", true, 1.0)); // room5 -> ending screen

            // Add NPCs: Shiannel, Victor and Jin
            this.game.addEntity(new Shiannel(this.game, 500, 300, true, "idle"));
            this.game.addEntity(new Victor(this.game, 1210, 250, true));
            this.game.addEntity(new Jin(this.game, 1140, 450, true));

            // interactable 
            // thy booketh shelf

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, 10, 350, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 90, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 220, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 95, 10, "./Sprites/FillerFurniture/Bookshelf.png", 210, 220, true, { x: 0, y: 0, w: 0, h: 70 },));
            this.game.addEntity(new DecorativeSprite(this.game, 308, 10, "./Sprites/FillerFurniture/Bookshelf.png", 210, 220, true, { x: 0, y: 0, w: 0, h: 70 },));
            this.game.addEntity(new DecorativeSprite(this.game, 150, 300, "./Sprites/FillerFurniture/BigRedRug.png", 330, 180, false, { x: 0, y: 0, w: 0, h: 40 }, false, 250));

            // invisible walls
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 385, 615, 1000, 250)); // bottom center
            this.game.addEntity(new InvisibleCollider(this.game, 0, 620, 115, 250)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

        }

        if (roomName === "ending") {
            this.showEndingScreen();
            return;
        }

        // Position Lily at spawn point
        this.lily.x = spawnX;
        this.lily.y = spawnY;
        this.lily.velocity = { x: 0, y: 0 };
        this.game.addEntity(this.lily);
        this.game.addEntity(this.dialogueBox);

        this.game.addEntity(new HealthUI(this.game));

        // Prevent instant retriggering of interaction key
        this.game.E = false;
        this.wasEPressed = false;

        // Close dialogue on room change
        this.dialogueBox.close();

        // Added: remove Shiannel prompt on room change
        if (this.shiannelPrompt) {
            this.shiannelPrompt.removeFromWorld = true;
            this.shiannelPrompt = null;
        }
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

    // Added: map internal npc keys to display names
    getNPCDisplayName(npcName) {
        const map = {
            shiannel: "Shiannel",
            victor: "Victor",
            jin: "Jin"
        };
        return map[npcName] || "";
    }

    // NPC DIALOGUE
    handleNPCInteraction(npcName, dialogueLines) {
        const npc = this.npcStates[npcName];
        if (!npc || !Array.isArray(dialogueLines) || dialogueLines.length === 0) return;

        const displayName = this.getNPCDisplayName(npcName);

        // If already open, advance
        if (this.dialogueBox.active) {
            npc.dialogueIndex++;
            if (npc.dialogueIndex >= dialogueLines.length) {
                npc.dialogueIndex = 0;
                this.dialogueBox.close();
                this.game.examining = false;
            } else {
                // Added: pass speaker name (portrait path stays optional)
                this.dialogueBox.open(dialogueLines[npc.dialogueIndex], null, displayName);
            }
            return;
        }

        // Open fresh
        npc.met = true;
        npc.dialogueIndex = 0;

        // Added: pass speaker name (portrait path stays optional)
        this.dialogueBox.open(dialogueLines[0], null, displayName);

        // Optional: lock player interaction while dialogue is open
        this.game.examining = true;
    }

    // Basic distance check
    isNear(x, y, range = 90) {
        const dx = (this.lily.x - x);
        const dy = (this.lily.y - y);
        return (dx * dx + dy * dy) <= (range * range);
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

        // E key NPC talk (GOTTA FIX THIS ONE)
        // We only trigger once per key press
        if (this.game.E && !this.wasEPressed) {
            // If dialogue is open, handle typing skip first, otherwise advance dialogue
            if (this.dialogueBox.active) {

                // Added: if text is still typing, E will instantly finish the line
                if (this.dialogueBox.isTyping) {
                    this.dialogueBox.skipTyping();
                    this.wasEPressed = true;
                    return;
                }

                if (this.currentRoom === "room2") {
                    this.handleNPCInteraction("shiannel", [
                        "testing 1",
                        "testing 2",
                        "testing 3"
                    ]);
                } else if (this.currentRoom === "room3") {

                    this.handleNPCInteraction("victor", [
                        "Testing1",
                        "Testing2",
                        "Testing3"
                    ]);
                } else {
                    // Default: close if open and not matched
                    this.dialogueBox.close();
                    this.game.examining = false;
                }
            } else {
                // Dialogue not open yet, decide who you are near

                if (this.currentRoom === "room2") {
                    // Added: use Shiannel position source for proximity check
                    if (this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120)) {
                        // Added: remove prompt when starting dialogue
                        if (this.shiannelPrompt) {
                            this.shiannelPrompt.removeFromWorld = true;
                            this.shiannelPrompt = null;
                        }

                        this.handleNPCInteraction("shiannel", [
                            "You should not be here.",
                            "The paintings watch more than you think.",
                            "If you hear footsteps behind you, do not turn around."
                        ]);
                    }
                }

                if (this.currentRoom === "room3") {
                    // Victor spawn: (955, 510)
                    if (this.isNear(955, 510, 120)) {
                        this.handleNPCInteraction("victor", [
                            "The door never opened for me.",
                            "Do not repeat my mistake.",
                            "If you find a symbol, remember its order."
                        ]);
                    }

                    // Jin spawn: (300, 495)
                    if (this.isNear(300, 495, 120)) {
                        this.handleNPCInteraction("jin", [
                            "You made it this far.",
                            "Stay calm, the room is designed to confuse you.",
                            "Look for patterns, not objects."
                        ]);
                    }
                }
            }

            this.wasEPressed = true;
        } else if (!this.game.E) {
            this.wasEPressed = false;
        }

        // Keep prompt updated even when E is not pressed (room2 Shiannel only)
        if (!this.dialogueBox.active && this.currentRoom === "room2") {
            // Added: use Shiannel position source for prompt placement
            const nearShiannel = this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120);

            if (nearShiannel) {
                if (!this.shiannelPrompt) {
                    this.shiannelPrompt = new TalkPrompt(
                        this.game,
                        this.shiannelPos.x,
                        this.shiannelPos.y - 80,
                        "E to Talk"
                    );
                    this.game.addEntity(this.shiannelPrompt);
                }
            } else {
                if (this.shiannelPrompt) {
                    this.shiannelPrompt.removeFromWorld = true;
                    this.shiannelPrompt = null;
                }
            }
        } else {
            if (this.shiannelPrompt) {
                this.shiannelPrompt.removeFromWorld = true;
                this.shiannelPrompt = null;
            }
        }
    }

    takeDamage() {
        if (this.health <= 0) return; // Already dead
        
        this.health--;
        
        if (this.health <= 0) {
            // Player died womp womp
            this.showDeathScreen();
        }
    }

    showDeathScreen() {
    // Stop all music
    if (this.roomBGM) {
        this.roomBGM.pause();
        this.roomBGM.currentTime = 0;
    }
    
    // Show death screen
    this.game.addEntity(new DeathScreen(this.game));
    }

    showEndingScreen() {
        // Stop room BGM
        if (this.roomBGM) {
            this.roomBGM.pause();
            this.roomBGM.currentTime = 0;
            this.roomBGM = null;
        }
        console.log("in showEndingScreen method")
        
        // Clear entities and show ending
        this.clearEntities();
        this.game.addEntity(new EndingScreen(this.game));
    }

    clearEntities() {
        this.game.entities = [];
    }

    resetGame() {
        // Reset health
        this.health = 3;
        
        // Clear inventory
        this.inventory = [];
        
        // Reset all puzzle states
        this.puzzleStates = {
            room1: {door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false },
            room2: {door2Open: false, pipeObtained: false, lockBroken: false, lockPosition: null}, 
            room3: {
                snowflakeMedallion: false,
                candleMedallion: false,
                leafMedallion: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null],
                door3Open: false
            }
        };
        
        // Reset NPC dialogue
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0 },
            victor: { met: false, dialogueIndex: 0 },
            jin: { met: false, dialogueIndex: 0 }
        };
        
        // Load Room 1
        this.loadRoom("room1", 210, 100);
    }
}

// Dialogue UI class
class DialogueBox {
    constructor(game) {
        // Added: store game reference for clockTick timing
        this.game = game;

        this.active = false;

        // Visible text that gets drawn
        this.text = "";

        // Typing effect state
        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.typeSpeed = 45; // characters per second
        this.isTyping = false;

        // Portrait state
        this.portraitImg = null;
        this.portraitReady = false;

        // Added: speaker name
        this.speakerName = "";

        this.isPopup = true;
    }

    update() {
        // Advance typing effect over time
        if (!this.active || !this.isTyping) return;

        const dt = (this.game && typeof this.game.clockTick === "number") ? this.game.clockTick : (1 / 60);
        this.typeTimer += dt;

        const charsToAdd = Math.floor(this.typeTimer * this.typeSpeed);
        if (charsToAdd <= 0) return;

        this.typeTimer -= charsToAdd / this.typeSpeed;
        this.charIndex = Math.min(this.fullText.length, this.charIndex + charsToAdd);

        this.displayText = this.fullText.slice(0, this.charIndex);
        this.text = this.displayText;

        if (this.charIndex >= this.fullText.length) {
            this.isTyping = false;
        }
    }

    // Added: supports optional portraitPath and speakerName
    open(text, portraitPath = null, speakerName = "") {
        this.active = true;

        // Typing effect reset
        this.fullText = String(text || "");
        this.displayText = "";
        this.text = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.isTyping = true;

        // Speaker name
        this.speakerName = speakerName || "";

        // Portrait reset
        this.portraitImg = null;
        this.portraitReady = false;

        if (portraitPath) {
            const img = new Image();
            img.onload = () => { this.portraitReady = true; };
            img.src = portraitPath;
            this.portraitImg = img;
        }
    }

    // Instantly completes the current line
    skipTyping() {
        if (!this.active || !this.isTyping) return;

        this.isTyping = false;
        this.charIndex = this.fullText.length;
        this.displayText = this.fullText;
        this.text = this.fullText;
    }

    close() {
        this.active = false;

        // Reset text and typing state
        this.text = "";
        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.isTyping = false;

        // Reset portrait state
        this.portraitImg = null;
        this.portraitReady = false;

        // Reset speaker name
        this.speakerName = "";
    }

    draw(ctx) {
        if (!this.active) return;

        const boxX = 120;
        const boxY = 560;
        const boxW = 1140;

        // Added: increase height to prevent text overlap
        const boxH = 200;

        // Portrait layout
        const portraitSize = 120;
        const portraitPad = 20;
        const portraitX = boxX + portraitPad;
        const portraitY = boxY + Math.floor((boxH - portraitSize) / 2);

        // Text layout
        const textX = portraitX + portraitSize + 30;
        const nameY = boxY + 42;     // Added: speaker name line
        const textY = boxY + 72;     // Added: dialogue text starts lower to avoid overlap with name
        const textMaxW = boxX + boxW - textX - 40;

        // Box
        ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Portrait frame
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);

        // Portrait image (only if provided and ready)
        if (this.portraitImg && this.portraitReady) {
            ctx.drawImage(this.portraitImg, portraitX, portraitY, portraitSize, portraitSize);
        }

        // Added: speaker name
        if (this.speakerName) {
            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText(this.speakerName, textX, nameY);
        }

        // Main dialogue text
        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        wrapText(ctx, this.text, textX, textY, textMaxW, 28);

        // Added: hint placed at bottom-right so it never overlaps dialogue
        ctx.font = "16px Arial";
        const hint = this.isTyping ? "Press E to skip" : "Press E to continue";
        ctx.textAlign = "right";
        ctx.fillText(hint, boxX + boxW - 30, boxY + boxH - 15);
        ctx.textAlign = "left";
    }
}

// Added: "E to Talk" prompt entity
class TalkPrompt {
    constructor(game, x, y, text) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.text = text || "E to Talk";
        this.removeFromWorld = false;

        // Added: draw above everything in GameEngine (popup layer)
        this.isPopup = true;
    }

    update() {}

    draw(ctx) {
        ctx.save();
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Simple text wrapping helper for canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}