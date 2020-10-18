import React from 'react'
import CenteredPage from '../layout/CenteredPage'
import PageTitle from '../components/PageTitle'
import { Button, Container, TextInput } from 'nes-react'
import { get, post } from '../utils'
import { reverse } from './index'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import ContainerButton from '../components/ContainerButton'

class GameList extends React.Component {
    state = {
        games: '',
        loading: false,
    }

    componentDidMount() {
        this.loadGames()
    }

    async loadGames() {
        this.setState({
            loading: true,
        })
        let rooms = await get({ url: '/room' })
        this.setState({
            games: rooms,
            loading: false,
        })
    }

    joinGame = id => () => {
        this.props.history.push(reverse('game', { id }))
    }

    render() {
        const { loading, games } = this.state

        if (loading) {
            return <CenteredPage>Loading...</CenteredPage>
        }
        if (!games.length) {
            return <CenteredPage>
                <Container dark>
                        No active games.
                    <ContainerButton position="bottomLeft" primary onClick={() => {
                        this.componentDidMount()
                    }}>Refresh</ContainerButton>
                    <ContainerButton position="bottomRight" onClick={() => {
                        this.props.history.replace(reverse('home'))
                    }}>Back</ContainerButton>
                </Container>
            </CenteredPage>
        }

        return (
            <>
                <PageTitle>Tanks prototype</PageTitle>
                <Container dark title={this.props.title}>
                    {games.map(({ id, name }) => (
                        <Container dark key={id}>
                            <Row className="align-items-center">
                                <Col><span>{name}</span></Col>
                                <Col>
                                    <Button
                                        style={{float: 'right'}}
                                        onClick={this.joinGame(id)}
                                        primary
                                        className="px-3"
                                    >
                                        Join
                                    </Button>
                                </Col>
                            </Row>
                        </Container>
                    ))}
                    <ContainerButton position="bottomLeft" success onClick={() => this.componentDidMount()}>Refresh</ContainerButton>
                </Container>
            </>
        )
    }
}

export default GameList
