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
        name: req.body.name
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

module.exports = { router, getRoom, getRooms }
