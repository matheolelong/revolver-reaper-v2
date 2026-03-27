import Player from '../../../common/element/Player.ts';

let lastFrameTime = 0;
// vitesse de l'animation de mouvement du joueur s'il est en vie
const frameDuration = 500;
// vitesse de l'animation de mort du joueur s'il est mort
const frameDurationDead = 100;

export default function updateAnimation(players: Player[]){
	const now = Date.now();
	players.forEach(p => {
		if (
			p.isDead &&
			p.currentFrame < 5 &&
			now - lastFrameTime >= frameDurationDead
		) {
			p.currentFrame = p.currentFrame + 1;
			lastFrameTime = now;
		} else if (!p.isDead && now - lastFrameTime >= frameDuration) {
			p.currentFrame = (p.currentFrame + 1) % 4;
			lastFrameTime = now;
		}
	});
}