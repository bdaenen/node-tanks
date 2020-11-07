import React from 'react'
import Phaser from 'phaser'
import { waitForSocket } from '../connect'
import CenteredPage from '../layout/CenteredPage'
import createMainScene from '../scenes/MainScene'
import { Button, Container } from 'nes-react'
import ContainerButton from '../components/ContainerButton'
import { reverse } from './index'
/*
let size = 0;
let seconds = 0

setInterval(() => {
    seconds++;
    console.info(`${size/125000/seconds}mbit/s`)
}, 1000)
*/

export default class Game extends React.Component {
    state = {
        connected: false,
        socket: null,
        game: null,
        socketId: null,
        error: null
    }

    componentWillUnmount() {
        this.state.game && this.state.game.destroy();
        this.state.socket && this.state.socket.close();
    }

    async componentDidMount() {
        /** @type WebSocket */
        let socket

        try {
            socket = await waitForSocket('ws://localhost:9001')
        } catch {}

        // Wait for pur unique socket/session ID
        let done = false;
        let socketId = await (async () => {
            return new Promise(resolve => {
                socket.addEventListener('message', function handleReady(event) {
//                    size += event.data.length;
                    if (done) {
                        return;
                    }
                    try {
                        let data = JSON.parse(event.data)
                        if (data.type === 'ready') {
/*//*/                      socket.removeEventListener('message', handleReady)
                            done = true;
                            resolve(data.id)
                        }
                    }
                    catch(err) {
                        console.warn(err, event)
                    }
                })
            })
        })()

        socket.addEventListener('message', (event) => {
            if (event.data) {
                try {
                    let data = JSON.parse(event.data);
                    if (data.type === 'error') {
                        this.setState({error: data.message});
                        socket.close();
                    }
                }catch (err) {
                    console.warn(err, event);
                }
            }
        })

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
                    target: 120,
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
        const { error, socket, connected } = this.state

        if (error) {
            return <CenteredPage>
                <Container dark>
                    <div className="nes-text is-error">
                        {error}
                    </div>
                    <ContainerButton position="bottom" primary onClick={() => {
                        this.props.history.replace(reverse('home'))
                    }}>Back</ContainerButton>
                </Container>
            </CenteredPage>
        }
        if (!socket || !connected) {
            return <CenteredPage>Connecting...</CenteredPage>
        }
        return <div id="phaser-game"/>
    }
}
