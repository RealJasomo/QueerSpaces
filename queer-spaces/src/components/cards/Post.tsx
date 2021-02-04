import React, { Component } from 'react'
import { firebase, usersRef, usernameRef } from '../'
import { IconButton } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-regular-svg-icons'
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined'
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import { User } from '../../interfaces/User'
import { generate, AnonymousInfo } from '../../util/AnonymousGenerator'
interface PostPropState{
    category: string,
    text_content?: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user_id?: string | null,
    created: firebase.firestore.Timestamp,
    userInfo?: Partial<User>
}
export default class Post extends Component<PostPropState, PostPropState> {
    constructor(props: PostPropState){
        super(props);
        this.state = {
            ...props
        }
        this.updateUserInfo();
    }
    updateUserInfo = () => {
        if(this.state.user_id){
            usersRef.doc(this.state.user_id).onSnapshot((snapshot) => {
                if(snapshot.exists)
                    this.setState({userInfo: snapshot.data()})
            })
            this.grabUserName();
        }
    }
    grabUserName = () => {
        usernameRef.where('uid','==', this.state.user_id).get()
        .then((snap) => {
            if(snap.size > 0)
                snap.forEach((doc) => {
                    this.setState({
                        userInfo: {
                            ...this.state.userInfo,
                            username: `@${doc.id}`
                        }
                    })
                })
        })
    }
    render() {
        var anonymous : AnonymousInfo = generate();
        return (<>
            <div className={styles.card}>
                <div id="profile" className={styles.profile}>
                    <img style={{backgroundColor: anonymous.color}}src={this.state.userInfo?.photo || anonymous.image || BlankProfile} className = {styles.profileImage} alt="profile"/> 
                    <div className={styles.profileInfo}>
                        <h2 style={{fontFamily:'roboto', color: '#5A5353'}}>{this.state.userInfo?.name || anonymous.name}</h2>
                        <p style={{fontFamily:'roboto', color: '#D8D8D8'}}>{this.state.userInfo?.username || this.state.userInfo?.email || anonymous.username}</p>
                    </div>
                </div> 
                <div className={styles.postText}>
                    {this.state.text_content}
                    {this.state.image_url?<img className={styles.postImage} src={this.state.image_url}/>:<></>}
                </div>
                <div className={styles.buttons}>
                <IconButton>
                    <FontAwesomeIcon icon={faCommentDots}  className={styles.iconBlack}/>
                </IconButton>
                <div className={styles.likes}>
                    <p className={styles.likeNumber}>0</p>
                    <IconButton>
                        <ThumbUpOutlinedIcon className={styles.iconBlack}/>
                    </IconButton>
                </div>
                <div className={styles.likes}>
                    <p className={styles.likeNumber}>0</p>
                    <IconButton>
                        <ThumbDownOutlinedIcon className={styles.iconBlack}/>
                    </IconButton>
                </div>
                </div>
            </div>
            <div>
               <pre>{JSON.stringify(this.state)}</pre>
            </div>
            </>)
    }
}
