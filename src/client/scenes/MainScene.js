import Phaser from 'phaser'
import { ucFirst } from '../utils'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'

export default function createMainScene(socket, socketId) {
    return class MainScene extends Phaser.Scene {
        preload() {
            this.load.image('tank_network', '/assets/tank_dark.png')
            this.load.image('tank_player', '/assets/tank_green.png')
            this.load.image('rocket_network', '/assets/bulletRed3_outline.png')
            this.load.image('rocket', '/assets/bulletGreen3_outline.png')
            for (let i = 1; i <= 5; i++) {
                this.load.image(`explosion_${i}`, `/assets/explosionSmoke${i}.png`)
            }
        }

        constructor(config) {
            super(config)
            this.sprites = null
            this.projectiles = null;
            this.player = null
            this.socket = socket
            this.SI = new SnapshotInterpolation(120)
        }

        create() {
            this.sprites = {}
            this.projectiles = {}
            this.player = this.add.sprite(-100, -100, 'tank_player')
            this.player.setDataEnabled()
            this.player.setData('id', socketId)

            this.socket.addEventListener('message', event => {
                let data = JSON.parse(event.data)
                this[`handle${ucFirst(data.type)}`]?.(data)
            })

            this.initControls()
        }

        initControls() {
            let keys = this.input.keyboard.addKeys({
                up: 'up',
                down: 'down',
                left: 'left',
                right: 'right',
                space: 'SPACE'
            })

            Object.entries(keys).forEach(([name, key]) => {
                key.on('down', e => {
//                    console.time('latency')
                    this.socket.send(
                        JSON.stringify({
                            type: 'input-down',
                            data: name,
                        })
                    )
                })
                key.on('up', e => {
                    this.socket.send(
                        JSON.stringify({
                            type: 'input-up',
                            data: name,
                        })
                    )
                })
            })
        }

        handleUpdate(message) {
            this.SI.snapshot.add(message.snapshot)
        }

        handlePlayerDisconnect(message) {
            console.log(message.id, 'disconnected')
            this.sprites[message.id]?.destroy()
            delete this.sprites[message.id]
        }

        update(time, delta) {
            this.updatePlayers();
            this.updateProjectiles();


            if (!document.hasFocus() && !this.doingRandomInput) {
                this.doingRandomInput = true;
                this.doRandomInput()
            }
            else if (document.hasFocus()) {
                this.doingRandomInput = false;
            }
        }

        updatePlayers() {
            const snapshot = this.SI.calcInterpolation(
                'x y rotationInDeg(rotation)', 'players'
            )

            if (!snapshot) {
                return
            }

            const { state } = snapshot

            state.forEach(player => {
                let sprite = this.sprites[player.id]
                if (player.id === this.player.getData('id')) {
                    sprite = this.player
//                    if (player.y !== sprite.y) {
//                        console.timeEnd('latency')
//                    }
                }

                if (sprite) {
                    sprite.setPosition(player.x, player.y)
                    sprite.setRotation(player.rotation)
                } else {
                    let sprite = this.add.sprite(
                        player.x,
                        player.y,
                        'tank_network'
                    )
                    sprite.setDataEnabled()
                    sprite.setData('id', player.id)
                    this.sprites[player.id] = sprite
                }
            })
        }
        updateProjectiles() {
            const snapshot = this.SI.calcInterpolation(
                'x y rotationInDeg(rotation)', 'projectiles'
            )

            if (!snapshot) {
                return
            }

            const { state } = snapshot

            if (this.projectiles.length > state.length) {
                this.projectiles = this.projectiles.filter((projectile) => {
                    return state.find(networkProjectile => networkProjectile.id === projectile.getData('id'))
                })
            }

            state.forEach(projectile => {
                let sprite = this.projectiles[projectile.id]
                if (projectile.playerId === this.player.getData('id')) {
                    // This is our rocket - do we care?
                }

                if (sprite) {
                    sprite.setPosition(projectile.x, projectile.y)
                    sprite.setRotation(projectile.rotation)
                } else {
                    let texture = 'rocket_network'
                    if (projectile.playerId === this.player.getData('id')) {
                        texture = 'rocket'
                    }
                    let sprite = this.add.sprite(
                        projectile.x,
                        projectile.y,
                        texture
                    )
                    sprite.setDataEnabled()
                    sprite.setData('playerId', projectile.playerId)
                    sprite.setData('id', projectile.id)
                    this.projectiles[projectile.id] = sprite;
                }
            })
        }
        doRandomInput() {
            setTimeout(() => {
                if (!this.doingRandomInput) {
                    return;
                }
//                console.log('changing input!')
                if (this.downButton) {
                    this.socket.send(
                        JSON.stringify({
                            type: 'input-up',
                            data: this.downButton,
                        })
                    )
                }
                this.downButton = ['up', 'down', 'left', 'right'][
                    Math.floor(Math.random() * 4)
                ]
                this.socket.send(
                    JSON.stringify({
                        type: 'input-down',
                        data: this.downButton,
                    })
                )
                this.doRandomInput()
            }, Math.round(Math.random() * 2000 + 500))
        }
    }
}
