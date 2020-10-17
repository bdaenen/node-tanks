import React from 'react'
import Phaser from 'phaser'
import { waitForSocket } from '../connect'
import CenteredPage from '../layout/CenteredPage'
import createMainScene from '../scenes/MainScene'

export default class Game extends React.Component {
    state = {
        connected: false,
        socket: null,
        game: null,
        socketId: null
    }

    async componentDidMount() {
        /** @type WebSocket */
        let socket

        try {
            socket = await waitForSocket('ws://localhost:9001')
        } catch {}

        let socketId = await (async () => {
            return new Promise(resolve => {
                socket.onmessage = event => {
                    let data = JSON.parse(event.data)
                    if (data.type === 'ready') {
                        resolve(data.id)
                    }
                }
            })
        })()

        socket.send(JSON.stringify({type: 'join-room', id: this.props.match.params.id}));

        this.setState({
            socket: socket,
            connected: true,
            socketId: socketId
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.socket && this.state.socket) {
            const config = {
                type: Phaser.WEBGL,
                width: 1280,
                height: 720,
                banner: true,
                audio: false,
                scene: [createMainScene(this.state.socket, this.state.socketId)],
                parent: 'phaser-game',
                fps: {
                    target: 60,
                },
                physics: {
                    default: 'arcade',
                },
            }

            let game = new Phaser.Game(config)
            this.setState({game: game})
        }
    }

    render() {
        const { socket, connected } = this.state

        if (!socket || !connected) {
            return <CenteredPage>Connecting...</CenteredPage>
        }
        return <div id="phaser-game"/>
    }
}
