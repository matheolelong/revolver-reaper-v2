import { io } from 'socket.io-client';
import Assets from './Assets.ts';
import Player from '../../common/element/Player.ts';
import Bullet from '../../common/element/Bullet.ts';
import type Bandit from '../../common/element/Bandit.ts';
import type BillyTheKid from '../../common/element/BillyTheKid.ts';
import type JohnHenry from '../../common/element/JohnHenry.ts';

import drawPlayer from './draw/drawPlayer.ts';
import drawBandits from './draw/drawBandits.ts';
import drawBillyTheKids from './draw/drawBillyTheKids.ts';
import drawJohnHenrys from './draw/drawJohnHenrys.ts';
import updateAnimation from './draw/updateAnimation.ts';

import type MouseMove from './move/MouseMove.ts';
import mouseMoving from './move/mouseMoving.ts';

const assets = new Assets();
export const socket = io('http://92.188.23.65:1234/');

let x: number = 0;
let y: number = 0;
let vitesseX: number = 0;
let vitesseY: number = 0;
const vitesse: number = 20;
const scale: number = 5;

let players: Player[] = [];
let serverBullets: Bullet[] = [];
let bandits: Bandit[] = [];
let listBonnus: any[] = [];
let billyTheKids: BillyTheKid[] = [];
let johnHenrys: JohnHenry[] = [];

let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let lastShootTime = 0;
const shootInterval = 10;

let mouseMovingX = 0;
let mouseMovingY = 0;
let isMouseMoving: boolean = false;

const articleGamePage = document.querySelector('.GamePage');
const articleReplayPage = document.querySelector('.ReplayPage');

const replayTemps = document.querySelector('.replayTemps');
const replayKillsBandit = document.querySelector('.replayKillsBandit');
const replayKillsBillyTheKid = document.querySelector(
	'.replayKillsBillyTheKid'
);
const replayKillsJohnHenry = document.querySelector('.replayKillsJohnHenry');
const replayScore = document.querySelector('.replayScore');

socket.on('players', (p: Player[]) => {
	p.forEach(newPlayer => {
		const oldPlayer = players.find(old => old.id === newPlayer.id);
		if (oldPlayer) {
			if (!newPlayer.isDead && oldPlayer.isDead) {
				newPlayer.currentFrame = 0;
			} else {
				newPlayer.currentFrame = oldPlayer.currentFrame;
			}
		}
	});
	players = p;
});

socket.on('bullets', b => {
	serverBullets = b;
});

socket.on('bandits', b => {
	bandits = b;
});

socket.on('bonnusList', bonnusDuServeur => {
	listBonnus = bonnusDuServeur;
});

socket.on('billyTheKids', b => {
	billyTheKids = b;
});

socket.on('johnHenrys', b => {
	johnHenrys = b;
});

socket.on('death', (id: string) => {
	if (id === socket.id) {
		articleGamePage?.setAttribute('style', 'display: none;');
		articleReplayPage?.setAttribute('style', '');

		if (replayTemps) {
			const nbTimeAlive = players.find(p => p.id === socket.id)?.nbTimeAlive;
			const nbSec = nbTimeAlive! % 60;
			const nbMin = Math.round(nbTimeAlive! / 60);
			replayTemps.innerHTML = `Temps : ${nbMin}min ${nbSec}sec`;
		}
		if (replayKillsBandit)
			replayKillsBandit.innerHTML = `Nombres de bandits tués : ${players.find(p => p.id === socket.id)?.nbKillsBandit}`;
		if (replayKillsBillyTheKid)
			replayKillsBillyTheKid.innerHTML = `Nombres de Billy The Kid tués : ${players.find(p => p.id === socket.id)?.nbKillsBillyTheKid}`;
		if (replayKillsJohnHenry)
			replayKillsJohnHenry.innerHTML = `Nombres de John henry tués : ${players.find(p => p.id === socket.id)?.nbKillsJohnHenry}`;
		if (replayScore)
			replayScore.innerHTML = `Score : ${players.find(p => p.id === socket.id)?.score}`;
	}
});

const canvas = document.querySelector<HTMLCanvasElement>('.gameCanvas')!,
	context = canvas.getContext('2d')!;
context.imageSmoothingEnabled = false;

const width: number = canvas.width;
const height: number = canvas.height;

let mapcpt = 0;

function render() {
	context.clearRect(0, 0, width, height);

	context.drawImage(
		assets.map,
		0,
		mapcpt,
		assets.map.width,
		height,
		0,
		0,
		width,
		height
	);
	if (mapcpt + height > assets.map.height) {
		context.drawImage(
			assets.map,
			0,
			0,
			assets.map.width,
			height - (assets.map.height - mapcpt),
			0,
			assets.map.height - mapcpt,
			width,
			height - (assets.map.height - mapcpt)
		);
	}

	mapcpt = (mapcpt + 0.5) % assets.map.height;

	updateAnimation(players);

	listBonnus.forEach(bonnus => {
		let drawBonnus = assets.bonnusVert;
		if (bonnus.type === 'rouge') {
			drawBonnus = assets.bonnusRouge;
		}
		if (bonnus.type === 'gold') {
			drawBonnus = assets.bonnusGold;
		}
		if (!drawBonnus.complete || drawBonnus.width === 0) return;

		context.drawImage(
			drawBonnus,
			bonnus.x,
			bonnus.y,
			bonnus.width,
			bonnus.height
		);
	});

	drawPlayer(players, context, scale, socket.id);
	drawBandits(bandits, context, scale);
	drawBillyTheKids(billyTheKids, context, scale);
	drawJohnHenrys(johnHenrys, context, scale);
	serverBullets.forEach(bullet => {
		context.beginPath();
		context.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
		context.fillStyle = 'black';
		context.fill();
		context.closePath();
	});
	requestAnimationFrame(render);
}

function movePlayer() {
	const playerBoxW = assets.playerSouth.width
		? (assets.playerSouth.width / 4) * scale
		: 160;
	const playerBoxH = assets.playerSouth.height
		? assets.playerSouth.height * scale
		: 160;

	if (x + playerBoxW < width || vitesseX < 0) {
		if (x > 0 || vitesseX > 0) {
			x += vitesseX;
		}
	}

	if (y + playerBoxH < height || vitesseY < 0) {
		if (y > 0 || vitesseY > 0) {
			y += vitesseY;
		}
	}

	let isMoving = vitesseX !== 0 || vitesseY !== 0;
	if (isMoving) {
		isMouseMoving = false;
	}
	let direction: 'North' | 'South' | 'East' | 'West' = 'South';

	let myPlayer = players.find(p => p.id === socket.id);
	if (myPlayer && myPlayer.direction) {
		direction = myPlayer.direction;
	}

	if (vitesseY < 0) direction = 'North';
	else if (vitesseY > 0) direction = 'South';
	else if (vitesseX > 0) direction = 'East';
	else if (vitesseX < 0) direction = 'West';

	if (isMouseMoving) {
		const mouseMove: MouseMove = mouseMoving(
			x,
			y,
			mouseMovingX,
			mouseMovingY,
			isMoving,
			vitesse
		);
		x = mouseMove.x;
		y = mouseMove.y;
		direction = mouseMove.direction;
		isMoving = mouseMove.isMoving;
		isMouseMoving = mouseMove.isMouseMoving;
	}

	socket.emit('playerMovement', x, y, direction, isMoving);
}

function update() {
	const player = players.find(p => p.id === socket.id);
	if (player && !player.isDead) {
		movePlayer();

		if (isMouseDown) {
			const now = Date.now();
			if (now - lastShootTime >= shootInterval) {
				lastShootTime = now;
				const playerBoxW = assets.playerSouth.width
					? (assets.playerSouth.width / 4) * scale
					: 160;
				const playerBoxH = assets.playerSouth.height
					? assets.playerSouth.height * scale
					: 160;
				const tab: number[] = [0,-1,1,0.5,-0.5]
				tab.forEach( i => {
					tab.forEach( j => {
						const angle = Math.atan2(i,j);
						socket.emit('shoot', {
							x: x + playerBoxW / 2,
							y: y + playerBoxH / 2,
							angle: angle,
						});
					})
				});
				lastShootTime = now;
			}
		}
	}
}

const keys = {
	up: false,
	down: false,
	left: false,
	right: false,
};

function updateVelocity() {
	let dx = 0;
	let dy = 0;

	if (keys.right) dx += 1;
	if (keys.left) dx -= 1;
	if (keys.down) dy += 1;
	if (keys.up) dy -= 1;

	if (dx !== 0 && dy !== 0) {
		const diagSpeed = vitesse / Math.sqrt(2);
		vitesseX = dx * diagSpeed;
		vitesseY = dy * diagSpeed;
	} else {
		vitesseX = dx * vitesse;
		vitesseY = dy * vitesse;
	}
}

document.addEventListener('keydown', event => {
	const player = players.find(p => p.id === socket.id);
	if (player && !player.isDead) {
		if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = true;
		if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = true;
		if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.down = true;
		if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.up = true;
		updateVelocity();
	}
});

document.addEventListener('keyup', event => {
	const player = players.find(p => p.id === socket.id);
	if (player && !player.isDead) {
		if (event.code === 'ArrowRight' || event.code === 'KeyD')
			keys.right = false;
		if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = false;
		if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.down = false;
		if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.up = false;
		updateVelocity();
	}
});

document.addEventListener('mousemove', event => {
	mouseX = event.clientX;
	mouseY = event.clientY;
});

document.addEventListener('mouseup', event => {
	if (event.button === 0) {
		isMouseDown = false;
	}
});

document.addEventListener('mousedown', event => {
	if (event.button === 0) {
		isMouseDown = true;
	}
});

canvas.addEventListener('contextmenu', event => {
	event.preventDefault();
	isMouseMoving = true;
	mouseMovingX = mouseX;
	mouseMovingY = mouseY;
});

assets
	.loadAll()
	.then(() => {
		setInterval(update, 1000 / 60);
		requestAnimationFrame(render);
	})
	.catch(console.error);

const replayButton = document.querySelector('.ReplayPage .PlayAgainButton');
const backToHomePageFromReplay = document.querySelector(
	'.ReplayPage .backToHomePageFromReplay'
);

backToHomePageFromReplay?.addEventListener('click', event => {
	resetPlayer(event);
	console.log('BackToHomPageButton press');
});

replayButton?.addEventListener('click', event => {
	resetPlayer(event);
	articleReplayPage?.setAttribute('style', 'display: none;');
	articleGamePage?.setAttribute('style', '');
	socket.emit('replay', socket.id);
	console.log('ReplayButton press');
});

function resetPlayer(event: Event) {
	event.preventDefault();
	x = 0;
	y = 0;
	vitesseX = 0;
	vitesseY = 0;
	keys.up = false;
	keys.down = false;
	keys.left = false;
	keys.right = false;
	isMouseMoving = false;
	isMouseDown = false;
}
