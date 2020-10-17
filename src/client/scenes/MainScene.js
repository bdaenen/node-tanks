import Phaser from 'phaser'

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
            this.socket = socket;
        }

        create() {
            const socket = this.socket
            this.sprites = {}
            this.player = this.add.sprite(-100, -100, 'tank_player')
            this.player.setDataEnabled()
            this.player.setData('id', socketId)
            socket.onmessage = event => {
                let data = JSON.parse(event.data)
                switch (data.type) {
                    case 'update':
                        console.log('update')
                        data.data.forEach(player => {
                            let sprite = this.sprites[player.id]
                            if (player.id === this.player.getData('id')) {
                                sprite = this.player
                            }

                            if (sprite) {
                                sprite.setPosition(player.x, player.y)
                            } else {
                                let sprite = this.add.sprite(
                                    data.x,
                                    data.y,
                                    'tank_network'
                                )
                                sprite.setDataEnabled()
                                sprite.setData('id', data.id)
                                this.sprites[player.id] = sprite
                            }
                        })
                        break
                    case 'left':
                        this.sprites[data.id]?.destroy()
                        delete this.sprites[data.id]
                        break
                }
            }
            console.log(socket)
        }

        update() {}
    }
}
