import React from 'react'
import { Container } from 'nes-react'
import PageTitle from '../components/PageTitle'
import NavButton from '../components/NavButton'
import ButtonList from '../components/ButtonList'
import { reverse } from './'
import CenteredPage from '../layout/CenteredPage'

export default class HomepageRoute extends React.Component {
    render() {
        return (
            <CenteredPage>
                <PageTitle>Tanks prototype</PageTitle>
                <Container dark title={'Menu'}>
                    <ButtonList>
                        <NavButton href={reverse('create-game')} primary className="px-3">
                            Create Game
                        </NavButton>
                        <NavButton href={reverse('join-game')} primary className="px-3">
                            Join Game
                        </NavButton>
                    </ButtonList>
                </Container>
            </CenteredPage>
        )
    }
}
