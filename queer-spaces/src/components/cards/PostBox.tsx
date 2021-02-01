import React, { Component } from 'react'
import BlankProfile from '../../res/bp.png'

export default class PostBox extends Component{
    render(){ 
        return(
        <>
          <div id="profile-image">
            <img src={BlankProfile} alt="profile image"/> 
          </div>  
        </>
    )}
}
