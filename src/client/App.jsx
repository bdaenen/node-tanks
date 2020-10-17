import React from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import routes from './routes/index'
import DynamicRoute from './DynamicRoute'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import './App.css'
import { Button, Container, TextInput } from 'nes-react'
import CenteredPage from './layout/CenteredPage'
import Fixed from './layout/Fixed'

class App extends React.Component {
    state = {
        username: '',
        confirmedName: false,
    }

    isNameValid(name) {
        return name && name.length > 2 && name.length < 21
    }

    componentDidMount() {
        let name = localStorage.getItem('tanks.name')
        if (this.isNameValid(name)) {
            this.setState({
                username: name,
                confirmedName: true,
            })
        }
    }

    renderApp() {
        return (
            <>
                <Router>
                    <Switch>
                        {routes.map((route, index) => {
                            return (
                                <DynamicRoute
                                    key={index}
                                    match={this.props.match}
                                    path={route.path}
                                    component={route.component}
                                    title={route.title}
                                    name={route.name}
                                />
                            )
                        })}
                    </Switch>
                </Router>
                <Fixed position="bottom">
                    <Container dark title="username">
                        {this.state.username}
                        <Button
                            primary
                            onClick={() => {
                                this.setState({
                                    confirmedName: false,
                                })
                            }}
                        >
                            Change
                        </Button>
                    </Container>
                </Fixed>
            </>
        )
    }

    renderUserInfoForm() {
        const { username } = this.state
        return (
            <CenteredPage>
                <Container dark title={'Menu'}>
                    <TextInput
                        label="Nickname"
                        placeholder="Enter a name..."
                        value={username}
                        onChange={e => {
                            this.setState({
                                username: e.target.value,
                            })
                        }}
                    />
                    <Button
                        success
                        disabled={!this.isNameValid(username)}
                        onClick={this.isNameValid(username) ? () => {
                            console.log(username)
                            localStorage.setItem('tanks.name', username)
                            this.setState({
                                confirmedName: true,
                            })
                        } : undefined}
                    >
                        Confirm
                    </Button>
                </Container>
            </CenteredPage>
        )
    }

    render() {
        return this.state.confirmedName
            ? this.renderApp()
            : this.renderUserInfoForm()
    }
}

export default App
