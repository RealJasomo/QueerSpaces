import React, { Component } from 'react'
import { firebase, usersRef, usernameRef } from '../'
import { IconButton, Menu, MenuItem } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-regular-svg-icons'
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import BlankProfile from '../../res/bp.png'
import styles from '../../css/postbox.module.css'
import { User } from '../../interfaces/User'
import { generate, AnonymousInfo } from '../../util/AnonymousGenerator'

interface PostProp {
    category: string,
    text_content?: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user_id?: string | null,
    created: firebase.firestore.Timestamp,
    userInfo?: Partial<User>,
    doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
}

interface PostPropState{
    category: string,
    text_content?: string | null,
    poll_question?: string | null,
    poll_options?: Array<string> | null,
    image_url?: string | null,
    user_id?: string | null,
    likes: number,
    dislikes: number,
    created: firebase.firestore.Timestamp,
    userInfo?: Partial<User>,
    menuOpen: HTMLButtonElement | null,
    liked: boolean,
    disliked: boolean,
}
export default class Post extends Component<PostProp, PostPropState> {
    constructor(props: PostProp){
        super(props);
        this.state = {
            ...props,
            likes: this.props.doc.get('like_count') || 0,
            dislikes: this.props.doc.get('dislike_count') || 0,
            menuOpen: null,
            liked: false,
            disliked: false
        }
        this.updateUserInfo();
        this.updateRating();
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

    updateRating = async () => {
        var user = firebase.auth().currentUser;
        var liked = false, disliked = false;
        if(user != null){
            var ref = this.props.doc.ref;
            await ref.collection('likes').doc(user.uid).get().then(snapshot => {
                if(snapshot.exists){
                    liked = true;
                }
            })
            await ref.collection('dislikes').doc(user.uid).get().then(snapshot => {
                if(snapshot.exists){
                    disliked = true;
                }
            })
            this.setState({
                liked: liked,
                disliked: disliked
            })
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
    handleLike = async () => {
        if(this.state.disliked)
            this.handleDislike();
        var updateLikes = () =>  this.setState({
            likes: this.props.doc.get('like_count')
        });
        var user = firebase.auth().currentUser;
        if(user != null){
            var ref = this.props.doc.ref;
            var doc_ref = ref.collection('likes').doc(user.uid);
            doc_ref.get().then(snapshot => {
                if(snapshot.exists){
                    doc_ref.delete();
                    ref.update({
                        like_count: firebase.firestore.FieldValue.increment(-1)
                    }).then(updateLikes).then(this.updateRating);
                }else{
                    doc_ref.set({ liked: true})
                    ref.update({
                        like_count: firebase.firestore.FieldValue.increment(1)
                    }).then(updateLikes).then(this.updateRating);
                }
            })
        }
        ;
    }
    handleDislike = () => {
        if(this.state.liked)
            this.handleLike();
        var updateDislikes = () =>  this.setState({
            dislikes: this.props.doc.get('dislike_count')
        });
        var user = firebase.auth().currentUser;
        if(user != null){
            var ref = this.props.doc.ref;
            var doc_ref = ref.collection('dislikes').doc(user.uid);
            doc_ref.get().then(snapshot => {
                if(snapshot.exists){
                    doc_ref.delete();
                    ref.update({
                        dislike_count: firebase.firestore.FieldValue.increment(-1)
                    }).then(updateDislikes).then(this.updateRating);
                }else{
                    doc_ref.set({ disliked: true})
                    ref.update({
                        dislike_count: firebase.firestore.FieldValue.increment(1)
                    }).then(updateDislikes).then(this.updateRating);
                }
            })
        }
    }
    render() {
        var anonymous : AnonymousInfo = generate();
        return (<>
            <Menu
                id="post-menu"
                style={{top: '40px'}}
                anchorEl={this.state.menuOpen}
                keepMounted
                open={!!this.state.menuOpen}
                onClose={() => this.setState({menuOpen: null})}>
                <MenuItem>Edit</MenuItem>
                <MenuItem>Delete</MenuItem>
            </Menu>
            <div className={styles.card}>
                <div id="profile" className={styles.profile}>
                    <img style={{backgroundColor: anonymous.color}}src={this.state.userInfo?.photo || anonymous.image || BlankProfile} className = {styles.profileImage} alt="profile"/> 
                    <div className={styles.profileInfo}>
                        <h2 style={{fontFamily:'roboto', color: '#5A5353'}}>{this.state.userInfo?.name || anonymous.name}</h2>
                        <p style={{fontFamily:'roboto', color: '#D8D8D8'}}>{this.state.userInfo?.username || this.state.userInfo?.email || anonymous.username}</p>
                    </div>
                    <div style={{marginLeft:'auto', marginRight:'15px'}}>{firebase.auth().currentUser?.uid === this.state.user_id ?<IconButton onClick={(event) => this.setState({menuOpen: event.currentTarget})}><MoreHorizIcon className={styles.iconBlack}/></IconButton>:<></>}</div>
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
                    <p className={styles.likeNumber}>{this.state.likes}</p>
                    <IconButton onClick={this.handleLike}>
                    {this.state.liked?<ThumbUpIcon className={styles.iconBlack}/>:<ThumbUpOutlinedIcon className={styles.iconBlack}/>}
                    </IconButton>
                </div>
                <div className={styles.likes}>
                    <p className={styles.likeNumber}>{this.state.dislikes}</p>
                    <IconButton onClick={this.handleDislike}>
                    {this.state.disliked?<ThumbDownIcon className={styles.iconBlack}/>:<ThumbDownOutlinedIcon className={styles.iconBlack}/>}
                    </IconButton>
                </div>
                </div>
            </div>
            <div>
               <pre>{JSON.stringify(this.props)}</pre>
            </div>
            </>)
    }
}
