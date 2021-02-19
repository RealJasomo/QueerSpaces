import React, { Component } from 'react'

import styles from '../css/homepage.module.css'
import NotificationsIcon from '@material-ui/icons/Notifications'

export default class Homepage extends Component {
    render() {
        return (
            <div className={styles.homepage}>
                <h1>Welcome to Queer Spaces!</h1>
                <h2 style={{marginBottom:'2rem'}}>The LGBTQIA+ Safe Social Space</h2>
                <p style={{padding:'1rem', borderRadius:'25px', boxShadow:'10px 10px 20px rgba(0, 0, 0, 0.2)', width:'50ch', display:'inline'}}><NotificationsIcon style={{color:'red', position:'relative', top:5}}/>Please make an acount to interact with posts</p>
            </div>
        )
    }
}
