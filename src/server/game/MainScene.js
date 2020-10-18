const Phaser = require('phaser')

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene')
        this.sprites = null
    }

    create() {
        this.sprites = []
        this.events.addListener('create-player', ws => {
            let playerSprite = this.physics.add.sprite(
                Math.round(Math.random() * 400),
                Math.round(Math.random() * 200),
                ''
            )
            playerSprite.setDataEnabled()
            playerSprite.setData('ws', ws)
            playerSprite.setData('input', {})
            this.sprites.push(playerSprite)
        })

        this.events.addListener('remove-player', ws => {
            this.sprites = this.sprites.filter(sprite => {
                if (ws === sprite.getData('ws')) {
                    sprite.destroy()
                    return false
                }

                return true
            })
        })

        this.events.addListener('input-down', ({ ws, key }) => {
            let sprite = this.sprites.find(
                sprite => ws === sprite.getData('ws')
            )
            sprite.setVelocityY(150)
            /*sprite.setData('input', {
                ...sprite.getData('input'),
                [key]: true,
            })*/
        })
        this.events.addListener('input-up', ({ ws, key }) => {
            let sprite = this.sprites.find(
                sprite => ws === sprite.getData('ws')
            )
            sprite.setVelocityY(0)
            /*sprite.setData('input', {
                ...sprite.getData('input'),
                [key]: false,
            })*/
        })
    }

    update() {
        let data = this.sprites.map(sprite => {
            return {
                id: sprite.getData('ws').__id,
                x: sprite.x,
                y: sprite.y,
            }
        })

        this.sprites.forEach(sprite => {
            /*let input = sprite.getData('input');
            if (input.up) {
                sprite.setVelocityY(100)
            }
            else {
                sprite.setVelocityY(0)
            }*/
            sprite
                .getData('ws')
                .send(JSON.stringify({ type: 'update', data: data }))

            console.log(sprite.getData('ws').getBufferedAmount())
        })
    }
}

module.exports = MainScene
