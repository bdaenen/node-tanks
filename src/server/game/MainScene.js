const Phaser = require('phaser');

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene')
        this.sprites = null;
    }

    create() {
        this.sprites = [];
        this.events.addListener('create-player', (ws) => {
            let playerSprite = this.physics.add.sprite(Math.round(Math.random() * 400), Math.round(Math.random() * 200), '');
            playerSprite.setDataEnabled();
            playerSprite.setData('ws', ws);
            playerSprite.setVelocityX(5);
            this.sprites.push(playerSprite);
        })

        this.events.addListener('remove-player', (ws) => {
            this.sprites = this.sprites.filter((sprite) => {
                if (ws === sprite.getData('ws')) {
                    sprite.destroy();
                    return false;
                }

                return true;
            });
        })
    }

    update() {
        let data = this.sprites.map((sprite) => {
            return {
                id: sprite.getData('ws').__id,
                x: sprite.x,
                y: sprite.y
            }
        })

        this.sprites.forEach((sprite) => {
            sprite.getData('ws').send(JSON.stringify({ type: 'update', data: data }));
        })
    }
}

module.exports = MainScene