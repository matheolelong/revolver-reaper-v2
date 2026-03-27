import GameElement from './GameElement.ts';

export default class Player extends GameElement {
	name: string;
	direction: 'North' | 'South' | 'East' | 'West' = 'South';
	isMoving: boolean = false;
	currentFrame: number = 0;
	score: number = 0;
	hp: number = 100;
	isDead: boolean = false;
	nbKillsBandit: number = 0;
	nbKillsBillyTheKid: number = 0;
	nbKillsJohnHenry: number = 0;
	nbTimeAlive: number = 0;
	isInvincible: boolean = false;

	constructor(name: string, id: string, x: number, y: number) {
		super(id, x, y);
		this.name = name;
	}

	move(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	addScore(add: number) {
		this.score += add;
	}

	damage(hpRemove: number) {
		if (this.hp - hpRemove > 0) {
			this.hp -= hpRemove;
		} else {
			this.hp = 0;
			this.isDead = true;
		}
	}
}
