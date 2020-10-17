const Phaser = require('phaser');
const MainScene = require('./MainScene')

module.exports = function createGame() {
    // prepare the config for Phaser
    const config = {
        type: Phaser.HEADLESS,
        width: 1280,
        height: 720,
        banner: true,
        audio: false,
        scene: [MainScene],
        fps: {
            target: global.phaserOnNodeFPS,
        },
        physics: {
            default: 'arcade',
        },
    }

    // start the game
    return new Phaser.Game(config)
}
