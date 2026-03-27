export default class Assets {
	playerNorth: HTMLImageElement = new Image();
	playerSouth: HTMLImageElement = new Image();
	playerEast: HTMLImageElement = new Image();
	playerWest: HTMLImageElement = new Image();
	playerDead: HTMLImageElement = new Image();
	player: HTMLImageElement = new Image();
	map: HTMLImageElement = new Image();
	bandit: HTMLImageElement = new Image();
	bonnusVert: HTMLImageElement = new Image();
    bonnusRouge: HTMLImageElement = new Image();
	bonnusGold: HTMLImageElement = new Image();
	billyTheKid: HTMLImageElement = new Image();
	johnHenry: HTMLImageElement = new Image();

	constructor() {
		this.playerNorth.src = 'images/player/walk/cowboy_walk_up_spritesheet.png';
		this.playerSouth.src =
			'images/player/walk/cowboy_walk_down_spritesheet.png';
		this.playerEast.src =
			'images/player/walk/cowboy_walk_right_spritesheet.png';
		this.playerWest.src = 'images/player/walk/cowboy_walk_left_spritesheet.png';
		this.playerDead.src = 'images/player/death/cowboy_death_spritesheet.png';
		this.player.src = 'images/player/player_back.png';
		this.map.src = 'images/mapTest.png';
		this.bandit.src = 'images/bandit.png';
		this.bonnusVert.src = 'images/ferChevalVert.png';
		this.bonnusRouge.src = 'images/ferChevalRouge.png';
		this.bonnusGold.src = 'images/ferChevalGold.png';
		this.billyTheKid.src = 'images/BillyTheKid.png';
		this.johnHenry.src = 'images/JohnHenry.png';
	}

	loadAll(): Promise<void[]> {
		const images = [
			this.playerNorth,
			this.playerSouth,
			this.playerEast,
			this.playerWest,
			this.player,
			this.map,
			this.bandit,
			this.bonnusVert,
			this.bonnusRouge,
			this.bonnusGold,
			this.billyTheKid,
			this.johnHenry,
		];

		const promises = images.map(img => {
			return new Promise<void>((resolve, reject) => {
				if (img.complete) {
					resolve();
				} else {
					img.onload = () => resolve();
					img.onerror = () => reject(new Error(`Erreur lors du chargement de: ${img.src}`));
				}
			});
		});

		return Promise.all(promises);
	}
}
