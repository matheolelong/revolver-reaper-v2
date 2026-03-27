import GameElement from './GameElement.ts';

export default class BillyTheKid extends GameElement {
    name: string = 'Billy The Kid';
    hp: number;
    isDead: boolean = false;
    currentFrame: number = 0;
    lastShootTime: number = 0;

    constructor(id: string, x: number, y: number) {
        super(id, x, y);
        this.hp = 100;
    }

    shoot(): boolean {
        const now = Date.now();
        if (now - this.lastShootTime >= 500) {
            // Tir toutes les 0.5 secondes
            this.lastShootTime = now;
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
