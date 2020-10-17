import React from 'react';
import './pageTitle.css'
export default function(props) {
    return <h1 className="page-title">{props.children}</h1>
}