import React from 'react'
import './containerButton.css'
import { Button } from 'nes-react'

export default function ContainerButton(props) {
    const { position, children, ...rest } = props

    return (
        <div className="container-button-wrapper">
            <Button className={`container-button ${position}`} {...rest}>{children}</Button>
        </div>
    )
}
