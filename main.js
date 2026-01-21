const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// must queue all assest here
ASSET_MANAGER.queueDownload("./Sprites/LilySpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantRoomBackground.png");


ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);

	const sceneManager = new SceneManager(gameEngine);
	gameEngine.sceneManager = sceneManager;

	sceneManager.loadRoom("room1", 50, 50);

	gameEngine.start();

	console.log("Game started! Entities:", gameEngine.entities.length);

});