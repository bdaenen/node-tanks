const { getRoom } = require('../roomRouter')

function gameMessageHandler(ws, data) {
    if (data.type.startsWith('input-')) {
        emitPhaserEvent(ws, data.type, data.data)
    }
}

function getScene(ws) {
    let room = getRoom(ws.__roomId)
    if (!room) {
        return null;
    }
    return room.game.scene.getScenes(true)[0]
}

function emitPhaserEvent(ws, event, data) {
    let scene = getScene(ws)
    scene.events.emit(event, {ws, key: data})
}

module.exports = gameMessageHandler