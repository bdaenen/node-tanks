import React from 'react'
import './buttonList.css'

export default function ButtonList (props) {
    return (
        <ul className="button-list">
            {props.children.map((child, i) => {
                return <li key={i}>{child}</li>
            })}
        </ul>
    )
}
