const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Queue only image assets

// general assets
ASSET_MANAGER.queueDownload("./Sprites/Room1/lockedDORE.png"); //same asset used for each room, do i need to queue multiple then?
ASSET_MANAGER.queueDownload("./Sprites/Room1/openDORE.png"); //same asset used for each room, do i need to queue multiple then?


// room 1
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png");
ASSET_MANAGER.queueDownload("./Sprites/LilySpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantRoomBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Bed.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant2.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster2.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster3.png");
    // interactive objects
    ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingWithKey.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingNoKey.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingZoom.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/DiamondKey.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/BookshelfWithBook.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/BookshelfWithOpenBook.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/LockedDiamondBook.png");
    ASSET_MANAGER.queueDownload("./Sprites/Room1/OpenDiamondBook.png");             // NOTE: need a sprite for this
    ASSET_MANAGER.queueDownload("./Sprites/Room1/067Codex.png");                   
    ASSET_MANAGER.queueDownload("./Sprites/Room1/Room1Note.png");


// room 2
ASSET_MANAGER.queueDownload("./Sprites/Room2/TheGalleryBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/LilRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/OldCouchSide.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/Shiannel_SpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/Room2InvisWall.png");

// room 3
ASSET_MANAGER.queueDownload("./Sprites/Room3/TheCellsBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Table.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideToilet.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/LilStool.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Alive_VictorSpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Alive_JinSpriteSheet.png");

// room 4
ASSET_MANAGER.queueDownload("./Sprites/Room4/LibraryBackground.png");

// room 5
ASSET_MANAGER.queueDownload("./Sprites/Room5/FinalRoom.png");


//title screens
ASSET_MANAGER.queueDownload("./Sprites/Start/TitleScreen.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/LightningSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Jin_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Lily_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Shiannel_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Victor_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/StartSign.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/ControlsSign.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/SelectorSign.png");


ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    const sceneManager = new SceneManager(gameEngine);
    gameEngine.sceneManager = sceneManager;

    // BGM setup (managed outside AssetManager)
    const BGM_PATH = "./bgm/House of Souls Intro.mp3";
    const introAudio = new Audio(BGM_PATH);
    introAudio.loop = true;
    introAudio.volume = 0.65;
    introAudio.preload = "auto";

    // Attach to gameEngine for global access
    gameEngine.introAudio = introAudio;

    let bgmStarted = false;

    // Start music inside a user interaction event due to browser autoplay policies
    const startBGMOnce = () => {
        if (bgmStarted) return;

        introAudio.muted = false;
        introAudio.volume = 0.65;

        const playPromise = introAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                bgmStarted = true;
                console.log("BGM started successfully.");
            }).catch(error => {
                console.log("BGM play blocked:", error);
            });
        }
    };

    // Start BGM on first canvas click
    canvas.addEventListener("click", startBGMOnce, { once: true });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") startBGMOnce();
    }, { once: true });

    //volume, debug, mute part
    const debugToggle = document.getElementById("debugToggle");
    const muteBtn = document.getElementById("muteBtn");
    const volumeSlider = document.getElementById("volumeSlider");

    debugToggle.addEventListener("change", () => {
        gameEngine.debug = debugToggle.checked;
    });

   muteBtn.addEventListener("click", () => {
    gameEngine.muted = !gameEngine.muted;

    // Apply to intro audio
    if (gameEngine.introAudio) gameEngine.introAudio.muted = gameEngine.muted;

    // Apply to room BGM (if it exists)
    if (gameEngine.sceneManager && gameEngine.sceneManager.roomBGM) {
        gameEngine.sceneManager.roomBGM.muted = gameEngine.muted;
    }

    muteBtn.textContent = gameEngine.muted ? "Unmute" : "Mute";
});


volumeSlider.addEventListener("input", () => {
    gameEngine.volume = Number(volumeSlider.value);

    // Apply to intro audio
    if (gameEngine.introAudio) gameEngine.introAudio.volume = gameEngine.volume;

    // Apply to room BGM (if it exists)
    if (gameEngine.sceneManager && gameEngine.sceneManager.roomBGM) {
        gameEngine.sceneManager.roomBGM.volume = gameEngine.volume;
    }
});



    gameEngine.addEntity(new StartSplashScreen(gameEngine));
    gameEngine.start();
});
