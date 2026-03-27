import type MouseMove from './MouseMove.ts';

export default function mouseMoving(
	x: number,
	y: number,
	mouseMovingX: number,
	mouseMovingY: number,
	isMoving: boolean,
	vitesse: number
): MouseMove {
	let direction: 'North' | 'South' | 'East' | 'West' = 'South';
	let isMouseMoving = true;

	isMoving = false;
	const angle = Math.atan2(mouseMovingY - y - 80, mouseMovingX - x - 80);
	const cosAngle = Math.cos(angle);
	const sinAngle = Math.sin(angle);
	x += cosAngle * vitesse;
	y += sinAngle * vitesse;

	if (Math.abs(cosAngle) > Math.abs(sinAngle)) {
		if (cosAngle > 0) direction = 'East';
		else direction = 'West';
	} else {
		if (sinAngle > 0) direction = 'South';
		else direction = 'North';
	}

	if (
		Math.abs(mouseMovingX - (x + 80)) < vitesse &&
		Math.abs(mouseMovingY - (y + 80)) < vitesse
	) {
		isMouseMoving = false;
	}

	return { x, y, direction ,isMoving, isMouseMoving };
}
