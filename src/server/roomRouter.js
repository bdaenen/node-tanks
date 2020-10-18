const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const createGame = require('./game/Game')
const logger = require('./logger');
let rooms = {}

router.use('/create', function (req, res) {
    let id = uniqid()
    rooms[id] = {
        id,
        game: createGame(),
        name: req.body.name,
        players: [],
        addPlayer: function(id) {
            this.players.push(id)
        },
        removePlayer: function(id) {
            this.players = this.players.filter((pid) => pid !== id)
            console.log(process.env.NODE_ENV)
            if (!this.players.length && process.env.NODE_ENV === 'production') {
                destroyRoom(this.id)
            }
        }
    };

    logger.info(`Created room: ${req.body.name} (${id})`);
    return res.json({ id })
})


router.post('/join', function (req, res) {
    let id = req.query.id;
    debugger;
})

router.get('/', function(req, res, next) {
    res.json(Object.values(rooms).map((room) => {
        return {
            id: room.id,
            name: room.name
        }
    }))
});

function getRoom(id) {
    return rooms[id];
}

function getRooms() {
    return rooms;
}

function destroyRoom(id) {
    let room = getRoom(id)
    if (room) {
        room.game.destroy();
        delete rooms[id]
    }
}

module.exports = { router, getRoom, getRooms }
