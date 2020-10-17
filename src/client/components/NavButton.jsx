import React from 'react'
import { withRouter } from 'react-router-dom'
import { Button } from 'nes-react'

class NavButton extends React.Component {
    handleClick = (e) => {
        this.props.history.push(this.props.href)
        this.props.onClick && this.props.onClick(e);
    }

    render() {
        return <Button {...this.props} onClick={this.handleClick}/>
    }
}

export default withRouter(NavButton)