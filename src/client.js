import Phaser from 'phaser';

let socket = new WebSocket('ws://localhost:9001');

async function main() {
    await waitForSocket();

    await (async () => {
        return new Promise((resolve) => {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data);
                if (data.type === 'ready') {
                    socket.__id = data.id;
                    resolve();
                }
            }
        })
    })()

    class MainScene extends Phaser.Scene {
        preload() {
            this.load.image('tank_network', '/assets/tank_dark.png')
            this.load.image('tank_player', '/assets/tank_green.png')
        }

        constructor() {
            super('MainScene')
            this.sprites = null;
            this.player = null;
            console.log('constructed');
        }

        create() {
            console.log('create');
            this.sprites = {};
            this.player = this.add.sprite(-100, -100, 'tank_player')
            this.player.setDataEnabled();
            this.player.setData('id', socket.__id);
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data);
                switch (data.type) {
                    case 'update':
                        console.log('update');
                        data.data.forEach((player) => {
                            let sprite = this.sprites[player.id];
                            if (player.id === this.player.getData('id')) {
                                sprite = this.player;
                            }

                            if (sprite) {
                                sprite.setPosition(player.x, player.y)
                            }
                            else {
                                let sprite = this.add.sprite(data.x, data.y, 'tank_network');
                                sprite.setDataEnabled();
                                sprite.setData('id', data.id)
                                this.sprites[player.id] = sprite;
                            }

                        })
                        break;
                    case 'left':
                        this.sprites[data.id]?.destroy();
                        delete this.sprites[data.id];
                        break;
                }
            }
            console.log(socket);

        }

        update() {
        }
    }

// prepare the config for Phaser
    const config = {
        type: Phaser.WEBGL,
        width: 1280,
        height: 720,
        banner: true,
        audio: false,
        scene: [MainScene],
        fps: {
            target: 60,
        },
        physics: {
            default: 'arcade',
        },
    }

// start the game
    let game = new Phaser.Game(config)
}

async function waitForSocket() {
    return new Promise((resolve, reject) => {
        socket.onopen = (e) => {
            resolve(e);
        }
    })
}

main();