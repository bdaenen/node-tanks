import React from 'react'
import CenteredPage from '../layout/CenteredPage'
import PageTitle from '../components/PageTitle'
import { Button, Container, TextInput } from 'nes-react'
import ButtonList from '../components/ButtonList'
import { post } from '../utils'
import { reverse } from './index'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

class CreateGame extends React.Component {
    state = {
        gameName: '',
    }

    validateName(name) {
        return name && name.length > 2 && name.length < 15
    }

    createGame = async () => {
        try {
            let roomId = await post({
                url: '/room/create',
                data: {
                    name: this.state.gameName,
                },
            })

            this.history.push(reverse('join-game-by-id', { id: roomId }))
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        const nameIsValid = this.validateName(this.state.gameName)

        return (
            <CenteredPage>
                <PageTitle>Tanks prototype</PageTitle>
                <Container dark title={this.props.title}>
                    <TextInput
                        label="Game Name"
                        placeholder="Enter a name..."
                        value={this.state.gameName}
                        style={{ margin: 0 }}
                        onChange={e => {
                            this.setState({
                                gameName: e.target.value,
                            })
                        }}
                    />
                    <Row>
                        <Col>
                            <Button
                                disabled={!nameIsValid}
                                onClick={
                                    nameIsValid ? this.createGame : undefined
                                }
                                primary
                                className="px-3"
                            >
                                Create
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                onClick={() =>
                                    this.props.history.push(reverse('home'))
                                }
                                error
                                style={{float: 'right'}}
                                className="px-3"
                            >
                                Cancel
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </CenteredPage>
        )
    }
}

export default CreateGame
