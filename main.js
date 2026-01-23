const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Queue only image assets
// room 1
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png");
ASSET_MANAGER.queueDownload("./Sprites/LilySpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantRoomBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/TheGalleryBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/TheCellsBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Bed.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant2.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster2.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster3.png");

//room 2
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/LilRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/OldCouchSide.png");

//title screens
ASSET_MANAGER.queueDownload("./Sprites/Start/TitleScreen.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/LightningSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Jin_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Lily_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Shiannel_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Victor_start.png");

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

    gameEngine.addEntity(new StartSplashScreen(gameEngine));
    gameEngine.start();
});
