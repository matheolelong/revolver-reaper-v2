import Assets from '../Assets.ts';
import JohnHenry from '../../../common/element/JohnHenry.ts';

export default function drawJohnHenrys(
	johnHenryList: JohnHenry[],
	context: CanvasRenderingContext2D,
	scale: number
) {
	const assets = new Assets();

	johnHenryList.forEach(b => {
		let image = assets.johnHenry;

		if (!image.complete || image.width === 0) return;

		const frameWidth = image.width / 4;
		const frameHeight = image.height;

		const pseudoX = b.x + (frameWidth * scale) / 2;
		const pseudoY = b.y + 25;

		context.font = "20px 'VT323', monospace";
		context.fillStyle = 'white';
		context.textAlign = 'center';
		context.lineWidth = 3;
		context.strokeStyle = 'black';
		context.strokeText(b.name, pseudoX, pseudoY);
		context.fillText(b.name, pseudoX, pseudoY);

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
