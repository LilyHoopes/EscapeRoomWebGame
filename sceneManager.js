class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1";

        this.roomIntroPlayed = {
        room2: false,
        room3: false
        };

        // Player state
        this.health = 3;
        this.inventory = []; // Will store objects like {name, sprite, used}

        //killer stuff
        this.room4KillerTimer = 0;
        this.room4KillerDelay = 3; // seconds
        this.room4KillerSpawned = false;

        // set true to unlock door for easier testing, false to lock it
        this.debugDoorUnlocks = {
        room1ToRoom2: true,   // Door from room 1 to room 2
        room2ToRoom3: true,   // Door from room 2 to room 3
        room3ToRoom4: true,  // Door from room 3 to room 4 
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
                hasCandleCodex: false,
                talkedAboutCandles: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null]
            }
        };

        // NPC dialogue tracking
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0, stage: 0 },
            victor: { met: false, dialogueIndex: 0, stage: 0 },
            jin: { met: false, dialogueIndex: 0, stage: 0 }
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
        
        // Track dialogue open/close state to prevent E carryover into doors
        this.wasDialogueActive = false;

        // Added: Shiannel "E to Talk" prompt handle
        this.shiannelPrompt = null;

        // Added: single source of truth for Shiannel position in room2
        this.shiannelPos = { x: 1210, y: 150 };

        // Victor/Jin "E to Talk" prompt handles (room3)
        this.victorPrompt = null;
        this.jinPrompt = null;
        
        // Single source of truth for Victor/Jin positions in room3 (default)
        this.victorPos = { x: 955, y: 510 };
        this.jinPos    = { x: 300, y: 495 };

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
            let door1Open = this.puzzleStates.room1.door1Open || this.debugDoorUnlocks.room1ToRoom2;
            let room1To2Door = new Door(this.game, 1105, 65, 157, 187, "room2", 600, 650,
                "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door1Open, 1.0);
            this.game.addEntity(room1To2Door);
        }

        if (roomName === "room2") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 558, 800, 270, 175, "room1", 1100, 150, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room2 -> room1

            let door2Open = this.puzzleStates.room2.door2Open || this.debugDoorUnlocks.room2ToRoom3;
            let room2To3Door = new Door(this.game, 975, 18, 155, 187, "room3", 600, 700,
                "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door2Open, 1.0);
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
            this.game.addEntity(new DecorativeSprite(this.game, -20, 455, "./Sprites/Room2/longredrug.png", 660, 500, false, {x:0,y:0,w:660,h:500}, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 820, 455, "./Sprites/Room2/longredrug.png", 640, 500, false, {x:0,y:0,w:640,h:500}, false, 250));
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
            this.game.addEntity(new DecorativeSprite(this.game, 25, 150, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },)); 
            this.game.addEntity(new DecorativeSprite(this.game, 1255, 150, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));    
            this.game.addEntity(new DecorativeSprite(this.game, 2, 482, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));    
            this.game.addEntity(new DecorativeSprite(this.game, 1280, 482, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));      

            // doors
            this.game.addEntity(new Door(this.game, 550, 815, 265, 150, "room2", 950, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room3 -> room2

            let door3Open = this.puzzleStates.room3.door3Open || this.debugDoorUnlocks.room3ToRoom4;
            let room3To4Door = new Door(this.game, 610, 30, 155, 187, "room4", 250, 700,
                "./Sprites/Room3/BlankMedallionDoor.png", "./Sprites/Room3/OpenMedallionDoor.png", !door3Open, 1.0);
            this.game.addEntity(room3To4Door);

            // added victor and jin
            this.game.addEntity(new Victor(this.game, 955, 510, true));
            this.game.addEntity(new Jin(this.game, 300, 495, true));

            // sync talk prompt positions with NPC spawn
            this.victorPos = { x: 955, y: 510 };
            this.jinPos    = { x: 300, y: 495 };

            // interactable objects
            this.game.addEntity(new PigHead(this.game, 210, 110));
            this.game.addEntity(new CandleTable(this.game, 982, 155));
            this.game.addEntity(new MedallionDoor(this.game, 610, 30));

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
            // Reset killer spawn state
            this.room4KillerTimer = 0;
            this.room4KillerSpawned = false;
        
            this.game.addEntity(new Door(this.game, 232, 800, 228, 187, "room3", 600, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room3
            let room4To5Door = (new Door(this.game, 1072, 800, 228, 187, "room5", 150, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room5

            this.game.addEntity(room4To5Door);

            //wall
            this.game.addEntity(new DecorativeSprite(this.game, 640, 300, "./Sprites/Room4/TopHalfOfBookShelf.png", 420, 115, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));
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
            this.game.addEntity(new Shiannel(this.game, 570, 100, true, "idle"));
            this.game.addEntity(new Victor(this.game, 1210, 250, true));
            this.game.addEntity(new Jin(this.game, 1140, 450, true));

            // interactable 
            // thy booketh shelf
            this.game.addEntity(new DecorativeSprite(this.game, 386, 420, "./Sprites/FillerFurniture/BackOfBookshelf.png", 220, 240, true, { x: 0, y: 0, w: 0, h: 40 },));  

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
        if (roomName === "room3" && !this.roomIntroPlayed.room3) {

    this.roomIntroPlayed.room3 = true;
    this.game.examining = true;

    this.dialogueBox.startSequence(
    [
        { speaker: "Lily", text: "What the…" },
        { speaker: "", text: "*Lily sees Victor and Jin within their cells*" },
        { speaker: "Lily", text: "Oh my god, are you guys okay?!" },
        { speaker: "Victor", text: "Yes, we have been trying to find a way out, but as you can see, we're stuck. I’m Victor. This over here is Jin." },
        { speaker: "Jin", text: "Hello, it is good to see another survivor." },
        { speaker: "Lily", text: "Yeah, I am glad to see I am not alone in this house… We have to find a way out!" },
        { speaker: "Victor", text: "The only way out of this room is with 3 medallions. Here, I managed to find one before the killer locked us up." },
        { speaker: "Lily", text: "Thank you. How can I get you guys out?" },
        { speaker: "Victor", text: "Don’t worry about us, we’ll find a way. You should just focus on trying to get out of this room." },
        { speaker: "Lily", text: "Okay.." }
    ],
    null,
    null,
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

    // Inventory toggle
    if (!inventoryOpen) {
        if (this.game.I && !this.wasIPressed && !this.game.examining) {
            this.game.addEntity(new InventoryUI(this.game));
            this.game.examining = true;
            this.wasIPressed = true;
        } else if (!this.game.I) {
            this.wasIPressed = false;
        }
    }

    // Dialogue carryover block
    if (!this.dialogueBox.active && this.wasDialogueActive) {
        this.game.E = false;
    }
    this.wasDialogueActive = this.dialogueBox.active;

    // Dialogue is open, skips all
    if (this.dialogueBox.active) {
        this.wasEPressed = !!this.game.E;
        return;
    }

    // ===== NPC talk trigger (start-only). Trigger once per key press. =====
    if (this.game.E && !this.wasEPressed && !this.dialogueBox.active) {
        let triggeredNPC = false;

        // ROOM 2: Shiannel
        if (this.currentRoom === "room2") {
            if (this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120)) {

                if (this.shiannelPrompt) {
                    this.shiannelPrompt.removeFromWorld = true;
                    this.shiannelPrompt = null;
                }

                const shi = this.npcStates.shiannel;

                // stage control
                if (this.puzzleStates.room2.lockBroken) {
                    shi.stage = 2;
                }

                // Consume E immediately so it does not retrigger
                this.game.E = false;

                try {
                    this.game.examining = true;

                    this.dialogueBox.startSequence(
                        Shiannel.getDialogue(shi.stage),
                        null,
                        null,
                        () => {
                            if (shi.stage === 0) shi.stage = 1;
                            shi.met = true;
                            this.game.examining = false;
                        }
                    );

                    triggeredNPC = true;

                } catch (err) {
                    console.error("Shiannel dialogue error:", err);
                    this.game.examining = false;
                    this.dialogueBox.close();
                }
            }
        }

        // ROOM 3: Victor / Jin
        if (this.currentRoom === "room3") {
            const victorState = this.npcStates.victor;
            const jinState = this.npcStates.jin;
            const r3 = this.puzzleStates.room3;

            // Victor
            if (this.victorPos && this.isNear(this.victorPos.x, this.victorPos.y, 220)) {

                if (this.victorPrompt) {
                    this.victorPrompt.removeFromWorld = true;
                    this.victorPrompt = null;
                }

                this.game.E = false;
                this.game.examining = true;

                // Stage logic based on candle interaction and codex status
                if (r3.talkedAboutCandles && !r3.hasCandleCodex && victorState.stage === 0) {
                    victorState.stage = 1;
                }

                if (r3.hasCandleCodex && victorState.stage < 2) {
                    victorState.stage = 2;
                }

                this.dialogueBox.startSequence(
                    Victor.getDialogue(victorState.stage),
                    null,
                    "Victor",
                    () => {
                        victorState.met = true;
                        this.game.examining = false;
                    }
                );

                triggeredNPC = true;
            }

            // Jin
            else if (this.isNear(this.jinPos.x, this.jinPos.y, 120)) {

                if (this.jinPrompt) {
                    this.jinPrompt.removeFromWorld = true;
                    this.jinPrompt = null;
                }

                this.game.E = false;
                this.game.examining = true;

                // switch Jin to codex dialogue (stage 1)
                if (r3.talkedAboutCandles && !r3.hasCandleCodex && jinState.stage === 0) {
                    jinState.stage = 1;
                }

                this.dialogueBox.startSequence(
                    Jin.getDialogue(jinState.stage),
                    null,
                    "Jin",
                    () => {
                        // Give codex once after stage 1 dialogue
                        if (jinState.stage === 1 && !r3.hasCandleCodex) {
                            r3.hasCandleCodex = true;
                            this.addToInventory("Candle Codex", "./Sprites/Room3/Codex.png");
                            jinState.stage = 2;
                        }

                        jinState.met = true;
                        this.game.examining = false;
                    }
                );

                triggeredNPC = true;
            }
        }

        if (triggeredNPC) this.game.E = false;
    }

    this.wasEPressed = !!this.game.E;

    // ===== Prompt updates =====

    // Room2 Shiannel prompt
    if (!this.dialogueBox.active && this.currentRoom === "room2") {
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

    // Room3 Victor/Jin prompts
    if (!this.dialogueBox.active && this.currentRoom === "room3") {

        const nearVictor = this.isNear(this.victorPos.x, this.victorPos.y, 220);
        const nearJin    = this.isNear(this.jinPos.x, this.jinPos.y, 120);

        // Victor prompt
        if (nearVictor) {
            if (!this.victorPrompt) {
                this.victorPrompt = new TalkPrompt(
                    this.game,
                    this.victorPos.x + 75,
                    this.victorPos.y - 40,
                    "E to Talk"
                );
                this.game.addEntity(this.victorPrompt);
            }
        } else {
            if (this.victorPrompt) {
                this.victorPrompt.removeFromWorld = true;
                this.victorPrompt = null;
            }
        }

        // Jin prompt
        if (nearJin) {
            if (!this.jinPrompt) {
                this.jinPrompt = new TalkPrompt(
                    this.game,
                    this.jinPos.x + 75,
                    this.jinPos.y - 40,
                    "F to Talk"
                );
                this.game.addEntity(this.jinPrompt);
            }
        } else {
            if (this.jinPrompt) {
                this.jinPrompt.removeFromWorld = true;
                this.jinPrompt = null;
            }
        }

    } else {
        // Not in room3, remove both prompts
        if (this.victorPrompt) {
            this.victorPrompt.removeFromWorld = true;
            this.victorPrompt = null;
        }
        if (this.jinPrompt) {
            this.jinPrompt.removeFromWorld = true;
            this.jinPrompt = null;
        }
    }

    // Room 4 Killer Spawn Logic
    if (this.currentRoom === "room4" && !this.room4KillerSpawned) {
        this.room4KillerTimer += this.game.clockTick;

        
        if (this.room4KillerTimer >= this.room4KillerDelay) {
            const killer = new Killer(this.game, 50, 500, this.lily);
            this.game.addEntity(killer);
            this.room4KillerSpawned = true;
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
                hasCandleCodex: false,
                talkedAboutCandles: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null],
                door3Open: false
            }
        };
        
        // Reset NPC dialogue
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0, stage: 0 },
            victor: { met: false, dialogueIndex: 0, stage: 0 },
            jin: { met: false, dialogueIndex: 0, stage: 0 }
        };
        
        // Load Room 1
        this.loadRoom("room1", 210, 100);
    }
}