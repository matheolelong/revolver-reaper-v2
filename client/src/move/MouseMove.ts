export default interface MouseMove {
	x: number;
	y: number;
    direction: 'North' | 'South' | 'East' | 'West';
	isMoving: boolean;
	isMouseMoving: boolean;
}
