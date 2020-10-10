require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const uWebsockets = require('@bdaenen/uwebsockets')
const uniqid = require('uniqid');

const app = express()
const server = require('http').Server(app)

// set the fps you need
const FPS = 30
global.phaserOnNodeFPS = FPS // default is 60

// your MainScene
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene')
        this.sprites = null;
    }

    create() {
        this.sprites = [];
        this.events.addListener('create-player', (ws) => {
            let playerSprite = this.physics.add.sprite(Math.round(Math.random()*400), Math.round(Math.random()*200), '');
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
            sprite.getData('ws').send(JSON.stringify({type: 'update', data: data}));
        })
    }
}

// prepare the config for Phaser
const config = {
    type: Phaser.HEADLESS,
    width: 1280,
    height: 720,
    banner: true,
    audio: false,
    scene: [MainScene],
    fps: {
        target: FPS,
    },
    physics: {
        default: 'arcade',
    },
}

// start the game
let game = new Phaser.Game(config)
const port = process.env.PORT || 3000

app.use(
    helmet({
        contentSecurityPolicy: {
            connectSrc: ["'self'", 'ws://localhost:8080'],
        },
    })
)
app.use(compression())
app.use((req, res, next) => {
    let origin = req.headers.origin
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    )
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
})

app.use('/', express.static(path.join(__dirname, './build')))

server.listen(port, () => {
    console.log('App is listening on port ' + port)
})

let connections = {};

require('@bdaenen/uwebsockets')
    .App()
    .ws('/*', {
        idleTimeout: 30,
        maxBackpressure: 1024,
        maxPayloadLength: 512,
        compression: uWebsockets.DEDICATED_COMPRESSOR_3KB,

        open: (ws) => {
            let id = uniqid();
            ws.__id = id;
            connections[id] = ws;
            console.log('new connection: ', ws);
            ws.send(JSON.stringify({
                type: 'ready',
                id: id
            }))

            let scene = game.scene.getScenes(true)[0]
            scene.events.emit('create-player', ws)
        },
        close: (ws) => {
            console.log(('closing ' + ws.__id));
            let scene = game.scene.getScenes(true)[0]
            scene.events.emit('remove-player', ws)
            let closedId = ws.__id;
            Object.entries(connections).forEach(([id, ws]) => {
                if (id !== closedId) {
                    ws.send(JSON.stringify({
                        type: 'left',
                        id: closedId
                    }))
                }
            })
            delete connections[closedId];
        },
        message: (ws, message, isBinary) => {
            const { __id } = ws;
            console.log(message)
        },
    })
    .listen(9001, listenSocket => {
        if (listenSocket) {
            console.log('Listening to port 9001 (WS)')
        }
    })
