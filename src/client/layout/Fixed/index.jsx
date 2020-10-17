import React from 'react'
import './fixed.css'

export default function Fixed(props){
    const { position, className = '', ...rest } = props;
    return (
        <div {...props} className={`position-fixed fixed-${props.position} ${className}`}>
        </div>
    )
}