import React from 'react'
import "./header.css"
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <div className='header_container'>
            <div className="header_option">
                <Link to={"/create"} ><button className='header_btn'>Register</button></Link>
                <Link to={"/"}><button className='header_btn'>Scann</button>
                </Link>
            </div>
        </div>
    )
}

export default Header
