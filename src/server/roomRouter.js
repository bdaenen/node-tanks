const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const createGame = require('./game/Game')
let rooms = {}

router.use((req, res, next) => {
    console.log('wtf');
})
router.use('/create', function (req, res) {
    let id = uniqid()
    console.log(req.body);
    rooms[id] = {
        id,
        game: createGame(),
        name: req.body.name
    };

    return res.json({ id })
})

router.post('/join', function (req, res) {

})

module.exports = router
