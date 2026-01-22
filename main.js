const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// must queue all assest here
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png");
ASSET_MANAGER.queueDownload("./Sprites/LilySpriteSheet.png");

// Room backgrounds
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantRoomBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/TheGalleryBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/TheCellsBackground.png");

// Room 1 Door 
ASSET_MANAGER.queueDownload("./Sprites/Room1/Bed.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant2.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster2.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster3.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png");



ASSET_MANAGER.downloadAll(() => {
	console.log("Room2 BG loaded?", ASSET_MANAGER.getAsset("./Sprites/Room2/TheGalleryBackground.png")); // testing line
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);

	// new scene manager object, takes in this game engine object
	const sceneManager = new SceneManager(gameEngine);
	gameEngine.sceneManager = sceneManager; // 

	sceneManager.loadRoom("room1", 200, 200);

	gameEngine.start();

	console.log("Game started! Entities:", gameEngine.entities.length);

});