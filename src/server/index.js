require('@geckos.io/phaser-on-nodejs')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const uWebsockets = require('@bdaenen/uwebsockets')
const uniqid = require('uniqid')
const bodyParser = require('body-parser')
const staticSnow = require('./staticSnow')
const logger = require('./logger');
const gameMessageHandler = require('./game/gameMessageHandler')
const { router: roomRouter, getRoom, getRooms } = require('./roomRouter')

const app = express()
const server = require('http').Server(app)

// set the fps you need
const FPS = 120
global.phaserOnNodeFPS = FPS // default is 60

const port = process.env.PORT || 8080

// Allow websocket connections in the CSP.
app.use(
    helmet({
        contentSecurityPolicy: false /*{
            connectSrc: ["'self'", 'ws://localhost:8080'],
            imgSrc: ["'self'", 'localhost:8080', 'unpkg.com']
        }*/,
    })
)

// Compression!
app.use(compression())

// Parse the POST body
app.use(bodyParser.json())

// Add a bunch of headers
app.use((req, res, next) => {
    let origin = req.headers.origin
    res.setHeader('Access-Control-Allow-Origin', origin || 'localhost:3000')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    )
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
})

// Room router
app.use('/room', roomRouter)

// Finally if nothing was found, rewrite to index.html
app.use(staticSnow(app))
server.listen(port, () => {
    console.log('HTTP: ' + port)
})

let connections = {}

require('@bdaenen/uwebsockets')
    .App()
    .ws('/*', {
        idleTimeout: 30,
        maxBackpressure: 1024,
        maxPayloadLength: 512,
        compression: uWebsockets.DEDICATED_COMPRESSOR_3KB,

        open: ws => {
            let id = uniqid()
            ws.__id = id
            connections[id] = ws
            console.log('new connection: ', ws)
            ws.send(
                JSON.stringify({
                    type: 'ready',
                    id: id,
                })
            )
        },
        close: ws => {
            console.log('closing ' + ws.__id)
            if (ws.__roomId) {
                let room = getRoom(ws.__roomId);
                let game = room.game;
                let scene = game.scene.getScenes(true)[0];
                room.removePlayer(ws.__id);
                scene.events.emit('remove-player', ws)
            }

            let closedId = ws.__id

            Object.entries(connections).forEach(([id, ws]) => {
                if (id !== closedId) {
                    ws.send(
                        JSON.stringify({
                            type: 'playerDisconnect',
                            id: closedId,
                        })
                    )
                }
            })
            delete connections[closedId]
        },
        message: (ws, message, isBinary) => {
            let textDecoder = new TextDecoder('utf-8');
            let json = textDecoder.decode(message);
            logger.info(json)
            try {
                json = JSON.parse(json)
            }
            catch (e) {
                logger.error('Failed to decode json: ' + json);
            }

            if (json.type === 'join-room') {
                let room = getRoom(json.id)
                if (!room) {
                    return ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown room.'
                    }))
                }
                ws.__roomId = json.id
                let game = room.game;
                room.addPlayer(ws.__id);
                let scene = game.scene.getScenes(true)[0]
                scene.events.emit('create-player', ws)
            }
            else {
                gameMessageHandler(ws, json);
            }
        },
    })
    .listen(9001, listenSocket => {
        if (listenSocket) {
            console.log('WS: 9001')
        }
    })
