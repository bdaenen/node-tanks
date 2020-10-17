import Phaser from 'phaser';
import { waitForSocket } from './connect'
import 'nes.css/css/nes.min.css'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import MainScene from '../server/game/MainScene'

let socket = null;

async function main() {
    try {
        let socket = await waitForSocket('ws://localhost:9001');
    }
    catch {

    }

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

// prepare the config for Phaser
    const config = {
        type: Phaser.WEBGL,
        width: 1280,
        height: 720,
        banner: true,
        audio: false,
        scene: [MainScene(socket)],
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


main();