import GameElement from './GameElement.ts';

export default class JohnHenry extends GameElement {
    name: string = 'John Henry';
    hp: number;
    isDead: boolean = false;
    currentFrame: number = 0;
    lastHitTime: number = 0;

    constructor(id: string, x: number, y: number) {
        super(id, x, y);
        this.hp = 200;
    }

    hit(): boolean {
        const now = Date.now();
        if (now - this.lastHitTime >= 1000) {
            // Tape toutes les 1 secondes
            this.lastHitTime = now;
            return true;
        }
        return false;
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
