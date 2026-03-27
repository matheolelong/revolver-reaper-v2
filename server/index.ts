import process from 'node:process';
import { Server as IOServer } from 'socket.io';
import http from 'http';
import fs from 'fs';

import Player from '../common/element/Player.ts';
import Bullet from '../common/element/Bullet.ts';
import Bandit from '../common/element/Bandit.ts';
import Bonnus from '../common/element/Bonnus.ts';
import BillyTheKid from '../common/element/BillyTheKid.ts';
import JohnHenry from '../common/element/JohnHenry.ts';

const initialBanditSpawnInterval = 3;
let banditSpawnInterval = 3; // En secondes
let banditCompteur = 0;
const initialBanditSpeed = 1;
let banditSpeed = 1;

const initialBonnusSpawnInterval = 15;
let bonnusSpawnInterval = 15; // En secondes
let bonnusCompteur = 0;
const activeBonnus = new Map<number, Bonnus>();

const initialBillyTheKidSpawnInterval = 20;
let billyTheKidSpawnInterval = 20; // En secondes
let billyTheKidCompteur = 0;
const initialBillyTheKidSpeed = 1;
let billyTheKidSpeed = 1;

const initialJohnHenrySpawnInterval = 30;
let johnHenrySpawnInterval = 30; // En secondes
let johnHenryCompteur = 0;
const initialJohnHenrySpeed = 3;
let johnHenrySpeed = 3;

const bestScores = new Map<string, {score: number, date: string}>();
const players = new Map<String, Player>();
const bulletsArray: Bullet[] = [];
const bandits = new Map<number, Bandit>();
const billyTheKids = new Map<number, BillyTheKid>();
const johnHenrys = new Map<number, JohnHenry>();

const httpServer = http.createServer((_req, res) => {
	res.end('test');
});

const io = new IOServer(httpServer, {
	cors: { origin: true },
});

io.on('connection', socket => {
	console.log(`Nouvelle connexion du client ${socket.id}`);

	socket.on('setPseudo', (pseudo: string) => {
		console.log(`Le goat ${socket.id} est là`);
		const newPlayer = new Player(pseudo, socket.id, 0, 0);
		newPlayer.isInvincible = true;
		players.set(socket.id, newPlayer);

		setTimeout(() => {
			const playerInMap = players.get(socket.id);
			if (playerInMap) {
				playerInMap.isInvincible = false;
			}
		}, 3000);

		io.emit('players', Array.from(players.values()));
	});

	socket.on('logInGame', (id: string) => {
		if (players.get(id)) {
			const pseudo = players.get(id)!.name;
			players.delete(id);
			players.set(id, new Player(pseudo, id, 0, 0));
		}
		io.emit('players', Array.from(players.values()));
		console.log(players);
	});

	socket.on('disconnect', () => {
		console.log(`Déconnexion du client ${socket.id}`);
		players.delete(socket.id);
	});
	socket.on(
		'playerMovement',
		(
			x: number,
			y: number,
			direction: 'North' | 'South' | 'East' | 'West',
			isMoving: boolean
		) => {
			const p: Player = players.get(socket.id)!;
			if (p) {
				p.x = x;
				p.y = y;
				p.direction = direction || 'South';
				p.isMoving = isMoving || false;
				io.emit('players', Array.from(players.values()));
			}
		}
	);

	socket.on('shoot', data => {
		bulletsArray.push(new Bullet(data.x, data.y, data.angle, socket.id));
		console.log(`Le joueur ${socket.id} a tiré avec l'angle :`, data.angle);
	});

	socket.on('replay', (id: string) => {
		const p = players.get(id);
		if (p) {
			let isTherePlayerAlive = false;
			players.forEach(player => {
				if (!player.isDead) {
					isTherePlayerAlive = true;
				}
			});
			if (!isTherePlayerAlive) {
				bulletsArray.length = 0;
				bandits.clear();
				billyTheKids.clear();
				johnHenrys.clear();
				activeBonnus.clear();
			}
			const newPlayer = new Player(p.name, id, 0, 0);
			newPlayer.isInvincible = true;
			players.set(id, newPlayer);

			setTimeout(() => {
				const playerInMap = players.get(id);
				if (playerInMap) {
					playerInMap.isInvincible = false;
				}
			}, 3000);

			console.log(players);
			io.emit('players', Array.from(players.values()));
		}
	});
});

const port = process.env.PORT || 1234;
httpServer.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

setInterval(() => {
	if (players.size === 0) {
		bulletsArray.length = 0;
		bandits.clear();
		billyTheKids.clear();
		johnHenrys.clear();
		activeBonnus.clear();
		return;
	}
	for (let i = 0; i < bulletsArray.length; i++) {
		const bullet: Bullet = bulletsArray[i];

		bullet.x += Math.cos(bullet.angle) * 5;
		bullet.y += Math.sin(bullet.angle) * 5;

		if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 900) {
			bulletsArray.splice(i, 1);
		}

		players.forEach(player => {
			if (!player.isDead && !player.isInvincible) {
				if (
					bullet.id !== player.id &&
					bullet.x > player.x + 50 &&
					bullet.x < player.x + 110 &&
					bullet.y > player.y + 50 &&
					bullet.y < player.y + 110
				) {
					bulletsArray.splice(i, 1);
					player.damage(5);
					if (player.isDead) {
						player.currentFrame = 0;
						io.emit('death', player.id);
					}
					// console.log(player.hp + ' | ' + player.isDead);
				}
			}
		});

		bandits.forEach(bandit => {
			if (
				bullet.id !== 'enemy' &&
				bullet.x > bandit.x + 50 &&
				bullet.x < bandit.x + 110 &&
				bullet.y > bandit.y + 50 &&
				bullet.y < bandit.y + 110
			) {
				const p = players.get(bullet.id);
				bulletsArray.splice(i, 1);
				bandit.damage(5);
				if (p) p.addScore(1);
				if (bandit.isDead) {
					if (p) {
						p.addScore(4);
						p.nbKillsBandit++;
					}
					bandits.delete(Number.parseInt(bandit.id));
				}
				// console.log(bandit.hp + ' | ' + bandit.isDead);
			}
		});

		billyTheKids.forEach(billy => {
			if (
				bullet.id !== 'enemy' &&
				bullet.x > billy.x + 50 &&
				bullet.x < billy.x + 110 &&
				bullet.y > billy.y + 50 &&
				bullet.y < billy.y + 110
			) {
				const p = players.get(bullet.id);
				bulletsArray.splice(i, 1);
				billy.damage(5);
				if (p) p.addScore(2);
				if (billy.isDead) {
					if (p) {
						p.addScore(8);
						p.nbKillsBillyTheKid++;
					}
					billyTheKids.delete(Number.parseInt(billy.id));
				}
				// console.log(billy.hp + ' | ' + billy.isDead);
			}
		});

		johnHenrys.forEach(john => {
			if (
				bullet.id !== 'enemy' &&
				bullet.x > john.x + 50 &&
				bullet.x < john.x + 110 &&
				bullet.y > john.y + 50 &&
				bullet.y < john.y + 110
			) {
				const p = players.get(bullet.id);
				bulletsArray.splice(i, 1);
				john.damage(5);
				if (p) p.addScore(2);
				if (john.isDead) {
					if (p) {
						p.addScore(18);
						p.nbKillsJohnHenry++;
					}
					johnHenrys.delete(Number.parseInt(john.id));
				}
				// console.log(john.hp + ' | ' + john.isDead);
			}
		});
	}

	players.forEach(player => {
		activeBonnus.forEach((bonnus, idBonnus) => {
			if (
				player.x + 80 > bonnus.x &&
				player.x + 80 < bonnus.x + bonnus.width &&
				player.y + 80 > bonnus.y &&
				player.y + 80 < bonnus.y + bonnus.height
			) {
				activeBonnus.delete(idBonnus);
				if (bonnus.type === 'vert') {
					player.hp = Math.min(100, player.hp + 10);
				} else if (bonnus.type === 'rouge') {
					const roulette = Math.random();
					if (roulette < 0.5) {
						player.addScore(100);
					} else {
						player.hp = 1;
					}
				} else if (bonnus.type === 'gold') {
					player.hp = 100;
					player.addScore(250);
				}
				io.emit('bonnusList', Array.from(activeBonnus.values()));
				io.emit('players', Array.from(players.values()));
			}
		});
	});

	updateDifficulty();
	updateAnimation();
	updateBandit();
	updateBillyTheKid();
	updateJohnHenry();
	io.emit('bandits', Array.from(bandits.values()));
	io.emit('billyTheKids', Array.from(billyTheKids.values()));
	io.emit('johnHenrys', Array.from(johnHenrys.values()));

	io.emit('bullets', bulletsArray);
	// console.log(bulletsArray[0]);
}, 1000 / 60);

let contenu_csv;
if (fs.existsSync('server/element/leaderboard.csv')) {
	let contenu = fs.readFileSync('server/element/leaderboard.csv', 'utf8');
	contenu_csv = contenu.split('\n');
	contenu_csv.forEach(element => {
		if (element.trim() === '') return;
		const separer = element.split(',');
		const name = separer[0];
		const score = Number.parseInt(separer[1]);
		const date = separer[2] || "inconnue";
		bestScores.set(name, {score, date} );
		console.log(name);
		console.log(score);
		console.log(date);
	});
}
setInterval(() => {
	players.forEach(player => {
		if (player.isDead) return;
		player.addScore(1);

		const dateJ = new Date().toLocaleDateString('fr-FR');
		player.nbTimeAlive++;
		if (
			!bestScores.has(player.name) ||
			bestScores.get(player.name)!.score < player.score
		) {
			bestScores.set(player.name, {score: player.score, date: dateJ });
		}
	});

	let text = '';
	bestScores.forEach((score, name) => {
		text += `${name},${score.score},${score.date}\n`;
	});
	fs.writeFileSync('server/element/leaderboard.csv', text);
	io.emit('players', Array.from(players.values()));
	io.emit('leaderboard', Array.from(bestScores.entries()));
}, 1000);

setInterval(() => {
	const gambling = Math.random();
	const maxX = 1200 - 150;
	const maxY = 900 - 150;
	const currentBonnusId = bonnusCompteur;

	if (gambling < 0.5) {
		console.log('looser');
		activeBonnus.set(
			bonnusCompteur,
			new Bonnus(
				Math.random() * maxX,
				Math.random() * maxY,
				'vert',
				60,
				60,
				'' + bonnusCompteur
			)
		);
	} else if (gambling < 0.95) {
		console.log("toi t'es un winner");
		activeBonnus.set(
			bonnusCompteur,
			new Bonnus(
				Math.random() * maxX,
				Math.random() * maxY,
				'rouge',
				60,
				60,
				'' + bonnusCompteur
			)
		);
	} else {
		console.log('VA JOUER AU LOTO');
		activeBonnus.set(
			bonnusCompteur,
			new Bonnus(
				Math.random() * maxX,
				Math.random() * maxY,
				'gold',
				60,
				60,
				'' + bonnusCompteur
			)
		);
	}
	bonnusCompteur++;
	io.emit('bonnusList', Array.from(activeBonnus.values()));

	setTimeout(() => {
		if (activeBonnus.has(currentBonnusId)) {
			activeBonnus.delete(currentBonnusId);
			io.emit('bonnusList', Array.from(activeBonnus.values()));
		}
	}, 15000);
}, 1000 * bonnusSpawnInterval);

//Spawn des bandits
setInterval(() => {
	bandits.set(
		banditCompteur,
		new Bandit('' + banditCompteur, Math.random() * 1200, 50)
	);
	banditCompteur++;
}, 1000 * banditSpawnInterval);

//Spawn des BillyTheKid
setInterval(() => {
	if (billyTheKids.size < 5 && players.size > 0) {
		billyTheKids.set(
			billyTheKidCompteur,
			new BillyTheKid('' + billyTheKidCompteur, Math.random() * 1200, 50)
		);
		billyTheKidCompteur++;
	}
}, 1000 * billyTheKidSpawnInterval);

//Spawn des JohnHenry
setInterval(() => {
	if (johnHenrys.size < 3 && players.size > 0) {
		johnHenrys.set(
			johnHenryCompteur,
			new JohnHenry('' + johnHenryCompteur, Math.random() * 1200, 50)
		);
		johnHenryCompteur++;
	}
}, 1000 * johnHenrySpawnInterval);

let lastBanditFrameTime = 0;
let lastBillyTheKidFrameTime = 0;
let lastJohnHenryFrameTime = 0;

const banditFrameDuration = 500;
const billyTheKidFrameDuration = 500;
const johnHenryFrameDuration = 250;

// Animation de déplacement des ennemis.
function updateAnimation() {
	const now = Date.now();
	if (now - lastBanditFrameTime >= banditFrameDuration) {
		lastBanditFrameTime = now;
		bandits.forEach(b => {
			b.currentFrame = (b.currentFrame + 1) % 4;
		});
	}
	if (now - lastBillyTheKidFrameTime >= billyTheKidFrameDuration) {
		lastBillyTheKidFrameTime = now;
		billyTheKids.forEach(billy => {
			billy.currentFrame = (billy.currentFrame + 1) % 4;
		});
	}
	if (now - lastJohnHenryFrameTime >= johnHenryFrameDuration) {
		lastJohnHenryFrameTime = now;
		johnHenrys.forEach(john => {
			john.currentFrame = (john.currentFrame + 1) % 4;
		});
	}
}

// Mouvement + Shoot des bandits
function updateBandit() {
	bandits.forEach(b => {
		if (b.shoot()) {
			bulletsArray.push(new Bullet(b.x + 80, b.y + 80, Math.PI / 2, 'enemy'));
		}
	});

	bandits.forEach(b => {
		b.y += banditSpeed;
		if (b.y > 900) {
			bandits.delete(Number(b.id));
		}
	});
}

// Mouvement + Tir des BillyTheKid
function updateBillyTheKid() {
	billyTheKids.forEach(billy => {
		let closestPlayer: Player | undefined;
		let minDistance = Infinity;

		players.forEach(p => {
			if (!p.isDead) {
				const dx = p.x - billy.x;
				const dy = p.y - billy.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < minDistance) {
					minDistance = dist;
					closestPlayer = p;
				}
			}
		});

		if (closestPlayer) {
			const angleToPlayer = Math.atan2(
				closestPlayer.y - billy.y,
				closestPlayer.x - billy.x
			);

			const corners = [
				{ x: 0, y: 0 },
				{ x: 1040, y: 0 },
				{ x: 0, y: 740 },
				{ x: 1040, y: 740 },
			];

			let farthestCorner = corners[0];
			let maxDist = -1;
			corners.forEach(corner => {
				const dist = Math.sqrt(
					(corner.x - closestPlayer!.x) ** 2 +
						(corner.y - closestPlayer!.y) ** 2
				);
				if (dist > maxDist) {
					maxDist = dist;
					farthestCorner = corner;
				}
			});

			const angleToCorner = Math.atan2(
				farthestCorner.y - billy.y,
				farthestCorner.x - billy.x
			);

			billy.x += Math.cos(angleToCorner) * billyTheKidSpeed;
			billy.y += Math.sin(angleToCorner) * billyTheKidSpeed;

			if (billy.x < 0) billy.x = 0;
			if (billy.x > 1040) billy.x = 1040;
			if (billy.y < 0) billy.y = 0;
			if (billy.y > 740) billy.y = 740;

			if (billy.shoot()) {
				bulletsArray.push(
					new Bullet(billy.x + 80, billy.y + 80, angleToPlayer, 'enemy')
				);
			}
		}
	});
}

// Mouvement + Tir des JohnHenry
function updateJohnHenry() {
	johnHenrys.forEach(johnHenry => {
		let closestPlayer: Player | undefined;
		let minDistance = Infinity;

		players.forEach(p => {
			if (!p.isDead) {
				const dx = p.x - johnHenry.x;
				const dy = p.y - johnHenry.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < minDistance) {
					minDistance = dist;
					closestPlayer = p;
				}
			}
		});

		if (closestPlayer) {
			const angleToPlayer = Math.atan2(
				closestPlayer.y - johnHenry.y,
				closestPlayer.x - johnHenry.x
			);

			johnHenry.x += Math.cos(angleToPlayer) * johnHenrySpeed;
			johnHenry.y += Math.sin(angleToPlayer) * johnHenrySpeed;

			if (johnHenry.x < 0) johnHenry.x = 0;
			if (johnHenry.x > 1040) johnHenry.x = 1040;
			if (johnHenry.y < 0) johnHenry.y = 0;
			if (johnHenry.y > 740) johnHenry.y = 740;

			if (
				johnHenry.x > closestPlayer.x - 30 &&
				johnHenry.x < closestPlayer.x + 30 &&
				johnHenry.y > closestPlayer.y - 30 &&
				johnHenry.y < closestPlayer.y + 30
			) {
				if (!closestPlayer.isInvincible && johnHenry.hit()) {
					closestPlayer.damage(10);
					if (closestPlayer.isDead) {
						closestPlayer.currentFrame = 0;
						io.emit('death', closestPlayer.id);
					}
				}
			}
		}
	});
}

// Augmentation de la difficulté selon le meilleur joueur en vie
function updateDifficulty() {
	let maxScore = 0;
	players.forEach(player => {
		if (player.isDead) return;
		if (player.score > maxScore) {
			maxScore = player.score;
		}
	});

	banditSpawnInterval = initialBanditSpawnInterval / (1 + maxScore / 200);
	billyTheKidSpawnInterval =
		initialBillyTheKidSpawnInterval / (1 + maxScore / 200);
	johnHenrySpawnInterval = initialJohnHenrySpawnInterval / (1 + maxScore / 200);
	bonnusSpawnInterval = initialBonnusSpawnInterval * (1 + maxScore / 200);

	banditSpeed = initialBanditSpeed * (1 + maxScore / 1000);
	billyTheKidSpeed = initialBillyTheKidSpeed * (1 + maxScore / 1000);
	johnHenrySpeed = initialJohnHenrySpeed * (1 + maxScore / 1000);
}
