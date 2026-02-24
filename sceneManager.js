class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1";

        // Player state
        this.health = 3;
        this.inventory = []; // Will store objects like {name, sprite, used}

        // set true to unlock door for easier testing, false to lock it
        this.debugDoorUnlocks = {
        room1ToRoom2: false,   // Door from room 1 to room 2
        room2ToRoom3: false,   // Door from room 2 to room 3
        room3ToRoom4: false,  // Door from room 3 to room 4 
        room4ToRoom5: true   // This should always be set to true
    };

        // Puzzle progress tracking
        this.puzzleStates = {
            room1: {door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false, introPlayed: false },
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
        // DialogueBox is defined in DialogueBox.js
        this.dialogueBox = new DialogueBox(this.game);
        this.dialogueBox.isPopup = true;
        // Used only to prevent repeat-triggering on hold
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
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 300, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200, true, { x: -20, y: 0, w: 0, h: 0 }, true));

            // invisible walls
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 200)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

            // Door to room2
            let door1Open = this.puzzleStates.room1.door1Open;
            let room1To2Door = (new Door(this.game, 1105, 65, 157, 187, "room2", 600, 650, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door1Open, 1.0)); // room1 -> room2
            
            if (this.debugDoorUnlocks.room1ToRoom2) {
                door1Open = true;
            }

            this.game.addEntity(room1To2Door);
        }

        if (roomName === "room2") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 558, 800, 270, 175, "room1", 1100, 150, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room2 -> room1
            let door2Open = this.puzzleStates.room2.door2Open; 
            let room2To3Door = new Door(this.game, 975, 18, 155, 187, "room3", 600, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door2Open, 1.0); // room2 -> room3
            this.game.addEntity(room2To3Door);

            if (this.puzzleStates.room2.lockBroken || this.debugDoorUnlocks.room2ToRoom3) {
                door2Open = true;
            }

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
            this.game.addEntity(new DecorativeSprite(this.game, 620, 330, "./Sprites/FillerFurniture/BigRedRug.png", 150, 250, false, { x: 0, y: 0, w: 150, h: 250 }, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 5, 160, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200));

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

            let door3Open = this.puzzleStates.room3.door3Open; 
            let room3To4Door = (new Door(this.game, 610, 30, 155, 187, "room4", 250, 700, "./Sprites/Room3/BlankMedallionDoor.png", "./Sprites/Room3/OpenMedallionDoor.png", !door3Open, 1.0)); // room3 -> room4

            if (this.puzzleStates.room3.medallionDoor || this.debugDoorUnlocks.room3ToRoom4) {
                door3Open = true;
            }
            this.game.addEntity(room3To4Door);

            // added victor and jin
            this.game.addEntity(new Victor(this.game, 955, 510, true));
            this.game.addEntity(new Jin(this.game, 300, 495, true));

            // interactable objects
            this.game.addEntity(new PigHead(this.game, 210, 110));
            this.game.addEntity(new CandleTable(this.game, 982, 155));
            this.game.addEntity(new MedallionDoor(this.game, 610, 30));

            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
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

        // Room 1 intro dialogue (play once per full game run)
        if (roomName === "room1" && !this.puzzleStates.room1.introPlayed) {
            this.puzzleStates.room1.introPlayed = true;

            // Lock movement/interaction while the intro is playing
            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    "Where am I? The last thing I remember was walking to my car, and then something hard hit the back of my head.",
                    "[A scream echoes in the distance]",
                    "Was I kidnapped? Oh no, I have to find a way out of here!"
                ],
                null,
                "Lily",
                () => {
                    this.game.examining = false;
                }
                );
                     }
            
                // Room 2 intro dialogue (play once per full game run)
if (roomName === "room2" && !this.puzzleStates.room2.introPlayed) {

    this.puzzleStates.room2.introPlayed = true;

    // Lock movement during intro
    this.game.examining = true;

    this.dialogueBox.startSequence(
        [
            "Brr, it is freezing in here!",
            "*Sees Shiannel huddled in the corner*",
            "Oh gosh, shes not… dead is she?"
        ],
        null,
        "Lily",
        () => {
            this.game.examining = false;
        }
    );
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

    // NPC DIALOGUE (start-only)
    // DialogueBox handles advancing lines via E while active.
    startNPCDialogue(npcName, dialogueLines) {
        if (!Array.isArray(dialogueLines) || dialogueLines.length === 0) return;
        const displayName = this.getNPCDisplayName(npcName);

        // Mark met (optional)
        const npc = this.npcStates[npcName];
        if (npc) npc.met = true;

        this.game.examining = true;
        this.dialogueBox.startSequence(dialogueLines, null, displayName, () => {
            this.game.examining = false;
        });
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

        // If a dialogue is open, DialogueBox handles E to skip/advance.
        // SceneManager should not also consume E while a dialogue is active.
        if (this.dialogueBox.active) {
            this.wasEPressed = !!this.game.E;
        } else {
            // NPC talk trigger (start-only). Trigger once per key press.
if (this.game.E && !this.wasEPressed && !this.game.examining) {

    let triggeredNPC = false;

    if (this.currentRoom === "room2") {
        if (this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120)) {
            if (this.shiannelPrompt) {
                this.shiannelPrompt.removeFromWorld = true;
                this.shiannelPrompt = null;
            }
            this.game.examining = true;

this.dialogueBox.startSequence(
    [
        { speaker: "Shiannel", text: ". . ." },
        { speaker: "Lily", text: "Hello? Are you okay?" },
        { speaker: "", text: "*Shiannel stands up*" },
        { speaker: "Shiannel", text: "Another survivor! Thank g-goodness, I have been stuck in this room for so long! It’s f-freezing!" },
        { speaker: "Lily", text: "It’s good I’m not alone!" },
        { speaker: "Shiannel", text: "Yes! But, we have a problem, T-the exit door has a lock and it’s frozen s-solid! I tried to break it with my h-hands but it wont budge!" },
        { speaker: "Lily", text: "I guess we need something harder to hit it with then." },
        { speaker: "Shiannel", text: "!!" },
        { speaker: "Shiannel", text: "The k-killer! He hides a weapon here within this room. But he a-always makes me close my eyes before he puts it away. I havent been able to f-find it yet, I can’t move as fast anymore, the cold is getting to me. It’s so… c-cold!" },
        { speaker: "Lily", text: "You just stay there, I’ll start looking. But where should I even begin? I don’t want to waste time." },
        { speaker: "Shiannel", text: "I’m not sure, b-but whenever he’s home, he always plays c-classical music. It’s c-creepy!" },
        { speaker: "Lily", text: "Hm…" }
    ],
    null,
    null,
    () => {
        this.game.examining = false;
    }
);
            triggeredNPC = true;
        }
    }

    if (this.currentRoom === "room3") {
        if (this.isNear(955, 510, 120)) {
            this.startNPCDialogue("victor", [
                "The door never opened for me.",
                "Do not repeat my mistake.",
                "If you find a symbol, remember its order."
            ]);
            triggeredNPC = true;

        } else if (this.isNear(300, 495, 120)) {
            this.startNPCDialogue("jin", [
                "You made it this far.",
                "Stay calm, the room is designed to confuse you.",
                "Look for patterns, not objects."
            ]);
            triggeredNPC = true;
        }
    }


    if (triggeredNPC) this.game.E = false;
}

            this.wasEPressed = !!this.game.E;
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
            room1: {door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false, introPlayed: false },
            room2: {door2Open: false, pipeObtained: false, lockBroken: false, lockPosition: null, introPlayed: false},
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