import Assets from '../Assets.ts';
import type Bandit from '../../../common/element/Bandit.ts';

export default function drawBandits(
	banditList: Bandit[],
	context: CanvasRenderingContext2D,
	scale: number
) {
	const assets = new Assets();

	banditList.forEach(b => {
		let image = assets.bandit;

		if (!image.complete || image.width === 0) return;

		const frameWidth = image.width / 4;
		const frameHeight = image.height;

		context.drawImage(
			image,
			b.currentFrame * frameWidth,
			0,
			frameWidth,
			frameHeight,
			b.x,
			b.y,
			frameWidth * scale,
			frameHeight * scale
		);
	});
}
