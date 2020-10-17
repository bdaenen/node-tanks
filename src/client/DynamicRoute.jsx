import React from 'react'
import { Route } from 'react-router-dom'
import Container from 'react-bootstrap/Container'

// Wrap router for passing props to child components.
export default class DynamicRoute extends React.Component {
    state = {
        Component: null,
    }

    loadRoute(routeName) {
        import(`${routeName}`)
            .then((module) => {
                this.setState({ Component: module.default })
                localStorage.setItem('import-fail-count', '0')
            })
            .catch((ex) => {
                console.error(ex)
                const failCount =
                    parseInt(localStorage.getItem('import-fail-count'), 10) || 0
                if (failCount > 2) {
                    throw ex
                }
                // Reload the current page when a chunk fails to load.
                // This can happen when a deploy created a new build, and a certain chunk don't match or doesn't exist anymore, resulting in a syntax error.
                localStorage.setItem('import-fail-count', failCount + 1)
                window.location.reload()
            })
        return null
    }

    render() {
        const { component, path, noContainer } = this.props
        const Component = this.state.Component
        return (
            <Route
                path={path}
                render={(routeProps) => {
                    const Wrapper = noContainer ? React.Fragment : Container
                    return (
                        <Wrapper>
                            {Component ? (
                                <Component
                                    path={path}
                                    routeName={this.props.name}
                                    {...routeProps}
                                />
                            ) : (
                                this.loadRoute(component)
                            )}
                        </Wrapper>
                    )
                }}
            />
        )
    }
}
