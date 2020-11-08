const Phaser = require('phaser')
const geckos = require('@geckos.io/snapshot-interpolation')
const uniqid = require('uniqid')

const SI = new geckos.SnapshotInterpolation(global.phaserOnNodeFPS)

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene')
        this.sprites = null
    }

    create() {
        this.physics.world.setBoundsCollision()
        this.sprites = []
        this.projectiles = []
        this.events.addListener('create-player', ws => {
            let playerSprite = this.physics.add.sprite(
                Math.round(Math.random() * 400),
                Math.round(Math.random() * 200),
                ''
            )
            Object.defineProperty(playerSprite, 'id', {
                get: function() {
                    return (
                        (this.getData('ws') && this.getData('ws').__id) || null
                    )
                },
            })
            playerSprite.setCollideWorldBounds()
            playerSprite.setDataEnabled()
            playerSprite.setData('ws', ws)
            playerSprite.setData('input', {})
            this.sprites.push(playerSprite)
        })

        this.events.addListener('remove-player', ws => {
            this.sprites = this.sprites.filter(sprite => {
                if (ws !== sprite.getData('ws')) {
                    return true
                }

                this.projectiles = this.projectiles.filter(projectile => {
                    if (projectile.getData('playerId') !== sprite.id) {
                        return true
                    }

                    projectile.destroy()
                    return false
                })

                sprite.destroy()
                return false
            })
        })

        this.events.addListener('input-down', ({ ws, key }) => {
            let sprite = this.sprites.find(
                sprite => ws === sprite.getData('ws')
            )

            sprite.setData('input', {
                ...sprite.getData('input'),
                [key]: true,
            })
        })
        this.events.addListener('input-up', ({ ws, key }) => {
            let sprite = this.sprites.find(
                sprite => ws === sprite.getData('ws')
            )

            sprite.setData('input', {
                ...sprite.getData('input'),
                [key]: false,
            })
        })

        this.events.on('postupdate', this.postUpdate, this)
    }

    update(time, delta) {
        this.sprites.forEach(sprite => {
            let input = sprite.getData('input')
            if (input.up) {
                let vector = this.physics.velocityFromRotation(
                    sprite.rotation,
                    150
                )
                sprite.setVelocity(vector.x, vector.y)
            } else if (input.down) {
                let vector = this.physics.velocityFromRotation(
                    sprite.rotation,
                    150
                )
                sprite.setVelocity(-vector.x, -vector.y)
            } else {
                sprite.setVelocity(0, 0)
            }

            if (input.left) {
                sprite.setAngularVelocity(-100)
            } else if (input.right) {
                sprite.setAngularVelocity(100)
            } else {
                sprite.setAngularVelocity(0)
            }

            if (input.space && !sprite.getData('firing')) {
                sprite.setData('firing', true)
                let projectile = this.physics.add.sprite(sprite.x, sprite.y, '')
                let vector = this.physics.velocityFromRotation(
                    sprite.rotation,
                    600
                )
                projectile.setVelocity(vector.x, vector.y)
                projectile.setRotation(sprite.rotation)
                projectile.setData('playerId', sprite.id)
                projectile.setData('id', uniqid('projectile'))
                Object.defineProperty(projectile, 'id', {
                    get: () => projectile.getData('id')
                })
                this.projectiles.push(projectile)
                // TODO: add collisions, destroy on collide + deal damage, set firing to false.
            }
        })
    }
    postUpdate(time, delta) {
        // TODO: projectiles can't be nested in the snapshot
        let sprites = this.sprites.map(sprite => {
            return {
                id: sprite.id,
                x: sprite.x,
                y: sprite.y,
                rotation: sprite.rotation,
            }
        })

        let projectiles = this.projectiles.map(projectile => ({
            id: projectile.id,
            x: projectile.x,
            y: projectile.y,
            rotation: projectile.rotation,
            playerId: projectile.getData('playerId')
        }))

        const snapshot = SI.snapshot.create({
            players: sprites,
            projectiles: projectiles,
        })

        this.sprites.forEach(sprite => {
            sprite
                .getData('ws')
                .send(JSON.stringify({ type: 'update', snapshot }))
        })
    }
}

module.exports = MainScene
