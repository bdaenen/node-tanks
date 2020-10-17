require('@geckos.io/phaser-on-nodejs')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const uWebsockets = require('@bdaenen/uwebsockets')
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const staticSnow = require('./staticSnow')
const roomRouter = require('./roomRouter');

const app = express()
const server = require('http').Server(app)

// set the fps you need
const FPS = 30
global.phaserOnNodeFPS = FPS // default is 60

const port = process.env.PORT || 3000

// Allow websocket connections in the CSP.
app.use(
    helmet({
        contentSecurityPolicy: {
            connectSrc: ["'self'", 'ws://localhost:8080'],
        },
    })
)

// Compression!
app.use(compression())

// Parse the POST body
app.use(bodyParser.json());

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
//app.use(staticSnow(app))
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
