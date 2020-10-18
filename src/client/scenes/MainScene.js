import Phaser from 'phaser'
import { ucFirst } from '../utils'

export default function createMainScene(socket, socketId) {
    return class MainScene extends Phaser.Scene {
        preload() {
            this.load.image('tank_network', '/assets/tank_dark.png')
            this.load.image('tank_player', '/assets/tank_green.png')
        }

        constructor(config) {
            super(config)
            this.sprites = null
            this.player = null
            this.socket = socket
        }

        create() {
            this.sprites = {}
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
            })

            Object.entries(keys).forEach(([name, key]) => {
                key.on('down', e => {
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
            let data = message.data;
            data.forEach(player => {
                let sprite = this.sprites[player.id]
                if (player.id === this.player.getData('id')) {
                    sprite = this.player
                }

                if (sprite) {
                    sprite.setPosition(player.x, player.y)
                } else {
                    let sprite = this.add.sprite(data.x, data.y, 'tank_network')
                    sprite.setDataEnabled()
                    sprite.setData('id', data.id)
                    this.sprites[player.id] = sprite
                }
            })
        }

        handlePlayerDisconnect(message) {
            this.sprites[message.id]?.destroy()
            delete this.sprites[message.id]
        }

        update(time, delta) {}
    }
}
