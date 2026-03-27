import GameElement from "./GameElement.ts";

export default class Bullet extends GameElement {
    angle: number;

    constructor(x: number, y: number, angle: number, id: string) {
        super(id,x, y);
        this.angle = angle;
    }
}
